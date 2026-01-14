import { App, Editor, TFile, moment } from "obsidian";

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
		const cursorToken = "{{cursor}}";
		let cursorIndex: number | null = null;

		// 我们通过正则一步步替换内容
		// 既然要支持 JS，最好是可以递归或者按顺序处理

		// 核心正则：匹配 {{...}}
		// 注意：非贪婪匹配
		const regex = /\{\{(.*?)\}\}/g;

		let result = template.replace(regex, (match, content) => {
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

			const func = new Function(...keys, body);
			const result = func(...values);

			return result !== undefined && result !== null ? String(result) : '';
		} catch (e: any) {
			console.error('[Editor Pro] Template JS Error:', e);
			return `[JS Error: ${e.message}]`;
		}
	}

	/**
	 * 直接插入处理后的模板到编辑器
	 */
	insertTemplate(editor: Editor, template: string) {
		const file = this.app.workspace.getActiveFile();
		const ctx: TemplateContext = {
			app: this.app,
			file: file,
			fileName: file ? file.basename : 'Untitled'
		};

		const { text, cursorIndex } = this.process(template, ctx);
		editor.replaceSelection(text);

		if (cursorIndex !== null) {
			const cursor = editor.getCursor();
			// We just replaced selection. The cursor is now at the END of inserted text?
			// No, replaceSelection puts cursor at end.
			// We need to calculate the *relative* position of {{cursor}} in the inserted text
			// and move the actual cursor there.

			// Wait, replaceSelection behavior: 
			// If we are at line 10, ch 0. Insert "A\nB\nC". Cursor becomes line 12, ch 1.
			// It's hard to calculate exact position if we rely on editor's end position.

			// Better approach:
			// 1. Get current start cursor (anchor).
			// 2. Replace range.
			// 3. Calculate absolute position of cursor token relative to start.

			// Or simpler: replace '___CURSOR_PLACEHOLDER___' with empty, but split text there.
			// The code above returns text with placeholder REMOVED.

			// Let's re-calculate logic for setCursor.
			// We know the length of text BEFORE the cursor placeholder.
			const beforeText = text.substring(0, cursorIndex);

			// Original pos
			// We can't rely on 'cursor' variable from start of function because content changed.
			// Actually, replaceSelection replaces *selection*. If selection was empty, it inserts at cursor.
			// It's safer to use replaceRange if we want precise control, but replaceSelection is friendlier to Obsidian history.

			// Let's try to find where we are.
			// Getting the cursor state *before* insertion is risky if we don't know *what* was selected.
			// But we can assume typical usage is insertion.

			// If we use `editor.getCursor("from")` (start of selection), that's our anchor.
			// The inserted text starts there.

			// We need to find the line/ch offset of cursorIndex in `text`.
			const lines = text.substring(0, cursorIndex).split('\n');
			const lineOffset = lines.length - 1;
			const chOffset = lines[lines.length - 1]?.length ?? 0;

			// Get original start pos
			// If there was a selection, it's gone. The start pos is the start of selection.
			// But Obsidian API `replaceSelection` might move the "head" to the end.
			// We can't easily get the start pos *after* replacement without calculating.

			// Trick: We can insert a unique marker via replaceSelection, find it, remove it, and place cursor.
			// But that messes up history (2 steps).

			// Alternative: use `replaceRange`.
			// const from = editor.getCursor('from');
			// const to = editor.getCursor('to');
			// editor.replaceRange(text, from, to);
			// Then calculate new cursor pos from `from`.

			// However, `replaceSelection` handles some edge cases better.
			// Let's stick to calculating offsets from "start of insertion".

			// We'll trust that we inserted at `editor.getCursor('from')` (if selection empty) or replaced selection.
			// So new cursor = start + offset.

			// BUT: editor.getCursor() *now* (after replacement) is at the END of inserted text.
			// We can calculate backwards? No.

			// Let's use the `replaceString` helper from Obsidian if available? No.

			// Let's use the offset computation logic I wrote in old template-engine.ts, it seemed correct:
			/*
				const before = text.slice(0, cursorIndex);
				const lines = before.split("\n");
				const lineOffset = lines.length - 1;
				const ch = lines[lines.length - 1]?.length ?? 0;
				editor.setCursor({ line: cursor.line + lineOffset, ch: lineOffset === 0 ? cursor.ch + ch : ch });
			*/
			// But this (old code) assumed `cursor` was captured *before* replaceSelection. 
			// And `replaceSelection` replaces the *selection*. 
			// `cursor` usually points to `head`. If selection is backwards, head is at start? No.
			// `editor.getCursor('from')` is always start.
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
