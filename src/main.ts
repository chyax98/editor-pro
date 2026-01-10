import { Editor, MarkdownView, Menu, normalizePath, Notice, Plugin, TFile, TFolder } from 'obsidian';
import { smartToggle } from './features/formatting/smart-toggle';
import { toggleTask } from './features/formatting/task-toggle';
import { wrapWithCallout, wrapWithCodeBlock } from './features/callout/wrap-callout';
import { CalloutTypePicker } from './features/callout/callout-picker';
import { SlashCommandMenu } from './features/slash-command/menu';
import { insertRow } from './utils/markdown-generators';
import { YamlManager } from './features/yaml/auto-update';
import { handleTableNavigation } from './features/table/table-navigation';
import { handleBlockNavigation } from './features/formatting/block-navigation';
import { checkSmartInput } from './features/smart-input/input-handler';
import { overdueHighlighter } from './features/visuals/overdue-highlighter';
import { BoardView, VIEW_TYPE_BOARD } from './views/board-view';
import { DEFAULT_BOARD } from './features/board/board-model';
import { registerInfographicRenderer } from './features/infographic/renderer';
import { DEFAULT_SETTINGS, EditorProSettings, EditorProSettingTab } from "./settings";

export default class EditorProPlugin extends Plugin {
    settings: EditorProSettings;
    yamlManager: YamlManager;

