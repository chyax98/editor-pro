import { Editor, EditorPosition } from "obsidian";

export type TextTransform =
	| { type: "upper" }
	| { type: "lower" }
	| { type: "title" }
	| { type: "sentence" }
	| { type: "trim-lines" }
	| { type: "remove-blank-lines" }
	| { type: "sort-lines"; descending?: boolean }
	| { type: "join-lines"; separator?: string };

function getRange(editor: Editor): { from: EditorPosition; to: EditorPosition; text: string } | null {
	if (editor.somethingSelected()) {
		const from = editor.getCursor("from");
		const to = editor.getCursor("to");
		const text = editor.getSelection();
		return { from, to, text };
	}

	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	return {
		from: { line: cursor.line, ch: 0 },
		to: { line: cursor.line, ch: line.length },
		text: line,
	};
}

function toTitleCase(text: string): string {
	return text.replace(/\b([A-Za-z])([A-Za-z]*)\b/g, (_m, a: string, rest: string) => a.toUpperCase() + rest.toLowerCase());
}

function toSentenceCase(text: string): string {
	let out = text.trimStart().toLowerCase();
	out = out.replace(/(^\s*[a-z])/, (m) => m.toUpperCase());
	out = out.replace(/([.!?]\s+)([a-z])/g, (_m, p1: string, p2: string) => p1 + p2.toUpperCase());
	return out;
}

function splitLines(text: string): string[] {
	return text.replace(/\r\n/g, "\n").split("\n");
}

function applyTransform(text: string, t: TextTransform): string {
	switch (t.type) {
		case "upper":
			return text.toUpperCase();
		case "lower":
			return text.toLowerCase();
		case "title":
			return toTitleCase(text);
		case "sentence":
			return toSentenceCase(text);
		case "trim-lines":
			return splitLines(text)
				.map((l) => l.trimEnd())
				.join("\n");
		case "remove-blank-lines":
			return splitLines(text)
				.filter((l) => l.trim().length > 0)
				.join("\n");
		case "sort-lines": {
			const lines = splitLines(text);
			const sorted = lines.slice().sort((a, b) => a.localeCompare(b));
			if (t.descending) sorted.reverse();
			return sorted.join("\n");
		}
		case "join-lines":
			return splitLines(text)
				.map((l) => l.trimEnd())
				.join(t.separator ?? " ");
	}
}

export function transformEditorText(editor: Editor, transform: TextTransform): boolean {
	const range = getRange(editor);
	if (!range) return false;

	const next = applyTransform(range.text, transform);
	if (next === range.text) return false;

	editor.replaceRange(next, range.from, range.to);
	return true;
}

