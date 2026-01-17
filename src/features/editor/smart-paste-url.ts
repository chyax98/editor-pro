import { Editor } from "obsidian";

function isLikelyUrl(text: string): boolean {
	const t = text.trim();
	if (!t) return false;
	if (/\s/.test(t)) return false;
	return /^https?:\/\/\S+$/i.test(t);
}

function escapeMarkdownLinkLabel(label: string): string {
	return label.replace(/[\\[\]]/g, (m) => `\\${m}`);
}

/**
 * Notion-style behavior:
 * - If there is a non-empty selection and clipboard is a URL,
 *   replace selection with `[selection](url)`.
 * - Otherwise do nothing (let Obsidian handle paste).
 */
export function smartPasteUrlIntoSelection(
	editor: Editor,
	clipboardText: string,
): boolean {
	const url = clipboardText.trim();
	if (!isLikelyUrl(url)) return false;

	const selection = editor.getSelection();
	if (!selection) return false;
	if (selection.includes("\n")) return false;

	const label = escapeMarkdownLinkLabel(selection);
	editor.replaceSelection(`[${label}](${url})`);
	return true;
}
