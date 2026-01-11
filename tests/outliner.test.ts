import { Editor } from 'obsidian';

// Simple mock of Editor for testing
class MockEditor implements Editor {
	private content = '';
	private cursor = { line: 0, ch: 0 };
	private _lineCount = 100;

	// Internal state tracking
	private _lines: string[] = [];

	constructor(content: string = '') {
		this.content = content;
		this._lines = content.split('\n');
		this._lineCount = this._lines.length;
	}

	getValue(): string {
		return this.content;
	}

	getLine(line: number): string {
		return this._lines[line] ?? '';
	}

	lineCount(): number {
		return this._lineCount;
	}

	getCursor(from?: { line: number; ch: number }): { line: number; ch: number } {
		if (from !== undefined) {
			this.cursor = from;
		}
		return this.cursor;
	}

	replaceRange(text: string, from: { line: number; ch: number }, to: { line: number; ch: number }): void {
		const startLine = this._lines[from.line] ?? '';
		const lines = text.split('\n');
		// Replace lines from from.line to to.line
		this._lines.splice(from.line, to.line - from.line + 1, ...lines);
		// Update line count
		this._lineCount = this._lines.length;
		// Update cursor
		this.cursor = { line: to.line, ch: to.ch };
	}

	replaceSelection(text: string): void {
		this.content = text;
		this._lines = text.split('\n');
		this._lineCount = this._lines.length;
	}

	setCursor(pos: { line: number; ch: number }): void {
		this.cursor = pos;
	}

	_setCursor(line: number, ch: number): void {
		this.cursor = { line, ch };
	}

	setText(text: string): void {
		this.content = text;
	}

	setLine(line: number, text: string): void {
		this._lines[line] = text;
	}

	exec(command: string): void {
		// No-op for now
	}
}

jest.mocked(Editor, () => new MockEditor());

export { MockEditor };

describe('outliner', () => {
	test('mock editor can be instantiated', () => {
		const editor = new MockEditor('- item 1\n- item 2\n- item 3');
		expect(editor.getLine(0)).toBe('- item 1');
		expect(editor.lineCount()).toBe(3);
	});
});
