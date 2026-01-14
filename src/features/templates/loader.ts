import { App, TFile, normalizePath } from "obsidian";
import EditorProPlugin from "../../main";

export interface TemplateFile {
    path: string;
    name: string;
    file: TFile;
}

export class TemplateLoader {
    constructor(private app: App, private plugin: EditorProPlugin) { }

    getTemplates(): TemplateFile[] {
        const folderPath = this.plugin.settings.templateFolderPath;
        if (!folderPath) return [];

        const normalizedFolder = normalizePath(folderPath);

        // Find all files in the vault that mimic the path
        // Optimization: Iterating all files is fast enough for <10k files.
        // For larger vaults, we might want to check if folder exists first.

        const folder = this.app.vault.getAbstractFileByPath(normalizedFolder);
        if (!folder) {
            // Folder doesn't exist, user might not have created it yet.
            return [];
        }

        const files: TemplateFile[] = [];

        // Recursive function to gather files? 
        // Or just use vault.getFiles() and filter using path.startsWith?
        // vault.getFiles() returns ALL files.

        const allFiles = this.app.vault.getFiles();
        for (const file of allFiles) {
            if (file.path.startsWith(normalizedFolder + "/") && file.extension === 'md') {
                files.push({
                    path: file.path,
                    name: file.basename,
                    file: file
                });
            }
        }

        // Sort by name
        return files.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getTemplateContent(file: TFile): Promise<string> {
        return await this.app.vault.read(file);
    }
}
