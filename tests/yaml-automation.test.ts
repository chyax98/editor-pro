import { YamlManager } from '../src/features/yaml/auto-update';
import { App, TFile } from 'obsidian';

// Mock generic debounce to execute immediately for tests, or use fake timers
jest.useFakeTimers();

describe('YamlManager', () => {
    let app: App;
    let yamlManager: YamlManager;

    beforeEach(() => {
        app = new App();
        // Initialize YamlManager with settings
        yamlManager = new YamlManager(app, {
            enableYaml: true,
            createdKey: 'created',
            updatedKey: 'updated',
            dateFormat: 'YYYY-MM-DD HH:mm'
        });
        yamlManager.onload();
    });

    test('updates created date on file creation', () => {
        const file = new TFile('new-note.md');
        let processedData: any = null;
        
        // Spy on processFrontMatter
        app.fileManager.processFrontMatter = jest.fn((f, cb) => {
            const data: any = {};
            cb(data);
            processedData = data;
            return Promise.resolve();
        });

        // Trigger create event
        app.vault.trigger('create', file);

        expect(app.fileManager.processFrontMatter).toHaveBeenCalledWith(file, expect.any(Function));
        expect(processedData).toHaveProperty('created');
        expect(processedData.created).toMatch(/^\d{4}-\d{2}-\d{2}/); // check format roughly
    });

    test('updates updated date on file modification', () => {
        const file = new TFile('existing-note.md');
        let processedData: any = {};
        
        app.fileManager.processFrontMatter = jest.fn((f, cb) => {
            cb(processedData);
            return Promise.resolve();
        });

        // Trigger modify event
        app.vault.trigger('modify', file);
        
        // Fast-forward debounce
        jest.runAllTimers();

        expect(app.fileManager.processFrontMatter).toHaveBeenCalled();
        expect(processedData).toHaveProperty('updated');
    });

    test('ignores non-markdown files', () => {
        const file = new TFile('image.png');
        app.fileManager.processFrontMatter = jest.fn();

        app.vault.trigger('create', file);

        expect(app.fileManager.processFrontMatter).not.toHaveBeenCalled();
    });
});
