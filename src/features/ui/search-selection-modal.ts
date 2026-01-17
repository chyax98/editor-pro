import { App, Editor, Modal, Notice, Setting } from "obsidian";

const MAX_SEARCH_LENGTH = 1000; // Prevent ReDoS with extremely long patterns

export class SearchInSelectionModal extends Modal {
	private editor: Editor;
	private find = "";
	private replace = "";
	private caseSensitive = false;
	private savedFocus: { line: number; ch: number } | null = null;
	private findInputEl: HTMLInputElement | null = null;

	constructor(app: App, editor: Editor) {
		super(app);
		this.editor = editor;
		this.setTitle("选区查找替换");
	}

	onOpen() {
		const selection = this.editor.getSelection();
		if (!selection) {
			new Notice("Editor Pro：请先选中一段文本");
			this.close();
			return;
		}

		// Save focus for restoration
		this.savedFocus = this.editor.getCursor();

		new Setting(this.contentEl).setName("查找").addText((text) => {
			text.setPlaceholder("要查找的内容").onChange((v: string) => (this.find = v));
			text.inputEl.setAttribute("aria-label", "查找内容");
			this.findInputEl = text.inputEl;
		});

		new Setting(this.contentEl).setName("替换为").addText((text) => {
			text.setPlaceholder("替换成什么").onChange((v: string) => (this.replace = v));
			text.inputEl.setAttribute("aria-label", "替换为");
		});

		new Setting(this.contentEl).setName("区分大小写").addToggle((toggle) => {
			toggle.setValue(this.caseSensitive).onChange((v) => (this.caseSensitive = v));
			toggle.toggleEl.setAttribute("aria-label", "区分大小写");
		});

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText("替换全部").setCta().onClick(() => {
					if (!this.find) {
						new Notice("Editor Pro：请输入要查找的内容");
						return;
					}

					// Prevent ReDoS by limiting search pattern length
					if (this.find.length > MAX_SEARCH_LENGTH) {
						new Notice(`Editor Pro：查找内容过长，最大支持 ${MAX_SEARCH_LENGTH} 个字符`);
						return;
					}

					// Prevent ReDoS: limit nested quantifiers
					// Pattern matches repeated quantifiers that could cause catastrophic backtracking
					const nestedQuantifierPattern = /(\{[0-9,]+\}){3,}|(\*|\+|\?|\{[0-9,]+\})\2{5,}/;
					if (nestedQuantifierPattern.test(this.find)) {
						new Notice("Editor Pro：查找模式过于复杂，可能影响性能");
						return;
					}

					const from = this.editor.getCursor("from");
					const to = this.editor.getCursor("to");
					const selected = this.editor.getSelection();

					const flags = this.caseSensitive ? "g" : "gi";
					const escaped = this.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

					// Validate escaped regex
					try {
						new RegExp(escaped, flags);
					} catch {
						new Notice("Editor Pro：查找内容包含不支持的字符");
						return;
					}

					const re = new RegExp(escaped, flags);
					const next = selected.replace(re, this.replace);
					this.editor.replaceRange(next, from, to);
					this.close();
				});
			})
			.addExtraButton((btn) => {
				btn.setIcon("x").setTooltip("Cancel").onClick(() => this.close());
				// ExtraButton uses internal button via icon/tooltip API
				// ARIA label is set via setTooltip
			});

		// Focus trap: focus to first input
		requestAnimationFrame(() => {
			this.findInputEl?.focus();
		});
	}

	onClose() {
		this.contentEl.empty();
		this.findInputEl = null;

		// Restore focus to editor
		if (this.savedFocus) {
			this.editor.focus();
			this.editor.setCursor(this.savedFocus);
			this.savedFocus = null;
		}
	}
}

