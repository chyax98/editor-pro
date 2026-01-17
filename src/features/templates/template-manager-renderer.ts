
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { App, Notice, Setting, ButtonComponent } from "obsidian";
import EditorProPlugin from "../../main";
import { UserTemplate } from "../../config";
import { ConfirmationModal } from "../ui/confirmation-modal";
import { InputModal } from "../ui/input-modal";
import { SaveTemplateModal } from "./save-template-modal";
import { extractSettings, sanitizeSettings } from "./template-utils";

export class TemplateManagerRenderer {
    constructor(
        private app: App,
        private plugin: EditorProPlugin,
        private renderCallback: () => void
    ) { }

    render(container: HTMLElement) {
        container.empty();
        container.addClass("template-manager-container");

        // Header
        const header = container.createDiv({ cls: "editor-pro-header" });
        header.createEl("h2", { text: "🎨 模板中心 (Template Center)" });
        header.createEl("p", {
            text: "管理您的配置快照。您可以保存当前配置的不同状态，并在需要时一键切换。支持全量备份或仅模块配置。",
            cls: "setting-item-description",
        });

        // Actions
        const actionsEl = container.createDiv({
            cls: "template-actions",
            attr: {
                style: "margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--background-modifier-border);",
            },
        });

        new Setting(actionsEl)
            .setName("操作")
            .setDesc("创建新模板或导入")
            .addButton((btn) =>
                btn
                    .setButtonText("保存当前配置为模板")
                    .setCta()
                    .setIcon("save")
                    .onClick(() => { void this.openSaveModal(); })
            )
            .addButton((btn) =>
                btn
                    .setButtonText("导入模板代码")
                    .setIcon("import")
                    .onClick(() => { void this.openImportModal(); })
            );

        // User Library
        container.createEl("h3", {
            text: `我的模板库 (${this.plugin.settings.userTemplates.length})`,
        });
        const listContainer = container.createDiv({
            cls: "template-list-container",
            attr: {
                style: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;",
            },
        });

        if (this.plugin.settings.userTemplates.length === 0) {
            listContainer.createEl("p", {
                text: "暂无保存的模板。",
                cls: "setting-item-description",
                attr: {
                    style: "grid-column: 1/-1; text-align: center; padding: 20px;",
                },
            });
        } else {
            this.plugin.settings.userTemplates.forEach((tpl) => {
                this.renderTemplateCard(listContainer, tpl, false);
            });
        }

        // Gallery (Static)
        container.createEl("h3", {
            text: "官方预设 (Gallery)",
            attr: { style: "margin-top: 30px;" },
        });
        const galleryContainer = container.createDiv({
            cls: "template-list-container",
            attr: {
                style: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;",
            },
        });
        this.getGalleryTemplates().forEach((tpl) => {
            this.renderTemplateCard(galleryContainer, tpl, true);
        });
    }

    private renderTemplateCard(
        container: HTMLElement,
        tpl: UserTemplate,
        isReadOnly: boolean
    ) {
        const card = container.createDiv({
            cls: "template-card",
            attr: {
                style: "border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px; background-color: var(--background-secondary);",
            },
        });

        const header = card.createDiv({
            attr: {
                style: "display: flex; justify-content: space-between; align-items: start;",
            },
        });
        const titleGroup = header.createDiv();
        titleGroup.createEl("h4", {
            text: tpl.name,
            attr: { style: "margin: 0 0 5px 0;" },
        });

        // Type Badge
        const typeColors: Record<string, string> = {
            full: "var(--text-accent)",
            homepage: "var(--color-green)",
            guardian: "var(--color-red)",
        };
        const typeLabels: Record<string, string> = {
            full: "全量",
            homepage: "Homepage",
            guardian: "Guardian",
        };

        titleGroup.createEl("span", {
            text: typeLabels[tpl.type] || tpl.type,
            attr: {
                style: `font-size: 0.8em; padding: 2px 6px; border-radius: 4px; background-color: var(--background-modifier-form-field); color: ${typeColors[tpl.type] || "var(--text-normal)"
                    }; border: 1px solid var(--background-modifier-border);`,
            },
        });

        // Date
        const dateStr = new Date(tpl.created).toLocaleDateString();
        titleGroup.createEl("span", {
            text: dateStr,
            attr: {
                style: "font-size: 0.8em; color: var(--text-muted); margin-left: 8px;",
            },
        });

        card.createEl("p", {
            text: tpl.description || "无描述",
            attr: {
                style: "margin: 0; color: var(--text-muted); font-size: 0.9em; flex-grow: 1;",
            },
        });

        // Buttons
        const btnGroup = card.createDiv({
            attr: { style: "display: flex; gap: 8px; margin-top: 10px;" },
        });

        new ButtonComponent(btnGroup)
            .setButtonText("应用")
            .setCta()
            .onClick(() => { void this.applyTemplate(tpl); });

        new ButtonComponent(btnGroup)
            .setIcon("copy")
            .setTooltip("导出/复制配置码")
            .onClick(async () => {
                await navigator.clipboard.writeText(JSON.stringify(tpl));
                new Notice("模板代码已复制到剪贴板");
            });

        if (!isReadOnly) {
            new ButtonComponent(btnGroup)
                .setIcon("trash")
                .setTooltip("删除")
                .setWarning()
                .onClick(() => { void this.deleteTemplate(tpl); });
        }
    }

