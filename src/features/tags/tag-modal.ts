import { App, FuzzySuggestModal, Modal, Setting, Notice } from "obsidian";
import { TagManager } from "./tag-manager";

export class TagRenameModal extends FuzzySuggestModal<string> {
    private tagManager: TagManager;

    constructor(app: App) {
        super(app);
        this.tagManager = new TagManager(app);
        this.setPlaceholder("选择要重命名的标签...");
    }

    getItems(): string[] {
        return this.tagManager.getAllTags();
    }

    getItemText(item: string): string {
        return item;
    }

    onChooseItem(tag: string, evt: MouseEvent | KeyboardEvent) {
        new InputModal(this.app, tag, async (newTag) => {
            if (newTag && newTag !== tag) {
                await this.tagManager.renameTag(tag, newTag);
            }
        }).open();
    }
}

class InputModal extends Modal {
    constructor(app: App, private oldName: string, private onSubmit: (result: string) => void) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: `重命名标签: ${this.oldName}` });

        let value = this.oldName;

        new Setting(contentEl)
            .setName("新名称")
            .setDesc("输入新的标签名称（包含 #）")
            .addText((text) =>
                text
                    .setValue(this.oldName)
                    .onChange((val) => {
                        value = val;
                    })
            );

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("确认")
                    .setCta()
                    .onClick(() => {
                        this.onSubmit(value);
                        this.close();
                    })
            );
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
