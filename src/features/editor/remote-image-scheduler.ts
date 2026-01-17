import { App, Editor, MarkdownView, Notice, requestUrl, TFile } from "obsidian";

interface ImageTask {
	id: string; // 唯一ID
	url: string; // 远程 URL
	alt: string; // 图片 Alt 文本
	originalText: string; // 原始 Markdown 文本 (![alt](url))
	filePath: string; // 所属文件路径
	retries: number; // 已重试次数
	timestamp: number; // 任务创建时间
}

const MAX_CONCURRENCY = 3; // 最大并发数
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY_BASE = 2000; // 重试基础延迟 (ms)
const DOWNLOAD_TIMEOUT = 30000; // 下载超时 30s
const MAX_CACHE_SIZE = 100; // 最大缓存 URL 数量

export class RemoteImageTaskScheduler {
	private app: App;
	private queue: ImageTask[] = [];
	private activeDownloads = 0;
	private processedUrls = new Map<string, string>(); // URL -> 本地文件名缓存
	private pendingTimeouts = new Set<ReturnType<typeof setTimeout>>(); // 追踪定时器
	private isShuttingDown = false; // 是否正在关闭

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * 扫描编辑器内容并调度任务
	 */
	public scanAndSchedule(editor: Editor, file: TFile) {
		const content = editor.getValue();
		const IMAGE_URL_REGEX = /!\[(.*?)\]\((https?:\/\/.*?)\)/g;
		const matches = Array.from(content.matchAll(IMAGE_URL_REGEX));

		let newTasksCount = 0;

		for (const match of matches) {
			const originalText = match[0];
			const alt = match[1] || "";
			const url = match[2];

			if (!url) continue;

			// 检查是否已经在处理或已完成
			if (this.processedUrls.has(url)) {
				// 如果已完成，直接替换（瞬间完成）
				const filename = this.processedUrls.get(url)!;
				void this.replaceInFile(file, originalText, `![[${filename}]]`);
				continue;
			}

			// 检查是否已在队列中
			const exists = this.queue.some(
				(t) => t.url === url && t.filePath === file.path,
			);
			if (exists) continue;

			const task: ImageTask = {
				id: Math.random().toString(36).substring(7),
				url,
				alt,
				originalText,
				filePath: file.path,
				retries: 0,
				timestamp: Date.now(),
			};

			this.queue.push(task);
			newTasksCount++;
		}

		if (newTasksCount > 0) {
			new Notice(`已添加 ${newTasksCount} 张图片到下载队列`);
			void this.processQueue();
		}
	}

	private async processQueue() {
		// 如果正在关闭，不再处理
		if (this.isShuttingDown) return;
		if (
			this.activeDownloads >= MAX_CONCURRENCY ||
			this.queue.length === 0
		) {
			return;
		}

		const task = this.queue.shift();
		if (!task) return;

		this.activeDownloads++;

		try {
			await this.executeTask(task);
		} catch (error) {
			console.error(`Download failed for ${task.url}:`, error);

			if (!this.isShuttingDown && task.retries < MAX_RETRIES) {
				task.retries++;
				const delay = RETRY_DELAY_BASE * Math.pow(2, task.retries - 1); // 2s, 4s, 8s
				console.debug(`Retrying task ${task.id} in ${delay}ms...`);

				const timeoutId = setTimeout(() => {
					this.pendingTimeouts.delete(timeoutId);
					if (!this.isShuttingDown) {
						this.queue.push(task);
						void this.processQueue();
					}
				}, delay);
				this.pendingTimeouts.add(timeoutId);
			} else if (!this.isShuttingDown) {
				new Notice(`图片下载失败 (重试耗尽): ${task.alt || "未命名"}`);
			}
		} finally {
			this.activeDownloads--;
			if (!this.isShuttingDown) {
				void this.processQueue(); // 处理下一个
			}
		}
	}

	private async executeTask(task: ImageTask) {
		// 1. 检查缓存
		if (this.processedUrls.has(task.url)) {
			const filename = this.processedUrls.get(task.url)!;
			await this.finalizeTask(task, filename);
			return;
		}

		// 2. 下载（带超时）
		const arrayBuffer = await this.fetchImageWithTimeout(
			task.url,
			DOWNLOAD_TIMEOUT,
		);
		const ext = this.getExtension(task.url) || "png";

		// 3. 保存
		const filename = await this.saveImage(arrayBuffer, ext, task.alt);

		// 4. 更新缓存（限制大小）
		if (this.processedUrls.size >= MAX_CACHE_SIZE) {
			// 删除最早的条目
			const nextKey = this.processedUrls.keys().next();
			const firstKey =
				typeof nextKey.value === "string" ? nextKey.value : null;
			if (firstKey) this.processedUrls.delete(firstKey);
		}
		this.processedUrls.set(task.url, filename);

		// 5. 替换
		await this.finalizeTask(task, filename);
	}

