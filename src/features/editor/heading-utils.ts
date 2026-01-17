import { Editor } from "obsidian";

/**
 * 设置当前行标题等级
 * - 如果当前行已有标题标记，会先移除，再添加新的
 * - 如果 level 与当前一致，可选：视为切换（移除标题），此处暂只实现设置
 */
export function setHeading(editor: Editor, level: number) {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);

	// 移除行首已有的 # (及可能存在的空格)
	// 匹配 ^(\s*#+\s?)
	// 但通常我们只替换标准的 Markdown 标题 # 号
	const content = line.replace(/^\s*#+\s?/, "");

	// 如果 level 为 0，表示清除标题
	if (level === 0) {
		editor.setLine(cursor.line, content);
	} else {
		editor.setLine(cursor.line, "#".repeat(level) + " " + content);
	}
}
