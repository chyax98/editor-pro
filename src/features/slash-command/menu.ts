import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian";
import { SlashCommand, shouldTriggerSlashCommand, matchCommand } from "./utils";
import { wrapWithCallout, wrapWithCodeBlock } from "../callout/wrap-callout";
import { CalloutTypePicker } from "../callout/callout-picker";
import { toggleBlockquote } from "../callout/callout-integrator";
import { setHeading } from "../formatting/heading-utils";

import { generateFencedCodeBlock, generateTable, generateDate, generateMath, generateDaily, generateWeekly, generateHTML } from "../../utils/markdown-generators";
import { BUILTIN_TEMPLATES } from "../templates/snippets";
import { TemplateEngine } from "../templates/template-engine";
import { NLDateParser } from "../nldates/parser";

// Inline helper for due date (previously from kanban module)
function setDueDate(line: string, date: string): string {
    if (!line.trim().startsWith('- [')) return line;
    const dueRegex = /@due\([^)]+\)/;
    const dueTag = `@due(${date})`;
    if (dueRegex.test(line)) {
        return line.replace(dueRegex, dueTag);
    } else {
        return `${line} ${dueTag}`;
    }
}



const COMMANDS: SlashCommand[] = [
    { id: 'callout', name: '提示块 (Callout)', aliases: ['callout', 'tip', 'tsk'] },
    { id: 'codeblock', name: '代码块 (Code Block)', aliases: ['code', 'dmk'] },
    { id: 'due', name: '设置截止 (Due Date)', aliases: ['due', 'jz'] },
    { id: 'math', name: '数学公式 (Math)', aliases: ['math', 'gs'] },
    { id: 'table', name: '插入表格 (Table)', aliases: ['table', 'bg'] },
    { id: 'date', name: '当前日期 (Date)', aliases: ['date', 'rq'] },
    { id: 'time', name: '当前时间 (Time)', aliases: ['time', 'sj'] },
    { id: 'mermaid', name: 'Mermaid 图表 (Mermaid)', aliases: ['mermaid', 'mm'] },
    { id: 'd2', name: 'D2 图表 (D2)', aliases: ['d2'] },
    { id: 'graph', name: 'Graph 图表 (DOT/Graphviz)', aliases: ['graph', 'dot', 'graphviz'] },
    { id: 'infographic', name: '信息图 (Infographic)', aliases: ['infographic', 'info', 'xx'] },
    { id: 'daily', name: '日记模板 (Daily)', aliases: ['daily', 'rj'] },
    { id: 'weekly', name: '周记模板 (Weekly)', aliases: ['weekly', 'zj'] },
    ...BUILTIN_TEMPLATES.map((t) => ({ id: t.id, name: t.name, aliases: t.aliases })),
    { id: 'html', name: 'HTML 片段 (HTML)', aliases: ['html', 'dm'] },
    { id: 'h1', name: '一级标题 (H1)', aliases: ['h1', 'yjbt'] },
    { id: 'h2', name: '二级标题 (H2)', aliases: ['h2', 'ejbt'] },
    { id: 'h3', name: '三级标题 (H3)', aliases: ['h3', 'sjbt'] },
    { id: 'h4', name: '四级标题 (H4)', aliases: ['h4', 'sijbt'] },
    { id: 'h5', name: '五级标题 (H5)', aliases: ['h5', 'wjbt'] },
    { id: 'h6', name: '六级标题 (H6)', aliases: ['h6', 'ljbt'] },
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
        const query = context.query;
        const matches = COMMANDS.filter(cmd => matchCommand(query, cmd));

        // Dynamic NLDate
        const nlRes = NLDateParser.parse(query);
        if (nlRes) {
            matches.unshift({
                id: `dynamic-nldate:${nlRes.formatted}`,
                name: `插入日期: ${nlRes.formatted} (${nlRes.text})`,
                aliases: []
            });
        }

        return matches;
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
        if (id.startsWith('dynamic-nldate:')) {
            const dateStr = id.split(':')[1] || '';
            editor.replaceSelection(dateStr);
            return;
        }

        const cursor = editor.getCursor();
        switch (id) {
            case 'callout':
                new CalloutTypePicker(this.app, (type) => {
                    wrapWithCallout(editor, { type });
                }).open();
                break;
            case 'codeblock':
                wrapWithCodeBlock(editor);
                break;
            case 'daily':
                editor.replaceSelection(generateDaily());
                break;
            case 'weekly':
                editor.replaceSelection(generateWeekly());
                break;
            case 'html':
                editor.replaceSelection(generateHTML());
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'due':
                {
                    const line = editor.getLine(cursor.line);
                    const newLine = setDueDate(line, generateDate('YYYY-MM-DD'));
                    if (newLine !== line) {
                        editor.setLine(cursor.line, newLine);
                    } else {
                        // 如果不是任务行，在当前位置插入 @due
                        editor.replaceSelection(`@due(${generateDate('YYYY-MM-DD')})`);
                    }
                }
                break;
            case 'math':
                editor.replaceSelection(generateMath());
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'quote':
                toggleBlockquote(editor);
                break;
            case 'table':
                editor.replaceSelection(generateTable(3, 3));
                editor.setCursor({ line: cursor.line, ch: 2 });
                break;
            case 'date':
                editor.replaceSelection(generateDate('YYYY-MM-DD'));
                break;
            case 'time':
                editor.replaceSelection(generateDate('HH:mm'));
                break;
            case 'mermaid':
                editor.replaceSelection(generateFencedCodeBlock('mermaid'));
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'd2':
                editor.replaceSelection(generateFencedCodeBlock('d2'));
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'graph':
                editor.replaceSelection(generateFencedCodeBlock('dot'));
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'infographic':
                editor.replaceSelection(generateFencedCodeBlock('infographic'));
                editor.setCursor({ line: cursor.line + 1, ch: 0 });
                break;
            case 'h1':
                setHeading(editor, 1);
                break;
            case 'h2':
                setHeading(editor, 2);
                break;
            case 'h3':
                setHeading(editor, 3);
                break;
            case 'h4':
                setHeading(editor, 4);
                break;
            case 'h5':
                setHeading(editor, 5);
                break;
            case 'h6':
                setHeading(editor, 6);
                break;
            default:
                {
                    // 处理自定义模板
                    const tpl = BUILTIN_TEMPLATES.find((t) => t.id === id);
                    if (tpl) {
                        new TemplateEngine(this.app).insert(editor, tpl.template);
                    }
                }
                break;
        }
    }
}
