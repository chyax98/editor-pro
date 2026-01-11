import { App, PluginSettingTab, Setting } from "obsidian";
import EditorProPlugin from "./main";

export interface EditorProSettings {
    enableBoard: boolean;

    enableSmartToggle: boolean;
    enableSlashCommand: boolean;
    enableContextMenu: boolean;
    enableHeadingHotkeys: boolean;
    enableTaskHotkeys: boolean;
    enableYaml: boolean;
    enableSmartPasteUrl: boolean;
    enableTypewriterScroll: boolean;
    enableKeyshots: boolean;
    enableSmartTyping: boolean;
    enableSmartInput: boolean;
    enableEditorNavigation: boolean;
    enableOutliner: boolean;
    enableTableOps: boolean;
    enableOverdueHighlighter: boolean;
    enableInfographicRenderer: boolean;
    enableSmartImagePaste: boolean;
    enableSmartLinkTitle: boolean;
    enableSmartLinkTitleNetwork: boolean;
    enableCursorMemory: boolean;
    enableQuickHud: boolean;
    enableMagicInput: boolean;

    enableSaveCleaner: boolean;
    enableTextTransformer: boolean;
    enableSearchInSelection: boolean;

    enableStatusBarStats: boolean;
    enableFocusUi: boolean;
    enableFloatingOutline: boolean;
    enableZoom: boolean;
    enableFlowBoard: boolean;

    enableFootnotes: boolean;
    enableInlineCalc: boolean;
    enableRandomGenerator: boolean;

    enableInlineDecorator: boolean;
    enableFileTreeHighlight: boolean;

    yamlCreatedKey: string;
    yamlUpdatedKey: string;
    yamlDateFormat: string;
    kanbanFilePath: string;
}

export const DEFAULT_SETTINGS: EditorProSettings = {
    enableBoard: true,

    enableSmartToggle: true,
    enableSlashCommand: true,
    enableContextMenu: true,
    enableHeadingHotkeys: true,
    enableTaskHotkeys: true,
    enableYaml: true,
    enableSmartPasteUrl: true,
    enableTypewriterScroll: true,
    enableKeyshots: true,
    enableSmartTyping: true,
    enableSmartInput: true,
    enableEditorNavigation: true,
    enableOutliner: true,
    enableTableOps: true,
    enableOverdueHighlighter: true,
    enableInfographicRenderer: true,
    enableSmartImagePaste: true,
    enableSmartLinkTitle: true,
    enableSmartLinkTitleNetwork: false,
    enableCursorMemory: true,
    enableQuickHud: true,
    enableMagicInput: true,

    enableSaveCleaner: true,
    enableTextTransformer: true,
    enableSearchInSelection: true,

    enableStatusBarStats: true,
    enableFocusUi: true,
    enableFloatingOutline: true,
    enableZoom: true,
    enableFlowBoard: true,

    enableFootnotes: true,
    enableInlineCalc: true,
    enableRandomGenerator: true,

    enableInlineDecorator: true,
    enableFileTreeHighlight: true,

    yamlCreatedKey: 'created',
    yamlUpdatedKey: 'updated',
    yamlDateFormat: 'YYYY-MM-DD HH:mm',
    kanbanFilePath: 'Kanban.board'
}

interface SettingItem {
    name: string;
    desc: string;
    key: keyof EditorProSettings;
    type: 'toggle' | 'text';
    placeholder?: string;
}

interface SettingSection {
    title: string;
    icon: string;
    settings: SettingItem[];
}

