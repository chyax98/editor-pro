import {
	App,
	MarkdownView,
	Plugin,
	TFile,
	debounce,
	normalizePath,
} from "obsidian";

type Frontmatter = Record<string, unknown> & {
	icon?: unknown;
	banner?: unknown;
};

function getFrontmatter(app: App, file: TFile): Frontmatter | null {
	const cache = app.metadataCache.getFileCache(file);
	return (cache?.frontmatter ?? null) as Frontmatter | null;
}

function readString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

// 文件图标缓存，避免重复查询 metadataCache
const fileIconCache = new WeakMap<
	TFile,
	{ icon: string | null; timestamp: number }
>();
const CACHE_DURATION = 5000; // 5秒缓存

export class InlineDecorator {
	private app: App;
	private enabled: () => boolean;
	private updateDebounced: () => void;
	private bannerEl: HTMLElement | null = null;
	// 追踪已处理的文件，避免重复处理
	private processedPaths = new Set<string>();

	constructor(options: { app: App; enabled: () => boolean }) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.updateDebounced = debounce(() => this.updateAll(), 500, true);
	}

	register(plugin: Plugin) {
		plugin.register(() => this.cleanup());
		plugin.registerEvent(
			this.app.workspace.on("layout-change", () =>
				this.updateDebounced(),
			),
		);
		plugin.registerEvent(
			this.app.workspace.on("file-open", () => this.updateDebounced()),
		);
		plugin.registerEvent(
			this.app.metadataCache.on("changed", () => this.updateDebounced()),
		);

		this.updateDebounced();
	}

	// 清理方法（public，供 main.ts 调用）
	cleanup() {
		this.bannerEl?.remove();
		this.bannerEl = null;
		this.processedPaths.clear();
	}

	private getCachedIcon(file: TFile): string | null {
		const cached = fileIconCache.get(file);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.icon;
		}
		return null;
	}

	private setCachedIcon(file: TFile, icon: string | null) {
		fileIconCache.set(file, { icon, timestamp: Date.now() });
	}

	private ensureBannerEl(view: MarkdownView) {
		if (this.bannerEl && this.bannerEl.isConnected) {
			if (this.bannerEl.parentElement === view.contentEl) return;
			this.bannerEl.remove();
			this.bannerEl = null;
		}

		this.bannerEl = document.createElement("div");
		this.bannerEl.addClass("editor-pro-note-banner");
		view.contentEl.insertBefore(this.bannerEl, view.contentEl.firstChild);
	}

	private updateBanner() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = view?.file;
		if (!view || !file) return;

		if (!this.enabled()) {
			this.bannerEl?.remove();
			this.bannerEl = null;
			return;
		}

		const fm = getFrontmatter(this.app, file);
		const bannerRaw = fm ? readString(fm.banner) : null;
		if (!bannerRaw) {
			this.bannerEl?.remove();
			this.bannerEl = null;
			return;
		}

		this.ensureBannerEl(view);

		let url = bannerRaw;
		// Support vault-relative path.
		if (!/^https?:\/\//i.test(bannerRaw)) {
			const normalized = normalizePath(bannerRaw);
			const bannerFile = this.app.vault.getAbstractFileByPath(normalized);
			if (bannerFile instanceof TFile) {
				url = this.app.vault.getResourcePath(bannerFile);
			}
		}

		// Avoid setting raw style attributes; keep the mutation scoped to a single CSS property.
		// Also ignore suspicious schemes (users can still use vault-relative paths).
		if (/^(https?:\/\/|app:\/\/)/i.test(url)) {
			// 更严格的 URL 转义：转义所有可能的 CSS 注入字符
			const safeUrl = url
				.replace(/"/g, "%22")
				.replace(/'/g, "%27")
				.replace(/\\/g, "%5C")
				.replace(/\n/g, "")
				.replace(/\r/g, "")
				.replace(/\(/g, "%28")
				.replace(/\)/g, "%29")
				.replace(/;/g, "%3B");

			if (this.bannerEl) {
				// 直接使用 style 属性，避免 setCssProps 可能的注入
				this.bannerEl.style.backgroundImage = `url("${safeUrl}")`;
			}
		} else {
			if (this.bannerEl)
				this.bannerEl.setCssProps({ "background-image": "" });
		}
	}

	private updateFileListIcons() {
		if (!this.enabled()) return;

		const containers = Array.from(
			document.querySelectorAll<HTMLElement>(".nav-files-container"),
		);
		const currentBatch: Array<{ el: HTMLElement; icon: string | null }> =
			[];

		for (const container of containers) {
			// 只处理可见的容器
			if (!this.isContainerVisible(container)) continue;

			const titles = Array.from(
				container.querySelectorAll<HTMLElement>(".nav-file-title"),
			);
			for (const title of titles) {
				const path = title.getAttribute("data-path");
				if (!path) continue;

				// 跳过已处理的文件
				if (this.processedPaths.has(path)) continue;

				const abs = this.app.vault.getAbstractFileByPath(path);
				if (!(abs instanceof TFile)) continue;

				// 使用缓存
				let icon = this.getCachedIcon(abs);
				if (icon === null) {
					const fm = getFrontmatter(this.app, abs);
					icon = readString(fm?.icon);
					this.setCachedIcon(abs, icon);
				}

				currentBatch.push({ el: title, icon });
				this.processedPaths.add(path);
			}
		}

		// 批量 DOM 更新
		requestAnimationFrame(() => {
			for (const { el, icon } of currentBatch) {
				let iconEl = el.querySelector<HTMLElement>(
					".editor-pro-file-icon",
				);
				if (icon) {
					if (!iconEl) {
						iconEl = el.createSpan({ cls: "editor-pro-file-icon" });
						const content = el.querySelector(
							".nav-file-title-content",
						);
						if (content) content.before(iconEl);
					}
					iconEl.setText(icon);
				} else {
					iconEl?.remove();
				}
			}
		});
	}

	private isContainerVisible(el: HTMLElement): boolean {
		const rect = el.getBoundingClientRect();
		return rect.top < window.innerHeight && rect.bottom > 0;
	}

	private updateAll() {
		this.updateFileListIcons();
		this.updateBanner();
	}
}
