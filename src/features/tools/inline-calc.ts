import { Editor, Notice } from "obsidian";

type Token =
	| { type: "num"; value: number }
	| { type: "op"; value: "+" | "-" | "*" | "/" | "^" }
	| { type: "lp" }
	| { type: "rp" };

function tokenize(input: string): Token[] | null {
	const s = input.trim();
	const tokens: Token[] = [];
	let i = 0;

	const pushOp = (op: "+" | "-" | "*" | "/" | "^") =>
		tokens.push({ type: "op", value: op });

	while (i < s.length) {
		const ch = s[i];
		if (ch === " " || ch === "\t") {
			i++;
			continue;
		}
		if (ch === "(") {
			tokens.push({ type: "lp" });
			i++;
			continue;
		}
		if (ch === ")") {
			tokens.push({ type: "rp" });
			i++;
			continue;
		}
		if (ch === "+" || ch === "*" || ch === "/" || ch === "^") {
			pushOp(ch);
			i++;
			continue;
		}
		if (ch === "-") {
			// unary minus: if at start or after operator/left paren
			const prev = tokens[tokens.length - 1];
			const isUnary = !prev || prev.type === "op" || prev.type === "lp";
			if (isUnary) {
				// consume number with sign
				let j = i + 1;
				while (j < s.length && (s[j] === " " || s[j] === "\t")) j++;
				const m = s.slice(j).match(/^\d+(\.\d+)?/);
				if (!m) return null;
				tokens.push({ type: "num", value: -Number(m[0]) });
				i = j + m[0].length;
				continue;
			}
			pushOp("-");
			i++;
			continue;
		}
		const m = s.slice(i).match(/^\d+(\.\d+)?/);
		if (m) {
			tokens.push({ type: "num", value: Number(m[0]) });
			i += m[0].length;
			continue;
		}
		return null;
	}
	return tokens;
}

function precedence(op: Token & { type: "op" }): number {
	switch (op.value) {
		case "^":
			return 4;
		case "*":
		case "/":
			return 3;
		case "+":
		case "-":
			return 2;
	}
}

function isRightAssociative(op: Token & { type: "op" }): boolean {
	return op.value === "^";
}

function toRpn(tokens: Token[]): Token[] | null {
	const out: Token[] = [];
	const stack: Token[] = [];

	for (const t of tokens) {
		if (t.type === "num") {
			out.push(t);
			continue;
		}
		if (t.type === "op") {
			while (stack.length) {
				const top = stack[stack.length - 1];
				if (!top) break;
				if (top.type !== "op") break;

				const p1 = precedence(t);
				const p2 = precedence(top);
				if (p2 > p1 || (p2 === p1 && !isRightAssociative(t))) {
					out.push(stack.pop()!);
				} else break;
			}
			stack.push(t);
			continue;
		}
		if (t.type === "lp") {
			stack.push(t);
			continue;
		}
		if (t.type === "rp") {
			let found = false;
			while (stack.length) {
				const top = stack.pop()!;
				if (top.type === "lp") {
					found = true;
					break;
				}
				out.push(top);
			}
			if (!found) return null;
		}
	}

	while (stack.length) {
		const top = stack.pop()!;
		if (top.type === "lp" || top.type === "rp") return null;
		out.push(top);
	}

	return out;
}

function evalRpn(tokens: Token[]): number | null {
	const stack: number[] = [];
	for (const t of tokens) {
		if (t.type === "num") {
			stack.push(t.value);
			continue;
		}
		if (t.type === "op") {
			const b = stack.pop();
			const a = stack.pop();
			if (a === undefined || b === undefined) return null;
			switch (t.value) {
				case "+":
					stack.push(a + b);
					break;
				case "-":
					stack.push(a - b);
					break;
				case "*":
					stack.push(a * b);
					break;
				case "/":
					if (b === 0) return null; // Handle division by zero
					stack.push(a / b);
					break;
				case "^":
					stack.push(Math.pow(a, b));
					break;
			}
		}
	}
	return stack.length === 1 ? (stack[0] ?? null) : null;
}

export function evaluateArithmeticExpression(expr: string): number | null {
	const tokens = tokenize(expr);
	if (!tokens) return null;
	const rpn = toRpn(tokens);
	if (!rpn) return null;
	const value = evalRpn(rpn);
	if (value === null || !Number.isFinite(value)) return null;
	return value;
}

export function inlineCalcReplaceSelection(editor: Editor): void {
	if (!editor.somethingSelected()) {
		new Notice("Editor Pro：请先选中一个表达式");
		return;
	}
	const expr = editor.getSelection();
	const value = evaluateArithmeticExpression(expr);
	if (value === null) {
		new Notice(
			"Editor Pro：无法计算该表达式（仅支持 + - * / ^ 和括号，不能除以零）",
		);
		return;
	}
	// Handle Infinity and NaN cases (though checked in evaluateArithmeticExpression)
	if (!Number.isFinite(value)) {
		new Notice("Editor Pro：计算结果超出范围（无穷大或非数字）");
		return;
	}
	editor.replaceSelection(String(value));
}
