import { Editor, EditorTransaction } from "obsidian";
import {
	isWrapped,
	unwrap,
	wrap,
	getWordBoundaries,
	findEnclosingMarker,
} from "../../utils/editor-utils";

export interface ToggleConfig {
	marker: string;
	// Command name for logging or internal use
	name?: string;
}

export function smartToggle(editor: Editor, config: ToggleConfig) {
	// Group all operations in a single transaction for proper undo support
	const tx: EditorTransaction = {};

	const selection = editor.getSelection();

	if (selection.length > 0) {
		// Case 1: Text is selected
		if (isWrapped(selection, config.marker)) {
			const unwrapped = unwrap(selection, config.marker);
			tx.replaceSelection = unwrapped;
		} else {
			tx.replaceSelection = wrap(selection, config.marker);
		}
	} else {
		// Case 2: No selection, check cursor context
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);

		// Check if we are inside a marker pair
		const markedRange = findEnclosingMarker(line, cursor.ch, config.marker);

		if (markedRange) {
			// Un-toggle: Remove markers
			const text = line.substring(markedRange.from, markedRange.to);
			const unwrapped = unwrap(text, config.marker);
			tx.changes = [
				{
					text: unwrapped,
					from: { line: cursor.line, ch: markedRange.from },
					to: { line: cursor.line, ch: markedRange.to },
				},
			];
		} else {
			// Toggle On:
			// Sub-case: Word under cursor?
			const wordRange = getWordBoundaries(line, cursor.ch);
			const word = line.substring(wordRange.from, wordRange.to);

			if (word.length > 0) {
				// Wrap the word
				tx.changes = [
					{
						text: wrap(word, config.marker),
						from: { line: cursor.line, ch: wordRange.from },
						to: { line: cursor.line, ch: wordRange.to },
					},
				];
				// Move cursor after the wrapped word
				tx.selection = {
					from: { line: cursor.line, ch: wordRange.from },
					to: {
						line: cursor.line,
						ch:
							wordRange.from +
							config.marker.length +
							word.length +
							config.marker.length,
					},
				};
			} else {
				// Insert empty marker and place cursor inside
				tx.changes = [
					{
						text: config.marker + config.marker,
						from: cursor,
						to: cursor,
					},
				];
				// Position cursor between markers
				tx.selection = {
					from: {
						line: cursor.line,
						ch: cursor.ch + config.marker.length,
					},
					to: {
						line: cursor.line,
						ch: cursor.ch + config.marker.length,
					},
				};
			}
		}
	}

	// Apply the transaction
	editor.transaction(tx, `smart-toggle:${config.name || config.marker}`);
}
