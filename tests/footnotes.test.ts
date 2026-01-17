import { insertFootnote } from '../src/features/tools/footnotes';

// Mock Editor
function createMockEditor(lines: string[], cursor: { line: number; ch: number }) {
    let content = lines.join('\n');
    let currentCursor = { ...cursor };

    return {
        getValue: () => content,
        getCursor: () => currentCursor,
        getLine: (n: number) => content.split('\n')[n] || '',
        lineCount: () => content.split('\n').length,
        replaceRange: (text: string, from: { line: number; ch: number }, to?: { line: number; ch: number }) => {
            const allLines = content.split('\n');
            const start = allLines.slice(0, from.line).join('\n').length + (from.line > 0 ? 1 : 0) + from.ch;
            const end = to
                ? allLines.slice(0, to.line).join('\n').length + (to.line > 0 ? 1 : 0) + to.ch
                : start;
            content = content.slice(0, start) + text + content.slice(end);
        },
        setCursor: (pos: { line: number; ch: number }) => {
            currentCursor = pos;
        },
        getContent: () => content,
    };
}

describe('Footnotes', () => {
    test('inserts first footnote marker and reference', () => {
        const editor = createMockEditor(['Hello world'], { line: 0, ch: 5 });
        insertFootnote(editor as any);

        const content = editor.getContent();
        expect(content).toContain('[^1]');
        expect(content).toContain('[^1]: ');
    });

    test('increments footnote number when footnotes exist', () => {
        const editor = createMockEditor([
            'Hello[^1] world',
            '',
            '[^1]: First note'
        ], { line: 0, ch: 15 });
        insertFootnote(editor as any);

        const content = editor.getContent();
        expect(content).toContain('[^2]');
        expect(content).toContain('[^2]: ');
    });

    test('handles multiple existing footnotes', () => {
        const editor = createMockEditor([
            'Hello[^1] world[^2]',
            '',
            '[^1]: First',
            '[^2]: Second'
        ], { line: 0, ch: 19 });
        insertFootnote(editor as any);

        const content = editor.getContent();
        expect(content).toContain('[^3]');
    });
});