const SECTIONS: SettingSection[] = [
    {
        title: '看板',
        icon: '📋',
        settings: [
            { name: '开启项目看板（.board）', desc: '提供侧边栏看板入口与 `.board` 视图。部分开关需要重载插件生效。', key: 'enableBoard', type: 'toggle' },
        ],
    },
    {
        title: '核心编辑与格式化',
        icon: '📝',
        settings: [
            { name: '开启键盘行操作（Keyshots）', desc: '提供上移/下移/复制/删除/选中当前行等命令（需在 **Settings → Hotkeys** 绑定）。', key: 'enableKeyshots', type: 'toggle' },
            { name: '开启输入增强（自动配对/智能退格/中英空格）', desc: '自动配对括号与引号；在 `(|)` 中退格删除一对；中英混排自动加空格。', key: 'enableSmartTyping', type: 'toggle' },
            { name: '开启编辑器导航增强（表格 Tab + Shift+Enter 跳出）', desc: '表格单元格 Tab/Shift+Tab 跳转；引用/Callout 内 Shift+Enter 快速跳出。', key: 'enableEditorNavigation', type: 'toggle' },
            { name: '开启大纲编辑（Outliner）', desc: '在列表项上使用 Tab/Shift+Tab 缩进/反缩进；提供折叠命令。', key: 'enableOutliner', type: 'toggle' },
            { name: '开启表格操作（Advanced Tables Lite）', desc: '提供表格列插入/删除、对齐、格式化等命令与右键入口（不自动改写）。', key: 'enableTableOps', type: 'toggle' },
            { name: '开启智能格式切换', desc: '智能处理加粗、斜体、行内代码（按下快捷键时，若光标在标记内则自动取消，避免符号叠加）。', key: 'enableSmartToggle', type: 'toggle' },
            { name: '开启斜杠命令', desc: '支持通过 "/"、"、" 或反斜杠（\\）触发命令菜单；支持拼音首字母搜索（MVP）。', key: 'enableSlashCommand', type: 'toggle' },
            { name: '开启右键菜单增强', desc: '在编辑器右键菜单中添加 "块包装" 和 "表格快速操作"。', key: 'enableContextMenu', type: 'toggle' },
            { name: '开启智能粘贴链接', desc: '选中文字后粘贴 URL，将自动变为 Markdown 链接（例如：选中 "Obsidian" 后粘贴 https://... -> [Obsidian](https://...)）。', key: 'enableSmartPasteUrl', type: 'toggle' },
            { name: '开启图片智能粘贴（重命名归档）', desc: '粘贴图片时按"笔记名+时间戳"重命名，并按 Obsidian 的附件规则写入文件，再插入 `![[...]]`。', key: 'enableSmartImagePaste', type: 'toggle' },
            { name: '开启链接智能粘贴（自动标题）', desc: '粘贴 URL 时尽量获取标题并插入 Markdown 链接；优先使用剪贴板 HTML，不联网。', key: 'enableSmartLinkTitle', type: 'toggle' },
            { name: '允许联网抓取网页标题', desc: '当剪贴板没有标题时，尝试联网请求网页并读取 `<title>`；失败会降级为纯 URL。', key: 'enableSmartLinkTitleNetwork', type: 'toggle' },
            { name: '开启打字机滚动（光标居中）', desc: '让光标行尽量保持在屏幕中间，适合长文写作。', key: 'enableTypewriterScroll', type: 'toggle' },
            { name: '开启光标记忆（Cursor memory）', desc: '记忆并恢复每个文件的光标与滚动位置。', key: 'enableCursorMemory', type: 'toggle' },
            { name: '开启最近文件 HUD', desc: '提供一个最近文件选择器（命令触发）。', key: 'enableQuickHud', type: 'toggle' },
        ],
    },
    {
        title: '任务与智能输入',
        icon: '✅',
        settings: [
            { name: '开启任务快捷键', desc: '提供任务状态循环命令（普通文本 / 待办 / 完成），可在 Obsidian 的快捷键设置中自行绑定。', key: 'enableTaskHotkeys', type: 'toggle' },
            { name: '开启智能输入展开 (@today / @time / @now)', desc: '输入特殊片段后自动展开为日期/时间。', key: 'enableSmartInput', type: 'toggle' },
            { name: '开启魔法输入（自然语言日期 + 符号替换）', desc: '例如：`@tomorrow`/`@next mon`/`@下周一`；以及 `-->` → `→`（仅在光标处生效）。', key: 'enableMagicInput', type: 'toggle' },
            { name: '开启到期高亮 (@due)', desc: '在编辑器中高亮 `@due(YYYY-MM-DD)`：过期标红、今天标黄。', key: 'enableOverdueHighlighter', type: 'toggle' },
            { name: '看板文件路径', desc: '库内相对路径（例如: Kanban.board 或 Projects/Kanban.board）。点击侧边栏图标将创建/打开此文件。', key: 'kanbanFilePath', type: 'text', placeholder: 'Kanban.board' },
        ],
    },
    {
        title: '标题快捷键',
        icon: '⌨️',
        settings: [
            { name: '开启标题快捷转换', desc: '提供设置标题等级的命令（1~6 级），可在 Obsidian 的快捷键设置中自行绑定。', key: 'enableHeadingHotkeys', type: 'toggle' },
        ],
    },
    {
        title: '文本处理与清理',
        icon: '🧹',
        settings: [
            { name: '开启保存时清理（Save cleaner）', desc: '保存时自动移除行尾空格，并确保文件以换行符结尾（尽量低侵入）。', key: 'enableSaveCleaner', type: 'toggle' },
            { name: '开启文本转换器（Text transformer）', desc: '提供大小写/排序/去空行等转换命令，并可在右键菜单中使用。', key: 'enableTextTransformer', type: 'toggle' },
            { name: '开启选区查找替换（Search in selection）', desc: '只在选中文本范围内做查找替换（命令与右键入口）。', key: 'enableSearchInSelection', type: 'toggle' },
        ],
    },
    {
        title: '专注与导航',
        icon: '🧭',
        settings: [
            { name: '开启状态栏统计（字数/阅读时间/选中数）', desc: '在状态栏显示统计信息（可关闭）。', key: 'enableStatusBarStats', type: 'toggle' },
            { name: '开启界面清理（Focus UI / Zen）', desc: '提供一个命令，用 CSS 隐藏侧边栏/状态栏等界面元素。', key: 'enableFocusUi', type: 'toggle' },
            { name: '开启浮动大纲（Floating outline）', desc: '提供一个命令，弹出极简目录（Esc 关闭）。', key: 'enableFloatingOutline', type: 'toggle' },
            { name: '开启局部聚焦（Heading/List zoom）', desc: '提供命令：聚焦当前标题段落 / 聚焦当前列表块（在弹窗里编辑并应用回原文）。', key: 'enableZoom', type: 'toggle' },
            { name: '开启文档流看板（Flow board）', desc: '提供命令：用"标题=列、列表块=卡片"的方式重组文章结构（拖拽会改写当前文档）。', key: 'enableFlowBoard', type: 'toggle' },
        ],
    },
    {
        title: '小工具',
        icon: '🧰',
        settings: [
            { name: '开启脚注助手（Footnotes）', desc: '提供命令：插入 `[^n]` 并在文末追加 `[^n]: `。', key: 'enableFootnotes', type: 'toggle' },
            { name: '开启行内计算（Inline calc）', desc: '提供命令：选中表达式后计算并替换（仅支持 + - * / ^ 和括号）。', key: 'enableInlineCalc', type: 'toggle' },
            { name: '开启随机生成器（Random generator）', desc: '提供命令：插入 UUID / 随机整数 / 掷骰子。', key: 'enableRandomGenerator', type: 'toggle' },
        ],
    },
    {
        title: '文件列表增强',
        icon: '🎨',
        settings: [
            { name: '开启 Frontmatter 图标/头图（Inline decorator）', desc: '从 Frontmatter 读取 `icon`/`banner`，在文件列表展示图标，并在笔记顶部展示头图（轻量实现）。', key: 'enableInlineDecorator', type: 'toggle' },
            { name: '开启文件树高亮（File tree highlight）', desc: '提供命令：为文件/文件夹加高亮标记（用于项目文件夹）。', key: 'enableFileTreeHighlight', type: 'toggle' },
        ],
    },
    {
        title: '自动化 (YAML)',
        icon: '🤖',
        settings: [
            { name: '开启 YAML 自动更新', desc: '自动维护笔记的 "创建时间" 和 "修改时间" 元数据（Frontmatter）。', key: 'enableYaml', type: 'toggle' },
            { name: '日期格式', desc: '时间戳的显示格式 (例如: YYYY-MM-DD HH:mm)。', key: 'yamlDateFormat', type: 'text', placeholder: 'YYYY-MM-DD HH:mm' },
        ],
    },
    {
        title: '预览渲染',
        icon: '🖼️',
        settings: [
            { name: '开启 Infographic 渲染器', desc: '在预览/阅读模式渲染 ` ```infographic` 代码块。关闭后表示"禁用渲染器"，需要重载插件生效。', key: 'enableInfographicRenderer', type: 'toggle' },
        ],
    },
];

