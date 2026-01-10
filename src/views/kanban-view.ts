import { ItemView, WorkspaceLeaf, TFile, Menu, debounce } from "obsidian";
import { KanbanBoard, KanbanModel, KanbanCard, KanbanColumn } from "../features/kanban/kanban-model";

export const VIEW_TYPE_KANBAN = "editor-pro-kanban-view";

export class KanbanView extends ItemView {
    file: TFile | null = null;
    boardData: KanbanBoard | null = null;
    
    // Drag State
    draggedCardId: string | null = null;
    draggedFromColId: string | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() { return VIEW_TYPE_KANBAN; }
    getDisplayText() { return this.file ? this.file.basename : "看板"; }
    getIcon() { return "kanban-square"; }

    async onOpen() {
        this.renderEmpty();
    }

    async setFile(file: TFile) {
        this.file = file;
        await this.refresh();
        
        // Register file change listener (debounced refresh to avoid fighting with self-updates)
        this.registerEvent(this.app.vault.on('modify', (f) => {
            if (f === this.file) void this.refresh();
        }));
    }

    async refresh() {
        if (!this.file) return;
        const content = await this.app.vault.read(this.file);
        this.boardData = KanbanModel.parse(content);
        this.renderBoard();
    }

    // Save changes back to Markdown
    async save() {
        if (!this.file || !this.boardData) return;
        const content = KanbanModel.stringify(this.boardData);
        await this.app.vault.modify(this.file, content);
    }

    // Debounced save to prevent excessive writes during rapid edits
    debouncedSave = debounce(this.save.bind(this), 500, true);

    renderEmpty() {
        this.contentEl.empty();
        this.contentEl.createEl('div', { text: '未选择看板文件', cls: 'kanban-empty' });
    }

    renderBoard() {
        const container = this.contentEl;
        container.empty();
        container.addClass('editor-pro-kanban-view');

        if (!this.boardData) return;

        const boardEl = container.createDiv({ cls: 'kanban-board' });

        // Render Columns
        this.boardData.columns.forEach(col => {
            this.renderColumn(col, boardEl);
        });

        // Add "New Column" button at the end
        const addColBtn = boardEl.createDiv({ cls: 'kanban-add-column-btn' });
        addColBtn.setText('+ 添加列表');
        addColBtn.onclick = () => {
            this.boardData?.columns.push({
                id: `col-${Date.now()}`,
                name: 'New List',
                cards: []
            });
            void this.save();
            this.renderBoard();
        };
    }

    renderColumn(col: KanbanColumn, parent: HTMLElement) {
        const colEl = parent.createDiv({ cls: 'kanban-column' });
        colEl.dataset.id = col.id;

        // Header
        const header = colEl.createDiv({ cls: 'kanban-column-header' });
        const titleInput = header.createEl('input', { cls: 'kanban-column-title', value: col.name });
        titleInput.onblur = () => {
            col.name = titleInput.value;
            void this.save();
        };
        
        // Count
        header.createSpan({ cls: 'kanban-count', text: `${col.cards.length}` });

        // Drag events for Column (Drop target)
        colEl.ondragover = (e) => {
            e.preventDefault(); // Allow drop
            colEl.addClass('kanban-drag-over');
        };
        colEl.ondragleave = () => {
            colEl.removeClass('kanban-drag-over');
        };
        colEl.ondrop = (e) => {
            e.preventDefault();
            colEl.removeClass('kanban-drag-over');
            this.handleCardDrop(col.id);
        };

        // Card List
        const listEl = colEl.createDiv({ cls: 'kanban-card-list' });
        
        col.cards.forEach(card => {
            this.renderCard(card, listEl, col);
        });

        // Add Card Button
        const addCardBtn = colEl.createDiv({ cls: 'kanban-add-card-btn', text: '+ 添加卡片' });
        addCardBtn.onclick = () => {
            const newCard: KanbanCard = {
                id: `card-${Date.now()}`,
                content: 'New Task',
                status: 'todo',
                originalText: '- [ ] New Task',
                metadata: { tags: [] }
            };
            col.cards.push(newCard);
            void this.save();
            this.renderBoard(); // Re-render to show new card
        };
    }

    renderCard(card: KanbanCard, parent: HTMLElement, col: KanbanColumn) {
        const cardEl = parent.createDiv({ cls: 'kanban-card' });
        if (card.status === 'done') cardEl.addClass('is-done');
        cardEl.draggable = true;

        // Drag Start
        cardEl.ondragstart = (e) => {
            this.draggedCardId = card.id;
            this.draggedFromColId = col.id;
            e.dataTransfer?.setData('text/plain', card.id);
            cardEl.addClass('is-dragging');
        };
        cardEl.ondragend = () => {
            cardEl.removeClass('is-dragging');
            this.draggedCardId = null;
            this.draggedFromColId = null;
        };

        // Content (Editable)
        const contentEl = cardEl.createDiv({ cls: 'kanban-card-content' });
        contentEl.contentEditable = 'true';
        contentEl.innerText = card.content;
        
        // Save on blur
        contentEl.onblur = () => {
            const newText = contentEl.innerText;
            if (newText !== card.content) {
                card.content = newText;
                this.debouncedSave();
            }
        };

        // Keydown (Enter to save/blur)
        contentEl.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                contentEl.blur();
            }
        };

        // Metadata badges
        if (card.metadata.due || card.metadata.tags.length > 0) {
            const footer = cardEl.createDiv({ cls: 'kanban-card-footer' });
            
            if (card.metadata.due) {
                const dueEl = footer.createSpan({ cls: 'kanban-tag tag-due' });
                dueEl.setText(`📅 ${card.metadata.due}`);
            }
            
            card.metadata.tags.forEach(tag => {
                const tagEl = footer.createSpan({ cls: 'kanban-tag' });
                tagEl.setText(tag);
            });
        }

        // Context Menu
        cardEl.oncontextmenu = (e) => {
            const menu = new Menu();
            menu.addItem((item) => {
                item.setTitle("删除卡片")
                    .setIcon("trash")
                    .onClick(() => {
                        const idx = col.cards.indexOf(card);
                        if (idx > -1) {
                            col.cards.splice(idx, 1);
                            void this.save();
                            this.renderBoard();
                        }
                    });
            });
            menu.showAtMouseEvent(e);
        };
    }

    handleCardDrop(targetColId: string) {
        if (!this.draggedCardId || !this.draggedFromColId || !this.boardData) return;

        const sourceCol = this.boardData.columns.find(c => c.id === this.draggedFromColId);
        const targetCol = this.boardData.columns.find(c => c.id === targetColId);

        if (!sourceCol || !targetCol) return;

        // Find and remove card
        const cardIndex = sourceCol.cards.findIndex(c => c.id === this.draggedCardId);
        if (cardIndex === -1) return;
        
        const [card] = sourceCol.cards.splice(cardIndex, 1);
        if (!card) return;

        // Update status based on target column name (Auto-Status Logic)
        if (targetCol.name.toLowerCase().includes('done') || targetCol.name.includes('完成')) {
            card.status = 'done';
        } else if (targetCol.name.toLowerCase().includes('doing') || targetCol.name.includes('进行')) {
            card.status = 'doing';
        } else {
            card.status = 'todo';
        }

        // Add to target
        targetCol.cards.push(card);

        void this.save();
        this.renderBoard();
    }
}
