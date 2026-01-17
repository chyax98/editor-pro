/**
 * Vault Guardian Feature - Health Report Modal
 * 健康检查报告弹窗
 */

import { App, Modal, Setting } from 'obsidian';
import { HealthCheckResult, ViolationReport } from './types';

export class VaultGuardianHealthReportModal extends Modal {
    private result: HealthCheckResult;

    constructor(app: App, result: HealthCheckResult) {
        super(app);
        this.result = result;
    }

    onOpen(): void {
        const { contentEl, result } = this;

        contentEl.addClass('vault-guardian-health-modal');

        // Header
        contentEl.createEl('h2', {
            text: result.isHealthy
                ? '✅ 目录结构健康'
                : '⚠️ 发现目录结构问题'
        });

        // Stats
        const statsEl = contentEl.createDiv({ cls: 'vault-guardian-stats' });
        statsEl.createEl('h4', { text: '📊 统计信息' });

        const statsList = statsEl.createEl('ul');
        statsList.createEl('li', { text: `根目录数量: ${result.stats.rootFolders}` });
        statsList.createEl('li', { text: `总目录数量: ${result.stats.totalFolders}` });
        statsList.createEl('li', { text: `最大嵌套深度: ${result.stats.maxDepthFound}` });

        // Violations
        if (result.violations.length > 0) {
            const violationsEl = contentEl.createDiv({ cls: 'vault-guardian-violations' });
            violationsEl.createEl('h4', { text: `❌ 发现 ${result.violations.length} 个问题` });

            const violationsList = violationsEl.createEl('ul');
            for (const violation of result.violations.slice(0, 20)) {
                const li = violationsList.createEl('li');
                li.createEl('span', {
                    text: this.getViolationIcon(violation.type),
                    cls: 'violation-icon'
                });
                li.createEl('code', { text: violation.path });
                li.createEl('span', { text: ` - ${violation.message}` });
            }

            if (result.violations.length > 20) {
                violationsList.createEl('li', {
                    text: `... 还有 ${result.violations.length - 20} 个问题`,
                    cls: 'vault-guardian-more'
                });
            }
        } else {
            const successEl = contentEl.createDiv({ cls: 'vault-guardian-success' });
            successEl.createEl('p', { text: '🎉 目录结构符合规范！' });
        }

        // Close button
        new Setting(contentEl)
            .addButton(btn => {
                btn
                    .setButtonText('关闭')
                    .setCta()
                    .onClick(() => this.close());
            });
    }

    private getViolationIcon(type: ViolationReport['type']): string {
        switch (type) {
            case 'root': return '📁';
            case 'subfolder': return '📂';
            case 'depth': return '📏';
            case 'pattern': return '🏷️';
            default: return '❓';
        }
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
