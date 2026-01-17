import { smartToggle } from '../src/features/editor';
import { Editor } from 'obsidian';

describe('smartToggle', () => {
    let editor: any; // Use any to access mock methods

    beforeEach(() => {
        editor = new Editor();
    });

    test('wraps selection with markers (Bold)', () => {
        editor._setText('Hello World');
        editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 }); // Select "Hello"
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('**Hello** World');
    });

    test('unwraps selection if already wrapped (Bold)', () => {
        editor._setText('**Hello** World');
        editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 }); // Select "**Hello**"
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('Hello World');
    });

    test('wraps word under cursor if no selection', () => {
        editor._setText('Hello World');
        editor._setCursor(0, 2); // Cursor in "He|llo"
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('**Hello** World');
    });

    test('unwraps word under cursor if inside markers', () => {
        editor._setText('**Hello** World');
        editor._setCursor(0, 4); // Cursor inside "**He|llo**"
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('Hello World');
    });
    
    test('inserts empty markers if no word under cursor', () => {
        editor._setText('Hello  World');
        editor._setCursor(0, 6); // Cursor in space
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('Hello **** World');
        // Check cursor position (should be inside markers)
        const cursor = editor.getCursor();
        expect(cursor.ch).toBe(8); // 6 + 2
    });

    test('does not unwrap if cursor is between two separate bolded words', () => {
        editor._setText('**A** target **B**');
        // **A** is 0-4. Space is 5. 't' is 6.
        editor._setCursor(0, 6); // Start of "target"
        
        smartToggle(editor as any, { marker: '**' });
        
        // Should wrap "target" instead of unwrapping the whole line
        expect(editor._getText()).toBe('**A** **target** **B**');
    });

    test('correctly identifies enclosing markers when multiple exist', () => {
        editor._setText('Text **Target** Text');
        editor._setCursor(0, 7); // Inside "Target"
        
        smartToggle(editor as any, { marker: '**' });
        
        expect(editor._getText()).toBe('Text Target Text');
    });
});
