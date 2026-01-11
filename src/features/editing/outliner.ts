import { Editor } from "obsidian";

function isInFencedCodeBlock(editor: Editor, line: number): boolean {
	// Cheap heuristic: scan up to 200 lines up for ```/~~~ fences.
	const start = Math.max(0, line - 200);
	let inFence = false;
	for (let i = start; i <= line; i++) {
		const text = editor.getLine(i).trim();
		if (text.startsWith("```") || text.startsWith("~~~")) {
			inFence = !inFence;
		}
	}
	return inFence;
}

function getLeadingSpaces(text: string): number {
	let i = 0;
	while (i < text.length && text[i] === " ") i++;
	return i;
}

function isListItemLine(text: string): { indent: number } | null {
	// - item
	// * item
	// + item
	// 1. item
	// - [ ] task
	const indent = getLeadingSpaces(text);
	const rest = text.slice(indent);
	if (/^([-*+])\s+/.test(rest)) return { indent };
	if (/^\d+\.\s+/.test(rest)) return { indent };
	return null;
}

function getListItemBlock(editor: Editor, startLine: number): { start: number; end: number; indent: number } | null {
	const lineText = editor.getLine(startLine);
	const list = isListItemLine(lineText);
	if (!list) return null;
	if (isInFencedCodeBlock(editor, startLine)) return null;

	const { indent } = list;
	let end = startLine;

	for (let i = startLine + 1; i < editor.lineCount(); i++) {
		const t = editor.getLine(i);
		if (!t.trim()) break;
		const leading = getLeadingSpaces(t);
		if (leading > indent) {
			end = i;
			continue;
		}
		break;
	}

	return { start: startLine, end, indent };
}

function replaceLineRange(editor: Editor, start: number, end: number, nextLines: string[]) {
	const endLineText = editor.getLine(end);
	editor.replaceRange(nextLines.join("\n"), { line: start, ch: 0 }, { line: end, ch: endLineText.length });
}

export function handleOutlinerIndent(editor: Editor, evt: KeyboardEvent): boolean {
	if (evt.key !== "Tab") return false;
	if (evt.ctrlKey || evt.metaKey || evt.altKey) return false;

	const cursor = editor.getCursor();
	const block = getListItemBlock(editor, cursor.line);
	if (!block) return false;

	evt.preventDefault();

	const lines: string[] = [];
	for (let i = block.start; i <= block.end; i++) lines.push(editor.getLine(i));

	const delta = evt.shiftKey ? -2 : 2;
	const nextLines = lines.map((line) => {
		if (delta > 0) return "  " + line;
		// outdent
		if (line.startsWith("  ")) return line.slice(2);
		if (line.startsWith(" ")) return line.slice(1);
		return line;
	});

	replaceLineRange(editor, block.start, block.end, nextLines);

	const nextCh = Math.max(0, cursor.ch + delta);
	editor.setCursor({ line: cursor.line, ch: nextCh });
	return true;
}

export function toggleFold(editor: Editor) {
	editor.exec("toggleFold");
}

