import { extractTitleFromClipboardHtml, isHttpUrl } from "../src/features/editor/smart-link-title";

describe("smart-link-title", () => {
	test("detects http url", () => {
		expect(isHttpUrl("https://example.com")).toBe(true);
		expect(isHttpUrl("http://example.com/a?b=c")).toBe(true);
		expect(isHttpUrl("example.com")).toBe(false);
		expect(isHttpUrl("https://example.com two")).toBe(false);
	});

	test("extracts title from clipboard html anchor", () => {
		const url = "https://example.com";
		const html = `<a href="https://example.com">Example Domain</a>`;
		expect(extractTitleFromClipboardHtml(html, url)).toBe("Example Domain");
	});

	test("extracts title tag when no anchor", () => {
		const url = "https://example.com";
		const html = `<!doctype html><html><head><title>My Title</title></head><body></body></html>`;
		expect(extractTitleFromClipboardHtml(html, url)).toBe("My Title");
	});
});

