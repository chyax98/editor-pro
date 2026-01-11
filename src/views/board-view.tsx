import { Debouncer, FileView, Notice, TFile, ViewStateResult, debounce } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { BoardData, DEFAULT_BOARD } from "../features/board/board-model";
import { BoardApp, BoardSaveStatus } from "./board-app";

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
    private saveStatus: BoardSaveStatus = "saved";
    private saveError: string | null = null;
    private parseError: { message: string; rawText: string } | null = null;

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
            this.saveStatus = "saved";
            this.saveError = null;
            this.parseError = null;
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            console.error("Failed to parse board file", e);
            // IMPORTANT: do not auto-overwrite user file on parse error.
            this.parseError = { message, rawText: content };
            this.saveStatus = "error";
            this.saveError = `看板文件解析失败：${message}`;
            this.dirty = false;
        }
        this.renderReact();
    }

    private renderReact() {
        if (!this.root) return;

        if (!this.file) {
            this.root.render(<div className="kanban-empty">请打开一个 .board 文件</div>);
            return;
        }

        if (this.parseError) {
            const { rawText, message } = this.parseError;
            this.root.render(
                <BoardApp
                    app={this.app}
                    data={DEFAULT_BOARD}
                    onChange={() => undefined}
                    filePath={this.file.path}
                    saveStatus={this.saveStatus}
                    saveError={this.saveError}
                    parseError={{ message, rawText }}
                    onApplyRawJson={(nextRaw) => void this.applyRawJson(nextRaw)}
                    onResetBoard={() => void this.resetBoard()}
                    onExportJson={() => void this.exportJsonToClipboard()}
                />
            );
            return;
        }

        const onChange = (next: BoardData) => {
            this.data = next;
            this.dirty = true;
            this.saveStatus = "dirty";
            this.saveDebounced?.();
            this.renderReact();
        };

        this.root.render(
            <BoardApp
                app={this.app}
                data={this.data}
                onChange={onChange}
                filePath={this.file.path}
                saveStatus={this.saveStatus}
                saveError={this.saveError}
                parseError={null}
                onApplyRawJson={null}
                onResetBoard={() => void this.resetBoard()}
                onExportJson={() => void this.exportJsonToClipboard()}
            />
        );
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
        if (this.parseError) return;
        if (!this.dirty && this.lastSavedText !== null) return;

        const nextText = JSON.stringify(this.data, null, 2);
        if (this.lastSavedText !== null && nextText === this.lastSavedText) {
            this.dirty = false;
            this.saveStatus = "saved";
            return;
        }

        this.internalWrite = true;
        this.saveStatus = "saving";
        this.saveError = null;
        this.renderReact();
        try {
            await this.app.vault.modify(this.file, nextText);
            this.lastSavedText = nextText;
            this.dirty = false;
            this.saveStatus = "saved";
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.saveStatus = "error";
            this.saveError = `保存失败：${message}`;
            console.error("[Editor Pro] Board save failed", e);
            this.renderReact();
        } finally {
            window.setTimeout(() => {
                this.internalWrite = false;
            }, 300);
        }
    }

    private async resetBoard() {
        if (!this.file) return;
        this.parseError = null;
        this.data = DEFAULT_BOARD;
        this.dirty = true;
        await this.saveData();
        new Notice("Editor Pro：已重置看板文件");
        await this.loadData();
    }

    private async applyRawJson(rawText: string) {
        if (!this.file) return;
        try {
            const parsed = JSON.parse(rawText) as unknown;
            if (!isBoardData(parsed)) throw new Error("Invalid board file shape");

            // Write raw JSON exactly as user edited (trim trailing spaces).
            const normalized = rawText.replace(/\s*$/g, "") + "\n";
            this.internalWrite = true;
            try {
                await this.app.vault.modify(this.file, normalized);
            } finally {
                window.setTimeout(() => {
                    this.internalWrite = false;
                }, 300);
            }

            this.parseError = null;
            this.saveStatus = "saved";
            this.saveError = null;
            await this.loadData();
            new Notice("Editor Pro：看板 JSON 已应用");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.saveStatus = "error";
            this.saveError = `看板 JSON 无法应用：${message}`;
            this.renderReact();
        }
    }

    private async exportJsonToClipboard() {
        if (!this.file) return;
        try {
            const text = await this.app.vault.read(this.file);
            await navigator.clipboard.writeText(text);
            new Notice("Editor Pro：看板 JSON 已复制到剪贴板");
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            new Notice(`Editor Pro：复制失败：${message}`);
        }
    }
}
