import { Editor } from "obsidian";
import { smartPasteUrlIntoSelection } from "../src/features/editor";

describe("smartPasteUrlIntoSelection", () => {
	test("wraps selection with pasted URL", () => {
		const editor: any = new Editor();
		editor._setText("Hello Obsidian");
		editor._setSelection({ line: 0, ch: 6 }, { line: 0, ch: 14 }); // Obsidian

		const handled = smartPasteUrlIntoSelection(editor as any, "https://obsidian.md");

		expect(handled).toBe(true);
		expect(editor._getText()).toBe("Hello [Obsidian](https://obsidian.md)");
	});

	test("does nothing when clipboard is not URL", () => {
		const editor: any = new Editor();
		editor._setText("Hello Obsidian");
		editor._setSelection({ line: 0, ch: 6 }, { line: 0, ch: 14 });

		const handled = smartPasteUrlIntoSelection(editor as any, "not-a-url");

		expect(handled).toBe(false);
		expect(editor._getText()).toBe("Hello Obsidian");
	});

	test("does nothing when no selection", () => {
		const editor: any = new Editor();
		editor._setText("Hello Obsidian");

		const handled = smartPasteUrlIntoSelection(editor as any, "https://obsidian.md");

		expect(handled).toBe(false);
		expect(editor._getText()).toBe("Hello Obsidian");
	});

	test("escapes brackets in label", () => {
		const editor: any = new Editor();
		editor._setText("A [B]");
		editor._setSelection({ line: 0, ch: 2 }, { line: 0, ch: 5 }); // [B]

		const handled = smartPasteUrlIntoSelection(editor as any, "https://example.com");

		expect(handled).toBe(true);
		expect(editor._getText()).toBe("A [\\[B\\]](https://example.com)");
	});
});
