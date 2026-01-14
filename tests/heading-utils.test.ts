import { Editor } from 'obsidian';
import { setHeading } from '../src/features/formatting/heading-utils';

class MockEditor {
    private lines: string[];
    private cursor: { line: number; ch: number };

    constructor(content: string) {
        this.lines = content.split('\n');
        this.cursor = { line: 0, ch: 0 };
    }

    getCursor() { return this.cursor; }
    setCursor(pos: { line: number, ch: number }) { this.cursor = pos; }

    getLine(line: number) { return this.lines[line]; }
    setLine(line: number, text: string) { this.lines[line] = text; }

    getValue() { return this.lines.join('\n'); }
}

describe('Heading Utils', () => {
    test('sets H1 on plain text', () => {
        const editor = new MockEditor('Title');
        setHeading(editor as any, 1);
        expect(editor.getValue()).toBe('# Title');
    });

    test('sets H2 on plain text', () => {
        const editor = new MockEditor('Section');
        setHeading(editor as any, 2);
        expect(editor.getValue()).toBe('## Section');
    });

    test('changes H1 to H3', () => {
        const editor = new MockEditor('# Title');
        setHeading(editor as any, 3);
        expect(editor.getValue()).toBe('### Title');
    });

    test('replaces existing hash even without space', () => {
        const editor = new MockEditor('#Title');
        setHeading(editor as any, 2);
        // Should Normalize to space
        expect(editor.getValue()).toBe('## Title');
    });

    test('sets level 0 (clear heading)', () => {
        const editor = new MockEditor('### Title');
        setHeading(editor as any, 0);
        expect(editor.getValue()).toBe('Title');
    });

    test('handles empty line', () => {
        const editor = new MockEditor('');
        setHeading(editor as any, 1);
        expect(editor.getValue()).toBe('# ');
    });
});
