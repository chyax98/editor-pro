import { App, Editor, Menu, Notice } from "obsidian";
import { TextPromptModal } from "../ui/modals";

type CryptoLike = {
	getRandomValues: (array: Uint8Array) => Uint8Array;
	randomUUID?: () => string;
};

function uuidV4(): string {
	const c = (globalThis as unknown as { crypto?: CryptoLike }).crypto;
	if (c?.randomUUID) {
		return c.randomUUID();
	}

	const bytes = new Uint8Array(16);
	if (!c) {
		// Fallback: weaker randomness but keeps feature usable.
		let out = "";
		for (let i = 0; i < 32; i++)
			out += Math.floor(Math.random() * 16).toString(16);
		return `${out.slice(0, 8)}-${out.slice(8, 12)}-4${out.slice(13, 16)}-a${out.slice(17, 20)}-${out.slice(20)}`;
	}

	c.getRandomValues(bytes);
	// Per RFC 4122 v4
	bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
	bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
		"",
	);
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseDice(text: string): { count: number; sides: number } | null {
	const m = text.trim().match(/^(\d*)d(\d+)$/i);
	if (!m) return null;
	const count = m[1] ? Number(m[1]) : 1;
	const sides = Number(m[2]);
	if (!Number.isFinite(count) || !Number.isFinite(sides)) return null;
	if (count <= 0 || sides <= 0) return null;
	if (count > 1000) return null;
	return { count, sides };
}

function rollDice(count: number, sides: number): number[] {
	const out: number[] = [];
	for (let i = 0; i < count; i++) {
		out.push(1 + Math.floor(Math.random() * sides));
	}
	return out;
}

export function insertUuid(editor: Editor) {
	editor.replaceSelection(uuidV4());
}

export function insertRandomIntPrompt(app: App, editor: Editor) {
	new TextPromptModal(app, {
		title: "插入随机整数",
		placeholder: "例如：1-100",
		submitText: "插入",
		onSubmit: (value) => {
			const m = value.trim().match(/^(-?\d+)\s*-\s*(-?\d+)$/);
			if (!m) {
				new Notice("Editor Pro：格式应为 min-max（例如 1-100）");
				return;
			}
			const a = Number(m[1]);
			const b = Number(m[2]);
			if (!Number.isFinite(a) || !Number.isFinite(b)) return;
			const min = Math.min(a, b);
			const max = Math.max(a, b);
			const n = min + Math.floor(Math.random() * (max - min + 1));
			editor.replaceSelection(String(n));
		},
	}).open();
}

export function insertDiceRollPrompt(app: App, editor: Editor) {
	new TextPromptModal(app, {
		title: "掷骰子",
		placeholder: "例如：d6 或 2d20",
		submitText: "插入",
		onSubmit: (value) => {
			const parsed = parseDice(value);
			if (!parsed) {
				new Notice("Editor Pro：格式应为 d6 或 2d20");
				return;
			}
			const rolls = rollDice(parsed.count, parsed.sides);
			const sum = rolls.reduce((a, b) => a + b, 0);
			const text =
				parsed.count === 1
					? String(rolls[0])
					: `${rolls.join(" + ")} = ${sum}`;
			editor.replaceSelection(text);
		},
	}).open();
}

export function showRandomGeneratorMenu(
	app: App,
	editor: Editor,
	evt: MouseEvent,
) {
	const menu = new Menu();
	menu.addItem((item) => {
		item.setTitle("插入 UUID");
		item.onClick(() => insertUuid(editor));
	});
	menu.addItem((item) => {
		item.setTitle("插入随机整数…");
		item.onClick(() => insertRandomIntPrompt(app, editor));
	});
	menu.addItem((item) => {
		item.setTitle("掷骰子…");
		item.onClick(() => insertDiceRollPrompt(app, editor));
	});
	menu.showAtMouseEvent(evt);
}
