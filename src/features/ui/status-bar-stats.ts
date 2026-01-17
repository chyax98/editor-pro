import { App, MarkdownView, Plugin, debounce } from "obsidian";

// 添加增量统计，避免重复计算
class WordCounter {
	private lastContent: string = "";
	private lastCount: { words: number; chars: number } = {
		words: 0,
		chars: 0,
	};
	private lastSelection: string = "";
	private lastSelectionCount: { words: number; chars: number } = {
		words: 0,
		chars: 0,
	};

	countWords(
		text: string,
		isSelection = false,
	): { words: number; chars: number } {
		// 如果内容没变，返回缓存结果
		if (!isSelection && text === this.lastContent) {
			return this.lastCount;
		}
		if (isSelection && text === this.lastSelection) {
			return this.lastSelectionCount;
		}

		const normalized = text.replace(/\r\n/g, "\n");
		const cjk = (normalized.match(/[\u4e00-\u9fff]/g) ?? []).length;
		const latinWords = (
			normalized.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) ?? []
		).length;
		const chars = normalized.replace(/\s/g, "").length;
		const result = { words: cjk + latinWords, chars };

		// 更新缓存
		if (!isSelection) {
			this.lastContent = text;
			this.lastCount = result;
		} else {
			this.lastSelection = text;
			this.lastSelectionCount = result;
		}

		return result;
	}

	invalidate() {
		this.lastContent = "";
	}
}

export class StatusBarStats {
	private app: App;
	private enabled: () => boolean;
	private el: HTMLElement | null = null;
	private updateDebounced: () => void;
	private wordCounter = new WordCounter();
	private lastEditorValue: string = "";
	private lastLineCount: number = -1;

	constructor(options: { app: App; enabled: () => boolean }) {
		this.app = options.app;
		this.enabled = options.enabled;
		// 增加防抖时间到 500ms
		this.updateDebounced = debounce(() => this.update(), 500, true);
	}

	register(plugin: Plugin) {
		this.el = plugin.addStatusBarItem();
		this.el.addClass("editor-pro-status-stats");

		plugin.register(() => {
			this.el?.remove();
			this.el = null;
		});

		plugin.registerEvent(
			this.app.workspace.on("active-leaf-change", () =>
				this.updateDebounced(),
			),
		);
		plugin.registerEvent(
			this.app.workspace.on("editor-change", (editor) => {
				// 优化：只在内容真正变化时更新，避免频繁调用 editor.getValue()
				const currentLineCount = editor.lineCount();
				if (currentLineCount !== this.lastLineCount) {
					this.lastLineCount = currentLineCount;
					this.wordCounter.invalidate();
					this.lastEditorValue = ""; // Force recalculation
					this.updateDebounced();
				}
			}),
		);
		// 移除 selectionchange 监听，减少频繁更新

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
			const { words, chars } = this.wordCounter.countWords(
				selected,
				true,
			);
			this.el.setText(`选中 ${chars} 字符 / ${words} 词`);
			return;
		}

		// 优化：只在编辑器行数变化时重新读取完整内容
		// 对于普通打字，只统计选区；行数变化时才统计全文
		const currentValue = editor.getValue();
		if (currentValue === this.lastEditorValue) {
			return; // 内容没变，使用缓存
		}
		this.lastEditorValue = currentValue;
		const { words } = this.wordCounter.countWords(currentValue);
		const minutes = Math.max(1, Math.ceil(words / 220));
		this.el.setText(`${words} 词 · ${minutes} 分钟`);
	}
}
