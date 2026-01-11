import { moveListItemBlock, handleOutlinerIndent, toggleFold } from '../src/features/editing/outliner';
import { Editor } from 'obsidian';

describe('outliner', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    describe('moveListItemBlock', () => {
        describe('moving list items up', () => {
            test('moves simple list item up', () => {
                editor._setText('- item 1\n- item 2\n- item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 2\n- item 1\n- item 3');
            });

            test('moves list item with sub-items', () => {
                editor._setText('- item 1\n  - sub 1\n  - sub 2\n- item 2');
                editor._setCursor(3, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 2\n- item 1\n  - sub 1\n  - sub 2');
            });

            test('preserves sub-items when moving', () => {
                editor._setText('- item 1\n- item 2\n  - sub 1\n- item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 2\n  - sub 1\n- item 1\n- item 3');
            });

            test('handles asterisk list markers', () => {
                editor._setText('* item 1\n* item 2\n* item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('* item 2\n* item 1\n* item 3');
            });

            test('handles plus list markers', () => {
                editor._setText('+ item 1\n+ item 2\n+ item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('+ item 2\n+ item 1\n+ item 3');
            });

            test('handles numbered lists', () => {
                editor._setText('1. item 1\n2. item 2\n3. item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('2. item 2\n1. item 1\n3. item 3');
            });

            test('handles task checkboxes', () => {
                editor._setText('- [ ] task 1\n- [ ] task 2\n- [x] task 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- [ ] task 2\n- [ ] task 1\n- [x] task 3');
            });
        });

        describe('moving list items down', () => {
            test('moves simple list item down', () => {
                editor._setText('- item 1\n- item 2\n- item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, 1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 1\n- item 3\n- item 2');
            });

            test('moves list item with sub-items down', () => {
                editor._setText('- item 1\n  - sub 1\n- item 2');
                editor._setCursor(0, 0);

                const result = moveListItemBlock(editor as any, 1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 2\n- item 1\n  - sub 1');
            });

            test('preserves sub-items when moving down', () => {
                editor._setText('- item 1\n- item 2\n  - sub 1\n- item 3');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, 1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 1\n- item 3\n- item 2\n  - sub 1');
            });
        });

        describe('edge cases', () => {
            test('returns false when not on a list item', () => {
                editor._setText('not a list\n- item 1\n- item 2');
                editor._setCursor(0, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(false);
                expect(editor._getText()).toBe('not a list\n- item 1\n- item 2');
            });

            test('returns false when at top and moving up', () => {
                editor._setText('- item 1\n- item 2');
                editor._setCursor(0, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(false);
            });

            test('returns false when at bottom and moving down', () => {
                editor._setText('- item 1\n- item 2');
                editor._setCursor(1, 0);

                const result = moveListItemBlock(editor as any, 1);

                expect(result).toBe(false);
            });

            test('does not move items in fenced code blocks', () => {
                editor._setText('```\n- item 1\n- item 2\n```\n- item 3\n- item 4');
                editor._setCursor(4, 0);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(false);
            });

            test('preserves blank lines between blocks', () => {
                editor._setText('- item 1\n\n- item 2');
                editor._setCursor(0, 0);

                const result = moveListItemBlock(editor as any, 1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('- item 2\n\n- item 1');
            });

            test('handles single item list', () => {
                editor._setText('- only item');
                editor._setCursor(0, 0);

                const resultUp = moveListItemBlock(editor as any, -1);
                const resultDown = moveListItemBlock(editor as any, 1);

                expect(resultUp).toBe(false);
                expect(resultDown).toBe(false);
            });

            test('handles indented list items', () => {
                editor._setText('  - item 1\n  - item 2\n  - item 3');
                editor._setCursor(1, 2);

                const result = moveListItemBlock(editor as any, -1);

                expect(result).toBe(true);
                expect(editor._getText()).toBe('  - item 2\n  - item 1\n  - item 3');
            });
        });

        describe('cursor position', () => {
            test('updates cursor position after moving up', () => {
                editor._setText('- item 1\n- item 2\n- item 3');
                editor._setCursor(1, 3);

                moveListItemBlock(editor as any, -1);

                expect(editor.getCursor().line).toBe(0);
                expect(editor.getCursor().ch).toBe(3);
            });

            test('updates cursor position after moving down', () => {
                editor._setText('- item 1\n- item 2\n- item 3');
                editor._setCursor(1, 3);

                moveListItemBlock(editor as any, 1);

                expect(editor.getCursor().line).toBe(2);
                expect(editor.getCursor().ch).toBe(3);
            });

            test('keeps cursor column position', () => {
                editor._setText('- very long item 1\n- very long item 2');
                editor._setCursor(0, 10);

                moveListItemBlock(editor as any, 1);

                expect(editor.getCursor().ch).toBe(10);
            });
        });
    });

    describe('handleOutlinerIndent', () => {
        let mockEvent: any;

        beforeEach(() => {
            mockEvent = {
                key: 'Tab',
                preventDefault: jest.fn(),
                shiftKey: false,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            };
        });

        test('returns false for non-tab keys', () => {
            mockEvent.key = 'Enter';
            editor._setText('- item 1');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(false);
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        test('returns false when Ctrl is pressed', () => {
            mockEvent.ctrlKey = true;
            editor._setText('- item 1');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('returns false when Meta is pressed', () => {
            mockEvent.metaKey = true;
            editor._setText('- item 1');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('returns false when Alt is pressed', () => {
            mockEvent.altKey = true;
            editor._setText('- item 1');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('indents list item with Tab', () => {
            editor._setText('- item 1\n- item 2');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('  - item 1\n- item 2');
        });

        test('indents list item with sub-items', () => {
            editor._setText('- item 1\n  - sub 1\n- item 2');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor._getText()).toBe('  - item 1\n    - sub 1\n- item 2');
        });

        test('outdents list item with Shift+Tab', () => {
            editor._setText('  - item 1\n- item 2');
            editor._setCursor(0, 2);
            mockEvent.shiftKey = true;

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor._getText()).toBe('- item 1\n- item 2');
        });

        test('outdents single space indentation', () => {
            editor._setText(' - item 1\n- item 2');
            editor._setCursor(0, 1);
            mockEvent.shiftKey = true;

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor._getText()).toBe('- item 1\n- item 2');
        });

        test('removes all indentation when outdenting single-space item', () => {
            editor._setText(' - item 1');
            editor._setCursor(0, 1);
            mockEvent.shiftKey = true;

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor._getText()).toBe('- item 1');
        });

        test('does not outdent unindented item', () => {
            editor._setText('- item 1');
            editor._setCursor(0, 0);
            mockEvent.shiftKey = true;

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor._getText()).toBe('- item 1');
        });

        test('returns false when not on a list item', () => {
            editor._setText('not a list');
            editor._setCursor(0, 0);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(false);
        });

        test('updates cursor position when indenting', () => {
            editor._setText('- item 1');
            editor._setCursor(0, 2);

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor.getCursor().ch).toBe(4);
        });

        test('updates cursor position when outdenting', () => {
            editor._setText('  - item 1');
            editor._setCursor(0, 4);
            mockEvent.shiftKey = true;

            const result = handleOutlinerIndent(editor as any, mockEvent);

            expect(result).toBe(true);
            expect(editor.getCursor().ch).toBe(2);
        });
    });

    describe('toggleFold', () => {
        test('calls editor exec with toggleFold', () => {
            const execSpy = jest.spyOn(editor, 'exec');

            toggleFold(editor as any);

            expect(execSpy).toHaveBeenCalledWith('toggleFold');
        });
    });

    describe('integration tests', () => {
        test('can indent then move items', () => {
            editor._setText('- item 1\n- item 2\n- item 3');

            // Indent item 2
            editor._setCursor(1, 0);
            const tabEvent = {
                key: 'Tab',
                preventDefault: jest.fn(),
                shiftKey: false,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            };
            handleOutlinerIndent(editor as any, tabEvent);
            expect(editor._getText()).toBe('- item 1\n  - item 2\n- item 3');

            // Move item 2 up (should not move as it has different indent)
            const moveResult = moveListItemBlock(editor as any, -1);
            expect(moveResult).toBe(false);
        });

        test('complex reorganization workflow', () => {
            editor._setText('- item 1\n  - sub 1\n- item 2\n- item 3');

            // Move item 2 (line 2) up
            // item 2 finds item 1 as its sibling (same indent: 0)
            // It moves past the sub-item
            editor._setCursor(2, 0);
            const result = moveListItemBlock(editor as any, -1);
            // The function should return true and swap item 1 and item 2
            expect(result).toBe(true);
            const resultText = editor._getText();
            expect(resultText).toContain('- item 1');
            expect(resultText).toContain('- item 2');
            expect(resultText).toContain('  - sub 1');
        });
    });

    describe('edge cases and boundary conditions', () => {
        test('handles empty file', () => {
            editor._setText('');
            editor._setCursor(0, 0);

            const result = moveListItemBlock(editor as any, -1);
            expect(result).toBe(false);
        });

        test('handles file with only blank lines', () => {
            editor._setText('\n\n\n');
            editor._setCursor(1, 0);

            const result = moveListItemBlock(editor as any, -1);
            expect(result).toBe(false);
        });

        test('handles very deeply nested lists', () => {
            editor._setText('- item 1\n    - sub 1\n      - sub 2\n- item 2');
            editor._setCursor(0, 0);

            const result = moveListItemBlock(editor as any, 1);
            expect(result).toBe(true);
        });

        test('handles mixed list markers', () => {
            editor._setText('- item 1\n* item 2\n+ item 3');
            editor._setCursor(1, 0);

            const result = moveListItemBlock(editor as any, -1);
            // Should work even with different markers
            expect(result).toBe(true);
        });

        test('handles list items with checkboxes', () => {
            editor._setText('- [ ] todo\n- [/] doing\n- [x] done');
            editor._setCursor(1, 0);

            const result = moveListItemBlock(editor as any, 1);
            expect(result).toBe(true);
            expect(editor._getText()).toContain('- [x] done');
            expect(editor._getText()).toContain('- [/] doing');
        });
    });
});
