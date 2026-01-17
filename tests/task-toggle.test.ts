import { toggleTask } from '../src/features/editor';
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

    test('toggles todo -> doing', () => {
        editor._setText('- [ ] Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('- [/] Buy milk');
    });

    test('toggles doing -> done', () => {
        editor._setText('- [/] Buy milk');
        editor._setCursor(0, 0);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('- [x] Buy milk');
    });

    test('removes task status from done task', () => {
        editor._setText('- [x] Buy milk');
        editor._setCursor(0, 0);

        toggleTask(editor as any);

        expect(editor._getText()).toBe('Buy milk');
    });

    test('handles indented tasks', () => {
        editor._setText('  Buy milk');
        editor._setCursor(0, 2);
        
        toggleTask(editor as any);
        
        expect(editor._getText()).toBe('  - [ ] Buy milk');
    });
});
