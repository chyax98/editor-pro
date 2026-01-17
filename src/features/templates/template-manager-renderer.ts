

import { App, Notice, Setting, ButtonComponent, normalizePath } from "obsidian";
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

    private get presetsDir() {
        return normalizePath(`${this.app.vault.configDir}/plugins/${this.plugin.manifest.id}/presets`);
    }

    async render(container: HTMLElement) {
        container.empty();
        container.addClass("template-manager-container");

        // Header
        const header = container.createDiv({ cls: "editor-pro-header" });
        header.createEl("h2", { text: "🎨 模板中心 (Template Center)" });
        header.createEl("p", {
            text: `管理您的配置模板。模板现作为独立文件存储在 ${this.presetsDir} 中，方便同步与分享。`,
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

        // Load Templates from FS
        const userTemplates = await this.listTemplates();

        // User Library
        container.createEl("h3", {
            text: `我的模板库 (${userTemplates.length})`,
        });
        const listContainer = container.createDiv({
            cls: "template-list-container",
            attr: {
                style: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;",
            },
        });

        if (userTemplates.length === 0) {
            listContainer.createEl("p", {
                text: "暂无保存的模板。保存的模板将以 JSON 文件形式出现在插件文件夹中。",
                cls: "setting-item-description",
                attr: {
                    style: "grid-column: 1/-1; text-align: center; padding: 20px;",
                },
            });
        } else {
            userTemplates.forEach((tpl) => {
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

    private async listTemplates(): Promise<UserTemplate[]> {
        const adapter = this.app.vault.adapter;
        if (!(await adapter.exists(this.presetsDir))) {
            return [];
        }

        const result = await adapter.list(this.presetsDir);
        const templates: UserTemplate[] = [];

        for (const filePath of result.files) {
            if (!filePath.endsWith(".json")) continue;
            try {
                const content = await adapter.read(filePath);
                const tpl = JSON.parse(content) as UserTemplate;
                // Ensure required fields exist
                if (tpl.name && tpl.type && tpl.data) {
                    templates.push(tpl);
                }
            } catch (e) {
                console.warn(`[EditorPro] Failed to parse template: ${filePath}`, e);
            }
        }
        return templates.sort((a, b) => b.created - a.created);
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
                await navigator.clipboard.writeText(JSON.stringify(tpl, null, 2));
                new Notice("模板配置已复制到剪贴板");
            });

        if (!isReadOnly) {
            new ButtonComponent(btnGroup)
                .setIcon("trash")
                .setTooltip("删除文件")
                .setWarning()
                .onClick(() => { void this.deleteTemplate(tpl); });
        }
    }

    private openSaveModal() {
        new SaveTemplateModal(this.app, async (meta) => {
            const data = extractSettings(this.plugin.settings, meta.type);

            const newTemplate: UserTemplate = {
                id: Date.now().toString(),
                name: meta.name,
                description: meta.description,
                type: meta.type,
                data: data,
                created: Date.now(),
            };

            // Save to FS
            const adapter = this.app.vault.adapter;
            if (!await adapter.exists(this.presetsDir)) {
                await adapter.mkdir(this.presetsDir);
            }

            // Safe filename
            const safeName = newTemplate.name.replace(/[^a-z0-9\u4e00-\u9fa5_-]/gi, "_") || newTemplate.id;
            const filePath = normalizePath(`${this.presetsDir}/${safeName}.json`);

            await adapter.write(filePath, JSON.stringify(newTemplate, null, 2));

            this.renderCallback(); // Reload list
            new Notice(`不再使用 data.json，模板已保存文件: ${safeName}.json`);
        }).open();
    }

    private openImportModal() {
        new InputModal(this.app, {
            title: "导入模板代码 (Import JSON)",
            placeholder: "在此粘贴模板 JSON 代码...",
            onSubmit: async (str) => {
                try {
                    const tpl = JSON.parse(str) as UserTemplate;

                    if (!tpl || typeof tpl !== 'object' || !tpl.data || !tpl.type || !tpl.name)
                        throw new Error("无效的模板格式");

                    // Save to FS
                    const adapter = this.app.vault.adapter;
                    if (!await adapter.exists(this.presetsDir)) {
                        await adapter.mkdir(this.presetsDir);
                    }

                    // Generate a new ID for the import but keep content
                    tpl.id = Date.now().toString();
                    const safeName = tpl.name.replace(/[^a-z0-9\u4e00-\u9fa5_-]/gi, "_") || tpl.id;
                    const filePath = normalizePath(`${this.presetsDir}/${safeName}.json`);

                    // Check if exists to avoid overwrite? 
                    // Simple logic: overwrite or append timestamp is handled by fs? 
                    // Here we just write. If user imports same name, it updates.

                    await adapter.write(filePath, JSON.stringify(tpl, null, 2));

                    this.renderCallback();
                    new Notice("模板已保存到 presets 文件夹");
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
            title: "删除模板文件",
            message: `确定要删除模板文件 "${tpl.name}" 吗？\n此操作将永久删除对应的 JSON 文件。`,
            onConfirm: async () => {
                const adapter = this.app.vault.adapter;
                // We need to find the filename. Since we don't store filename in UserTemplate, 
                // we iterate to find the matching file.
                // Weakness of current design: listing creates UserTemplate without filename meta.
                // Improvement: listTemplates should return object with path.

                // Quick fix: loop list again to find match.
                try {
                    const files = await adapter.list(this.presetsDir);
                    for (const f of files.files) {
                        const content = await adapter.read(f);
                        const json = JSON.parse(content) as UserTemplate;
                        if (json.id === tpl.id) {
                            await adapter.remove(f);
                            this.renderCallback();
                            new Notice("文件已删除");
                            return;
                        }
                    }
                    new Notice("未找到对应文件");
                } catch (e) {
                    console.error(e);
                    new Notice("删除失败");
                }
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
