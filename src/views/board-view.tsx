import { Debouncer, FileView, Notice, TFile, ViewStateResult, debounce } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { BoardData, DEFAULT_BOARD } from "../features/board/board-model";
import { BoardApp } from "./board-app";

export const VIEW_TYPE_BOARD = "editor-pro-board-view";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isBoardData(value: unknown): value is BoardData {
	if (!isRecord(value)) return false;
	if (typeof value.title !== "string") return false;
	if (!Array.isArray(value.columns)) return false;
	if (!Array.isArray(value.cards)) return false;

	for (const col of value.columns) {
		if (!isRecord(col)) return false;
		if (typeof col.id !== "string") return false;
		if (typeof col.name !== "string") return false;
	}

	for (const card of value.cards) {
		if (!isRecord(card)) return false;
		if (typeof card.id !== "string") return false;
		if (typeof card.columnId !== "string") return false;
		if (typeof card.title !== "string") return false;
		if (typeof card.description !== "string") return false;
		if (card.priority !== "low" && card.priority !== "medium" && card.priority !== "high") return false;
		if (card.dueDate !== null && typeof card.dueDate !== "string") return false;
		if (!Array.isArray(card.tags)) return false;
	}

	return true;
}

export class BoardView extends FileView {
    data: BoardData = DEFAULT_BOARD;
    private root: Root | null = null;
    private mountEl: HTMLElement | null = null;
    private internalWrite = false;
    private saveDebounced: Debouncer<[], void> | null = null;
    private dirty = false;
    private lastSavedText: string | null = null;

    getViewType() { return VIEW_TYPE_BOARD; }
    getDisplayText() { return this.file ? this.file.basename : "项目看板"; }
    getIcon() { return "layout-dashboard"; }

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
        this.saveDebounced = debounce(() => {
            void this.saveData();
        }, 300, true);

        this.registerEvent(this.app.vault.on('modify', (f) => {
            if (this.internalWrite) return;
            if (this.file && f.path === this.file.path) void this.loadData();
        }));
        this.mountEl = this.contentEl.createDiv();
        this.root = createRoot(this.mountEl);
        this.renderReact();
    }

    async onLoadFile(file: TFile): Promise<void> {
        this.file = file;
        await this.loadData();
    }

    async onUnloadFile(_file: TFile): Promise<void> {
        await this.flushPendingSave();
    }

    async loadData() {
        if (!this.file) return;
        const content = await this.app.vault.read(this.file);
        try {
            const parsed = JSON.parse(content) as unknown;
            if (!isBoardData(parsed)) {
                throw new Error("Invalid board file shape");
            }
            this.data = parsed;
            this.lastSavedText = content;
            this.dirty = false;
        } catch (e) {
            console.error('Failed to parse board file', e);
            this.data = DEFAULT_BOARD;
            this.lastSavedText = JSON.stringify(DEFAULT_BOARD, null, 2);
            this.dirty = true;
            new Notice('Editor Pro：看板文件解析失败，已使用默认模板');
        }
        this.renderReact();
    }

    private renderReact() {
        if (!this.root) return;

        if (!this.file) {
            this.root.render(<div className="kanban-empty">请打开一个 .board 文件</div>);
            return;
        }

        const onChange = (next: BoardData) => {
            this.data = next;
            this.dirty = true;
            this.saveDebounced?.();
            this.renderReact();
        };

        this.root.render(<BoardApp app={this.app} data={this.data} onChange={onChange} />);
    }

    async onClose() {
        await this.flushPendingSave();
        this.root?.unmount();
        this.root = null;
        this.mountEl = null;
        this.contentEl.empty();
    }

    private async flushPendingSave() {
        if (!this.saveDebounced) return;
        this.saveDebounced.cancel();
        await this.saveData();
    }

    async saveData() {
        if (!this.file) return;
        if (!this.dirty && this.lastSavedText !== null) return;

        const nextText = JSON.stringify(this.data, null, 2);
        if (this.lastSavedText !== null && nextText === this.lastSavedText) {
            this.dirty = false;
            return;
        }

        this.internalWrite = true;
        try {
            await this.app.vault.modify(this.file, nextText);
            this.lastSavedText = nextText;
            this.dirty = false;
        } finally {
            window.setTimeout(() => {
                this.internalWrite = false;
            }, 300);
        }
    }
}
