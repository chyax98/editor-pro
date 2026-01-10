import { aggregateTasks } from '../src/features/task/aggregator';

describe('Task Aggregation', () => {
    test('aggregates incomplete tasks', () => {
        const content = `
# Header
- [ ] Task 1
- [ ] Task 2
Text
- [x] Done
        `;
        
        const result = aggregateTasks(content, { includeCompleted: false });
        
        expect(result).toContain('> [!todo] Tasks');
        expect(result).toContain('> - [ ] Task 1');
        expect(result).toContain('> - [ ] Task 2');
        expect(result).not.toContain('Done');
    });

    test('aggregates all tasks including completed', () => {
        const content = `- [ ] A\n- [x] B`;
        const result = aggregateTasks(content, { includeCompleted: true });
        
        expect(result).toContain('> - [ ] A');
        expect(result).toContain('> - [x] B');
    });

    test('returns null message if no tasks found', () => {
        const content = `Just text`;
        const result = aggregateTasks(content);
        expect(result).toBe('> [!info] No tasks found.');
    });
});
