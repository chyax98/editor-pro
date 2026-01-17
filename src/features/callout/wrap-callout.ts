import { Editor } from "obsidian";

export interface CalloutOptions {
	type: string;
	title?: string;
	foldable?: boolean; // true for collapsed (-), false for open (+)
}

export function wrapWithCallout(editor: Editor, options: CalloutOptions) {
	const selection = editor.getSelection();
	let content = selection;
	let rangeToReplace = null;

	if (!selection) {
		const cursor = editor.getCursor();
		content = editor.getLine(cursor.line);
		rangeToReplace = {
			from: { line: cursor.line, ch: 0 },
			to: { line: cursor.line, ch: content.length },
		};
	}

	const lines = content.split("\n");
	let title = options.title || "";
	let bodyLines = lines;

	// Smart Title Detection: If no title provided, and first line is short and looks like a title
	const firstLine = lines[0];
	if (
		!title &&
		lines.length > 1 &&
		firstLine &&
		firstLine.length < 50 &&
		!firstLine.startsWith(">")
	) {
		title = firstLine;
		bodyLines = lines.slice(1);
	}

	const formattedBody = bodyLines.map((l) => `> ${l}`).join("\n");
	const header = `> [!${options.type}]${options.foldable === true ? "-" : options.foldable === false ? "+" : ""} ${title}`;

	const result = `${header}\n${formattedBody}`;

	if (rangeToReplace) {
		editor.replaceRange(result, rangeToReplace.from, rangeToReplace.to);
	} else {
		editor.replaceSelection(result);
	}
}

export function wrapWithQuote(editor: Editor) {
	const selection = editor.getSelection();
	if (!selection) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		editor.replaceRange(
			`> ${line}`,
			{ line: cursor.line, ch: 0 },
			{ line: cursor.line, ch: line.length },
		);
	} else {
		const lines = selection.split("\n");
		const result = lines.map((l) => `> ${l}`).join("\n");
		editor.replaceSelection(result);
	}
}

export function wrapWithCodeBlock(editor: Editor, lang: string = "") {
	const selection = editor.getSelection();
	if (!selection) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		// If line is empty, we want to place cursor inside the block
		if (line.trim() === "") {
			const result = "```" + lang + "\n\n```";
			editor.replaceRange(
				result,
				{ line: cursor.line, ch: 0 },
				{ line: cursor.line, ch: line.length },
			);
			// Move cursor to the middle line
			editor.setCursor({ line: cursor.line + 1, ch: 0 });
		} else {
			// Wrap existing line
			const result = "```" + lang + "\n" + line + "\n```";
			editor.replaceRange(
				result,
				{ line: cursor.line, ch: 0 },
				{ line: cursor.line, ch: line.length },
			);
		}
	} else {
		const result = "```" + lang + "\n" + selection + "\n```";
		editor.replaceSelection(result);
	}
}
