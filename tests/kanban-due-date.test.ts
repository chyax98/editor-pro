import { setDueDate } from '../src/features/kanban/due-date';

describe('Set Due Date', () => {
    test('appends due date to task', () => {
        const line = '- [ ] Task A';
        const date = '2023-12-31';
        
        const result = setDueDate(line, date);
        expect(result).toBe('- [ ] Task A @due(2023-12-31)');
    });

    test('updates existing due date', () => {
        const line = '- [ ] Task A @due(2023-01-01)';
        const date = '2023-12-31';
        
        const result = setDueDate(line, date);
        expect(result).toBe('- [ ] Task A @due(2023-12-31)');
    });

    test('does nothing if not a task', () => {
        const line = 'Just text';
        const result = setDueDate(line, '2023-12-31');
        expect(result).toBe(line);
    });
});
