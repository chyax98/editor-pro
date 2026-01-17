import { Editor } from "obsidian";

/**
 * 智能排版与输入增强
 */

// Cache regex patterns for performance
const CN_REGEX = /[\u4e00-\u9fa5]/;
const EN_REGEX = /[a-zA-Z0-9]/;

// 1. 中英文之间自动加空格
// 规则：CN+EN -> CN + space + EN
// 规则：EN+CN -> EN + space + CN
export function handleSmartSpacing(editor: Editor) {
	const cursor = editor.getCursor();
	// 只检查光标前2个字符和光标后1个字符（简单版，避免全文档扫描）
	// 实际上 editor-change 事件触发时，字符已经上屏。

	const line = editor.getLine(cursor.line);
	if (line.length < 2) return;

	// 防止负索引：确保 cursor.ch >= 2
	if (cursor.ch < 2) return;

	const leftChar = line.charAt(cursor.ch - 2);
	const rightChar = line.charAt(cursor.ch - 1);

	if (!leftChar || !rightChar) return;

	const isCN = (char: string) => CN_REGEX.test(char);
	const isEN = (char: string) => EN_REGEX.test(char);

	// 中英文混排自动加空格（合并情况 A 和 B 的重复逻辑）
	if (
		(isCN(leftChar) && isEN(rightChar)) ||
		(isEN(leftChar) && isCN(rightChar))
	) {
		editor.replaceRange(
			" " + rightChar,
			{ line: cursor.line, ch: cursor.ch - 1 },
			{ line: cursor.line, ch: cursor.ch },
		);
		return;
	}
}

// 2. 自动配对符号 (中英文)
export const PAIR_MAP: Record<string, string> = {
	"【": "】",
	"《": "》",
	"“": "”",
	"（": "）",
	"「": "」",
	"(": ")",
	"[": "]",
	"{": "}",
	'"': '"',
	"'": "'",
};

export function handleAutoPair(
	editor: Editor,
	typedChar: string,
	evt: KeyboardEvent,
): boolean {
	const closeChar = PAIR_MAP[typedChar];
	if (!closeChar) return false;

	// A. 如果有选区 -> 包裹选区 (Surround Selection)
	if (editor.somethingSelected()) {
		evt.preventDefault();
		const selection = editor.getSelection();
		editor.replaceSelection(typedChar + selection + closeChar);
		// 保持选中状态，或者光标移动到末尾？通常习惯是保持选中，或者取消选中放在末尾。
		// VSCode 行为：保持选中。
		// 但 Obsidian replaceSelection 后默认不选中。我们手动恢复选中稍微复杂，这里先简化：包裹后光标放在末尾。
		return true;
	}

	// B. 如果没有选区 -> 自动补全配对
	evt.preventDefault();
	const cursor = editor.getCursor();
	editor.replaceRange(typedChar + closeChar, cursor);
	editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });

	return true;
}

// 3. 智能退格 (Smart Backspace)
// 当光标在配对符号中间时 '(|)'，按下 Backspace 同时删除左右符号
export function handleSmartBackspace(
	editor: Editor,
	evt: KeyboardEvent,
): boolean {
	if (evt.key !== "Backspace") return false;
	if (editor.somethingSelected()) return false;

	const cursor = editor.getCursor();
	if (cursor.ch === 0) return false;

	const line = editor.getLine(cursor.line);
	const leftChar = line.charAt(cursor.ch - 1);
	const rightChar = line.charAt(cursor.ch);

	// 检查是否是一对
	if (PAIR_MAP[leftChar] === rightChar) {
		evt.preventDefault();
		// 删除左边和右边各一个字符
		editor.replaceRange(
			"",
			{ line: cursor.line, ch: cursor.ch - 1 },
			{ line: cursor.line, ch: cursor.ch + 1 },
		);
		return true;
	}

	return false;
}
