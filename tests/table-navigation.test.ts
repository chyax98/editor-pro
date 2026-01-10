import { findNextCell, findPreviousCell } from '../src/features/table/navigation-utils';

describe('Table Navigation Logic', () => {
    test('finds next cell in standard row', () => {
        // | Cell 1 | Cell 2 |
        //        ^ cursor at 7
        const line = '| Cell 1 | Cell 2 |';
        const cursorCh = 7; 
        
        // Should jump to start of Cell 2 content (or select it)
        // For MVP, let's just jump to start of content.
        // Pipe is at 9. Content starts at 11.
        const result = findNextCell(line, cursorCh);
        
        expect(result).toBe(11);
    });

    test('jumps to first cell if before table', () => {
        const line = '| Cell 1 |';
        const cursorCh = 0;
        const result = findNextCell(line, cursorCh);
        expect(result).toBe(2); // After "| "
    });

    test('returns null if no next cell', () => {
        const line = '| Cell 1 |';
        const cursorCh = 5;
        // Next pipe is end. No cell after.
        const result = findNextCell(line, cursorCh);
        expect(result).toBeNull();
    });

    test('finds previous cell', () => {
        // | Cell 1 | Cell 2 |
        //            ^ cursor at 13 (in Cell 2)
        const line = '| Cell 1 | Cell 2 |';
        const cursorCh = 13;
        
        // Previous cell content starts at 2.
        const result = findPreviousCell(line, cursorCh);
        expect(result).toBe(2);
    });
});