export class EditorProSettingTab extends PluginSettingTab {
    plugin: EditorProPlugin;
    private searchInput?: HTMLInputElement;
    private settingElements: HTMLElement[] = [];

    constructor(app: App, plugin: EditorProPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Header
        containerEl.createEl('h1', { text: 'Editor Pro 插件设置' });

        // Search bar
        const searchContainer = containerEl.createDiv({ cls: 'editor-pro-settings-search' });
        searchContainer.createEl('input', {
            type: 'text',
            placeholder: '🔍 搜索设置... (输入关键词过滤)',
            cls: 'editor-pro-search-input'
        }, (el) => {
            this.searchInput = el;
            el.addEventListener('input', () => this.filterSettings());
        });

        // Add search styles
        this.addSearchStyles(containerEl);

        // Render all settings
        this.renderAllSettings(containerEl);
    }

    private addSearchStyles(container: HTMLElement): void {
        const doc = container.ownerDocument;
        if (!doc) return;

        if (doc.getElementById('editor-pro-settings-styles')) {
            return; // Already added
        }

        const style = container.createEl('style', { attr: { id: 'editor-pro-settings-styles' } });
        style.innerHTML = `
            .editor-pro-settings-search {
                margin: 16px 0;
                padding: 0;
            }
            .editor-pro-search-input {
                width: 100%;
                padding: 8px 12px;
                font-size: 14px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                background: var(--background-primary);
                color: var(--text-normal);
            }
            .editor-pro-search-input:focus {
                outline: none;
                border-color: var(--interactive-accent);
                box-shadow: 0 0 0 2px var(--interactive-accent-hover);
            }
            .editor-pro-setting-item {
                transition: opacity 0.2s ease;
            }
            .editor-pro-setting-item.hidden {
                display: none;
            }
            .editor-pro-section.hidden {
                display: none;
            }
            .editor-pro-section-title {
                cursor: pointer;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .editor-pro-section-title:hover {
                opacity: 0.8;
            }
            .editor-pro-section-toggle {
                font-size: 12px;
                transition: transform 0.2s ease;
            }
            .editor-pro-section-toggle.collapsed {
                transform: rotate(-90deg);
            }
        `;
    }

