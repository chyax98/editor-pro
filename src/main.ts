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
import { FlowBoardView, VIEW_TYPE_FLOW_BOARD } from './views/flow-board-view';
import { DEFAULT_BOARD } from './features/board/board-model';
import { registerInfographicRenderer } from './features/infographic/renderer';
import { DEFAULT_SETTINGS, EditorProSettings, EditorProSettingTab } from "./settings";
import { deleteLine, duplicateLine, moveLineDown, moveLineUp, selectLine } from './features/editing/keyshots';
import { handleAutoPair, handleSmartBackspace, handleSmartSpacing } from './features/editing/smart-typography';
import { smartPasteUrlIntoSelection } from './features/editing/smart-paste-url';
import { createTypewriterScrollExtension } from './features/editing/typewriter-mode';
import { handleOutlinerIndent, toggleFold } from './features/editing/outliner';
import { applyTableOp } from './features/table/table-ops';
import { handleSmartImagePaste } from './features/editing/smart-image-paste';
import { extractTitleFromClipboardHtml, fetchPageTitle, isHttpUrl } from './features/editing/smart-link-title';
import { CursorMemoryManager, CursorMemoryState } from './features/navigation/cursor-memory';
import { RecentFilesHud } from './features/navigation/recent-files-hud';
import { SaveCleaner } from './features/editing/save-cleaner';
import { transformEditorText } from './features/editing/text-transformer';
import { SearchInSelectionModal } from './ui/search-selection-modal';
import { applyReplacementAtCursor, checkMagicDateInput, checkMagicSymbols } from './features/editing/magic-input';
import { FocusUiManager } from './features/ui/focus-ui';
import { StatusBarStats } from './features/ui/status-bar-stats';
import { FloatingOutline } from './features/ui/floating-outline';
import { zoomCurrentHeading, zoomCurrentListBlock } from './ui/zoom-modal';
import { insertFootnote } from './features/editing/footnotes';
import { inlineCalcReplaceSelection } from './features/editing/inline-calc';
import { insertDiceRollPrompt, insertRandomIntPrompt, insertUuid } from './features/editing/random-generator';
import { InlineDecorator } from './features/ui/inline-decorator';
import { FileTreeHighlightManager, HighlightColor } from './features/ui/file-tree-highlight';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isPluginDataV2(value: unknown): value is {
    version?: number;
    settings?: Partial<EditorProSettings>;
    cursorMemory?: Record<string, CursorMemoryState>;
    fileTreeHighlights?: Record<string, HighlightColor>;
} {
    if (!isRecord(value)) return false;
    if (!('settings' in value)) return false;
    const settings = (value as { settings?: unknown }).settings;
    return isRecord(settings);
}

export default class EditorProPlugin extends Plugin {
    settings: EditorProSettings;
    yamlManager: YamlManager;
    cursorMemory: CursorMemoryManager | null = null;
    private cursorMemoryInitial: Record<string, CursorMemoryState> | undefined;
    private focusUi: FocusUiManager | null = null;
    private floatingOutline: FloatingOutline | null = null;
    private inlineDecorator: InlineDecorator | null = null;
    private fileTreeHighlightManager: FileTreeHighlightManager | null = null;
    private fileTreeHighlights: Record<string, HighlightColor> = {};

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

            this.addCommand({
                id: 'open-board',
                name: '打开项目看板（.board）',
                callback: () => void this.openBoard(),
            });

