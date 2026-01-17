
import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import EditorProPlugin from "./main";

import { McpFeature } from "./features/mcp/mcp-feature";
import { TemplateManagerRenderer } from "./features/templates/template-manager-renderer";
import { McpSettingsRenderer } from "./features/mcp/mcp-settings-tab";

import { ConfirmationModal } from "./features/ui/confirmation-modal";
import { InputModal } from "./features/ui/input-modal";

import { EditorProSettings, SECTIONS, SettingItem, SettingSection, SettingsTabDefinition, SETTING_PRESETS, SettingsPreset } from "./config";
export * from "./config";
export class EditorProSettingTab extends PluginSettingTab {
    plugin: EditorProPlugin;
    private searchInput?: HTMLInputElement;
    private settingElements: HTMLElement[] = [];
    private mcpFeature: McpFeature | null;
    private activeTabId = "editing";
    private tabContent?: HTMLElement;

    constructor(
        app: App,
        plugin: EditorProPlugin,
        mcpFeature: McpFeature | null,
    ) {
        super(app, plugin);
        this.plugin = plugin;
        this.mcpFeature = mcpFeature;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Header with welcome message
        const headerContainer = containerEl.createDiv({
            cls: "editor-pro-header",
        });
        headerContainer.createEl("h1", { text: "Editor Pro 插件设置" });

        // Welcome message for new users (using safe DOM API)
        const welcomeEl = headerContainer.createDiv({
            cls: "editor-pro-welcome",
        });
        const welcomeTitle = welcomeEl.createEl("p");
        welcomeTitle.createEl("strong").setText("欢迎使用 Editor Pro！");
        welcomeEl
            .createEl("p")
            .setText(
                "本插件提供丰富的编辑增强功能，默认已启用核心编辑功能以确保最佳体验。",
            );

        const quickStartTitle = welcomeEl.createEl("p");
        quickStartTitle.createEl("strong").setText("💡 快速入门：");

        const quickStartList = welcomeEl.createEl("ul");
        const items = [
            "📝 基础编辑：行操作（上移/下移/复制）、智能配对、表格编辑",
            "⌨️ 快捷键：在 Settings → Hotkeys 中绑定命令",
            "🎨 格式化：选中文字后使用快捷键或右键菜单",
            "🔧 更多功能：在下方分类中按需开启",
        ];
        items.forEach((item) => {
            quickStartList.createEl("li").setText(item);
        });

        const helpLink = welcomeEl.createEl("p", {
            cls: "editor-pro-help-link",
        });
        helpLink.setText("💬 需要帮助？访问 GitHub 或查看文档。");

        // 预设选择区域
        const presetContainer = containerEl.createDiv({
            cls: "editor-pro-presets",
        });
        presetContainer.createEl("h3", { text: "⚡ 快速配置预设" });
        presetContainer.createEl("p", {
            text: "选择一个预设快速配置，或在下方手动调整各项设置。",
            cls: "editor-pro-preset-desc",
        });

        const presetButtons = presetContainer.createDiv({
            cls: "editor-pro-preset-buttons",
        });

        for (const preset of SETTING_PRESETS) {
            const btn = presetButtons.createEl("button", {
                cls: "editor-pro-preset-btn",
                attr: { "data-preset": preset.id },
            });
            btn.createEl("span", { text: preset.icon, cls: "preset-icon" });
            btn.createEl("span", { text: preset.name, cls: "preset-name" });
            btn.createEl("span", {
                text: preset.description,
                cls: "preset-desc",
            });

            btn.addEventListener("click", () => {
                void this.applyPreset(preset);
            });
        }

        const tabs = this.buildTabs();
        this.renderTabs(containerEl, tabs);

        // Import/Export Zone
        const ioContainer = containerEl.createDiv({
            cls: "editor-pro-io",
            attr: {
                style: "margin: 20px 0; padding: 10px; border: 1px dashed var(--background-modifier-border); border-radius: 5px; display: flex; justify-content: space-between; align-items: center;",
            },
        });
        ioContainer.createEl("span", {
            text: "配置管理 (Backup/Restore)",
            attr: { style: "font-weight: bold; color: var(--text-muted);" },
        });
        const ioBtnGroup = ioContainer.createDiv({
            attr: { style: "display: flex; gap: 8px;" },
        });

        new Setting(ioBtnGroup)
            .addButton((btn) =>
                btn
                    .setButtonText("导出配置")
                    .setIcon("copy")
                    .setTooltip("复制当前配置 JSON 到剪贴板")
                    .onClick(async () => {
                        const data = JSON.stringify(
                            this.plugin.settings,
                            null,
                            2,
                        );
                        await navigator.clipboard.writeText(data);
                        new Notice("配置 JSON 已复制到剪贴板");
                    }),
            )
            .addButton((btn) =>
                btn
                    .setButtonText("导入配置")
                    .setIcon("import")
                    .setTooltip("从 JSON 恢复配置")
                    .onClick(async () => {
                        // Use InputModal instead of prompt
                        new InputModal(this.app, {
                            title: "导入配置 (Paste JSON)",
                            placeholder: "在此粘贴 JSON 配置...",
                            onSubmit: async (input) => {
                                if (!input) return;
                                try {
                                    const newSettings = JSON.parse(
                                        input,
                                    ) as Partial<EditorProSettings>;
                                    if (typeof newSettings !== "object")
                                        throw new Error("Invalid format");
                                    Object.assign(
                                        this.plugin.settings,
                                        newSettings,
                                    );
                                    await this.plugin.saveSettings();
                                    this.display();
                                    new Notice("配置导入成功！");
                                } catch (error) {
                                    console.error(error);
                                    new Notice("导入失败：无效的 JSON 格式");
                                }
                            },
                        }).open();
                    }),
            );

        // Search bar with accessibility support
        const searchContainer = containerEl.createDiv({
            cls: "editor-pro-settings-search",
        });
        searchContainer.createEl(
            "input",
            {
                type: "text",
                placeholder: "🔍 搜索设置... (输入关键词过滤)",
                cls: "editor-pro-search-input",
                attr: {
                    "aria-label": "搜索设置",
                    "aria-describedby": "editor-pro-search-help",
                    role: "searchbox",
                },
            },
            (el) => {
                this.searchInput = el;
                el.addEventListener("input", () => this.filterSettings());
                // Add keyboard shortcut hint
                el.setAttribute("title", "输入以过滤设置选项");
            },
        );

        this.tabContent = containerEl.createDiv({
            cls: "editor-pro-tab-content",
        });
        this.renderActiveTab();
    }

