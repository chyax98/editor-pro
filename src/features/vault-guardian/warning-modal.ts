/**
 * Vault Guardian Feature - Warning Modal
 * 违规警告弹窗
 */

import { App, Modal, Setting } from 'obsidian';
import { ViolationReport } from './types';

export class VaultGuardianWarningModal extends Modal {
    private violation: ViolationReport;
    private onProceed: () => void;
    private onCancel: () => void;
    private blockCreation: boolean;

    constructor(
        app: App,
        violation: ViolationReport,
        blockCreation: boolean,
        onProceed: () => void,
        onCancel: () => void
    ) {
        super(app);
        this.violation = violation;
        this.blockCreation = blockCreation;
        this.onProceed = onProceed;
        this.onCancel = onCancel;
    }

    onOpen(): void {
        const { contentEl, violation, blockCreation } = this;

        contentEl.addClass('vault-guardian-warning-modal');

        // Header
        contentEl.createEl('h2', { text: '⚠️ Vault Guardian 警告' });

        // Violation message
        const messageEl = contentEl.createDiv({ cls: 'vault-guardian-message' });
        messageEl.createEl('p', {
            text: `❌ ${violation.message}`,
            cls: 'vault-guardian-error'
        });

        // Path
        contentEl.createEl('p', {
            text: `路径: ${violation.path}`,
            cls: 'vault-guardian-path'
        });

        // Suggestion
        if (violation.suggestion) {
            const suggestionEl = contentEl.createDiv({ cls: 'vault-guardian-suggestion' });
            suggestionEl.createEl('p', { text: '💡 建议:' });
            suggestionEl.createEl('p', { text: violation.suggestion });
        }

        // Actions
        const actionsEl = contentEl.createDiv({ cls: 'vault-guardian-actions' });

        new Setting(actionsEl)
            .addButton(btn => {
                btn
                    .setButtonText('取消')
                    .onClick(() => {
                        this.close();
                        this.onCancel();
                    });
            })
            .addButton(btn => {
                if (blockCreation) {
                    btn
                        .setButtonText('已阻止')
                        .setDisabled(true);
                } else {
                    btn
                        .setButtonText('仍然创建')
                        .setWarning()
                        .onClick(() => {
                            this.close();
                            this.onProceed();
                        });
                }
            });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
