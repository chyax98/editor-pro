import { Editor, MarkdownView, Plugin, Menu, Notice } from 'obsidian';
import { smartToggle } from './features/formatting/smart-toggle';
import { toggleTask } from './features/formatting/task-toggle';
import { wrapWithCallout, wrapWithCodeBlock, wrapWithQuote } from './features/callout/wrap-callout';
import { CalloutTypePicker } from './features/callout/callout-picker';
import { SlashCommandMenu } from './features/slash-command/menu';
import { generateTable, generateDate, insertRow, deleteRow } from './utils/markdown-generators';
import { YamlManager } from './features/yaml/auto-update';
import { handleTableNavigation } from './features/table/table-navigation';
import { checkSmartInput } from './features/smart-input/input-handler';
import { getTaskColumn, moveTaskToColumn } from './features/kanban/kanban-logic';
import { setDueDate } from './features/kanban/due-date';
import { archiveCompletedTasks } from './features/kanban/archive';
import { DEFAULT_SETTINGS, MyPluginSettings, EditorProSettingTab } from "./settings";

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    yamlManager: YamlManager;

    async onload() {
        await this.loadSettings();

        // 1. Smart Toggle Formatting
        if (this.settings.enableSmartToggle) {
            this.addCommand({
                id: 'smart-bold', name: 'Smart bold',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '**', name: 'Bold' }), 'Smart bold failed'),
                hotkeys: [{ modifiers: ['Mod'], key: 'b' }]
            });
            this.addCommand({
                id: 'smart-italic', name: 'Smart italic',
                editorCallback: (editor: Editor) => this.safeExecute(() => smartToggle(editor, { marker: '*', name: 'Italic' }), 'Smart italic failed'),
                hotkeys: [{ modifiers: ['Mod'], key: 'i' }]
            });
            this.addCommand({
                id: 'smart-strikethrough', name: 'Smart strikethrough',
                editorCallback: (editor: Editor) => smartToggle(editor, { marker: '~~', name: 'Strikethrough' }),
                hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 's' }]
            });
            this.addCommand({
                id: 'smart-highlight', name: 'Smart highlight',
                editorCallback: (editor: Editor) => smartToggle(editor, { marker: '==', name: 'Highlight' }),
                hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'h' }]
            });
            this.addCommand({
                id: 'smart-code', name: 'Smart inline code',
                editorCallback: (editor: Editor) => smartToggle(editor, { marker: '`', name: 'Code' }),
                hotkeys: [{ modifiers: ['Mod'], key: '`' }]
            });
        }

        // 2. Wrap Selection
        // These are always enabled as commands, can be unbound by user if needed
        this.addCommand({
            id: 'wrap-callout', name: 'Wrap with callout',
            editorCallback: (editor: Editor) => {
                new CalloutTypePicker(this.app, (type) => wrapWithCallout(editor, { type })).open();
            },
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'c' }]
        });

        this.addCommand({
            id: 'wrap-codeblock', name: 'Wrap with code block',
            editorCallback: (editor: Editor) => wrapWithCodeBlock(editor),
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'k' }]
        });

        this.addCommand({
            id: 'wrap-quote', name: 'Wrap with quote',
            editorCallback: (editor: Editor) => wrapWithQuote(editor),
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'q' }]
        });

        // 3. Slash Command
        if (this.settings.enableSlashCommand) {
            this.registerEditorSuggest(new SlashCommandMenu(this.app));
        }

        // 4. Heading Hotkeys
        if (this.settings.enableHeadingHotkeys) {
            for (let i = 1; i <= 6; i++) {
                this.addCommand({
                    id: `set-heading-${i}`,
                    name: `Set heading ${i}`,
                    editorCallback: (editor: Editor) => this.setHeading(editor, i),
                    hotkeys: [{ modifiers: ['Mod'], key: String(i) }]
                });
            }
        }

        // 5. Task Hotkeys
        if (this.settings.enableTaskHotkeys) {
            this.addCommand({
                id: 'toggle-task',
                name: 'Toggle task status',
                editorCallback: (editor: Editor) => toggleTask(editor),
                hotkeys: [{ modifiers: ['Mod'], key: 'l' }]
            });

            this.addCommand({
                id: 'move-task-next',
                name: 'Move task to next column',
                editorCallback: (editor: Editor) => {
                    this.safeExecute(() => {
                        const cursor = editor.getCursor();
                        const allLines = editor.getValue().split('\n');
                        const currentCol = getTaskColumn(allLines, cursor.line);
                        
                        let targetCol = '';
                        if (currentCol === 'Todo') targetCol = 'In Progress';
                        else if (currentCol === 'In Progress') targetCol = 'Done';
                        else {
                            new Notice('Editor Pro: Cursor must be under a Kanban heading (Todo or In Progress)');
                            return;
                        }

                        const result = moveTaskToColumn(allLines, cursor.line, targetCol);
                        editor.setValue(result.newLines.join('\n'));
                        editor.setCursor({ line: result.newCursorLine, ch: 0 });
                    }, 'Failed to move task');
                },
                hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'ArrowRight' }]
            });

            this.addCommand({
                id: 'set-due-date',
                name: 'Set due date (Today)',
                editorCallback: (editor: Editor) => {
                    const cursor = editor.getCursor();
                    const line = editor.getLine(cursor.line);
                    const newLine = setDueDate(line, generateDate('YYYY-MM-DD'));
                    editor.setLine(cursor.line, newLine);
                }
            });

            this.addCommand({
                id: 'archive-tasks',
                name: 'Archive completed tasks',
                editorCallback: (editor: Editor) => {
                    const content = editor.getValue();
                    const newContent = archiveCompletedTasks(content);
                    editor.setValue(newContent);
                }
            });
        }

        // 6. Context Menu Integration
        if (this.settings.enableContextMenu) {
            this.registerEvent(
                this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor) => {
                    const selection = editor.getSelection();
                    const line = editor.getLine(editor.getCursor().line);
                    const isInTable = line.trim().startsWith('|');

                    if (selection) {
                        menu.addSeparator();
                        
                        menu.addItem((item) => {
                            item.setTitle("Wrap with Callout")
                                .setIcon("info")
                                .onClick(() => {
                                     new CalloutTypePicker(this.app, (type) => wrapWithCallout(editor, { type })).open();
                                });
                        });
                        
                        menu.addItem((item) => {
                            item.setTitle("Wrap with Code Block")
                                .setIcon("code")
                                .onClick(() => wrapWithCodeBlock(editor));
                        });
                    }

                    if (isInTable) {
                        menu.addSeparator();
                        menu.addItem((item) => {
                            item.setTitle("Insert Row Below")
                                .setIcon("table")
                                .onClick(() => {
                                    const cursor = editor.getCursor();
                                    const allLines = editor.getValue().split('\n');
                                    const newLines = insertRow(allLines, cursor.line);
                                    editor.setValue(newLines.join('\n'));
                                    editor.setCursor({ line: cursor.line + 1, ch: 2 });
                                });
                        });
                        menu.addItem((item) => {
                            item.setTitle("Delete Current Row")
                                .setIcon("trash")
                                .onClick(() => {
                                    const cursor = editor.getCursor();
                                    const allLines = editor.getValue().split('\n');
                                    const newLines = deleteRow(allLines, cursor.line);
                                    editor.setValue(newLines.join('\n'));
                                });
                        });
                    }
                })
            );
        }

        // 7. Insert Commands
        this.addCommand({
            id: 'insert-table',
            name: 'Insert table (3x3)',
            editorCallback: (editor: Editor) => editor.replaceSelection(generateTable(3, 3))
        });

        this.addCommand({
            id: 'insert-row-below',
            name: 'Insert row below',
            editorCallback: (editor: Editor) => {
                const cursor = editor.getCursor();
                const allLines = editor.getValue().split('\n');
                const newLines = insertRow(allLines, cursor.line);
                editor.setValue(newLines.join('\n'));
                editor.setCursor({ line: cursor.line + 1, ch: 2 });
            }
        });

        this.addCommand({
            id: 'delete-table-row',
            name: 'Delete current row',
            editorCallback: (editor: Editor) => {
                const cursor = editor.getCursor();
                const allLines = editor.getValue().split('\n');
                const newLines = deleteRow(allLines, cursor.line);
                editor.setValue(newLines.join('\n'));
            }
        });

        this.addCommand({
            id: 'insert-date',
            name: 'Insert current date',
            editorCallback: (editor: Editor) => editor.replaceSelection(generateDate('YYYY-MM-DD'))
        });
        
        this.addCommand({
            id: 'insert-time',
            name: 'Insert current time',
            editorCallback: (editor: Editor) => editor.replaceSelection(generateDate('HH:mm'))
        });

        // 8. YAML Automation
        this.yamlManager = new YamlManager(this.app, {
            enableYaml: this.settings.enableYaml,
            createdKey: this.settings.yamlCreatedKey,
            updatedKey: this.settings.yamlUpdatedKey,
            dateFormat: this.settings.yamlDateFormat
        });
        this.yamlManager.onload();

        // 9. Table Navigation (Tab Key)
        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                handleTableNavigation(evt, view.editor);
            }
        });

        // 10. Smart Input Expansion (@today, @time)
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

        this.addSettingTab(new EditorProSettingTab(this.app, this));
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private setHeading(editor: Editor, level: number) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        // Remove existing heading marker (e.g. "### ")
        const content = line.replace(/^#+\s?/, '');
        editor.setLine(cursor.line, '#'.repeat(level) + ' ' + content);
    }

    private safeExecute(action: () => void, errorMessage: string = 'Command failed') {
        try {
            action();
        } catch (error) {
            new Notice(`Editor Pro: ${errorMessage}`);
            console.error(`[Editor Pro] ${errorMessage}`, error);
        }
    }
}