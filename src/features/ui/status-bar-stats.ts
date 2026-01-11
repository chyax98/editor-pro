import { App, MarkdownView, Plugin, debounce } from "obsidian";

function countWords(text: string): { words: number; chars: number } {
	const normalized = text.replace(/\r\n/g, "\n");
	const cjk = (normalized.match(/[\u4E00-\u9FFF]/g) ?? []).length;
	const latinWords = (normalized.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) ?? []).length;
	const chars = normalized.replace(/\s/g, "").length;
	return { words: cjk + latinWords, chars };
}

export class StatusBarStats {
	private app: App;
	private enabled: () => boolean;
	private el: HTMLElement | null = null;
	private updateDebounced: () => void;

	constructor(options: { app: App; enabled: () => boolean }) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.updateDebounced = debounce(() => this.update(), 200, true);
	}

	register(plugin: Plugin) {
		this.el = plugin.addStatusBarItem();
		this.el.addClass("editor-pro-status-stats");

		plugin.register(() => {
			this.el?.remove();
			this.el = null;
		});

		plugin.registerEvent(this.app.workspace.on("active-leaf-change", () => this.updateDebounced()));
		plugin.registerEvent(this.app.workspace.on("editor-change", () => this.updateDebounced()));
		plugin.registerDomEvent(document, "selectionchange", () => this.updateDebounced());

		this.updateDebounced();
	}

	private update() {
		if (!this.el) return;
		if (!this.enabled()) {
			this.el.setText("");
			return;
		}

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view?.editor;
		if (!editor) {
			this.el.setText("");
			return;
		}

		const selected = editor.getSelection();
		if (selected) {
			const { words, chars } = countWords(selected);
			this.el.setText(`选中 ${chars} 字符 / ${words} 词`);
			return;
		}

		const { words } = countWords(editor.getValue());
		const minutes = Math.max(1, Math.ceil(words / 220));
		this.el.setText(`${words} 词 · ${minutes} 分钟`);
	}
}
