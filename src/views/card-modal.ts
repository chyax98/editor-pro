import { Modal, App, Setting } from "obsidian";
import { BoardCard, BoardColumn } from "../features/board/board-model";
import { ConfirmModal } from "./simple-modals";

export class CardModal extends Modal {
    card: BoardCard;
    columns: BoardColumn[];
    onSave: (card: BoardCard) => void;
    onDelete: (card: BoardCard) => void;

    constructor(app: App, card: BoardCard, columns: BoardColumn[], onSave: (card: BoardCard) => void, onDelete: (card: BoardCard) => void) {
        super(app);
        this.card = { ...card }; // Clone to avoid mutation before save
        this.columns = columns;
        this.onSave = onSave;
        this.onDelete = onDelete;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('board-card-modal');

        contentEl.createEl('h2', { text: '编辑任务' });

        // Title
        new Setting(contentEl)
            .setName('任务标题')
            .addText(text => text
                .setValue(this.card.title)
                .onChange(value => this.card.title = value));

        // Column (Status)
        new Setting(contentEl)
            .setName('状态 (列)')
            .addDropdown(drop => {
                this.columns.forEach((col) => {
                    drop.addOption(col.id, col.name);
                });
                drop.setValue(this.card.columnId);
                drop.onChange((value) => {
                    this.card.columnId = value;
                });
            });

        // Priority
        new Setting(contentEl)
            .setName('优先级')
            .addDropdown(drop => drop
                .addOption('low', '🟢 低')
                .addOption('medium', '🟡 中')
                .addOption('high', '🔴 高')
                .setValue(this.card.priority)
                .onChange((value) => {
                    if (value === 'low' || value === 'medium' || value === 'high') {
                        this.card.priority = value;
                    }
                }));

        // Due Date
        new Setting(contentEl)
            .setName('截止日期')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.card.dueDate || '')
                .onChange(value => this.card.dueDate = value));

        // Description (TextArea)
        const descContainer = contentEl.createDiv({ cls: 'board-modal-description' });
        descContainer.createEl('h4', { text: '详细描述' });
        const descArea = descContainer.createEl('textarea', { 
            cls: 'board-card-description',
            text: this.card.description 
        });
        descArea.onblur = () => { this.card.description = descArea.value; };

        // Buttons
        const btnContainer = contentEl.createDiv({ cls: 'board-modal-buttons' });
        
        const saveBtn = btnContainer.createEl('button', { text: '保存', cls: 'mod-cta' });
        saveBtn.onclick = () => {
            this.onSave(this.card);
            this.close();
        };

        const deleteBtn = btnContainer.createEl('button', { text: '删除', cls: 'mod-warning' });
        deleteBtn.onclick = () => {
            new ConfirmModal(this.app, {
                title: "删除任务",
                message: "确定要删除这个任务吗？",
                confirmText: "删除",
                cancelText: "取消",
                onConfirm: () => {
                    this.onDelete(this.card);
                    this.close();
                },
            }).open();
        };
    }

    onClose() {
        this.contentEl.empty();
    }
}
