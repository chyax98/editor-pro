import { App, TFile, debounce } from "obsidian";
import { generateDate } from "../../utils/markdown-generators";

export interface YamlSettings {
    enableYaml: boolean;
    createdKey: string;
    updatedKey: string;
    dateFormat: string;
}

export class YamlManager {
    private app: App;
    private settings: YamlSettings;
    private updateDebounced: (file: TFile) => void;

    constructor(app: App, settings: YamlSettings) {
        this.app = app;
        this.settings = settings;
        
        // Create a debounced update function
        // Note: In Obsidian API, debounce returns a function. 
        // We use a custom simple debounce for MVP if strict types match is tricky, 
        // but let's try to use standard logic.
        this.updateDebounced = this.debounce((file: TFile) => this.updateFile(file), 1000);
    }

    onload() {
        if (!this.settings.enableYaml) return;

        this.app.vault.on('create', (file) => {
            if (file instanceof TFile && file.extension === 'md') {
                this.addCreatedDate(file);
            }
        });

        this.app.vault.on('modify', (file) => {
            if (file instanceof TFile && file.extension === 'md') {
                this.updateDebounced(file);
            }
        });
    }
    
    updateSettings(newSettings: YamlSettings) {
        this.settings = newSettings;
    }

    private addCreatedDate(file: TFile) {
        this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            if (!frontmatter[this.settings.createdKey]) {
                frontmatter[this.settings.createdKey] = generateDate(this.settings.dateFormat as any);
            }
        });
    }

    private updateFile(file: TFile) {
        this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            const now = generateDate(this.settings.dateFormat as any);
            // Only update if changed (to check logic)
            // But processFrontMatter handles the write.
            // We should check if 'updated' is already 'now' to avoid loop if Modify event triggers this?
            // Yes, modify triggers this. Writing frontmatter triggers modify.
            // Infinite loop risk!
            
            const current = frontmatter[this.settings.updatedKey];
            if (current !== now) {
                frontmatter[this.settings.updatedKey] = now;
            }
        });
    }
    
    // Simple debounce implementation
    private debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
        let timeout: any;
        return ((...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        }) as T;
    }
}
