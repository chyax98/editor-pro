import { Editor } from "obsidian";
import { deleteColumn, insertColumn, joinTableRow, setColumnAlign, splitTableRow } from "../../utils/table-generators";

function isTableLine(line: string): boolean {
	return line.trim().startsWith("|");
}

function getTableBounds(editor: Editor, line: number): { from: number; to: number } | null {
	const currentLine = editor.getLine(line);
	if (!currentLine || !isTableLine(currentLine)) return null;
	let from = line;
	let to = line;

	while (from > 0) {
		const prevLine = editor.getLine(from - 1);
		if (!prevLine || !isTableLine(prevLine)) break;
		from--;
	}
	while (to < editor.lineCount() - 1) {
		const nextLine = editor.getLine(to + 1);
		if (!nextLine || !isTableLine(nextLine)) break;
		to++;
	}

	return { from, to };
}

function getTableRows(editor: Editor, bounds: { from: number; to: number }): string[] {
	const rows: string[] = [];
	for (let i = bounds.from; i <= bounds.to; i++) rows.push(editor.getLine(i));
	return rows;
}

function getColumnIndexAtCh(row: string, ch: number): number {
	if (!row || row.length === 0) return 0;

	const cells = splitTableRow(row);
	if (cells.length <= 1) return 0;

	let boundaryCount = 0;
	const maxI = Math.min(ch, row.length);
	for (let i = 0; i < maxI; i++) {
		if (row[i] === "|" && !(i > 0 && row[i - 1] === "\\")) {
			boundaryCount++;
		}
	}

	// If row starts with "|", first boundary is before col 0.
	const startsWithPipe = row.trimStart().startsWith("|");
	let col = startsWithPipe ? boundaryCount - 1 : boundaryCount;
	if (Number.isNaN(col) || col < 0) col = 0;
	return Math.max(0, Math.min(cells.length - 1, col));
}

function replaceTable(editor: Editor, bounds: { from: number; to: number }, nextRows: string[]) {
	const endLine = editor.getLine(bounds.to);
	editor.replaceRange(nextRows.join("\n"), { line: bounds.from, ch: 0 }, { line: bounds.to, ch: endLine.length });
}

function formatTableRows(rows: string[]): string[] {
	return rows.map((row) => {
		if (!isTableLine(row)) return row;
		return joinTableRow(splitTableRow(row));
	});
}

export type TableOp =
	| { type: "insert-col"; side: "left" | "right" }
	| { type: "delete-col" }
	| { type: "align-col"; align: "left" | "center" | "right" }
	| { type: "format" };

export function applyTableOp(editor: Editor, op: TableOp): boolean {
	const cursor = editor.getCursor();
	const bounds = getTableBounds(editor, cursor.line);
	if (!bounds) return false;

	const rows = getTableRows(editor, bounds);
	const colIndex = getColumnIndexAtCh(editor.getLine(cursor.line), cursor.ch);

	let nextRows = rows;
	switch (op.type) {
		case "insert-col":
			nextRows = insertColumn(rows, colIndex, op.side);
			break;
		case "delete-col":
			nextRows = deleteColumn(rows, colIndex);
			break;
		case "align-col":
			nextRows = setColumnAlign(rows, colIndex, op.align);
			break;
		case "format":
			nextRows = formatTableRows(rows);
			break;
	}

	replaceTable(editor, bounds, nextRows);
	return true;
}

