import { FileView, Notice, TFile } from "obsidian";
import { BoardCard, BoardColumn, BoardData, DEFAULT_BOARD } from "../features/board/board-model";
import { CardModal } from "./card-modal";
import { TextPromptModal } from "./simple-modals";

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
    draggedCardId: string | null = null;

    getViewType() { return VIEW_TYPE_BOARD; }
    getDisplayText() { return this.file ? this.file.basename : "项目看板"; }
    getIcon() { return "layout-dashboard"; }

    async onOpen() {
        this.registerEvent(this.app.vault.on('modify', (f) => {
            if (this.file && f.path === this.file.path) void this.loadData();
        }));
        this.renderEmpty();
    }

    async onLoadFile(file: TFile): Promise<void> {
        this.file = file;
        await this.loadData();
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
        } catch (e) {
            console.error('Failed to parse board file', e);
            this.data = DEFAULT_BOARD;
            new Notice('Editor Pro：看板文件解析失败，已使用默认模板');
        }
        this.renderBoard();
    }

    async saveData() {
        if (!this.file) return;
        await this.app.vault.modify(this.file, JSON.stringify(this.data, null, 2));
    }

    renderEmpty() {
        this.contentEl.empty();
        this.contentEl.createEl('div', { text: '请打开一个 .board 文件', cls: 'kanban-empty' });
    }

    renderBoard() {
        const container = this.contentEl;
        container.empty();
        container.addClass('editor-pro-board');

        const boardEl = container.createDiv({ cls: 'board-container' });

        this.data.columns.forEach(col => {
            this.renderColumn(col, boardEl);
        });

        // Add Column Btn
        const addColBtn = boardEl.createDiv({ cls: 'board-add-col-btn', text: '+ 添加列表' });
        addColBtn.onclick = () => {
            new TextPromptModal(this.app, {
                title: "列表名称",
                placeholder: "例如：待办",
                submitText: "创建",
                onSubmit: (name) => {
                    this.data.columns.push({ id: `col-${Date.now()}`, name });
                    void this.saveData();
                    this.renderBoard();
                },
            }).open();
        };
    }

    renderColumn(col: BoardColumn, parent: HTMLElement) {
        const colEl = parent.createDiv({ cls: 'board-column' });
        
        // Header
        const header = colEl.createDiv({ cls: 'board-column-header' });
        header.createEl('h4', { text: col.name });
        
        // Drop Zone
        colEl.ondragover = e => { e.preventDefault(); colEl.addClass('drag-over'); };
        colEl.ondragleave = () => colEl.removeClass('drag-over');
        colEl.ondrop = () => {
            colEl.removeClass('drag-over');
            if (this.draggedCardId) {
                this.moveCardToColumn(this.draggedCardId, col.id);
            }
        };

        // Cards
        const cards = this.data.cards.filter(c => c.columnId === col.id);
        const listEl = colEl.createDiv({ cls: 'board-card-list' });
        
        cards.forEach(card => this.renderCard(card, listEl));

        // Add Card
        const addBtn = colEl.createDiv({ cls: 'board-add-card', text: '+ 添加任务' });
        addBtn.onclick = () => {
            const newCard: BoardCard = {
                id: `card-${Date.now()}`,
                columnId: col.id,
                title: '新任务',
                description: '',
                priority: 'medium',
                dueDate: null,
                tags: []
            };
            this.data.cards.push(newCard);
            void this.saveData();
            this.renderBoard();
            // Auto open modal?
            new CardModal(this.app, newCard, this.data.columns, 
                (updated) => { Object.assign(newCard, updated); void this.saveData(); this.renderBoard(); },
                (deleted) => { this.data.cards = this.data.cards.filter(c => c.id !== deleted.id); void this.saveData(); this.renderBoard(); }
            ).open();
        };
    }

    renderCard(card: BoardCard, parent: HTMLElement) {
        const cardEl = parent.createDiv({ cls: 'board-card' });
        cardEl.draggable = true;
        cardEl.ondragstart = e => {
            this.draggedCardId = card.id;
            cardEl.addClass('dragging');
        };
        cardEl.ondragend = () => {
            this.draggedCardId = null;
            cardEl.removeClass('dragging');
        };

        // Click to edit (The Real Deal)
        cardEl.onclick = () => {
            new CardModal(this.app, card, this.data.columns, 
                (updated) => { 
                    // Update model
                    const idx = this.data.cards.findIndex(c => c.id === card.id);
                    if (idx !== -1) this.data.cards[idx] = updated;
                    void this.saveData();
                    this.renderBoard();
                },
                (deleted) => {
                    this.data.cards = this.data.cards.filter(c => c.id !== card.id);
                    void this.saveData();
                    this.renderBoard();
                }
            ).open();
        };

        // UI
        cardEl.createDiv({ cls: 'board-card-title', text: card.title });
        
        // Metadata Row
        const metaRow = cardEl.createDiv({ cls: 'board-card-meta' });
        
        // Priority Badge
        const pBadge = metaRow.createSpan({ cls: `board-badge priority-${card.priority}` });
        pBadge.setText(card.priority === 'high' ? '高' : (card.priority === 'medium' ? '中' : '低'));

        // Date Badge
        if (card.dueDate) {
            const dBadge = metaRow.createSpan({ cls: 'board-badge date-badge' });
            dBadge.setText(card.dueDate);
            if (new Date(card.dueDate) < new Date()) dBadge.addClass('overdue');
        }
    }

    moveCardToColumn(cardId: string, colId: string) {
        const card = this.data.cards.find(c => c.id === cardId);
        if (card && card.columnId !== colId) {
            card.columnId = colId;
            void this.saveData();
            this.renderBoard();
        }
    }
}
