import { Editor } from "obsidian";

export function handleBlockNavigation(evt: KeyboardEvent, editor: Editor) {
	// Only handle Shift + Enter
	if (evt.key !== "Enter" || !evt.shiftKey) return;

	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);

	// Check if we are in a blockquote or callout (starts with >)
	// We allow spaces before > (indentation)
	if (line.trimStart().startsWith(">")) {
		// Prevent default behavior (which might be "soft break" staying in quote)
		evt.preventDefault();
		evt.stopPropagation();

		// Insert a clean newline.
		// In Obsidian markdown, inserting '\n' from a quote line breaks the quote context for the new line.
		editor.replaceSelection("\n");

		// No need to manually move cursor, replaceSelection moves it to end of inserted text
	}
}