    private renderAllSettings(container: HTMLElement): void {
        this.settingElements = [];

        for (const section of SECTIONS) {
            const sectionEl = this.renderSection(container, section);
            this.settingElements.push(sectionEl);
        }
    }

    private renderSection(container: HTMLElement, section: SettingSection): HTMLElement {
        const sectionContainer = container.createDiv({ cls: 'editor-pro-section' });
        sectionContainer.dataset.section = section.title;

        // Section header with collapse toggle
        const headerEl = sectionContainer.createEl('h3', {
            cls: 'editor-pro-section-title'
        });
        headerEl.innerHTML = `
            <span class="editor-pro-section-toggle">▼</span>
            <span>${section.icon} ${section.title}</span>
        `;

        // Toggle collapse on click
        const toggle = headerEl.querySelector('.editor-pro-section-toggle') as HTMLElement;
        let isCollapsed = false;

        headerEl.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            toggle.classList.toggle('collapsed', isCollapsed);

            const settingsContainer = sectionContainer.querySelector('.editor-pro-section-settings') as HTMLElement;
            if (settingsContainer) {
                settingsContainer.style.display = isCollapsed ? 'none' : 'block';
            }
        });

        // Settings container
        const settingsContainer = sectionContainer.createDiv({ cls: 'editor-pro-section-settings' });

        // Render each setting in the section
        for (const setting of section.settings) {
            this.renderSetting(settingsContainer, setting);
        }

        return sectionContainer;
    }

    private renderSetting(container: HTMLElement, setting: SettingItem): void {
        const settingEl = container.createDiv({ cls: 'editor-pro-setting-item' });
        settingEl.dataset.name = setting.name.toLowerCase();
        settingEl.dataset.desc = setting.desc.toLowerCase();

        if (setting.type === 'toggle') {
            new Setting(settingEl)
                .setName(setting.name)
                .setDesc(setting.desc)
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings[setting.key] as boolean)
                    .onChange(async (value) => {
                        (this.plugin.settings[setting.key] as boolean) = value;
                        await this.plugin.saveSettings();

                        // Special handling for YAML setting
                        if (setting.key === 'enableYaml' && this.plugin.yamlManager) {
                            this.plugin.yamlManager.updateSettings({
                                enableYaml: value,
                                createdKey: this.plugin.settings.yamlCreatedKey,
                                updatedKey: this.plugin.settings.yamlUpdatedKey,
                                dateFormat: this.plugin.settings.yamlDateFormat
                            });
                        }
                    }));
        } else if (setting.type === 'text') {
            new Setting(settingEl)
                .setName(setting.name)
                .setDesc(setting.desc)
                .addText(text => text
                    .setPlaceholder(setting.placeholder || '')
                    .setValue(this.plugin.settings[setting.key] as string)
                    .onChange(async (value) => {
                        (this.plugin.settings[setting.key] as string) = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }

    private filterSettings(): void {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const sections = Array.from(document.querySelectorAll('.editor-pro-section'));

        for (const section of sections) {
            const sectionEl = section as HTMLElement;
            const settings = Array.from(sectionEl.querySelectorAll('.editor-pro-setting-item'));
            let hasVisibleSettings = false;

            for (const setting of settings) {
                const settingEl = setting as HTMLElement;
                const name = settingEl.dataset.name || '';
                const desc = settingEl.dataset.desc || '';

                const matches = name.includes(searchTerm) || desc.includes(searchTerm);
                settingEl.classList.toggle('hidden', !matches);

                if (matches) {
                    hasVisibleSettings = true;
                }
            }

            // Show section if it has visible settings or if search is empty
            sectionEl.classList.toggle('hidden', !hasVisibleSettings && searchTerm !== '');

            // Auto-expand section when searching
            const toggle = sectionEl.querySelector('.editor-pro-section-toggle') as HTMLElement;
            const settingsContainer = sectionEl.querySelector('.editor-pro-section-settings') as HTMLElement;

            if (searchTerm !== '' && hasVisibleSettings) {
                toggle?.classList.remove('collapsed');
                if (settingsContainer) {
                    settingsContainer.style.display = 'block';
                }
            }
        }
    }
}
