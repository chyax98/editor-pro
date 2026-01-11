import { FileView, MarkdownView, Notice, TFile, ViewStateResult, debounce } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { FlowBoardApp } from "./flow-board-app";
import { FlowCard, FlowParseResult, buildMarkdownFromFlowBoard, parseMarkdownToFlowBoard } from "../features/flow-board/flow-parser";

export const VIEW_TYPE_FLOW_BOARD = "editor-pro-flow-board-view";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function cardStartLine(cardId: string): number | null {
	const m = cardId.match(/^card-(\d+)-/);
	if (!m) return null;
	const n = Number(m[1]);
	return Number.isFinite(n) ? n : null;
}

export class FlowBoardView extends FileView {
	private root: Root | null = null;
	private mountEl: HTMLElement | null = null;
	private markdown = "";
	private parsed: FlowParseResult | null = null;
	private cards: FlowCard[] = [];
	private internalWrite = false;
	private saveDebounced: (() => void) | null = null;

	getViewType() {
		return VIEW_TYPE_FLOW_BOARD;
	}

	getDisplayText() {
		return this.file ? `${this.file.basename} · Flow Board` : "Flow Board";
	}

	getIcon() {
		return "layout-dashboard";
	}

	getState(): Record<string, unknown> {
		return this.file ? { file: this.file.path } : {};
	}

	async setState(state: unknown, _result: ViewStateResult): Promise<void> {
		if (!isRecord(state)) return;
		const filePath = state.file;
		if (typeof filePath !== "string") return;
		const f = this.app.vault.getAbstractFileByPath(filePath);
		if (f instanceof TFile) {
			await this.onLoadFile(f);
		}
	}

	async onOpen() {
		this.saveDebounced = debounce(() => void this.saveData(), 500, true);
		this.registerEvent(
			this.app.vault.on("modify", (f) => {
				if (this.internalWrite) return;
				if (this.file && f.path === this.file.path) void this.loadData();
			}),
		);
		this.mountEl = this.contentEl.createDiv();
		this.root = createRoot(this.mountEl);
		this.renderReact();
	}

	async onLoadFile(file: TFile): Promise<void> {
		this.file = file;
		await this.loadData();
	}

	async loadData() {
		if (!this.file) return;
		try {
			this.markdown = await this.app.vault.read(this.file);
			this.parsed = parseMarkdownToFlowBoard(this.markdown);
			this.cards = this.parsed.cards.slice();
		} catch (e) {
			console.error("[Editor Pro] Flow board load failed", e);
			new Notice("Editor Pro：Flow board 解析失败");
		}
		this.renderReact();
	}

	private renderReact() {
		if (!this.root) return;
		if (!this.file || !this.parsed) {
			this.root.render(<div className="kanban-empty">请打开一个 Markdown 文件</div>);
			return;
		}

		const onChange = (nextCards: FlowCard[]) => {
			this.cards = nextCards;
			this.saveDebounced?.();
			this.renderReact();
		};

		const onOpenCard = (id: string) => {
			void this.openCardInEditor(id);
		};

		this.root.render(<FlowBoardApp sections={this.parsed.sections} cards={this.cards} onChange={onChange} onOpenCard={onOpenCard} />);
	}

	private async openCardInEditor(id: string) {
		if (!this.file) return;
		const line = cardStartLine(id);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(this.file, { active: true });
		if (!(leaf.view instanceof MarkdownView)) return;
		const editor = leaf.view.editor;
		if (typeof line !== "number") return;
		editor.setCursor({ line, ch: 0 });
		editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
		this.mountEl = null;
		this.contentEl.empty();
	}

	private async saveData() {
		if (!this.file || !this.parsed) return;
		try {
			const next = buildMarkdownFromFlowBoard(this.markdown, this.parsed, this.cards);
			if (next === this.markdown) return;
			this.internalWrite = true;
			try {
				await this.app.vault.modify(this.file, next);
				this.markdown = next;
				this.parsed = parseMarkdownToFlowBoard(this.markdown);
				this.cards = this.parsed.cards.slice();
			} finally {
				window.setTimeout(() => {
					this.internalWrite = false;
				}, 400);
			}
		} catch (e) {
			console.error("[Editor Pro] Flow board save failed", e);
			new Notice("Editor Pro：Flow board 写入失败");
		}
	}
}
