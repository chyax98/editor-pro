import { buildMarkdownFromFlowBoard, parseMarkdownToFlowBoard } from "../src/features/flow-board/flow-parser";

describe("Flow board parser", () => {
	test("parses headings into sections and list blocks into cards", () => {
		const md = [
			"# Title",
			"",
			"## Todo",
			"- [ ] Task A",
			"  - child",
			"- [ ] Task B",
			"",
			"## Done",
			"- [x] Task C",
			"",
		].join("\n");

		const parsed = parseMarkdownToFlowBoard(md);
		expect(parsed.sections.some((s) => s.headingText.includes("Todo"))).toBe(true);
		expect(parsed.cards.length).toBe(3);
	});

	test("rebuilds markdown when cards move columns", () => {
		const md = ["## A", "- one", "", "## B", "- two", ""].join("\n");
		const parsed = parseMarkdownToFlowBoard(md);
		const a = parsed.sections.find((s) => s.headingText === "A")!;
		const b = parsed.sections.find((s) => s.headingText === "B")!;

		const one = parsed.cards.find((c) => c.title === "one")!;
		const nextCards = parsed.cards.map((c) => (c.id === one.id ? { ...c, columnId: b.columnId, order: 99 } : c));
		const next = buildMarkdownFromFlowBoard(md, parsed, nextCards);
		expect(next.includes("## A")).toBe(true);
		expect(next.includes("## B")).toBe(true);
		expect(next.indexOf("one")).toBeGreaterThan(next.indexOf("## B"));
		expect(a.columnId).not.toEqual(b.columnId);
	});
});

