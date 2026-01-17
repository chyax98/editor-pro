
import { App, Modal, Setting } from "obsidian";

export class ConfirmationModal extends Modal {
    private title: string;
    private message: string;
    private onConfirm: () => void | Promise<void>;

    constructor(
        app: App,
        options: {
            title: string;
            message: string;
            onConfirm: () => void | Promise<void>;
        }
    ) {
        super(app);
        this.title = options.title;
        this.message = options.message;
        this.onConfirm = options.onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("editor-pro-confirmation-modal");

        contentEl.createEl("h2", { text: this.title });

        const msgLines = this.message.split('\n');
        for (const line of msgLines) {
            contentEl.createEl("p", { text: line });
        }

        const buttonContainer = contentEl.createDiv({
            cls: "editor-pro-confirmation-buttons",
            attr: { style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;" }
        });

        new Setting(buttonContainer)
            .addButton((btn) =>
                btn
                    .setButtonText("取消")
                    .onClick(() => {
                        this.close();
                    })
            )
            .addButton((btn) =>
                btn
                    .setButtonText("确认")
                    .setCta()
                    .onClick(() => {
                        void Promise.resolve(this.onConfirm()).finally(() => {
                            this.close();
                        });
                    })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