    async onload() {
        await this.loadSettings();

        // 注册多维看板视图
        this.registerView(
            VIEW_TYPE_BOARD,
            (leaf) => new BoardView(leaf)
        );
        this.registerExtensions(['board'], VIEW_TYPE_BOARD);

        // 侧边栏图标：打开项目看板
        this.addRibbonIcon('layout-dashboard', '打开项目看板', () => {
            void this.openBoard();
        });

        // 1. 智能格式切换
        if (this.settings.enableSmartToggle) {
            this.addCommand({
                id: 'smart-bold', name: '智能加粗',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '**', name: 'Bold' }), '加粗失败'),
            });
            this.addCommand({
                id: 'smart-italic', name: '智能斜体',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '*', name: 'Italic' }), '斜体失败'),
            });
            this.addCommand({
                id: 'smart-strikethrough', name: '智能删除线',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '~~', name: 'Strikethrough' }), '删除线失败'),
            });
            this.addCommand({
                id: 'smart-highlight', name: '智能高亮',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '==', name: 'Highlight' }), '高亮失败'),
            });
            this.addCommand({
                id: 'smart-code', name: '智能行内代码',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '`', name: 'Code' }), '行内代码失败'),
            });
        }

        // 2. 块包装转换
        this.addCommand({
            id: 'wrap-callout', name: '转为 Callout 提示块',
            editorCallback: (editor: Editor) => {
                new CalloutTypePicker(this.app, (type) => wrapWithCallout(editor, { type })).open();
            },
        });
        this.addCommand({
            id: 'wrap-codeblock', name: '转为代码块',
            editorCallback: (editor: Editor) => wrapWithCodeBlock(editor),
        });

        // 3. 斜杠命令
        if (this.settings.enableSlashCommand) {
            this.registerEditorSuggest(new SlashCommandMenu(this.app));
        }

        // 4. 标题快捷键
        if (this.settings.enableHeadingHotkeys) {
            for (let i = 1; i <= 6; i++) {
                this.addCommand({
                    id: `set-heading-${i}`,
                    name: `设为 ${i} 级标题`,
                    editorCallback: (editor: Editor) => this.setHeading(editor, i),
                });
            }
        }

        // 5. 任务管理
        if (this.settings.enableTaskHotkeys) {
            this.addCommand({
                id: 'toggle-task',
                name: '切换任务状态',
                editorCallback: (editor: Editor) => toggleTask(editor),
            });
        }

        // 6. 右键菜单集成
        if (this.settings.enableContextMenu) {
            this.registerEvent(
                this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor) => {
                    const selection = editor.getSelection();
                    const line = editor.getLine(editor.getCursor().line);
                    const isInTable = line.trim().startsWith('|');

                    if (selection) {
                        menu.addSeparator();
                        menu.addItem((item) => {
                            item.setTitle("包裹为 Callout 提示块")
                                .setIcon("info")
                                .onClick(() => {
                                     new CalloutTypePicker(this.app, (type) => wrapWithCallout(editor, { type })).open();
                                });
                        });
                    }

                    if (isInTable) {
                        menu.addSeparator();
                        menu.addItem((item) => {
                            item.setTitle("在下方插入行")
                                .setIcon("table")
                                .onClick(() => {
                                    const allLines = editor.getValue().split('\n');
                                    const newLines = insertRow(allLines, editor.getCursor().line);
                                    editor.setValue(newLines.join('\n'));
                                });
                        });
                    }
                })
            );
        }

        // 7. YAML 自动化
        this.yamlManager = new YamlManager(this.app, {
            enableYaml: this.settings.enableYaml,
            createdKey: this.settings.yamlCreatedKey,
            updatedKey: this.settings.yamlUpdatedKey,
            dateFormat: this.settings.yamlDateFormat
        });
        this.yamlManager.register(this);

        // 8. 表格 Tab 导航 & 块跳出 (Shift+Enter)
        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                handleTableNavigation(evt, view.editor);
                handleBlockNavigation(evt, view.editor);
            }
        });

        // 9. 智能输入展开 (@today, @time)
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor: Editor) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);
                const match = checkSmartInput(line, cursor.ch);
                if (match) {
                    editor.replaceRange(
                        match.replacement,
                        { line: cursor.line, ch: match.range.from },
                        { line: cursor.line, ch: match.range.to }
                    );
                }
            })
        );

        // 10. 过期高亮
        this.registerEditorExtension(overdueHighlighter);

        // 11. Infographic 渲染器（```infographic 代码块）
        registerInfographicRenderer(this);

        this.addSettingTab(new EditorProSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        const loaded = (await this.loadData()) as Partial<EditorProSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded ?? {});
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async openBoard() {
        const rawPath = this.settings.kanbanFilePath?.trim() || 'Kanban.board';

        let path = rawPath.endsWith('.board')
            ? rawPath
            : `${rawPath.replace(/\.md$/i, '')}.board`;

        path = normalizePath(path);

        // Obsidian vault paths must be relative.
        if (path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)) {
            new Notice('Editor Pro：看板路径必须是库内相对路径（例如：Kanban.board 或 Projects/Kanban.board）');
            return;
        }

        try {
            const folderPath = path.split('/').slice(0, -1).join('/');
            if (folderPath) await this.ensureFolderExists(folderPath);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            new Notice(`Editor Pro：创建文件夹失败：${message}`);
            return;
        }

        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing && !(existing instanceof TFile)) {
            new Notice(`Editor Pro：看板路径被文件夹占用：${path}`);
            return;
        }

        let file = existing as TFile | null;
        if (!file) {
            try {
                file = await this.app.vault.create(path, JSON.stringify(DEFAULT_BOARD, null, 2));
                new Notice(`已创建看板: ${path}`);
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                new Notice(`创建看板失败: ${message}`);
                return;
            }
        }

        const leaf = this.app.workspace.getLeaf(true);
        try {
            await leaf.setViewState({ type: VIEW_TYPE_BOARD, state: { file: file.path }, active: true });
        } catch {
            await leaf.openFile(file, { active: true });
        }
        await this.app.workspace.revealLeaf(leaf);
    }

    private async ensureFolderExists(folderPath: string) {
        const parts = folderPath.split('/').filter(Boolean);
        let currentPath = '';

        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            const existing = this.app.vault.getAbstractFileByPath(currentPath);
            if (!existing) {
                await this.app.vault.createFolder(currentPath);
                continue;
            }

            if (!(existing instanceof TFolder)) {
                throw new Error(`路径冲突：${currentPath} 已存在且不是文件夹`);
            }
        }
    }

    private setHeading(editor: Editor, level: number) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const content = line.replace(/^#+\s?/, '');
        editor.setLine(cursor.line, '#'.repeat(level) + ' ' + content);
    }

    private safeExecute(action: () => void, errorMessage: string = '操作失败') {
        try {
            action();
        } catch (error) {
            new Notice(`Editor Pro: ${errorMessage}`);
            console.error(`[Editor Pro] ${errorMessage}`, error);
        }
    }
}
