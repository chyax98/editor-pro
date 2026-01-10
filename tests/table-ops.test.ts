import { generateTable, insertRow, deleteRow } from '../src/utils/markdown-generators';

describe('Table Advanced Operations', () => {
    test('inserts row below current line', () => {
        const table = [
            '| A | B |',
            '| --- | --- |',
            '| 1 | 2 |'
        ];
        // Cursor at index 2 (row 2: | 1 | 2 |)
        const result = insertRow(table, 2);
        
        expect(result.length).toBe(4);
        expect(result[3]).toBe('|  |  |');
    });

    test('deletes current row', () => {
        const table = [
            '| A | B |',
            '| --- | --- |',
            '| 1 | 2 |',
            '| 3 | 4 |'
        ];
        // Delete row index 2 (| 1 | 2 |)
        const result = deleteRow(table, 2);
        
        expect(result.length).toBe(3);
        expect(result[2]).toBe('| 3 | 4 |');
    });

    test('refuses to delete header or separator', () => {
        const table = [
            '| A | B |',
            '| --- | --- |',
            '| 1 | 2 |'
        ];
        // Try delete index 0 (header)
        const result = deleteRow(table, 0);
        expect(result).toEqual(table); // No change
    });
});
