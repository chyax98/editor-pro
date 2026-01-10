import { wrapWithCallout, wrapWithCodeBlock, wrapWithQuote } from '../src/features/callout/wrap-callout';
import { Editor } from 'obsidian';

describe('wrapWithCallout', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    test('wraps selection with callout', () => {
        editor._setText('Line 1\nLine 2');
        editor._setSelection({ line: 0, ch: 0 }, { line: 1, ch: 6 }); // Select all
        
        wrapWithCallout(editor as any, { type: 'note', title: 'My Title' });
        
        const text = editor._getText();
        // Expected format:
        // > [!note] My Title
        // > Line 1
        // > Line 2
        expect(text).toContain('> [!note] My Title');
        expect(text).toContain('> Line 1');
        expect(text).toContain('> Line 2');
    });

    test('wraps single line if no selection', () => {
        editor._setText('Hello World');
        editor._setCursor(0, 5);
        
        wrapWithCallout(editor as any, { type: 'tip' });
        
        const text = editor._getText();
        expect(text).toContain('> [!tip] ');
        expect(text).toContain('> Hello World');
    });

    test('supports foldable option', () => {
        editor._setText('Content');
        editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 7 });
        
        wrapWithCallout(editor as any, { type: 'info', foldable: true });
        
        const text = editor._getText();
        expect(text).toContain('> [!info]-');
    });
});

describe('wrapWithCodeBlock', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    test('wraps selection with code block', () => {
        editor._setText('console.log("hi");');
        editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 18 });
        
        wrapWithCodeBlock(editor as any, 'js');
        
        const text = editor._getText();
        expect(text).toBe('```js\nconsole.log("hi");\n```');
    });

    test('wraps line if no selection', () => {
        editor._setText('print("hello")');
        editor._setCursor(0, 0);
        
        wrapWithCodeBlock(editor as any, 'python');
        
        const text = editor._getText();
        expect(text).toBe('```python\nprint("hello")\n```');
    });
});

describe('wrapWithQuote', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    test('adds > to each line of selection', () => {
        editor._setText('A\nB');
        editor._setSelection({ line: 0, ch: 0 }, { line: 1, ch: 1 });
        
        wrapWithQuote(editor as any);
        
        const text = editor._getText();
        expect(text).toBe('> A\n> B');
    });
});
