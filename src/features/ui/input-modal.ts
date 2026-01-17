
import { App, Modal, Setting } from "obsidian";

export class InputModal extends Modal {
    private title: string;
    private placeholder: string;
    private value: string;
    private onSubmit: (result: string) => void | Promise<void>;

    constructor(
        app: App,
        options: {
            title: string;
            placeholder?: string;
            value?: string;
            onSubmit: (result: string) => void | Promise<void>;
        }
    ) {
        super(app);
        this.title = options.title;
        this.placeholder = options.placeholder || "";
        this.value = options.value || "";
        this.onSubmit = options.onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: this.title });

        const inputContainer = contentEl.createDiv({
            cls: "editor-pro-input-container",
        });

        // Use a TextArea for larger JSON content
        const textArea = inputContainer.createEl("textarea", {
            attr: {
                style: "width: 100%; height: 200px; margin-bottom: 10px; font-family: monospace;",
            },
            placeholder: this.placeholder,
        });
        textArea.value = this.value;

        const buttonContainer = contentEl.createDiv({
            cls: "editor-pro-confirmation-buttons",
            attr: {
                style: "display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;",
            },
        });

        new Setting(buttonContainer)
            .addButton((btn) =>
                btn.setButtonText("取消").onClick(() => {
                    this.close();
                })
            )
            .addButton((btn) =>
                btn
                    .setButtonText("确认")
                    .setCta()
                    .onClick(() => {
                        void Promise.resolve(this.onSubmit(textArea.value)).finally(() => {
                            this.close();
                        });
                    })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
