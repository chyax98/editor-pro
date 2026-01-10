import { App, Modal, Setting } from "obsidian";

export class TextPromptModal extends Modal {
	private value: string;
	private placeholder?: string;
	private submitText: string;
	private onSubmit: (value: string) => void;

	constructor(
		app: App,
		options: {
			title: string;
			placeholder?: string;
			initialValue?: string;
			submitText?: string;
			onSubmit: (value: string) => void;
		},
	) {
		super(app);
		this.setTitle(options.title);
		this.placeholder = options.placeholder;
		this.value = options.initialValue ?? "";
		this.submitText = options.submitText ?? "Confirm";
		this.onSubmit = options.onSubmit;
	}

	onOpen() {
		new Setting(this.contentEl).addText((text) => {
			if (this.placeholder) text.setPlaceholder(this.placeholder);
			text.setValue(this.value).onChange((value) => {
				this.value = value;
			});
		});

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText(this.submitText).setCta().onClick(() => {
					const trimmed = this.value.trim();
					if (!trimmed) return;
					this.onSubmit(trimmed);
					this.close();
				});
			})
			.addExtraButton((btn) => {
				btn.setIcon("x").setTooltip("Cancel").onClick(() => this.close());
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}

export class ConfirmModal extends Modal {
	private message: string;
	private confirmText: string;
	private cancelText: string;
	private onConfirm: () => void;

	constructor(
		app: App,
		options: {
			title: string;
			message: string;
			confirmText?: string;
			cancelText?: string;
			onConfirm: () => void;
		},
	) {
		super(app);
		this.setTitle(options.title);
		this.message = options.message;
		this.confirmText = options.confirmText ?? "Confirm";
		this.cancelText = options.cancelText ?? "Cancel";
		this.onConfirm = options.onConfirm;
	}

	onOpen() {
		this.contentEl.createDiv({ text: this.message });

		new Setting(this.contentEl)
			.addButton((btn) => {
				btn.setButtonText(this.confirmText).setWarning().onClick(() => {
					this.onConfirm();
					this.close();
				});
			})
			.addButton((btn) => {
				btn.setButtonText(this.cancelText).onClick(() => this.close());
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}

