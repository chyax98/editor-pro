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
    // Prevent infinite loops where updating the file triggers the modify event again
    private inProgressFiles: Set<string> = new Set();

    constructor(app: App, settings: YamlSettings) {
        this.app = app;
        this.settings = settings;
        
        // Use Obsidian's official debounce
        // 1000ms delay to batch rapid edits
        this.updateDebounced = debounce((file: TFile) => this.updateFile(file), 2000, true);
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
                // If we are currently updating this file, ignore this event
                if (this.inProgressFiles.has(file.path)) return;
                
                this.updateDebounced(file);
            }
        });
    }
    
    updateSettings(newSettings: YamlSettings) {
        this.settings = newSettings;
    }

    private async addCreatedDate(file: TFile) {
        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                if (!frontmatter[this.settings.createdKey]) {
                    frontmatter[this.settings.createdKey] = generateDate(this.settings.dateFormat as any);
                }
            });
        } catch (error) {
            console.error(`[Editor Pro] Failed to add created date to ${file.path}`, error);
        }
    }

    private async updateFile(file: TFile) {
        if (this.inProgressFiles.has(file.path)) return;
        this.inProgressFiles.add(file.path);

        try {
            await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                const now = generateDate(this.settings.dateFormat as any);
                const current = frontmatter[this.settings.updatedKey];
                
                // Only update if time has actually changed (minute precision)
                if (current !== now) {
                    frontmatter[this.settings.updatedKey] = now;
                }
            });
        } catch (error) {
            console.error(`[Editor Pro] Failed to update date for ${file.path}`, error);
        } finally {
            // Release the lock after a short delay to allow file system to settle
            setTimeout(() => {
                this.inProgressFiles.delete(file.path);
            }, 500);
        }
    }
}
