import { moveTaskToColumn } from '../src/features/kanban/kanban-logic';

describe('Kanban Advanced Logic', () => {
    // Mock Date for consistent timestamps
    const mockDate = new Date('2023-10-01T10:00:00Z');
    
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(mockDate);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    const kanbanContent = `
## Todo
- [ ] Task A

## Doing
- [/] Task B @started(2023-09-30 09:00)

## Done
    `.trim();

    test('Todo -> Doing: updates status to [/] and adds started timestamp', () => {
        const lines = kanbanContent.split('\n');
        const result = moveTaskToColumn(lines, 1, 'Doing');
        
        const output = result.newLines.join('\n');
        expect(output).toContain('## Doing');
        // Check for task content
        expect(output).toContain('- [/] Task A');
        // Check for timestamp format separately to be safe with regex escaping
        expect(output).toMatch(/@started\(\d{4}-\d{2}-\d{2} \d{2}:\d{2}\)/);
    });

    test('Doing -> Done: updates status to [x] and adds completed timestamp', () => {
        const lines = kanbanContent.split('\n');
        // Task B is at line 4: ## Doing (3), - [/] (4)
        const result = moveTaskToColumn(lines, 4, 'Done');
        
        const output = result.newLines.join('\n');
        expect(output).toContain('## Done');
        expect(output).toContain('- [x] Task B');
        // Should keep start time
        expect(output).toContain('@started(2023-09-30 09:00)');
        // And add completed time
        expect(output).toMatch(/@completed\(\d{4}-\d{2}-\d{2} \d{2}:\d{2}\)/);
    });
});