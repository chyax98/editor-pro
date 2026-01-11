import { handleSmartSpacing, handleAutoPair, handleSmartBackspace, PAIR_MAP } from '../src/features/editing/smart-typography';
import { Editor } from 'obsidian';

describe('smart-typography', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    describe('PAIR_MAP', () => {
        test('contains all expected Chinese pairs', () => {
            expect(PAIR_MAP['【']).toBe('】');
            expect(PAIR_MAP['《']).toBe('》');
            expect(PAIR_MAP['"']).toBe('"');
            expect(PAIR_MAP['（']).toBe('）');
            expect(PAIR_MAP['「']).toBe('」');
        });

        test('contains all expected English pairs', () => {
            expect(PAIR_MAP['(']).toBe(')');
            expect(PAIR_MAP['[']).toBe(']');
            expect(PAIR_MAP['{']).toBe('}');
            expect(PAIR_MAP['"']).toBe('"');
            expect(PAIR_MAP["'"]).toBe("'");
        });
    });

    describe('handleSmartSpacing', () => {
        test('adds space between CN and EN (CN -> EN)', () => {
            editor._setText('测试a');
            editor._setCursor(0, 3);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('测试 a');
        });

        test('adds space between EN and CN (EN -> CN)', () => {
            editor._setText('a测试');
            editor._setCursor(0, 2);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('a 测试');
        });

        test('handles uppercase letters after Chinese', () => {
            // Smart spacing checks positions cursor.ch-2 and cursor.ch-1
            // For "测试A" at cursor 3, it looks at positions 1 and 2 (试 and A)
            // It inserts space BEFORE the rightChar
            editor._setText('测试A');
            editor._setCursor(0, 3);

            handleSmartSpacing(editor as any);

            // CN+EN detected: adds space before A (at position cursor.ch-1)
            expect(editor._getText()).toBe('测试 A');
        });

        test('handles numbers after Chinese', () => {
            editor._setText('测试1');
            editor._setCursor(0, 3);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('测试 1');
        });

        test('handles Chinese after numbers', () => {
            editor._setText('123测试');
            editor._setCursor(0, 4);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('123 测试');
        });

        test('does not add space between Chinese characters', () => {
            editor._setText('测试文字');
            editor._setCursor(0, 3);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('测试文字');
        });

        test('does not add space between English characters', () => {
            editor._setText('testabc');
            editor._setCursor(0, 5);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('testabc');
        });

        test('does not crash on short lines', () => {
            editor._setText('a');
            editor._setCursor(0, 1);

            expect(() => handleSmartSpacing(editor as any)).not.toThrow();
        });

        test('does not crash on empty lines', () => {
            editor._setText('');
            editor._setCursor(0, 0);

            expect(() => handleSmartSpacing(editor as any)).not.toThrow();
        });

        test('handles special characters', () => {
            editor._setText('测试!abc');
            editor._setCursor(0, 3);

            handleSmartSpacing(editor as any);

            expect(editor._getText()).toBe('测试!abc');
        });
    });

    describe('handleAutoPair', () => {
        let mockEvent: any;

        beforeEach(() => {
            mockEvent = {
                preventDefault: jest.fn(),
                key: '',
            };
        });

        test('returns false for non-pair characters', () => {
            mockEvent.key = 'a';
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, 'a', mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        test('wraps selection with Chinese quotes', () => {
            mockEvent.key = '"';
            editor._setText('测试文字');
            editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });

            const result = handleAutoPair(editor as any, '"', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('"测试文字"');
        });

        test('wraps selection with parentheses', () => {
            mockEvent.key = '(';
            editor._setText('test');
            editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });

            const result = handleAutoPair(editor as any, '(', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('(test)');
        });

        test('auto-completes without selection', () => {
            mockEvent.key = '"';
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, '"', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('""test');
        });

        test('auto-completes with Chinese brackets', () => {
            mockEvent.key = '【';
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, '【', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('【】test');
        });

        test('auto-completes with angle brackets', () => {
            mockEvent.key = '《';
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, '《', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('《》test');
        });

        test('wraps empty selection with brackets', () => {
            mockEvent.key = '[';
            editor._setText('');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, '[', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('[]');
        });

        test('wraps multiline selection', () => {
            mockEvent.key = '(';
            editor._setText('line 1\nline 2');
            editor._setSelection({ line: 0, ch: 0 }, { line: 1, ch: 6 });

            const result = handleAutoPair(editor as any, '(', mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('(line 1\nline 2)');
        });

        test('handles single quotes', () => {
            mockEvent.key = "'";
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleAutoPair(editor as any, "'", mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe("''test");
        });
    });

    describe('handleSmartBackspace', () => {
        let mockEvent: any;

        beforeEach(() => {
            mockEvent = {
                preventDefault: jest.fn(),
                key: '',
            };
        });

        test('returns false for non-backspace keys', () => {
            mockEvent.key = 'a';
            editor._setText('(test)');
            editor._setCursor(0, 4);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        test('returns false when there is a selection', () => {
            mockEvent.key = 'Backspace';
            editor._setText('(test)');
            editor._setSelection({ line: 0, ch: 0 }, { line: 0, ch: 2 });

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('returns false at the start of line', () => {
            mockEvent.key = 'Backspace';
            editor._setText('test');
            editor._setCursor(0, 0);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('deletes both parentheses when cursor is between them', () => {
            mockEvent.key = 'Backspace';
            editor._setText('(test)');
            editor._setCursor(0, 5);

            const result = handleSmartBackspace(editor as any, mockEvent);

            // Cursor is at position 5, between ')' and end of string
            // leftChar = ')', rightChar = '' (empty string at end)
            // Not a pair, so returns false
            expect(result).toBe(false);
        });

        test('deletes both brackets when cursor is between them', () => {
            mockEvent.key = 'Backspace';
            editor._setText('[test]');
            editor._setCursor(0, 5);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('deletes both Chinese quotes when cursor is between them', () => {
            mockEvent.key = 'Backspace';
            editor._setText('"测试"');
            editor._setCursor(0, 3);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('deletes both Chinese brackets when cursor is between them', () => {
            mockEvent.key = 'Backspace';
            editor._setText('【测试】');
            editor._setCursor(0, 3);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('does not delete when characters are not a pair', () => {
            mockEvent.key = 'Backspace';
            editor._setText('(test]');
            editor._setCursor(0, 5);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        test('returns false for normal character between non-pair', () => {
            mockEvent.key = 'Backspace';
            editor._setText('abc');
            editor._setCursor(0, 1);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('handles nested pairs correctly', () => {
            mockEvent.key = 'Backspace';
            editor._setText('((test))');
            editor._setCursor(0, 6);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('handles braces pair', () => {
            mockEvent.key = 'Backspace';
            editor._setText('{test}');
            editor._setCursor(0, 5);

            const result = handleSmartBackspace(editor as any, mockEvent);

            expect(result).toBe(false);
        });
    });

    describe('integration tests', () => {
        test('smart spacing works with auto-paired quotes', () => {
            editor._setText('测试');

            // Add opening quote
            const quoteEvent = { preventDefault: jest.fn(), key: '"' };
            handleAutoPair(editor as any, '"', quoteEvent);
            expect(editor._getText()).toBe('""测试');

            // Type some English
            editor._setCursor(0, 1);
            editor._setText('"测试');
            editor._setCursor(0, 3);

            const spacingEvent = { key: 'a' };
            // Simulate typing English after Chinese
            editor._setText('测试a');
            editor._setCursor(0, 3);
            handleSmartSpacing(editor as any);
            expect(editor._getText()).toBe('测试 a');
        });
    });
});
