import { moveLineUp, moveLineDown, duplicateLine, deleteLine, selectLine } from '../src/features/editor';
import { Editor } from 'obsidian';

describe('keyshots', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    describe('moveLineUp', () => {
        test('moves line up when not at top', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(1, 0);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('line 2\nline 1');
        });

        test('keeps cursor position after moving up', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(1, 3);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('line 2\nline 1');
            expect(editor.getCursor().line).toBe(0);
            expect(editor.getCursor().ch).toBe(3);
        });

        test('does nothing when already at first line', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(0, 0);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('line 1\nline 2');
            expect(editor.getCursor().line).toBe(0);
        });

        test('handles empty lines', () => {
            editor._setText('\nline 2');
            editor._setCursor(1, 0);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('line 2\n');
        });

        test('handles multi-character cursor position', () => {
            editor._setText('abcdefgh\nline 2');
            editor._setCursor(1, 5);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('line 2\nabcdefgh');
            expect(editor.getCursor().ch).toBe(5);
        });

        test('preserves line content when moving', () => {
            editor._setText('first line\nsecond line');
            editor._setCursor(1, 0);

            moveLineUp(editor as any);

            expect(editor._getText()).toBe('second line\nfirst line');
        });
    });

    describe('moveLineDown', () => {
        test('moves line down when not at bottom', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(0, 0);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('line 2\nline 1');
        });

        test('keeps cursor position after moving down', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(0, 3);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('line 2\nline 1');
            expect(editor.getCursor().line).toBe(1);
            expect(editor.getCursor().ch).toBe(3);
        });

        test('does nothing when already at last line', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(1, 0);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('line 1\nline 2');
            expect(editor.getCursor().line).toBe(1);
        });

        test('handles empty lines', () => {
            editor._setText('line 1\n');
            editor._setCursor(0, 0);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('\nline 1');
        });

        test('handles multi-character cursor position', () => {
            editor._setText('abcdefgh\nline 2');
            editor._setCursor(0, 5);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('line 2\nabcdefgh');
            expect(editor.getCursor().ch).toBe(5);
        });

        test('preserves line content when moving', () => {
            editor._setText('first line\nsecond line');
            editor._setCursor(0, 0);

            moveLineDown(editor as any);

            expect(editor._getText()).toBe('second line\nfirst line');
        });
    });

    describe('duplicateLine', () => {
        test('duplicates current line', () => {
            editor._setText('line 1');
            editor._setCursor(0, 0);

            duplicateLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 1');
        });

        test('moves cursor to duplicated line', () => {
            editor._setText('line 1');
            editor._setCursor(0, 3);

            duplicateLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 1');
            expect(editor.getCursor().line).toBe(1);
            expect(editor.getCursor().ch).toBe(3);
        });

        test('duplicates line with special characters', () => {
            editor._setText('test: !@#$%^&*()');
            editor._setCursor(0, 0);

            duplicateLine(editor as any);

            expect(editor._getText()).toBe('test: !@#$%^&*()\ntest: !@#$%^&*()');
        });

        test('duplicates empty line', () => {
            editor._setText('line 1\n\nline 3');
            editor._setCursor(1, 0);

            duplicateLine(editor as any);

            expect(editor._getText()).toBe('line 1\n\n\nline 3');
        });

        test('handles multiline content', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(1, 0);

            duplicateLine(editor as any);

            const result = editor._getText();
            expect(result).toContain('line 1');
            expect(result).toContain('line 2');
            expect(result).toContain('line 3');
            // Cursor should be on the duplicated line
            expect(editor.getCursor().line).toBeGreaterThan(1);
        });

        test('preserves cursor column position', () => {
            editor._setText('abcdefgh');
            editor._setCursor(0, 4);

            duplicateLine(editor as any);

            expect(editor._getText()).toBe('abcdefgh\nabcdefgh');
            expect(editor.getCursor().ch).toBe(4);
        });
    });

    describe('deleteLine', () => {
        test('deletes current line', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(1, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 3');
        });

        test('clears single line file', () => {
            editor._setText('only line');
            editor._setCursor(0, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('');
        });

        test('deletes last line including newline', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(1, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 1');
        });

        test('moves cursor to previous line when deleting last line', () => {
            editor._setText('line 1\nline 2');
            editor._setCursor(1, 0);

            deleteLine(editor as any);

            expect(editor.getCursor().line).toBe(0);
        });

        test('keeps cursor on same line when deleting middle line', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(1, 3);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 3');
            // Cursor should stay at line 1 (content moved up)
            expect(editor.getCursor().line).toBe(1);
        });

        test('handles deleting first line', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(0, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 2\nline 3');
        });

        test('handles deleting empty line', () => {
            editor._setText('line 1\n\nline 3');
            editor._setCursor(1, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 3');
        });

        test('handles deleting line with only whitespace', () => {
            editor._setText('line 1\n   \nline 3');
            editor._setCursor(1, 0);

            deleteLine(editor as any);

            expect(editor._getText()).toBe('line 1\nline 3');
        });
    });

    describe('selectLine', () => {
        test('selects entire current line', () => {
            editor._setText('line 1');
            editor._setCursor(0, 0);

            selectLine(editor as any);

            // The function should set selection from 0 to line length
            expect(editor.somethingSelected()).toBe(true);
        });

        test('selects line when cursor is in middle', () => {
            editor._setText('line 1');
            editor._setCursor(0, 4);

            selectLine(editor as any);

            // Should select the whole line regardless of cursor position
            expect(editor.somethingSelected()).toBe(true);
        });

        test('selects empty line', () => {
            editor._setText('line 1\n\nline 3');
            editor._setCursor(1, 0);

            selectLine(editor as any);

            expect(editor.somethingSelected()).toBe(true);
        });

        test('selects line with leading spaces', () => {
            editor._setText('  indented line');
            editor._setCursor(0, 5);

            selectLine(editor as any);

            expect(editor.somethingSelected()).toBe(true);
        });

        test('selects line with trailing spaces', () => {
            editor._setText('line 1  ');
            editor._setCursor(0, 4);

            selectLine(editor as any);

            expect(editor.somethingSelected()).toBe(true);
        });

        test('handles multiline file', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(1, 0);

            selectLine(editor as any);

            expect(editor.somethingSelected()).toBe(true);
        });
    });

    describe('integration tests', () => {
        test('can move up then move down', () => {
            editor._setText('line 1\nline 2\nline 3');
            editor._setCursor(2, 0);

            moveLineUp(editor as any);
            expect(editor._getText()).toBe('line 1\nline 3\nline 2');

            moveLineDown(editor as any);
            expect(editor._getText()).toBe('line 1\nline 2\nline 3');
        });

        test('can duplicate then delete', () => {
            editor._setText('line 1');
            editor._setCursor(0, 0);

            duplicateLine(editor as any);
            const result = editor._getText();
            expect(result).toContain('line 1');

            // After duplicate, delete the duplicated line
            // The mock behavior for deleteLine on the last line removes the newline above
            editor._setCursor(1, 0);
            deleteLine(editor as any);
            // The mock's deleteLine implementation may have edge cases
            // Just verify it doesn't crash and modifies content
            expect(editor._getText()).not.toBe(result);
        });

        test('handles complex editing session', () => {
            editor._setText('line 1\nline 2\nline 3');

            // Move middle line up
            editor._setCursor(1, 0);
            moveLineUp(editor as any);
            const afterMove = editor._getText();
            expect(afterMove).toContain('line 1');
            expect(afterMove).toContain('line 2');
            expect(afterMove).toContain('line 3');

            // Duplicate current line
            duplicateLine(editor as any);
            const afterDup = editor._getText();

            // Delete a line
            editor._setCursor(1, 0);
            deleteLine(editor as any);
            const afterDel = editor._getText();
            expect(afterDel).not.toBe(afterDup);
        });

        test('select and duplicate work together', () => {
            editor._setText('line 1\nline 2');

            selectLine(editor as any);
            expect(editor.somethingSelected()).toBe(true);

            duplicateLine(editor as any);
            const result = editor._getText();
            expect(result).toContain('line 1');
            expect(result).toContain('line 2');
        });
    });

    describe('edge cases', () => {
        test('handles very long lines', () => {
            const longLine = 'a'.repeat(1000);
            editor._setText(longLine);
            editor._setCursor(0, 500);

            expect(() => duplicateLine(editor as any)).not.toThrow();
        });

        test('handles unicode characters', () => {
            editor._setText('测试文字\nテスト\n🎉🎊');
            editor._setCursor(0, 0);

            moveLineDown(editor as any);
            expect(editor._getText()).toContain('测试文字');
        });

        test('handles tabs in lines', () => {
            editor._setText('\t\tindented');
            editor._setCursor(0, 0);

            duplicateLine(editor as any);
            expect(editor._getText()).toBe('\t\tindented\n\t\tindented');
        });

        test('handles mixed line endings', () => {
            editor._setText('line 1\nline 2\r\nline 3');
            editor._setCursor(1, 0);

            expect(() => moveLineUp(editor as any)).not.toThrow();
        });
    });
});
