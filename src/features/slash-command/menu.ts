import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian";
import { SlashCommand, shouldTriggerSlashCommand, matchCommand } from "./utils";
import { wrapWithCallout, wrapWithCodeBlock } from "../callout/wrap-callout";
import { CalloutTypePicker } from "../callout/callout-picker";

import { generateTable, generateMermaid, generateDate } from "../../utils/markdown-generators";

const COMMANDS: SlashCommand[] = [
    { id: 'callout', name: '提示块 (Callout)', aliases: ['callout', 'tip', 'tsk'] },
    { id: 'codeblock', name: '代码块 (Code Block)', aliases: ['code', 'dmk'] },
    { id: 'table', name: '插入表格 (Table)', aliases: ['table', 'bg'] },
    { id: 'date', name: '当前日期 (Date)', aliases: ['date', 'rq'] },
    { id: 'time', name: '当前时间 (Time)', aliases: ['time', 'sj'] },
    { id: 'flowchart', name: '流程图 (Flowchart)', aliases: ['flow', 'lct'] },
    { id: 'sequence', name: '时序图 (Sequence)', aliases: ['seq', 'sxt'] },
    { id: 'h1', name: '一级标题 (H1)', aliases: ['h1', 'yjbt'] },
    { id: 'h2', name: '二级标题 (H2)', aliases: ['h2', 'ejbt'] },
    { id: 'h3', name: '三级标题 (H3)', aliases: ['h3', 'sjbt'] },
    { id: 'quote', name: '引用 (Quote)', aliases: ['quote', 'yy'] },
];

export class SlashCommandMenu extends EditorSuggest<SlashCommand> {
    constructor(app: App) {
        super(app);
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
        const line = editor.getLine(cursor.line);
        const trigger = shouldTriggerSlashCommand(line, cursor.ch);
        
        if (trigger) {
            return {
                start: { line: cursor.line, ch: cursor.ch - trigger.query.length - 1 },
                end: cursor,
                query: trigger.query
            };
        }
        return null;
    }

    getSuggestions(context: EditorSuggestContext): SlashCommand[] {
        return COMMANDS.filter(cmd => matchCommand(context.query, cmd));
    }

    renderSuggestion(value: SlashCommand, el: HTMLElement): void {
        el.setText(value.name);
    }

    selectSuggestion(value: SlashCommand, evt: MouseEvent | KeyboardEvent): void {
        if (this.context) {
            const editor = this.context.editor;
            
            // 1. Remove the trigger text (e.g. "/code")
            editor.replaceRange('', this.context.start, this.context.end);
            
            // 2. Execute command
            this.executeCommand(value.id, editor);
        }
    }
    
    private executeCommand(id: string, editor: Editor) {
        switch (id) {
            case 'callout':
                new CalloutTypePicker(this.app, (type) => {
                     wrapWithCallout(editor, { type });
                }).open();
                break;
            case 'codeblock':
                wrapWithCodeBlock(editor);
                break;
            case 'quote': {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);
                editor.setLine(cursor.line, '> ' + line);
                break;
            }
            case 'table':
                editor.replaceSelection(generateTable(3, 3));
                break;
            case 'date':
                editor.replaceSelection(generateDate('YYYY-MM-DD'));
                break;
            case 'time':
                editor.replaceSelection(generateDate('HH:mm'));
                break;
            case 'flowchart':
                editor.replaceSelection(generateMermaid('flowchart'));
                break;
            case 'sequence':
                editor.replaceSelection(generateMermaid('sequence'));
                break;
            case 'h1':
                this.setHeading(editor, 1);
                break;
            case 'h2':
                this.setHeading(editor, 2);
                break;
            case 'h3':
                this.setHeading(editor, 3);
                break;
        }
    }

    private setHeading(editor: Editor, level: number) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        // If line already starts with #, replace it? Or just prepend?
        // Simple prepend for MVP.
        // Check if line is empty (just had the command removed)
        if (line.trim() === '') {
            editor.setLine(cursor.line, '#'.repeat(level) + ' ');
        } else {
             editor.setLine(cursor.line, '#'.repeat(level) + ' ' + line);
        }
        // Move cursor to end
        const newLineLen = editor.getLine(cursor.line).length;
        editor.setCursor({ line: cursor.line, ch: newLineLen });
    }
}
