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
import { createOverdueHighlighter } from './features/visuals/overdue-highlighter';
import { BoardView, VIEW_TYPE_BOARD } from './views/board-view';
import { DEFAULT_BOARD } from './features/board/board-model';
import { registerInfographicRenderer } from './features/infographic/renderer';
import { DEFAULT_SETTINGS, EditorProSettings, EditorProSettingTab } from "./settings";
import { deleteLine, duplicateLine, moveLineDown, moveLineUp, selectLine } from './features/editing/keyshots';
import { handleAutoPair, handleSmartBackspace, handleSmartSpacing } from './features/editing/smart-typography';
import { smartPasteUrlIntoSelection } from './features/editing/smart-paste-url';
import { createTypewriterScrollExtension } from './features/editing/typewriter-mode';
import { handleOutlinerIndent, toggleFold } from './features/editing/outliner';
import { applyTableOp } from './features/table/table-ops';

export default class EditorProPlugin extends Plugin {
    settings: EditorProSettings;
    yamlManager: YamlManager;

    async onload() {
        await this.loadSettings();

        // 注册多维看板视图
        if (this.settings.enableBoard) {
            this.registerView(
                VIEW_TYPE_BOARD,
                (leaf) => new BoardView(leaf)
            );
            this.registerExtensions(['board'], VIEW_TYPE_BOARD);

            // 侧边栏图标：打开项目看板
            this.addRibbonIcon('layout-dashboard', '打开项目看板', () => {
                void this.openBoard();
            });
        }

        // --- Editor UX Enhancements (Keyshots) ---
        if (this.settings.enableKeyshots) {
            this.addCommand({
                id: 'move-line-up', name: '上移当前行 (Move Line Up)',
                editorCallback: (editor: Editor) => moveLineUp(editor)
            });
            this.addCommand({
                id: 'move-line-down', name: '下移当前行 (Move Line Down)',
                editorCallback: (editor: Editor) => moveLineDown(editor)
            });
            this.addCommand({
                id: 'duplicate-line', name: '向下复制当前行 (Duplicate Line)',
                editorCallback: (editor: Editor) => duplicateLine(editor)
            });
            this.addCommand({
                id: 'delete-line', name: '删除当前行 (Delete Line)',
                editorCallback: (editor: Editor) => deleteLine(editor)
            });
            this.addCommand({
                id: 'select-line', name: '选中当前行 (Select Line)',
                editorCallback: (editor: Editor) => selectLine(editor)
            });
        }

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

        // 5.1 Outliner（折叠命令）
        if (this.settings.enableOutliner) {
            this.addCommand({
                id: 'outliner-toggle-fold',
                name: '大纲：折叠/展开 (Toggle fold)',
                editorCallback: (editor: Editor) => toggleFold(editor),
            });
            this.addCommand({
                id: 'outliner-fold-all',
                name: '大纲：全部折叠 (Fold all)',
                editorCallback: (editor: Editor) => editor.exec('foldAll'),
            });
            this.addCommand({
                id: 'outliner-unfold-all',
                name: '大纲：全部展开 (Unfold all)',
                editorCallback: (editor: Editor) => editor.exec('unfoldAll'),
            });
        }

        // 5.2 表格操作（Advanced Tables Lite）
        if (this.settings.enableTableOps) {
            this.addCommand({
                id: 'table-insert-column-left',
                name: '表格：在当前列左侧插入列',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'insert-col', side: 'left' });
                },
            });
            this.addCommand({
                id: 'table-insert-column-right',
                name: '表格：在当前列右侧插入列',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'insert-col', side: 'right' });
                },
            });
            this.addCommand({
                id: 'table-delete-column',
                name: '表格：删除当前列',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'delete-col' });
                },
            });
            this.addCommand({
                id: 'table-align-left',
                name: '表格：当前列左对齐',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'align-col', align: 'left' });
                },
            });
            this.addCommand({
                id: 'table-align-center',
                name: '表格：当前列居中',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'align-col', align: 'center' });
                },
            });
            this.addCommand({
                id: 'table-align-right',
                name: '表格：当前列右对齐',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'align-col', align: 'right' });
                },
            });
            this.addCommand({
                id: 'table-format',
                name: '表格：格式化当前表格',
                editorCallback: (editor: Editor) => {
                    applyTableOp(editor, { type: 'format' });
                },
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

                        if (this.settings.enableTableOps) {
                            menu.addSeparator();
                            menu.addItem((item) => {
                                item.setTitle("表格：插入列（左）")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'insert-col', side: 'left' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：插入列（右）")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'insert-col', side: 'right' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：删除列")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'delete-col' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：列左对齐")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'align-col', align: 'left' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：列居中")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'align-col', align: 'center' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：列右对齐")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'align-col', align: 'right' }));
                            });
                            menu.addItem((item) => {
                                item.setTitle("表格：格式化")
                                    .setIcon("table")
                                    .onClick(() => applyTableOp(editor, { type: 'format' }));
                            });
                        }
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

        // 7.1 Typewriter scroll（光标居中）
        this.registerEditorExtension(
            createTypewriterScrollExtension(() => this.settings.enableTypewriterScroll)
        );

        // 8. 表格 Tab 导航 & 块跳出 (Shift+Enter) & 自动配对 & 智能退格
        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                if (!this.settings.enableSmartTyping && !this.settings.enableEditorNavigation && !this.settings.enableOutliner) return;

                // 1. 智能退格 (Backspace)
                if (this.settings.enableSmartTyping && evt.key === 'Backspace') {
                    if (handleSmartBackspace(view.editor, evt)) return;
                }

                // 2. 自动配对 / 包裹 (Any Char)
                // 注意：evt.key 可能是 'Enter', 'Tab' 等，PAIR_MAP 查不到会返回 false，安全。
                if (this.settings.enableSmartTyping && evt.key.length === 1 && !evt.ctrlKey && !evt.metaKey && !evt.altKey) {
                     if (handleAutoPair(view.editor, evt.key, evt)) return;
                }

                if (this.settings.enableOutliner) {
                    if (handleOutlinerIndent(view.editor, evt)) return;
                }

                if (this.settings.enableEditorNavigation) {
                    handleTableNavigation(evt, view.editor);
                    handleBlockNavigation(evt, view.editor);
                }
            }
        });

        // 8.1 智能粘贴链接：选中标题后粘贴 URL -> [标题](URL)
        this.registerDomEvent(document, 'paste', (evt: ClipboardEvent) => {
            if (!this.settings.enableSmartPasteUrl) return;

            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view) return;

            const target = evt.target instanceof HTMLElement ? evt.target : null;
            if (target && !target.closest('.cm-editor')) return;

            const text = evt.clipboardData?.getData('text/plain') ?? '';
            if (!text) return;

            const handled = smartPasteUrlIntoSelection(view.editor, text);
            if (handled) evt.preventDefault();
        });

        // 9. 智能输入展开 (@today, @time) + 智能排版 (Smart Spacing)
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor: Editor) => {
                // A. 智能排版 (中英自动空格)
                if (this.settings.enableSmartTyping) {
                    handleSmartSpacing(editor);
                }

                // B. 智能输入展开
                if (this.settings.enableSmartInput) {
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
                }
            })
        );

        // 10. 过期高亮
        this.registerEditorExtension(
            createOverdueHighlighter(() => this.settings.enableOverdueHighlighter)
        );

        // 11. Infographic 渲染器（```infographic 代码块）
        if (this.settings.enableInfographicRenderer) {
            registerInfographicRenderer(this);
        }

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

        const file = existing instanceof TFile ? existing : null;
        if (!file) {
            try {
                const created = await this.app.vault.create(path, JSON.stringify(DEFAULT_BOARD, null, 2));
                new Notice(`已创建看板: ${path}`);

                const leaf = this.app.workspace.getLeaf(true);
                try {
                    await leaf.setViewState({ type: VIEW_TYPE_BOARD, state: { file: created.path }, active: true });
                } catch {
                    await leaf.openFile(created, { active: true });
                }
                await this.app.workspace.revealLeaf(leaf);
                return;
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
