import { Editor } from "obsidian";

export interface Replacement {
	replacement: string;
	range: { from: number; to: number };
}

function isInInlineCode(line: string, cursorCh: number): boolean {
	const before = line.slice(0, cursorCh);
	const ticks = (before.match(/`/g) ?? []).length;
	return ticks % 2 === 1;
}

function formatDate(d: Date): string {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function nextWeekday(from: Date, weekday0Sun: number): Date {
	const base = startOfDay(from);
	const day = base.getDay();
	let delta = (weekday0Sun - day + 7) % 7;
	if (delta === 0) delta = 7;
	return new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);
}

export function checkMagicDateInput(line: string, cursorCh: number): Replacement | null {
	if (cursorCh === 0) return null;
	if (isInInlineCode(line, cursorCh)) return null;

	const before = line.slice(0, cursorCh);

	// @tomorrow, @yesterday, @today
	const simple = before.match(/@(?:today|tomorrow|yesterday)$/i);
	if (simple) {
		const now = new Date();
		const key = simple[0].slice(1).toLowerCase();
		let d = startOfDay(now);
		if (key === "tomorrow") d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
		if (key === "yesterday") d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
		return {
			replacement: formatDate(d),
			range: { from: cursorCh - simple[0].length, to: cursorCh },
		};
	}

	// @next mon/tue/wed/thu/fri/sat/sun
	const next = before.match(/@next\s+(mon|tue|wed|thu|fri|sat|sun)$/i);
	if (next) {
		const map: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
		const key = next[1]?.toLowerCase() ?? "";
		const weekday = map[key];
		if (weekday === undefined) return null;
		const d = nextWeekday(new Date(), weekday);
		return { replacement: formatDate(d), range: { from: cursorCh - next[0].length, to: cursorCh } };
	}

	// Chinese minimal: @明天/@后天/@昨天/@今天/@下周一...@下周日
	const cnSimple = before.match(/@(今天|明天|后天|昨天)$/);
	if (cnSimple) {
		const now = startOfDay(new Date());
		let d = now;
		if (cnSimple[1] === "明天") d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
		if (cnSimple[1] === "后天") d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
		if (cnSimple[1] === "昨天") d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
		return { replacement: formatDate(d), range: { from: cursorCh - cnSimple[0].length, to: cursorCh } };
	}

	const cnNext = before.match(/@下周([一二三四五六日天])$/);
	if (cnNext) {
		const map: Record<string, number> = { 日: 0, 天: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
		const weekday = map[cnNext[1] ?? ""];
		if (weekday === undefined) return null;
		const d = nextWeekday(new Date(), weekday);
		return { replacement: formatDate(d), range: { from: cursorCh - cnNext[0].length, to: cursorCh } };
	}

	return null;
}

export function checkMagicSymbols(line: string, cursorCh: number): Replacement | null {
	if (cursorCh === 0) return null;
	if (isInInlineCode(line, cursorCh)) return null;

	const before = line.slice(0, cursorCh);
	const table: Array<{ needle: string; replacement: string }> = [
		{ needle: "-->", replacement: "→" },
		{ needle: "<--", replacement: "←" },
		{ needle: "<->", replacement: "↔" },
		{ needle: "...", replacement: "…" },
	];

	for (const { needle, replacement } of table) {
		if (!before.endsWith(needle)) continue;
		return { replacement, range: { from: cursorCh - needle.length, to: cursorCh } };
	}
	return null;
}

export function applyReplacementAtCursor(editor: Editor, r: Replacement) {
	const cursor = editor.getCursor();
	editor.replaceRange(r.replacement, { line: cursor.line, ch: r.range.from }, { line: cursor.line, ch: r.range.to });
}

