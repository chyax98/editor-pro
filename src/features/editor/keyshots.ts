import { Editor } from "obsidian";
import { moveListItemBlock } from "./outliner";

/**
 * 模拟 IDE 的快捷操作
 */

// 1. 向上移动当前行
export function moveLineUp(editor: Editor) {
	if (moveListItemBlock(editor, -1)) return;
	const cursor = editor.getCursor();
	const lineCount = editor.lineCount();

	// 增加空文件检查
	if (lineCount === 0 || cursor.line === 0) return;

	const currentLine = editor.getLine(cursor.line);
	const prevLine = editor.getLine(cursor.line - 1);

	editor.replaceRange(
		currentLine + "\n" + prevLine,
		{ line: cursor.line - 1, ch: 0 },
		{ line: cursor.line, ch: currentLine.length },
	);

	// 保持光标跟随
	editor.setCursor({ line: cursor.line - 1, ch: cursor.ch });
}

// 2. 向下移动当前行
export function moveLineDown(editor: Editor) {
	if (moveListItemBlock(editor, 1)) return;
	const cursor = editor.getCursor();
	const lineCount = editor.lineCount();
	if (cursor.line === lineCount - 1) return; // 已经在最后一行

	const currentLine = editor.getLine(cursor.line);
	const nextLine = editor.getLine(cursor.line + 1);

	editor.replaceRange(
		nextLine + "\n" + currentLine,
		{ line: cursor.line, ch: 0 },
		{ line: cursor.line + 1, ch: nextLine.length },
	);

	// 保持光标跟随
	editor.setCursor({ line: cursor.line + 1, ch: cursor.ch });
}

// 3. 向下复制当前行 (Duplicate)
export function duplicateLine(editor: Editor) {
	const cursor = editor.getCursor();
	const currentLine = editor.getLine(cursor.line);

	editor.replaceRange("\n" + currentLine, {
		line: cursor.line,
		ch: currentLine.length,
	});

	// 光标移动到新行
	editor.setCursor({ line: cursor.line + 1, ch: cursor.ch });
}

// 4. 删除当前行
export function deleteLine(editor: Editor) {
	const cursor = editor.getCursor();
	const lineCount = editor.lineCount();

	if (lineCount === 0) {
		return; // 空文档，无需操作
	}

	if (lineCount === 1) {
		editor.setLine(0, "");
		editor.setCursor({ line: 0, ch: 0 });
		return;
	}

	// 如果是最后一行，删掉上一行的换行符
	if (cursor.line === lineCount - 1) {
		const prevLine = editor.getLine(cursor.line - 1);
		const prevLineLen = prevLine.length;
		editor.replaceRange(
			"",
			{ line: cursor.line - 1, ch: prevLineLen },
			{ line: cursor.line, ch: editor.getLine(cursor.line).length },
		);
		// 确保光标位置有效
		editor.setCursor({
			line: cursor.line - 1,
			ch: Math.max(0, prevLineLen),
		});
	} else {
		// 否则删掉本行及换行符
		editor.replaceRange(
			"",
			{ line: cursor.line, ch: 0 },
			{ line: cursor.line + 1, ch: 0 },
		);
		// 光标保持不动（内容上移了）
	}
}

// 5. 选中当前行
export function selectLine(editor: Editor) {
	const cursor = editor.getCursor();
	const lineContent = editor.getLine(cursor.line);

	editor.setSelection(
		{ line: cursor.line, ch: 0 },
		{ line: cursor.line, ch: lineContent.length },
	);
}