            this.addCommand({
                id: 'recreate-board',
                name: '重置项目看板文件（删除并重新创建）',
                callback: () => void this.recreateBoard(),
            });
        }

        // 注册文档流看板（Flow board）
        if (this.settings.enableFlowBoard) {
            this.registerView(VIEW_TYPE_FLOW_BOARD, (leaf) => new FlowBoardView(leaf));
            this.addCommand({
                id: 'open-flow-board',
                name: '打开文档流看板 (Flow board)',
                checkCallback: (checking) => {
                    const file = this.app.workspace.getActiveFile();
                    if (!file || file.extension !== 'md') return false;
                    if (checking) return true;
                    void this.openFlowBoard(file);
                    return true;
                },
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

        // 5.3 文本处理 / 小工具 / 专注
        if (this.settings.enableTextTransformer) {
            this.addCommand({
                id: 'text-transform-upper',
                name: '文本转换：大写 (Uppercase)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'upper' }),
            });
            this.addCommand({
                id: 'text-transform-lower',
                name: '文本转换：小写 (Lowercase)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'lower' }),
            });
            this.addCommand({
                id: 'text-transform-title',
                name: '文本转换：标题格式 (Title case)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'title' }),
            });
            this.addCommand({
                id: 'text-transform-sentence',
                name: '文本转换：句首大写 (Sentence case)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'sentence' }),
            });
            this.addCommand({
                id: 'text-transform-trim-lines',
                name: '文本转换：移除行尾空格 (Trim line ends)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'trim-lines' }),
            });
            this.addCommand({
                id: 'text-transform-remove-blank-lines',
                name: '文本转换：移除空行 (Remove blank lines)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'remove-blank-lines' }),
            });
            this.addCommand({
                id: 'text-transform-sort-lines-asc',
                name: '文本转换：排序行 (Sort lines asc)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'sort-lines' }),
            });
            this.addCommand({
                id: 'text-transform-sort-lines-desc',
                name: '文本转换：倒序排序行 (Sort lines desc)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'sort-lines', descending: true }),
            });
            this.addCommand({
                id: 'text-transform-join-lines',
                name: '文本转换：合并为一行 (Join lines)',
                editorCallback: (editor) => transformEditorText(editor, { type: 'join-lines' }),
            });
        }

        if (this.settings.enableSearchInSelection) {
            this.addCommand({
                id: 'search-in-selection',
                name: '选区查找替换 (Search in selection)',
                editorCallback: (editor) => new SearchInSelectionModal(this.app, editor).open(),
            });
        }

        if (this.settings.enableZoom) {
            this.addCommand({
                id: 'zoom-heading',
                name: '聚焦当前标题段落 (Zoom heading)',
                editorCallback: (editor) => zoomCurrentHeading(this.app, editor),
            });
            this.addCommand({
                id: 'zoom-list-block',
                name: '聚焦当前列表块 (Zoom list block)',
                editorCallback: (editor) => zoomCurrentListBlock(this.app, editor),
            });
        }

        if (this.settings.enableFootnotes) {
            this.addCommand({
                id: 'insert-footnote',
                name: '插入脚注 (Insert footnote)',
                editorCallback: (editor) => insertFootnote(editor),
            });
        }

        if (this.settings.enableInlineCalc) {
            this.addCommand({
                id: 'inline-calc',
                name: '行内计算（选区）(Inline calc)',
                editorCallback: (editor) => inlineCalcReplaceSelection(editor),
            });
        }

        if (this.settings.enableRandomGenerator) {
            this.addCommand({
                id: 'insert-uuid',
                name: '插入 UUID',
                editorCallback: (editor) => insertUuid(editor),
            });
            this.addCommand({
                id: 'insert-random-int',
                name: '插入随机整数…',
                editorCallback: (editor) => insertRandomIntPrompt(this.app, editor),
            });
            this.addCommand({
                id: 'dice-roll',
                name: '掷骰子…',
                editorCallback: (editor) => insertDiceRollPrompt(this.app, editor),
            });
        }

        if (this.settings.enableFileTreeHighlight) {
            this.addCommand({
                id: 'filetree-highlight-current',
                name: '文件树：高亮当前文件/文件夹…',
                callback: () => void this.openFileTreeHighlightMenu(),
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

                    if (this.settings.enableTextTransformer) {
                        menu.addSeparator();
                        menu.addItem((item) => {
                            item.setTitle("文本转换：移除空行").setIcon("wand").onClick(() => {
                                transformEditorText(editor, { type: "remove-blank-lines" });
                            });
                        });
                        menu.addItem((item) => {
                            item.setTitle("文本转换：合并为一行").setIcon("wand").onClick(() => {
                                transformEditorText(editor, { type: "join-lines" });
                            });
                        });
                        menu.addItem((item) => {
                            item.setTitle("文本转换：排序行").setIcon("wand").onClick(() => {
                                transformEditorText(editor, { type: "sort-lines" });
                            });
                        });
                    }

                    if (this.settings.enableSearchInSelection && selection) {
                        menu.addItem((item) => {
                            item.setTitle("选区查找替换…").setIcon("search").onClick(() => {
                                new SearchInSelectionModal(this.app, editor).open();
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

        // 7.2 保存时清理（Save cleaner）
        if (this.settings.enableSaveCleaner) {
            new SaveCleaner({ app: this.app, enabled: () => this.settings.enableSaveCleaner }).register(this);
        }

        // 7.0 光标记忆（Cursor memory）
        if (this.settings.enableCursorMemory) {
            this.cursorMemory = new CursorMemoryManager({
                app: this.app,
                enabled: () => this.settings.enableCursorMemory,
                initialState: this.cursorMemoryInitial,
                onSave: async (state) => {
                    await this.savePluginData({ cursorMemory: state });
                },
            });
            this.cursorMemory.register(this);
        }

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

        // 8.1 智能粘贴：图片重命名归档 / URL 自动标题 / URL into selection
        this.registerEvent(
            this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor, info) => {
                void this.safeExecuteAsync(async () => {
                    // A) 图片粘贴：重命名归档
                    if (this.settings.enableSmartImagePaste) {
                        const handled = await handleSmartImagePaste(this.app, editor, { file: info.file }, evt);
                        if (handled) return;
                    }

                    const text = evt.clipboardData?.getData('text/plain') ?? '';
                    if (!text) return;

                    // B) URL into selection（Notion 风格）
                    if (this.settings.enableSmartPasteUrl) {
                        const handled = smartPasteUrlIntoSelection(editor, text);
                        if (handled) {
                            evt.preventDefault();
                            return;
                        }
                    }

                    // C) URL 自动标题（无选区）
                    if (this.settings.enableSmartLinkTitle && !editor.somethingSelected() && isHttpUrl(text)) {
                        const url = text.trim();
                        const html = evt.clipboardData?.getData('text/html') ?? '';
                        const fromHtml = html ? extractTitleFromClipboardHtml(html, url) : null;
                        const title = fromHtml?.trim()
                            ? fromHtml.trim()
                            : (this.settings.enableSmartLinkTitleNetwork ? await fetchPageTitle(url) : null);

                        if (title) {
                            evt.preventDefault();
                            editor.replaceSelection(`[${title}](${url})`);
                        }
                    }
                });
            })
        );

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
                        return;
                    }
                }

                // C. 魔法输入（自然语言日期 + 符号替换）
                if (this.settings.enableMagicInput) {
                    const cursor = editor.getCursor();
                    const line = editor.getLine(cursor.line);
                    const sym = checkMagicSymbols(line, cursor.ch);
                    if (sym) {
                        applyReplacementAtCursor(editor, sym);
                        return;
                    }
                    const date = checkMagicDateInput(line, cursor.ch);
                    if (date) {
                        applyReplacementAtCursor(editor, date);
                        return;
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

        // 12. 最近文件 HUD
        if (this.settings.enableQuickHud) {
            this.addCommand({
                id: 'quick-hud-recent-files',
                name: '最近文件 (Quick HUD)',
                callback: () => {
                    new RecentFilesHud(this.app).open();
                },
            });
        }

        // 13. Focus UI / Floating outline / Status bar stats
        if (this.settings.enableFocusUi) {
            this.focusUi = new FocusUiManager();
            this.focusUi.register(this);
            this.addCommand({
                id: 'toggle-focus-ui',
                name: '切换专注模式（隐藏侧边栏/状态栏）',
                callback: () => {
                    this.focusUi?.toggle();
                },
            });
        }

        if (this.settings.enableFloatingOutline) {
            this.floatingOutline = new FloatingOutline({ app: this.app, enabled: () => this.settings.enableFloatingOutline });
            this.floatingOutline.register(this);
            this.addCommand({
                id: 'toggle-floating-outline',
                name: '切换浮动大纲 (Floating outline)',
                callback: () => {
                    this.floatingOutline?.toggle();
                },
            });
        }

        if (this.settings.enableStatusBarStats) {
            new StatusBarStats({ app: this.app, enabled: () => this.settings.enableStatusBarStats }).register(this);
        }

        // 14. 文件列表增强（icon/banner + file tree highlight）
        if (this.settings.enableInlineDecorator) {
            this.inlineDecorator = new InlineDecorator({ app: this.app, enabled: () => this.settings.enableInlineDecorator });
            this.inlineDecorator.register(this);
        }

        if (this.settings.enableFileTreeHighlight) {
            this.fileTreeHighlightManager = new FileTreeHighlightManager({
                app: this.app,
                enabled: () => this.settings.enableFileTreeHighlight,
                getHighlights: () => this.fileTreeHighlights,
            });
            this.fileTreeHighlightManager.register(this);
        }

        this.addSettingTab(new EditorProSettingTab(this.app, this));
    }

    private async openFileTreeHighlightMenu() {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
            new Notice('Editor Pro：当前没有打开文件');
            return;
        }

        const menu = new Menu();
        const colors: HighlightColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

        for (const color of colors) {
            menu.addItem((item) => {
                item.setTitle(`高亮：${color}`);
                item.onClick(() => void this.setFileTreeHighlight(file.path, color));
            });
        }

        menu.addSeparator();
        menu.addItem((item) => {
            item.setTitle('清除高亮');
            item.onClick(() => void this.clearFileTreeHighlight(file.path));
        });

        // Trigger from command palette: show at center-ish.
        menu.showAtPosition({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
    }

    private async setFileTreeHighlight(path: string, color: HighlightColor) {
        this.fileTreeHighlights[path] = color;
        this.fileTreeHighlightManager?.update();
        await this.savePluginData({ fileTreeHighlights: this.fileTreeHighlights });
    }

    private async clearFileTreeHighlight(path: string) {
        delete this.fileTreeHighlights[path];
        this.fileTreeHighlightManager?.update();
        await this.savePluginData({ fileTreeHighlights: this.fileTreeHighlights });
    }

    onunload() {}

    async loadSettings() {
        const loaded = (await this.loadData()) as unknown;

        // Backward compatible: old format stored settings at root.
        if (isPluginDataV2(loaded)) {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded.settings ?? {});
            this.cursorMemoryInitial = loaded.cursorMemory;
            this.fileTreeHighlights = loaded.fileTreeHighlights ?? {};
            return;
        }

        this.settings = Object.assign({}, DEFAULT_SETTINGS, (loaded as Partial<EditorProSettings>) ?? {});
    }

    async saveSettings() {
        await this.savePluginData({ settings: this.settings });
    }

    private async savePluginData(patch: {
        settings?: EditorProSettings;
        cursorMemory?: Record<string, CursorMemoryState>;
        fileTreeHighlights?: Record<string, HighlightColor>;
    }) {
        const existing = (await this.loadData()) as unknown;
        const base = isPluginDataV2(existing)
            ? existing
            : { version: 2, settings: { ...this.settings }, cursorMemory: undefined, fileTreeHighlights: undefined };

        const next = {
            ...base,
            version: 2,
            settings: patch.settings ?? base.settings,
            cursorMemory: patch.cursorMemory ?? base.cursorMemory,
            fileTreeHighlights: patch.fileTreeHighlights ?? base.fileTreeHighlights,
        };

        await this.saveData(next);
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

    private async openFlowBoard(file: TFile) {
        const leaf = this.app.workspace.getLeaf(true);
        await leaf.setViewState({ type: VIEW_TYPE_FLOW_BOARD, state: { file: file.path }, active: true });
        await this.app.workspace.revealLeaf(leaf);
    }

    private async recreateBoard() {
        const rawPath = this.settings.kanbanFilePath?.trim() || 'Kanban.board';

        let path = rawPath.endsWith('.board')
            ? rawPath
            : `${rawPath.replace(/\.md$/i, '')}.board`;

        path = normalizePath(path);

        if (path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)) {
            new Notice('Editor Pro：看板路径必须是库内相对路径（例如：Kanban.board 或 Projects/Kanban.board）');
            return;
        }

        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing instanceof TFolder) {
            new Notice(`Editor Pro：看板路径被文件夹占用：${path}`);
            return;
        }

        if (existing instanceof TFile) {
            try {
                await this.app.fileManager.trashFile(existing);
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                new Notice(`Editor Pro：删除旧看板失败：${message}`);
                return;
            }
        }

        try {
            const folderPath = path.split('/').slice(0, -1).join('/');
            if (folderPath) await this.ensureFolderExists(folderPath);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            new Notice(`Editor Pro：创建文件夹失败：${message}`);
            return;
        }

        try {
            await this.app.vault.create(path, JSON.stringify(DEFAULT_BOARD, null, 2));
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            new Notice(`Editor Pro：创建看板失败：${message}`);
            return;
        }

        new Notice(`Editor Pro：已重置看板：${path}`);
        await this.openBoard();
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

    private async safeExecuteAsync(action: () => Promise<void>, errorMessage: string = '操作失败') {
        try {
            await action();
        } catch (error) {
            new Notice(`Editor Pro: ${errorMessage}`);
            console.error(`[Editor Pro] ${errorMessage}`, error);
        }
    }
}
