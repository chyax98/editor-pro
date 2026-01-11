import { Editor } from "obsidian";

function nextFootnoteNumber(text: string): number {
	let max = 0;
	const re = /\[\^(\d+)\]/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text))) {
		const n = Number(m[1]);
		if (Number.isFinite(n)) max = Math.max(max, n);
	}
	return max + 1;
}

export function insertFootnote(editor: Editor): void {
	const full = editor.getValue();
	const n = nextFootnoteNumber(full);
	const marker = `[^${n}]`;

	// Insert marker at cursor end (if selection exists, keep selection).
	const cursor = editor.getCursor("to");
	editor.replaceRange(marker, cursor, cursor);

	// Append definition at end of file.
	const lastLine = editor.lineCount() - 1;
	const lastLineText = editor.getLine(lastLine);
	const prevLineText = lastLine > 0 ? editor.getLine(lastLine - 1) : null;

	let prefix = "";
	if (lastLineText.length > 0) {
		// No trailing newline.
		prefix = "\n\n";
	} else if (prevLineText !== null && prevLineText.length > 0) {
		// Trailing newline, but not a blank line.
		prefix = "\n";
	}

	const endPos = { line: lastLine, ch: lastLineText.length };
	editor.replaceRange(prefix + `[^${n}]: `, endPos, endPos);

	const newLastLine = editor.lineCount() - 1;
	editor.setCursor({ line: newLastLine, ch: `[^${n}]: `.length });
}
