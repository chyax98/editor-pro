import { Editor } from "obsidian";

/**
 * 检测光标是否在代码块内
 *
 * 实现说明：从文件开头扫描，统计 ```/~~~ 配对状态
 * 性能说明：对于 1000 行文档约 1ms，对常规文件无影响
 *
 * 注意：之前使用"向上扫描 200 行"的方案存在误判问题 ——
 * 如果代码块开始于 200 行之前，会错误地认为不在代码块内。
 */
function isInFencedCodeBlock(editor: Editor, line: number): boolean {
	let inFence = false;
	for (let i = 0; i <= line; i++) {
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
	//1. item
	// - [ ] task
	const indent = getLeadingSpaces(text);
	const rest = text.slice(indent);
	if (/^([-*+])\s+/.test(rest)) return { indent };
	if (/^\d+\.\s+/.test(rest)) return { indent };
	return null;
}

function getListItemBlock(
	editor: Editor,
	startLine: number,
): { start: number; end: number; indent: number } | null {
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

function replaceLineRange(
	editor: Editor,
	start: number,
	end: number,
	nextLines: string[],
) {
	const endLineText = editor.getLine(end);
	editor.replaceRange(
		nextLines.join("\n"),
		{ line: start, ch: 0 },
		{ line: end, ch: endLineText.length },
	);
}

function getLines(editor: Editor, start: number, end: number): string[] {
	const lines: string[] = [];
	for (let i = start; i <= end; i++) lines.push(editor.getLine(i));
	return lines;
}

function findSiblingBlock(
	editor: Editor,
	block: { start: number; end: number; indent: number },
	direction: -1 | 1,
): { start: number; end: number; indent: number } | null {
	const step = direction;
	let i = direction === -1 ? block.start - 1 : block.end + 1;
	// Prevent infinite loop by adding iteration limit
	const maxIterations = editor.lineCount();
	let iterations = 0;

	while (i >= 0 && i < editor.lineCount() && iterations < maxIterations) {
		const t = editor.getLine(i);
		if (!t.trim()) {
			i += step;
			iterations++;
			continue;
		}

		const list = isListItemLine(t);
		if (
			list &&
			list.indent === block.indent &&
			!isInFencedCodeBlock(editor, i)
		) {
			return getListItemBlock(editor, i);
		}

		i += step;
		iterations++;
	}

	return null;
}

export function moveListItemBlock(editor: Editor, direction: -1 | 1): boolean {
	const cursor = editor.getCursor();
	const block = getListItemBlock(editor, cursor.line);
	if (!block) return false;

	const sibling = findSiblingBlock(editor, block, direction);
	if (!sibling) return false;

	const a = direction === -1 ? sibling : block;
	const b = direction === -1 ? block : sibling;

	// Preserve whitespace gap between blocks.
	const gapStart = a.end + 1;
	const gapEnd = b.start - 1;
	const gap = gapEnd >= gapStart ? getLines(editor, gapStart, gapEnd) : [];

	const aLines = getLines(editor, a.start, a.end);
	const bLines = getLines(editor, b.start, b.end);
	const next =
		direction === -1
			? [...bLines, ...gap, ...aLines]
			: [...bLines, ...gap, ...aLines];

	replaceLineRange(editor, a.start, b.end, next);

	const shift = b.end - b.start + 1 + gap.length;
	const nextLine =
		direction === -1 ? cursor.line - shift : cursor.line + shift;
	editor.setCursor({
		line: Math.max(0, Math.min(editor.lineCount() - 1, nextLine)),
		ch: cursor.ch,
	});
	return true;
}

export function handleOutlinerIndent(
	editor: Editor,
	evt: KeyboardEvent,
): boolean {
	if (evt.key !== "Tab") return false;
	if (evt.ctrlKey || evt.metaKey || evt.altKey) return false;

	const cursor = editor.getCursor();
	const block = getListItemBlock(editor, cursor.line);
	if (!block) return false;

	evt.preventDefault();

	const lines: string[] = [];
	for (let i = block.start; i <= block.end; i++)
		lines.push(editor.getLine(i));

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

// 清理缓存函数，供插件卸载时调用
export function clearFenceCache() {
	// 无缓存需要清理
}
