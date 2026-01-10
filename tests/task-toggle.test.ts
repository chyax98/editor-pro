import { toggleTask } from '../src/features/formatting/task-toggle';
import { Editor } from 'obsidian';

describe('toggleTask', () => {
    let editor: any;

    beforeEach(() => {
        editor = new Editor();
    });

    test('converts plain text to checkbox', () => {
        editor._setText('Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('- [ ] Buy milk');
    });

    test('converts list item to checkbox', () => {
        editor._setText('- Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('- [ ] Buy milk');
    });

    test('toggles incomplete task to complete', () => {
        editor._setText('- [ ] Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('- [x] Buy milk');
    });

    test('removes task status from completed task', () => {
        editor._setText('- [x] Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        // Cycle back to plain text or list? 
        // Usually: - [x] -> - [ ] (toggle) OR - [x] -> plain text (cycle).
        // Let's implement Cycle: Plain -> Todo -> Done -> Plain
        expect(editor._getText()).toBe('Buy milk');
    });

    test('handles indented tasks', () => {
        editor._setText('  Buy milk');
        editor._setCursor(0, 2);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('  - [ ] Buy milk');
    });
});
