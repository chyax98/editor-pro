import { App, Editor, Modal, Notice, Setting } from "obsidian";

function findHeadingSection(editor: Editor, fromLine: number): { start: number; end: number; title: string } | null {
	let start = -1;
	let level = 0;
	for (let i = fromLine; i >= 0; i--) {
		const line = editor.getLine(i);
			const m = line.match(/^(#{1,6})\s+(.*)$/);
			if (!m) continue;
			start = i;
			level = (m[1] ?? "").length;
			break;
		}
	if (start < 0) return null;

	let end = editor.lineCount() - 1;
	for (let i = start + 1; i < editor.lineCount(); i++) {
		const line = editor.getLine(i);
			const m = line.match(/^(#{1,6})\s+/);
			if (!m) continue;
			const nextLevel = (m[1] ?? "").length;
			if (nextLevel <= level) {
				end = i - 1;
				break;
			}
	}

	const titleLine = editor.getLine(start);
	const title = titleLine.replace(/^#{1,6}\s+/, "").trim() || "Heading";
	return { start, end, title };
}

function getLeadingSpaces(text: string): number {
	let i = 0;
	while (i < text.length && text[i] === " ") i++;
	return i;
}

function isListItemLine(text: string): { indent: number } | null {
	const indent = getLeadingSpaces(text);
	const rest = text.slice(indent);
	if (/^([-*+])\s+/.test(rest)) return { indent };
	if (/^\d+\.\s+/.test(rest)) return { indent };
	return null;
}

function findListBlock(editor: Editor, line: number): { start: number; end: number } | null {
	const info = isListItemLine(editor.getLine(line));
	if (!info) return null;
	const indent = info.indent;

	let start = line;
	for (let i = line - 1; i >= 0; i--) {
		const t = editor.getLine(i);
		if (!t.trim()) break;
		const li = isListItemLine(t);
		if (li && li.indent === indent) {
			start = i;
			continue;
		}
		if (getLeadingSpaces(t) > indent) {
			start = i;
			continue;
		}
		break;
	}

	let end = line;
	for (let i = line + 1; i < editor.lineCount(); i++) {
		const t = editor.getLine(i);
		if (!t.trim()) break;
		if (getLeadingSpaces(t) > indent) {
			end = i;
			continue;
		}
		const li = isListItemLine(t);
		if (li && li.indent === indent) {
			end = i;
			continue;
		}
		break;
	}
	return { start, end };
}

class ZoomEditModal extends Modal {
	private editor: Editor;
	private startLine: number;
	private endLine: number;
	private initial: string;
	private value: string;

	constructor(app: App, editor: Editor, startLine: number, endLine: number, title: string) {
		super(app);
		this.editor = editor;
		this.startLine = startLine;
		this.endLine = endLine;
		this.setTitle(title);

		const lines: string[] = [];
		for (let i = startLine; i <= endLine; i++) lines.push(editor.getLine(i));
		this.initial = lines.join("\n");
		this.value = this.initial;
	}

	onOpen() {
		new Setting(this.contentEl).setName("内容").addTextArea((ta) => {
			ta.setValue(this.value).onChange((v) => (this.value = v));
			ta.inputEl.addClass("editor-pro-zoom-textarea");
		});

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText("应用").setCta().onClick(() => {
					if (this.value === this.initial) {
						this.close();
						return;
					}
					const endText = this.editor.getLine(this.endLine);
					this.editor.replaceRange(this.value, { line: this.startLine, ch: 0 }, { line: this.endLine, ch: endText.length });
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

export function zoomCurrentHeading(app: App, editor: Editor) {
	const cursor = editor.getCursor();
	const section = findHeadingSection(editor, cursor.line);
	if (!section) {
		new Notice("Editor Pro：未找到标题（请把光标放在某个标题段落内）");
		return;
	}
	new ZoomEditModal(app, editor, section.start, section.end, `聚焦：${section.title}`).open();
}

export function zoomCurrentListBlock(app: App, editor: Editor) {
	const cursor = editor.getCursor();
	const block = findListBlock(editor, cursor.line);
	if (!block) {
		new Notice("Editor Pro：未找到列表块（请把光标放在列表项上）");
		return;
	}
	new ZoomEditModal(app, editor, block.start, block.end, "聚焦：列表块").open();
}
