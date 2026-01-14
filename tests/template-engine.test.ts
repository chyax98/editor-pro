import { TemplateEngine, TemplateContext } from '../src/features/templates/template-engine';
import { moment } from 'obsidian';

// Mock Obsidian modules
jest.mock('obsidian', () => ({
    Editor: class { },
    App: class { },
    TFile: class { },
    moment: jest.fn(),
}));

// Mock NLDateParser
jest.mock('../src/features/nldates/parser', () => ({
    NLDateParser: {
        parse: (input: string) => {
            if (input === 'tomorrow') return { formatted: '2023-01-02' };
            return null;
        }
    }
}));

// Mock moment implementation for testing
const mockMomentFn = (dateStr?: string) => {
    return {
        format: (fmt?: string) => {
            if (fmt === 'YYYY-MM-DD') return '2023-01-01';
            if (fmt === 'HH:mm') return '12:00';
            return '2023-01-01 12:00';
        }
    };
}
(moment as unknown as jest.Mock).mockImplementation(mockMomentFn);

describe('Template Engine', () => {
    let engine: TemplateEngine;
    let mockApp: any;
    let ctx: TemplateContext;

    beforeEach(() => {
        mockApp = {};
        engine = new TemplateEngine(mockApp);
        ctx = {
            app: mockApp,
            file: null,
            fileName: 'Test File'
        };
    });

    test('replaces basic variables', () => {
        const tpl = 'Hello {{title}}, today is {{date}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('Hello Test File, today is 2023-01-01');
    });

    test('replaces formatted date/time', () => {
        const tpl = 'Time: {{time:HH:mm}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('Time: 12:00');
    });

    test('replaces natural language date', () => {
        const tpl = 'Deadline: {{date:tomorrow}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('Deadline: 2023-01-02');
    });

    test('executes simple JS', () => {
        const tpl = '1+1={{js: 1+1}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('1+1=2');
    });

    test('executes JS using context variables', () => {
        const tpl = 'Files: {{js: title.toUpperCase()}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('Files: TEST FILE');
    });

    test('handles cursor position', () => {
        const tpl = 'Start {{cursor}} End';
        const { text, cursorIndex } = engine.process(tpl, ctx);
        expect(text).toBe('Start  End');
        expect(cursorIndex).toBe(6);
    });

    test('evaluates JS returning empty string', () => {
        const tpl = 'X{{js: ""}}Y';
        const { text } = engine.process(tpl, ctx);
        expect(text).toBe('XY');
    });

    test('handles JS errors gracefully', () => {
        const tpl = 'Error: {{js: throw new Error("Boom");}}';
        const { text } = engine.process(tpl, ctx);
        expect(text).toContain('[JS Error: Boom]');
    });
});
