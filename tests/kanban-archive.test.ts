import { archiveCompletedTasks } from '../src/features/kanban/archive';

describe('Archive Completed Tasks', () => {
    test('moves completed tasks to Archive section', () => {
        const content = `
## Todo
- [ ] Task A

## Done
- [x] Task B
- [x] Task C
`;
        const result = archiveCompletedTasks(content);
        
        expect(result).toContain('## Todo\n- [ ] Task A');
        expect(result).not.toContain('## Done\n- [x] Task B'); // Done section empty or Tasks removed
        
        // Expect Archive section at end
        expect(result).toContain('## 🗄️ Archived');
        expect(result).toContain('- [x] Task B');
        expect(result).toContain('- [x] Task C');
    });

    test('appends to existing Archive section', () => {
        const content = `
- [x] New Done

## 🗄️ Archived
- [x] Old Done
`;
        const result = archiveCompletedTasks(content);
        
        expect(result).toContain('## 🗄️ Archived');
        expect(result).toContain('- [x] Old Done');
        expect(result).toContain('- [x] New Done');
    });
});