    private renderAllSettings(container: HTMLElement): void {
        this.settingElements = [];

        for (const section of SECTIONS) {
            const sectionEl = this.renderSection(container, section);
            this.settingElements.push(sectionEl);
        }
    }

    private renderSection(
        container: HTMLElement,
        section: SettingSection,
    ): HTMLElement {
        const sectionContainer = container.createDiv({
            cls: "editor-pro-section",
        });
        sectionContainer.dataset.section = section.title;

        // Section header with collapse toggle and accessibility
        const headerEl = sectionContainer.createEl("h3", {
            cls: "editor-pro-section-title",
            attr: {
                role: "button",
                tabindex: "0",
                "aria-expanded": "true",
                "aria-controls": `${section.title}-settings`,
            },
        });
        // Use safe DOM API to prevent XSS
        const toggleSpan = headerEl.createEl("span", {
            cls: "editor-pro-section-toggle",
            attr: { "aria-hidden": "true" },
        });
        toggleSpan.setText("▼");
        const titleSpan = headerEl.createEl("span");
        titleSpan.setText(`${section.icon} ${section.title}`);

        // Settings container with ID for accessibility
        const settingsContainer = sectionContainer.createDiv({
            cls: "editor-pro-section-settings",
            attr: { id: `${section.title}-settings` },
        });

        // Toggle collapse on click and keyboard
        const toggle = headerEl.querySelector(
            ".editor-pro-section-toggle",
        ) as HTMLElement;
        let isCollapsed = false;

        const toggleCollapse = () => {
            isCollapsed = !isCollapsed;
            toggle.classList.toggle("collapsed", isCollapsed);
            headerEl.setAttribute("aria-expanded", String(!isCollapsed));

            if (settingsContainer) {
                settingsContainer.classList.toggle(
                    "editor-pro-section-collapsed",
                    isCollapsed,
                );
            }
        };

        headerEl.addEventListener("click", toggleCollapse);
        headerEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCollapse();
            }
        });

        // Render each setting in the section
        for (const setting of section.settings) {
            this.renderSetting(settingsContainer, setting);
        }

        return sectionContainer;
    }

    private buildTabs(): SettingsTabDefinition[] {
        const mapping = (titles: string[]) => new Set(titles);
        const tabs: SettingsTabDefinition[] = [
            {
                id: "editing",
                title: "编辑功能",
                icon: "✍️",
                sectionTitles: mapping([
                    "基础编辑",
                    "格式化与转换",
                    "快捷键与命令",
                    "智能粘贴",
                    "辅助功能",
                ]),
            },
            {
                id: "experience",
                title: "写作体验",
                icon: "🧘",
                sectionTitles: mapping(["写作体验", "界面增强"]),
            },
            {
                id: "content",
                title: "文件管理",
                icon: "📁",
                sectionTitles: mapping(["小工具", "文件与库管理"]),
            },
            {
                id: "visuals",
                title: "可视化",
                icon: "📊",
                sectionTitles: mapping(["可视化"]),
            },
            {
                id: "homepage",
                title: "首页",
                icon: "🏠",
                sectionTitles: mapping(["首页仪表板"]),
            },
            {
                id: "guardian",
                title: "结构守护",
                icon: "🛡️",
                sectionTitles: mapping(["目录结构守护"]),
            },
            {
                id: "mcp",
                title: "MCP / Agent",
                icon: "🤖",
                render: (container: HTMLElement) => {
                    if (!this.mcpFeature) {
                        container.createEl("p", {
                            text: "MCP 模块未加载。请重启插件。",
                            cls: "setting-item-description",
                        });
                        return;
                    }
                    new McpSettingsRenderer(this.mcpFeature).render(container);
                },
            },
            {
                id: "templates",
                title: "模板中心",
                icon: "🎨",
                render: (container: HTMLElement) => {
                    new TemplateManagerRenderer(this.app, this.plugin, () => {
                        // Callback to refresh
                        this.display();
                    }).render(container);
                }
            },
        ];

        if (!this.mcpFeature) {
            if (this.activeTabId === "mcp") {
                this.activeTabId = "editing";
            }
            return tabs.filter((tab) => tab.id !== "mcp");
        }

        return tabs;
    }

    private renderTabs(container: HTMLElement, tabs: SettingsTabDefinition[]) {
        const tabContainer = container.createDiv({ cls: "editor-pro-tabs" });
        tabs.forEach((tab) => {
            const button = tabContainer.createEl("button", {
                cls: "editor-pro-tab-button",
                attr: { "data-tab-id": tab.id },
            });
            button.createEl("span", {
                text: tab.icon,
                cls: "editor-pro-tab-icon",
            });
            button.createEl("span", { text: tab.title });
            if (tab.id === this.activeTabId) {
                button.addClass("active");
            }
            button.addEventListener("click", () => {
                this.activeTabId = tab.id;
                tabContainer
                    .querySelectorAll(".editor-pro-tab-button")
                    .forEach((el) => {
                        el.classList.toggle(
                            "active",
                            el.getAttribute("data-tab-id") === tab.id,
                        );
                    });
                this.renderActiveTab();
            });
        });
    }

    private renderActiveTab() {
        if (!this.tabContent) return;
        const tabs = this.buildTabs();
        const active =
            tabs.find((tab) => tab.id === this.activeTabId) ?? tabs[0];
        if (!active) return;

        this.tabContent.empty();

        if (active.render) {
            active.render(this.tabContent);
            this.settingElements = [];
            return;
        }

        const sections = SECTIONS.filter((section) =>
            active.sectionTitles?.has(section.title),
        );
        this.settingElements = [];
        sections.forEach((section) => {
            const sectionEl = this.renderSection(this.tabContent!, section);
            this.settingElements.push(sectionEl);
        });

        if ((this.searchInput?.value ?? "").trim()) {
            this.filterSettings();
        }
    }

    private renderSetting(container: HTMLElement, setting: SettingItem): void {
        const settingEl = container.createDiv({
            cls: "editor-pro-setting-item",
        });
        settingEl.dataset.name = setting.name.toLowerCase();
        settingEl.dataset.desc = setting.desc.toLowerCase();

        // Add tooltip if available
        if (setting.tooltip) {
            settingEl.setAttribute(
                "title",
                `${setting.name}: ${setting.tooltip}`,
            );
        }

        const descFragment = document.createDocumentFragment();
        descFragment.append(setting.desc);

        if (setting.longDesc) {
            const details = document.createElement("details");
            details.addClass("editor-pro-details");

            const summary = document.createElement("summary");
            summary.addClass("editor-pro-details-summary");
            summary.textContent = "详细说明";

            const content = document.createElement("div");
            content.addClass("editor-pro-details-content");
            content.textContent = setting.longDesc;

            details.appendChild(summary);
            details.appendChild(content);
            descFragment.appendChild(details);
        }

        if (setting.type === "toggle") {
            new Setting(settingEl)
                .setName(setting.name)
                .setDesc(descFragment)
                .addToggle((toggle) =>
                    toggle
                        .setValue(this.plugin.settings[setting.key] as boolean)
                        .onChange(async (value) => {
                            (this.plugin.settings[setting.key] as boolean) =
                                value;
                            await this.plugin.saveSettings();

                            // Special handling for YAML setting
                            if (
                                setting.key === "enableYaml" &&
                                this.plugin.yamlManager
                            ) {
                                this.plugin.yamlManager.updateSettings({
                                    enableYaml: value,
                                    createdKey:
                                        this.plugin.settings.yamlCreatedKey,
                                    updatedKey:
                                        this.plugin.settings.yamlUpdatedKey,
                                    dateFormat:
                                        this.plugin.settings.yamlDateFormat,
                                });
                            }
                        }),
                );
        } else if (setting.type === "text") {
            new Setting(settingEl)
                .setName(setting.name)
                .setDesc(descFragment)
                .addText((text) =>
                    text
                        .setPlaceholder(setting.placeholder || "")
                        .setValue(this.plugin.settings[setting.key] as string)
                        .onChange(async (value) => {
                            (this.plugin.settings[setting.key] as string) =
                                value;
                            await this.plugin.saveSettings();
                        }),
                );
        }
    }

    private filterSettings(): void {
        const searchTerm = this.searchInput?.value.toLowerCase() || "";
        const sections = Array.from(
            this.tabContent?.querySelectorAll(".editor-pro-section") ?? [],
        );

        for (const section of sections) {
            const sectionEl = section as HTMLElement;
            const settings = Array.from(
                sectionEl.querySelectorAll(".editor-pro-setting-item"),
            );
            let hasVisibleSettings = false;

            for (const setting of settings) {
                const settingEl = setting as HTMLElement;
                const name = settingEl.dataset.name || "";
                const desc = settingEl.dataset.desc || "";

                const matches =
                    name.includes(searchTerm) || desc.includes(searchTerm);
                settingEl.classList.toggle("hidden", !matches);

                if (matches) {
                    hasVisibleSettings = true;
                }
            }

            // Show section if it has visible settings or if search is empty
            sectionEl.classList.toggle(
                "hidden",
                !hasVisibleSettings && searchTerm !== "",
            );

            // Auto-expand section when searching
            const toggle = sectionEl.querySelector(
                ".editor-pro-section-toggle",
            ) as HTMLElement;
            const settingsContainer = sectionEl.querySelector(
                ".editor-pro-section-settings",
            ) as HTMLElement;
            const headerEl = sectionEl.querySelector(
                ".editor-pro-section-title",
            ) as HTMLElement;

            if (searchTerm !== "" && hasVisibleSettings) {
                toggle?.classList.remove("collapsed");
                if (settingsContainer) {
                    settingsContainer.classList.remove(
                        "editor-pro-section-collapsed",
                    );
                }
                // Update ARIA state for accessibility
                if (headerEl) {
                    headerEl.setAttribute("aria-expanded", "true");
                }
            }
        }
    }

    private async applyPreset(preset: SettingsPreset) {
        new ConfirmationModal(this.app, {
            title: `切换到${preset.name}`,
            message: `您确定要应用"${preset.name}"预设吗？\n\n这将覆盖您当前的大部分设置（包括开启/关闭的功能）。此操作不可撤销。`,
            onConfirm: async () => {
                const settings = preset.settings;
                this.plugin.settings = Object.assign(
                    {},
                    this.plugin.settings,
                    settings
                );
                await this.plugin.saveSettings();
                this.display(); // Refresh UI
                new Notice(`已应用预设：${preset.name}`);
            }
        }).open();
    }
}
