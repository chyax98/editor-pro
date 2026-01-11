import { App, Editor, Modal, Notice, Setting } from "obsidian";

export class SearchInSelectionModal extends Modal {
	private editor: Editor;
	private find = "";
	private replace = "";
	private caseSensitive = false;

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

		new Setting(this.contentEl).setName("查找").addText((text) => {
			text.setPlaceholder("要查找的内容").onChange((v) => (this.find = v));
		});

		new Setting(this.contentEl).setName("替换为").addText((text) => {
			text.setPlaceholder("替换成什么").onChange((v) => (this.replace = v));
		});

		new Setting(this.contentEl).setName("区分大小写").addToggle((t) => {
			t.setValue(this.caseSensitive).onChange((v) => (this.caseSensitive = v));
		});

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText("替换全部").setCta().onClick(() => {
					if (!this.find) {
						new Notice("Editor Pro：请输入要查找的内容");
						return;
					}

					const from = this.editor.getCursor("from");
					const to = this.editor.getCursor("to");
					const selected = this.editor.getSelection();

					const flags = this.caseSensitive ? "g" : "gi";
					const escaped = this.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
					const re = new RegExp(escaped, flags);
					const next = selected.replace(re, this.replace);
					this.editor.replaceRange(next, from, to);
					this.close();
				});
			})
			.addExtraButton((btn) => {
				btn.setIcon("x").setTooltip("Cancel").onClick(() => this.close());
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}

