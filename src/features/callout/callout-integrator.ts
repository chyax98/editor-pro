import { Editor } from "obsidian";
import { CalloutTypePicker } from "./callout-picker";

/**
 * 切换 Callout 前缀 (Toggle >)
 * - 如果选区所有行都以 `> ` 开头，则移除
 * - 否则，给所有行添加 `> `
 */
// Alias for toggleBlockquote (legacy)
export const toggleCalloutPrefix = toggleBlockquote;

/**
 * 切换引用块前缀 (Toggle >)
 * - 如果选区所有行都以 `> ` 开头，则移除
 * - 否则，给所有行添加 `> `
 */
export function toggleBlockquote(editor: Editor) {

    const selection = editor.getSelection();

    if (selection) {
        // 处理选区
        const selectedRange = editor.listSelections()[0];
        if (!selectedRange) return;

        let fromLine = selectedRange.anchor.line;
        let toLine = selectedRange.head.line;

        // 确保 from <= to
        if (fromLine > toLine) {
            [fromLine, toLine] = [toLine, fromLine];
        }

        const lines = [];
        for (let i = fromLine; i <= toLine; i++) {
            lines.push(editor.getLine(i));
        }

        const allHavePrefix = lines.every(line => line.trim().startsWith('>'));

        const newLines = lines.map(line => {
            if (allHavePrefix) {
                // 移除 >
                return line.replace(/^\s*>\s?/, '');
            } else {
                // 添加 >
                return `> ${line}`;
            }
        });

        // 替换范围（整行替换）
        const from = { line: fromLine, ch: 0 };
        const to = { line: toLine, ch: editor.getLine(toLine).length };
        editor.replaceRange(newLines.join('\n'), from, to);

        // 重新选中（方便连续操作）
        // 计算新的结束位置长度
        // const newLength = newLines.join('\n').length;
        // editor.setSelection(from, { line: toLine, ch: newLines[newLines.length-1].length });

    } else {
        // 处理当前行
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);

        if (line.trim().startsWith('>')) {
            // 移除 >
            const newLine = line.replace(/^\s*>\s?/, '');
            editor.setLine(cursor.line, newLine);
        } else {
            // 添加 >
            editor.setLine(cursor.line, `> ${line}`);
        }
    }
}

/**
 * 修改当前 Callout 类型
 * - 向上查找 Callout 标题行 `> [!type]`
 * - 弹出选择器
 * - 替换类型
 */
export function changeCalloutType(editor: Editor, app: any) {
    const cursor = editor.getCursor();
    const currentLineNum = cursor.line;

    // 1. 向上查找 Callout Header
    let headerLineNum = -1;
    let headerContent = '';

    // 向上找最多 50 行（避免性能问题）
    for (let i = currentLineNum; i >= Math.max(0, currentLineNum - 50); i--) {
        const line = editor.getLine(i);
        if (line.match(/^\s*>\s*\[!(\w+)\]/)) {
            headerLineNum = i;
            headerContent = line;
            break;
        }
        // 如果遇到非引用行，说明断了，停止查找
        if (!line.trim().startsWith('>')) {
            break;
        }
    }

    if (headerLineNum === -1) {
        // 没找到，提示用户可能不在 Callout 内
        // console.log("Not inside a callout");
        return;
    }

    // 2. 弹出选择器
    new CalloutTypePicker(app, (newType) => {
        // 3. 替换类型
        // Regex: > [!oldType](+/-?) title
        const newHeader = headerContent.replace(
            /(^\s*>\s*\[!)(\w+)(\])/,
            `$1${newType}$3`
        );
        editor.setLine(headerLineNum, newHeader);
    }).open();
}
