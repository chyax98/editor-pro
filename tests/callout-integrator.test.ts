// Mock Obsidian module BEFORE imports
jest.mock('obsidian', () => ({
    Editor: class { },
    SuggestModal: class { },
    App: class { },
    Plugin: class { },
    PluginSettingTab: class { },
    Setting: class { },
    Notice: class { },
}));

import { Editor } from 'obsidian';

import { toggleBlockquote } from '../src/features/callout/callout-integrator';

/**
 * Mock Editor implementation for basic line/selection operations
 */
class MockEditor {
    private lines: string[];
    private cursor: { line: number; ch: number };
    private selection: { from: { line: number, ch: number }, to: { line: number, ch: number } } | null;

    constructor(content: string) {
        this.lines = content.split('\n');
        this.cursor = { line: 0, ch: 0 };
        this.selection = null;
    }

    getCursor() { return this.cursor; }
    setCursor(pos: { line: number, ch: number }) { this.cursor = pos; }

    getLine(line: number) { return this.lines[line]; }
    setLine(line: number, text: string) { this.lines[line] = text; }

    getSelection() {
        if (!this.selection) return '';
        // Simplified selection getter for test logic triggering
        return 'mock selection content';
    }

    listSelections() {
        if (!this.selection) return [];
        return [{ anchor: this.selection.from, head: this.selection.to }];
    }

    replaceRange(replacement: string, from: { line: number, ch: number }, to: { line: number, ch: number }) {
        // Simplified multi-line replacement
        const newLines = replacement.split('\n');
        // Removing old lines
        this.lines.splice(from.line, to.line - from.line + 1, ...newLines);
    }

    // Helper for verification
    getValue() { return this.lines.join('\n'); }

    // Helpers for test setup
    setSelection(from: { line: number, ch: number }, to: { line: number, ch: number }) {
        this.selection = { from, to };
    }
    clearSelection() { this.selection = null; }
}

describe('Callout Integrator (Toggle Blockquote)', () => {
    test('adds blockquote to single line', () => {
        const editor = new MockEditor('Hello World');
        editor.setCursor({ line: 0, ch: 0 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('> Hello World');
    });

    test('removes blockquote from single line', () => {
        const editor = new MockEditor('> Hello World');
        editor.setCursor({ line: 0, ch: 0 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('Hello World');
    });

    test('removes blockquote (loose format)', () => {
        const editor = new MockEditor('>Hello World'); // No space
        editor.setCursor({ line: 0, ch: 0 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('Hello World');
    });

    test('multi-line selection: all empty -> all added', () => {
        const editor = new MockEditor('Line 1\nLine 2');
        editor.setSelection({ line: 0, ch: 0 }, { line: 1, ch: 6 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('> Line 1\n> Line 2');
    });

    test('multi-line selection: mixed -> all added', () => {
        const editor = new MockEditor('> Line 1\nLine 2');
        editor.setSelection({ line: 0, ch: 0 }, { line: 1, ch: 6 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('> > Line 1\n> Line 2');
        // Logic check: if NOT all have prefix, add to ALL. 
        // Existing prefix gets double quoted (standard markdown behavior for nesting)
    });

    test('multi-line selection: all quoted -> all removed', () => {
        const editor = new MockEditor('> Line 1\n> Line 2');
        editor.setSelection({ line: 0, ch: 0 }, { line: 1, ch: 6 });

        toggleBlockquote(editor as any);

        expect(editor.getValue()).toBe('Line 1\nLine 2');
    });
});
