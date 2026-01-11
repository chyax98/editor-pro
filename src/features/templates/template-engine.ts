import { Editor } from "obsidian";

export interface TemplateContext {
	date: string; // YYYY-MM-DD
	time: string; // HH:mm
	now: string; // YYYY-MM-DD HH:mm
	fileName?: string;
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

export function defaultTemplateContext(fileName?: string): TemplateContext {
	const d = new Date();
	const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
	return {
		date,
		time,
		now: `${date} ${time}`,
		fileName,
	};
}

export function expandTemplate(template: string, ctx: TemplateContext): { text: string; cursorIndex: number | null } {
	const cursorToken = "{{cursor}}";
	const cursorIndex = template.indexOf(cursorToken);

	const withoutCursor = cursorIndex >= 0 ? template.replace(cursorToken, "") : template;
	let text = withoutCursor;
	text = text.split("{{date}}").join(ctx.date);
	text = text.split("{{time}}").join(ctx.time);
	text = text.split("{{now}}").join(ctx.now);
	text = text.split("{{fileName}}").join(ctx.fileName ?? "");

	return { text, cursorIndex: cursorIndex >= 0 ? cursorIndex : null };
}

export function insertExpandedTemplate(editor: Editor, template: string, ctx: TemplateContext) {
	const cursor = editor.getCursor();
	const { text, cursorIndex } = expandTemplate(template, ctx);
	editor.replaceSelection(text);

	if (cursorIndex === null) return;

	const before = text.slice(0, cursorIndex);
	const lines = before.split("\n");
	const lineOffset = lines.length - 1;
	const ch = lines[lines.length - 1]?.length ?? 0;
	editor.setCursor({ line: cursor.line + lineOffset, ch: lineOffset === 0 ? cursor.ch + ch : ch });
}
