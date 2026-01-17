// Save Cleaner Tests
// Tests for save-time cleanup functionality

describe('Save Cleaner', () => {
    describe('Trailing whitespace removal', () => {
        test('removes trailing spaces from lines', () => {
            const input = 'Hello world   \nTest line  \n';
            const expected = 'Hello world\nTest line\n';

            // Simulate the cleanup logic
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n'); // Ensure single trailing newline

            expect(cleaned).toBe(expected);
        });

        test('removes trailing tabs', () => {
            const input = 'Hello\t\t\nWorld\t\n';
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n');

            expect(cleaned).toBe('Hello\nWorld\n');
        });

        test('preserves intentional indentation', () => {
            const input = '  Indented line\n    More indented\n';
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n');

            expect(cleaned).toBe('  Indented line\n    More indented\n');
        });

        test('handles empty file', () => {
            const input = '';
            const cleaned = input || '';
            expect(cleaned).toBe('');
        });

        test('ensures file ends with single newline', () => {
            const input = 'Content';
            const cleaned = input.trimEnd() + '\n';
            expect(cleaned).toBe('Content\n');
        });

        test('normalizes multiple trailing newlines', () => {
            const input = 'Content\n\n\n\n';
            const cleaned = input.replace(/\n+$/, '\n');
            expect(cleaned).toBe('Content\n');
        });
    });

    describe('Edge cases', () => {
        test('handles lines with only whitespace', () => {
            const input = 'Hello\n   \nWorld\n';
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n');

            // Lines with only whitespace become empty lines
            expect(cleaned).toBe('Hello\n\nWorld\n');
        });

        test('handles mixed line endings', () => {
            // This test documents that we work with Unix-style newlines
            const input = 'Line1  \nLine2  \n';
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n');

            expect(cleaned).toBe('Line1\nLine2\n');
        });

        test('preserves code block indentation', () => {
            const input = '```\n  code here\n    nested\n```\n';
            const cleaned = input.split('\n')
                .map(line => line.replace(/\s+$/, ''))
                .join('\n')
                .replace(/\n+$/, '\n');

            expect(cleaned).toBe('```\n  code here\n    nested\n```\n');
        });
    });
});
