import { App, FuzzySuggestModal, TFile, Notice } from "obsidian";
import EditorProPlugin from "../../main";
import { TemplateLoader, TemplateFile } from "./loader";
import { TemplateEngine } from "./template-engine";
import { BUILTIN_TEMPLATES } from "./snippets";

// Unified item type
interface TemplateItem {
    type: 'file' | 'snippet';
    name: string;
    // For file
    file?: TFile;
    // For snippet
    content?: string;
    id?: string;
}

export class TemplateModal extends FuzzySuggestModal<TemplateItem> {
    private loader: TemplateLoader;
    private engine: TemplateEngine;

    constructor(app: App, private plugin: EditorProPlugin) {
        super(app);
        this.loader = new TemplateLoader(app, plugin);
        this.engine = new TemplateEngine(app);

        this.setPlaceholder("选择模板...");
    }

    getItems(): TemplateItem[] {
        const items: TemplateItem[] = [];

        // 1. Load File Templates
        const files = this.loader.getTemplates();
        files.forEach(f => {
            items.push({
                type: 'file',
                name: f.name,
                file: f.file
            });
        });

        // 2. Load Built-in Snippets (Optional, can be removed if strictly file-based)
        // But keeping them is good for onboarding.
        BUILTIN_TEMPLATES.forEach(t => {
            // Check if we have a duplicate name? 
            // Mark them distinctively
            items.push({
                type: 'snippet',
                name: `📦 ${t.name}`, // Add icon to distinguish
                content: t.template,
                id: t.id
            });
        });

        return items;
    }

    getItemText(item: TemplateItem): string {
        return item.name;
    }

    async onChooseItem(item: TemplateItem, evt: MouseEvent | KeyboardEvent): Promise<void> {
        let content = "";

        if (item.type === 'file' && item.file) {
            content = await this.loader.getTemplateContent(item.file);
        } else if (item.type === 'snippet' && item.content) {
            content = item.content;
        }

        if (!content) return;

        const activeView = this.app.workspace.getActiveViewOfType(Object as any); // Type cast generic workaround
        // Actually we need MarkdownView
        // But easier is just checking editor
        const editor = this.app.workspace.activeEditor?.editor;

        if (editor) {
            this.engine.insert(editor, content);
            new Notice(`已插入模板: ${item.name}`);
        } else {
            new Notice("请先打开一个文档");
        }
    }
}
