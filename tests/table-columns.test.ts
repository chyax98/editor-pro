import { insertColumn, deleteColumn, setColumnAlign } from '../src/utils/table-generators';

describe('Table Column Operations', () => {
    // Helper to join array for readability
    const join = (rows: string[]) => rows.join('\n');

    test('inserts column to the right correctly', () => {
        const table = [
            '| H1 | H2 |',
            '| -- | -- |',
            '| A1 | A2 |'
        ];
        // Cursor at col 0 (H1)
        const result = insertColumn(table, 0, 'right');
        
        expect(result[0]).toBe('| H1 |  | H2 |');
        expect(result[1]).toBe('| -- | --- | -- |'); // Should add separator
        expect(result[2]).toBe('| A1 |  | A2 |');
    });

    test('deletes current column', () => {
        const table = [
            '| H1 | H2 | H3 |',
            '| -- | -- | -- |',
            '| A1 | A2 | A3 |'
        ];
        // Delete col 1 (H2)
        const result = deleteColumn(table, 1);
        
        expect(result[0]).toBe('| H1 | H3 |');
        expect(result[1]).toBe('| -- | -- |');
        expect(result[2]).toBe('| A1 | A3 |');
    });

    test('handles escaped pipes in content', () => {
        const table = [
            '| H1 | Esc\\|ped |',
            '| -- | -------- |',
            '| A1 | Content  |'
        ];
        // Delete col 0 (H1). Should keep "Esc\\|ped" intact as one cell.
        const result = deleteColumn(table, 0);
        
        expect(result[0]).toBe('| Esc\\|ped |');
    });

    test('sets column alignment', () => {
        const table = [
            '| A | B |',
            '|---|---|'
        ];
        
        // Set col 0 to Center
        const resCenter = setColumnAlign(table, 0, 'center');
        expect(resCenter[1]).toBe('| :---: | --- |');
        
        // Set col 1 to Right
        const resRight = setColumnAlign(table, 1, 'right');
        expect(resRight[1]).toBe('| --- | ---: |');
        
        // Set col 0 to Left
        const resLeft = setColumnAlign(table, 0, 'left');
        expect(resLeft[1]).toBe('| :--- | --- |');
    });
});
