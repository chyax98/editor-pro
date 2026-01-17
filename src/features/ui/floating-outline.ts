import { App, MarkdownView, Plugin, TFile } from "obsidian";

type HeadingCache = {
	heading: string;
	level: number;
	position: { start: { line: number } };
};

function getHeadings(app: App, file: TFile): HeadingCache[] {
	const cache = app.metadataCache.getFileCache(file);
	return (cache?.headings ?? []) as HeadingCache[];
}

export class FloatingOutline {
	private app: App;
	private enabled: () => boolean;
	private visible = false;
	private root: HTMLElement | null = null;
	private eventHandlers: Array<() => void> = [];

	constructor(options: { app: App; enabled: () => boolean }) {
		this.app = options.app;
		this.enabled = options.enabled;
	}

	register(plugin: Plugin) {
		plugin.register(() => this.hide());
		plugin.registerEvent(
			this.app.workspace.on(
				"active-leaf-change",
				() => this.visible && this.render(),
			),
		);
		plugin.registerEvent(
			this.app.metadataCache.on(
				"changed",
				() => this.visible && this.render(),
			),
		);
		plugin.registerDomEvent(document, "keydown", (evt) => {
			if (!this.visible) return;
			if (evt.key !== "Escape") return;
			this.hide();
		});
	}

	toggle(): boolean {
		if (!this.enabled()) return false;
		if (this.visible) {
			this.hide();
			return false;
		}
		this.show();
		return true;
	}

	show() {
		if (!this.enabled()) return;
		if (this.visible) return;
		this.visible = true;
		this.root = document.body.createDiv({
			cls: "editor-pro-floating-outline",
		});
		this.render();
	}

	hide() {
		this.visible = false;
		this.root?.remove();
		this.root = null;
		this.cleanup(); // hide 时也清理
	}

	// 清理方法（public，供 main.ts 调用）
	cleanup() {
		this.eventHandlers.forEach((cleanup) => cleanup());
		this.eventHandlers = [];
	}

	private render() {
		if (!this.root) return;
		this.root.empty();

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = view?.file;
		const editor = view?.editor;
		if (!file || !editor) {
			this.root.createDiv({ text: "无可用大纲" });
			return;
		}

		const headings = getHeadings(this.app, file);
		if (!headings.length) {
			this.root.createDiv({ text: "此文件没有标题" });
			return;
		}

		const header = this.root.createDiv({
			cls: "editor-pro-floating-outline-header",
		});
		header.createDiv({ text: "目录" });
		const closeBtn = header.createEl("button", {
			text: "×",
			cls: "editor-pro-floating-outline-close",
			attr: { "aria-label": "关闭" },
		});

		// 保存清理函数
		const closeHandler = () => this.hide();
		closeBtn.onclick = closeHandler;
		this.eventHandlers.push(() => {
			closeBtn.onclick = null;
		});

		const list = this.root.createDiv({
			cls: "editor-pro-floating-outline-list",
			attr: { role: "list", "aria-label": "文档目录" },
		});
		for (const h of headings) {
			const item = list.createDiv({
				cls: "editor-pro-floating-outline-item",
				attr: {
					role: "listitem",
					tabindex: "0",
					"aria-label": h.heading,
				},
			});
			item.style.paddingLeft = `${(h.level - 1) * 12}px`;
			item.setText(h.heading);

			// 保存清理函数
			const clickHandler = () => {
				editor.focus();
				editor.setCursor({ line: h.position.start.line, ch: 0 });
				this.hide();
			};
			item.onclick = clickHandler;
			this.eventHandlers.push(() => {
				item.onclick = null;
			});

			// Keyboard navigation support
			const keyHandler = (evt: KeyboardEvent) => {
				if (evt.key === "Enter" || evt.key === " ") {
					evt.preventDefault();
					editor.focus();
					editor.setCursor({ line: h.position.start.line, ch: 0 });
					this.hide();
				}
			};
			item.addEventListener("keydown", keyHandler);
			this.eventHandlers.push(() => {
				item.removeEventListener("keydown", keyHandler);
			});
		}
	}
}
