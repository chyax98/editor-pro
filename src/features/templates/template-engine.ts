import { App, Editor, TFile, moment } from "obsidian";
import { NLDateParser } from "../nldates/parser";

export interface TemplateContext {
	app: App;
	file: TFile | null;
	fileName: string;
}

/**
 * 模板引擎核心
 * 支持语法：
 * - {{date}} / {{time}} / {{now}}
 * - {{date:YYYY-MM-DD}} format
 * - {{title}} / {{fileName}}
 * - {{cursor}}
 * - {{js: javascript code}}
 */
export class TemplateEngine {
	constructor(private app: App) { }

	/**
	 * 处理模板字符串
	 * @param template 原始模板内容
	 * @param ctx 上下文信息
	 * @returns 处理后的文本和光标位置
	 */
	process(template: string, ctx: TemplateContext): { text: string; cursorIndex: number | null } {
		// 1. 处理 {{cursor}} - 先定位，暂不替换（最后处理，或者先替换为空并记录位置）
		// 我们可以先用特殊占位符替换 {{cursor}} 来保持其位置，最后再计算 index
		let cursorIndex: number | null = null;

		// 我们通过正则一步步替换内容
		// 既然要支持 JS，最好是可以递归或者按顺序处理

		// 核心正则：匹配 {{...}}
		// 注意：非贪婪匹配
		const regex = /\{\{(.*?)\}\}/g;

		let result = template.replace(regex, (match: string, content: string) => {
			const raw = content.trim();

			// 1. Cursor
			if (raw === 'cursor') {
				return '___CURSOR_PLACEHOLDER___';
			}

			// 2. JS: {{js: new Date().toString()}}
			if (raw.startsWith('js:')) {
				const code = raw.substring(3).trim();
				return this.evaluateJs(code, ctx);
			}

			// 3. Date/Time with format: {{date:YYYY-MM-DD}}
			if (raw.startsWith('date:') || raw.startsWith('time:') || raw.startsWith('now:')) {
				const parts = raw.split(':');
				const format = parts.slice(1).join(':');

				// Try Natural Language Date
				const nl = NLDateParser.parse(format);
				if (nl) {
					return nl.formatted;
				}

				return moment().format(format);
			}

			// 4. Basic Variables
			switch (raw) {
				case 'date': return moment().format('YYYY-MM-DD');
				case 'time': return moment().format('HH:mm');
				case 'now': return moment().format('YYYY-MM-DD HH:mm');
				case 'title':
				case 'fileName': return ctx.fileName;
				case 'path': return ctx.file?.path ?? '';
				default:
					// Unknown variable, return as is or empty?
					// Templater leaves it. We can leave it too if it's not matched.
					// But our regex matched it. Let's try to eval it as JS if simple variable failed?
					// No, explicit {{js:}} is safer.
					// Return raw match if unknown
					return match;
			}
		});

		// Calculate Cursor Index
		const placeholderIndex = result.indexOf('___CURSOR_PLACEHOLDER___');
		if (placeholderIndex >= 0) {
			cursorIndex = placeholderIndex;
			result = result.replace('___CURSOR_PLACEHOLDER___', '');
		}

		return { text: result, cursorIndex };
	}

	private evaluateJs(code: string, ctx: TemplateContext): string {
		try {
			// Create a safe-ish scope
			// We expose: app, moment, file, title
			const scope = {
				app: this.app,
				moment: moment,
				file: ctx.file,
				title: ctx.fileName,
				console: console
			};

			// Use Function constructor to creating a function with accessing scope variables
			// const func = new Function(...keys, "return " + code);
			// But 'return' is needed if code is an expression.
			// Support both expression and statements?
			// Simple approach: if it doesn't contain ';', treat as expression.

			const isExpression = !code.includes(';') && !code.includes('return ');
			const body = isExpression ? `return (${code});` : code;

			const keys = Object.keys(scope);
			const values = Object.values(scope);

			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			const func = new Function(...keys, body) as (...args: unknown[]) => unknown;
			const result = func(...values);

			// Handle various return types safely
			if (result === undefined || result === null) {
				return '';
			}
			if (typeof result === 'object') {
				return JSON.stringify(result);
			}
			// Primitive types (string, number, boolean, bigint, symbol) are safe to stringify
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return String(result);
		} catch (e) {
			console.error('[Editor Pro] Template JS Error:', e);
			const errorMessage = e instanceof Error ? e.message : String(e);
			return `[JS Error: ${errorMessage}]`;
		}
	}

	// Helper to calculate cursor pos
	// Just a refined version of insertTemplate for public use
	insert(editor: Editor, template: string) {
		// 1. Get context
		const file = this.app.workspace.getActiveFile();
		const ctx: TemplateContext = {
			app: this.app,
			file: file,
			fileName: file ? file.basename : 'Untitled'
		};

		// 2. Process
		const { text, cursorIndex } = this.process(template, ctx);

		// 3. Insert and position cursor
		const startPos = editor.getCursor('from');
		editor.replaceSelection(text);

		if (cursorIndex !== null) {
			const before = text.substring(0, cursorIndex);
			const lines = before.split('\n');
			const addedLines = lines.length - 1;
			const lastLineLen = lines[lines.length - 1]?.length ?? 0;

			const newLine = startPos.line + addedLines;
			const newCh = (addedLines === 0 ? startPos.ch : 0) + lastLineLen;

			editor.setCursor({ line: newLine, ch: newCh });
		}
	}
}
