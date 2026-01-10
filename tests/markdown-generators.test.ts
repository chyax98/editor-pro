import { generateTable, generateMermaid, generateDate } from '../src/utils/markdown-generators';

describe('Markdown Generators', () => {
    
    // 1. Table Generator
    test('generates 2x2 table by default', () => {
        const table = generateTable(2, 2);
        const expected = 
`|  |  |
| --- | --- |
|  |  |
|  |  |
`;
        expect(table.trim()).toBe(expected.trim());
    });

    test('generates 3x3 table', () => {
        const table = generateTable(3, 3);
        // Header row + Separator + 3 Data rows
        const lines = table.trim().split('\n');
        expect(lines.length).toBe(5); 
        expect(lines[0].split('|').length).toBe(5); // | col | col | col | -> 5 parts (empty start/end)
    });

    // 2. Mermaid Generator
    test('generates basic flowchart', () => {
        const mermaid = generateMermaid('flowchart');
        expect(mermaid).toContain('```mermaid');
        expect(mermaid).toContain('flowchart LR');
        expect(mermaid).toContain('```');
    });

    test('generates sequence diagram', () => {
        const mermaid = generateMermaid('sequence');
        expect(mermaid).toContain('sequenceDiagram');
    });

    // 3. Date Generator
    test('generates current date YYYY-MM-DD', () => {
        // Mock Date
        const mockDate = new Date('2023-10-01T12:00:00Z');
        jest.useFakeTimers().setSystemTime(mockDate);

        const dateStr = generateDate('YYYY-MM-DD');
        expect(dateStr).toBe('2023-10-01');

        jest.useRealTimers();
    });
    
    test('generates current time HH:mm', () => {
         const mockDate = new Date('2023-10-01T14:30:00Z'); // UTC
         // Note: Local time depends on system timezone. 
         // To be safe in tests, we might check length or format, 
         // or force a specific output if we implement a custom formatter.
         // For MVP, simple regex check is enough.
         
         const timeStr = generateDate('HH:mm');
         expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    });
});