	/**
	 * 带超时的图片下载
	 */
	private async fetchImageWithTimeout(
		url: string,
		timeout: number,
	): Promise<ArrayBuffer> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		this.pendingTimeouts.add(timeoutId);

		try {
			const res = await requestUrl({ url });
			return res.arrayBuffer;
		} finally {
			clearTimeout(timeoutId);
			this.pendingTimeouts.delete(timeoutId);
		}
	}

	private async finalizeTask(task: ImageTask, filename: string) {
		const file = this.app.vault.getAbstractFileByPath(task.filePath);
		if (file instanceof TFile) {
			const replacement = `![[${filename}]]`;
			await this.replaceInFile(file, task.originalText, replacement);
		}
	}

	/**
	 * 智能替换：优先使用 Editor API，否则使用 Vault API
	 */
	private async replaceInFile(
		file: TFile,
		target: string,
		replacement: string,
	) {
		// 1. 尝试查找打开了该文件的编辑器
		let editor: Editor | null = null;
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (
				leaf.view instanceof MarkdownView &&
				leaf.view.file?.path === file.path
			) {
				editor = leaf.view.editor;
			}
		});

		if (editor) {
			// 使用编辑器替换（保留光标位置，支持撤销）
			const content = (editor as Editor).getValue();
			// 只替换第一个匹配项，避免误伤
			const idx = content.indexOf(target);
			if (idx !== -1) {
				const from = (editor as Editor).offsetToPos(idx);
				const to = (editor as Editor).offsetToPos(idx + target.length);
				(editor as Editor).replaceRange(replacement, from, to);
			}
		} else {
			// 后台替换
			// 注意：读取-修改-写入 即使是原子的，也可能与用户当前的操作冲突（如果用户刚打开文件但视图还没加载好）
			// 这里使用 process 回调更安全
			await this.app.vault.process(file, (data) => {
				return data.replace(target, replacement);
			});
		}
	}

	private getExtension(url: string): string | null {
		try {
			const cleanUrl = url.split("?")[0]?.split("#")[0];
			if (!cleanUrl) return null;
			const dotIndex = cleanUrl.lastIndexOf(".");
			if (dotIndex !== -1) {
				const ext = cleanUrl.substring(dotIndex + 1).toLowerCase();
				if (
					[
						"jpg",
						"jpeg",
						"png",
						"gif",
						"webp",
						"bmp",
						"svg",
					].includes(ext)
				) {
					return ext;
				}
			}
		} catch {
			/* ignore */
		}
		return null;
	}

	private async saveImage(
		data: ArrayBuffer,
		ext: string,
		prefix: string,
	): Promise<string> {
		const assetsFolder = this.getAssetsFolder();
		await this.ensureFolder(assetsFolder);

		const now = new Date();
		const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

		const safePrefix =
			(prefix || "image").replace(/[\\/:*?"<>|]/g, "-").trim() || "image";

		let filename = `${safePrefix}-${timestamp}.${ext}`;
		let path = `${assetsFolder}/${filename}`;

		let counter = 1;
		while (await this.app.vault.adapter.exists(path)) {
			filename = `${safePrefix}-${timestamp}-${counter}.${ext}`;
			path = `${assetsFolder}/${filename}`;
			counter++;
		}

		await this.app.vault.createBinary(path, data);
		return filename;
	}

	private getAssetsFolder(): string {
		const folder = (
			this.app.vault as unknown as {
				getConfig: (key: string) => string | null | undefined;
			}
		).getConfig("attachmentFolderPath");
		return folder && folder !== "./" ? folder : "Attachments";
	}

	private async ensureFolder(path: string) {
		if (path === "/" || path === ".") return;
		if (!(await this.app.vault.adapter.exists(path))) {
			try {
				await this.app.vault.createFolder(path);
			} catch (error: unknown) {
				// Folder might have been created concurrently
				if (!(await this.app.vault.adapter.exists(path))) {
					throw error instanceof Error
						? error
						: new Error(String(error));
				}
			}
		}
	}

	/**
	 * 清理资源：取消所有待处理任务和定时器
	 * 在插件卸载时调用
	 */
	public cleanup() {
		this.isShuttingDown = true;

		// 清空队列
		this.queue.length = 0;

		// 取消所有待处理的定时器
		for (const timeoutId of this.pendingTimeouts) {
			clearTimeout(timeoutId);
		}
		this.pendingTimeouts.clear();

		// 清空缓存
		this.processedUrls.clear();

		// 重置计数器
		this.activeDownloads = 0;
	}

	/**
	 * 获取当前队列状态（用于调试或状态显示）
	 */
	public getStatus(): {
		queueLength: number;
		activeDownloads: number;
		cacheSize: number;
	} {
		return {
			queueLength: this.queue.length,
			activeDownloads: this.activeDownloads,
			cacheSize: this.processedUrls.size,
		};
	}
}