    private openSaveModal() {
        new SaveTemplateModal(this.app, async (meta) => {
            // REFACTORED: Use pure utility function
            const data = extractSettings(this.plugin.settings, meta.type);

            const newTemplate: UserTemplate = {
                id: Date.now().toString(),
                name: meta.name,
                description: meta.description,
                type: meta.type,
                data: data,
                created: Date.now(),
            };

            this.plugin.settings.userTemplates.push(newTemplate);
            await this.plugin.saveSettings();
            this.renderCallback();
            new Notice("模板已保存");
        }).open();
    }

    private openImportModal() {
        new InputModal(this.app, {
            title: "导入模板",
            placeholder: "在此粘贴模板 JSON 代码...",
            onSubmit: async (str) => {
                try {
                    const tpl = JSON.parse(str);

                    // Basic validation
                    if (!tpl || typeof tpl !== 'object' || !tpl.data || !tpl.type || !tpl.name)
                        throw new Error("无效的模板格式");

                    const settingsTpl = tpl as UserTemplate;

                    // Regenerate ID to avoid collision
                    settingsTpl.id = Date.now().toString();
                    settingsTpl.created = Date.now();

                    this.plugin.settings.userTemplates.push(settingsTpl);
                    await this.plugin.saveSettings();
                    this.renderCallback();
                    new Notice("模板导入成功");
                } catch (e) {
                    console.error(e);
                    new Notice("导入失败：格式错误");
                }
            },
        }).open();
    }

    private async applyTemplate(tpl: UserTemplate) {
        new ConfirmationModal(this.app, {
            title: `应用模板：${tpl.name}`,
            message: `确认应用此模板？\n类型：${tpl.type}\n这将覆盖当前的相关设置。`,
            onConfirm: async () => {
                // REFACTORED: Use pure utility function for secure sanitization
                const cleanData = sanitizeSettings(tpl.data);

                Object.assign(this.plugin.settings, cleanData);
                await this.plugin.saveSettings();
                new Notice(`已应用模板：${tpl.name}`);
                this.displayReload();
            },
        }).open();
    }

    private displayReload() {
        this.renderCallback();
    }

    private async deleteTemplate(tpl: UserTemplate) {
        new ConfirmationModal(this.app, {
            title: "删除模板",
            message: `确定要删除模板 "${tpl.name}" 吗？`,
            onConfirm: async () => {
                this.plugin.settings.userTemplates =
                    this.plugin.settings.userTemplates.filter(
                        (t) => t.id !== tpl.id
                    );
                await this.plugin.saveSettings();
                this.renderCallback();
                new Notice("模板已删除");
            },
        }).open();
    }

    private getGalleryTemplates(): UserTemplate[] {
        return [
            {
                id: "gallery_para",
                name: "Classic PARA",
                description:
                    "基于 Tiago Forte 的 PARA 方法构建的文件夹结构规则。",
                type: "guardian",
                created: Date.now(),
                data: {
                    enableVaultGuardian: true,
                    vaultGuardianAllowedRoots:
                        "Projects\nAreas\nResources\nArchives\nInbox",
                    vaultGuardianFolderRules:
                        "Projects:true:2:\nAreas:true:2:\nResources:true:3:\nArchives:true:4:\nInbox:false:1:",
                },
            },
            {
                id: "gallery_zettel",
                name: "Zettelkasten Flow",
                description:
                    "简单的卡片盒笔记流，Homepage 追踪 Inbox -> Reference -> Permanent。",
                type: "homepage",
                created: Date.now(),
                data: {
                    enableHomepage: true,
                    homepageTrackedFolders:
                        "Inbox:Inbox:📥:true:1\nReference:Literature:📚:true:2\nPermanent:Permanent:🧠:true:3",
                    homepageShowFolderStats: true,
                },
            },
        ];
    }
}
