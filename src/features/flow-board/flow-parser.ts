export interface FlowSection {
	columnId: string;
	headingLine: number | null; // null means "intro" section (before first heading)
	headingText: string;
	baseLines: string[];
}

export interface FlowCard {
	id: string;
	columnId: string;
	title: string;
	order: number;
}

export interface FlowParseResult {
	sections: FlowSection[];
	cards: FlowCard[];
	cardBlocks: Map<string, string[]>;
}

function hash(text: string): string {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(16);
}

function getHeading(line: string): { level: number; text: string } | null {
	const m = line.match(/^(#{1,6})\s+(.*)$/);
	if (!m) return null;
	return { level: (m[1] ?? "").length, text: (m[2] ?? "").trim() };
}

function chooseColumnHeadingLevel(lines: string[]): number {
	const levels = new Set<number>();
	for (const line of lines) {
		const h = getHeading(line);
		if (h) levels.add(h.level);
	}
	if (levels.has(2)) return 2;
	if (levels.has(1)) return 1;
	// fallback: use the minimum heading level present, else default to 1.
	let min = 7;
	for (const l of levels) min = Math.min(min, l);
	return min === 7 ? 1 : min;
}

function isFence(line: string): boolean {
	const t = line.trim();
	return t.startsWith("```") || t.startsWith("~~~");
}

function leadingSpaces(line: string): number {
	let i = 0;
	while (i < line.length && line[i] === " ") i++;
	return i;
}

function isListItem(line: string): { indent: number } | null {
	const indent = leadingSpaces(line);
	const rest = line.slice(indent);
	if (/^([-*+])\s+/.test(rest)) return { indent };
	if (/^\d+\.\s+/.test(rest)) return { indent };
	return null;
}

function stripListMarker(line: string): string {
	return line
		.replace(/^\s*([-*+]|\d+\.)\s+/, "")
		.replace(/^\[[ xX]\]\s+/, "")
		.trim();
}

function trimTrailingBlank(lines: string[]): string[] {
	let end = lines.length;
	while (end > 0 && !lines[end - 1]?.trim()) end--;
	return lines.slice(0, end);
}

function extractCards(lines: string[], start: number, end: number): Array<{ start: number; end: number }> {
	const ranges: Array<{ start: number; end: number }> = [];
	let inFence = false;

	let i = start;
	while (i <= end) {
		const line = lines[i] ?? "";
		if (isFence(line)) {
			inFence = !inFence;
			i++;
			continue;
		}
		if (inFence) {
			i++;
			continue;
		}

		const li = isListItem(line);
		if (!li || li.indent !== 0) {
			i++;
			continue;
		}

		let j = i;
		while (j + 1 <= end) {
			const next = lines[j + 1] ?? "";
			if (!next.trim()) break;
			const nli = isListItem(next);
			if (nli && nli.indent === 0) break;
			if (leadingSpaces(next) > 0) {
				j++;
				continue;
			}
			break;
		}

		ranges.push({ start: i, end: j });
		i = j + 1;
	}

	return ranges;
}

export function parseMarkdownToFlowBoard(markdown: string): FlowParseResult {
	const lines = markdown.replace(/\r\n/g, "\n").split("\n");
	const level = chooseColumnHeadingLevel(lines);

	const headingLines: Array<{ line: number; text: string }> = [];
	for (let i = 0; i < lines.length; i++) {
		const h = getHeading(lines[i] ?? "");
		if (!h) continue;
		if (h.level === level) headingLines.push({ line: i, text: h.text || "Untitled" });
	}

	const sections: FlowSection[] = [];
	const cards: FlowCard[] = [];
	const cardBlocks = new Map<string, string[]>();

	const pushSection = (headingLine: number | null, headingText: string, start: number, end: number) => {
		const normalizedStart = Math.max(0, start);
		const normalizedEnd = Math.min(lines.length - 1, end);

		const columnId = headingLine === null ? "intro" : `h-${headingLine}`;
		if (normalizedStart > normalizedEnd || lines.length === 0) {
			sections.push({
				columnId,
				headingLine,
				headingText,
				baseLines: [],
			});
			return;
		}

		const ranges = extractCards(lines, normalizedStart, normalizedEnd);
		const removed = new Set<number>();
		for (const r of ranges) for (let i = r.start; i <= r.end; i++) removed.add(i);

		const baseLines: string[] = [];
		for (let i = normalizedStart; i <= normalizedEnd; i++) {
			if (removed.has(i)) continue;
			baseLines.push(lines[i] ?? "");
		}

		sections.push({
			columnId,
			headingLine,
			headingText,
			baseLines: trimTrailingBlank(baseLines),
		});

		ranges.forEach((r, idx) => {
			const block = lines.slice(r.start, r.end + 1);
			const id = `card-${r.start}-${hash(block.join("\n"))}`;
			const title = stripListMarker(lines[r.start] ?? "") || "Untitled";
			cards.push({ id, columnId, title, order: idx });
			cardBlocks.set(id, block);
		});
	};

	if (headingLines.length === 0) {
		pushSection(null, "Document", 0, Math.max(0, lines.length - 1));
		return { sections, cards, cardBlocks };
	}

	// Intro section (before first heading).
	if (headingLines[0]!.line > 0) {
		pushSection(null, "（无标题）", 0, headingLines[0]!.line - 1);
	}

	for (let i = 0; i < headingLines.length; i++) {
		const h = headingLines[i]!;
		const next = headingLines[i + 1];
		const sectionStart = h.line + 1;
		const sectionEnd = next ? next.line - 1 : lines.length - 1;
		pushSection(h.line, h.text || "Untitled", sectionStart, sectionEnd);
	}

	return { sections, cards, cardBlocks };
}

export function buildMarkdownFromFlowBoard(
	originalMarkdown: string,
	parsed: FlowParseResult,
	nextCards: FlowCard[],
): string {
	const lines = originalMarkdown.replace(/\r\n/g, "\n").split("\n");
	const cardsByCol = new Map<string, FlowCard[]>();
	for (const card of nextCards) {
		const list = cardsByCol.get(card.columnId) ?? [];
		list.push(card);
		cardsByCol.set(card.columnId, list);
	}
	for (const [col, list] of cardsByCol) {
		list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		cardsByCol.set(col, list);
	}

	const out: string[] = [];

	for (const sec of parsed.sections) {
		if (sec.headingLine !== null) {
			out.push(lines[sec.headingLine] ?? `## ${sec.headingText}`);
		}

		out.push(...trimTrailingBlank(sec.baseLines));

		const ordered = cardsByCol.get(sec.columnId) ?? [];
		if (ordered.length) {
			if (out.length && out[out.length - 1]?.trim()) out.push("");
			ordered.forEach((card, idx) => {
				const block = parsed.cardBlocks.get(card.id) ?? [`- ${card.title}`];
				out.push(...block);
				if (idx !== ordered.length - 1) out.push("");
			});
		}

		// Section separator
		if (out.length && out[out.length - 1]?.trim()) out.push("");
	}

	let text = out.join("\n").replace(/\s*$/g, "");
	text = text.length ? text + "\n" : "";
	return text;
}
