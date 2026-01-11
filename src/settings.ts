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

    yamlCreatedKey: 'created',
    yamlUpdatedKey: 'updated',
    yamlDateFormat: 'YYYY-MM-DD HH:mm',
    kanbanFilePath: 'Kanban.board'
}

export class EditorProSettingTab extends PluginSettingTab {
    plugin: EditorProPlugin;

    constructor(app: App, plugin: EditorProPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        
        containerEl.createEl('h1', { text: 'Editor Pro 插件设置' });

        // --- 0：看板 ---
        containerEl.createEl('h3', { text: '📋 看板' });

        new Setting(containerEl)
            .setName('开启项目看板（.board）')
            .setDesc('提供侧边栏看板入口与 `.board` 视图。部分开关需要重载插件生效。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableBoard)
                .onChange(async (value) => {
                    this.plugin.settings.enableBoard = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第一组：核心编辑 ---
        containerEl.createEl('h3', { text: '📝 核心编辑与格式化' });

        new Setting(containerEl)
            .setName('开启键盘行操作（Keyshots）')
            .setDesc('提供上移/下移/复制/删除/选中当前行等命令（需在 **Settings → Hotkeys** 绑定）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableKeyshots)
                .onChange(async (value) => {
                    this.plugin.settings.enableKeyshots = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启输入增强（自动配对/智能退格/中英空格）')
            .setDesc('自动配对括号与引号；在 `(|)` 中退格删除一对；中英混排自动加空格。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartTyping)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartTyping = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启编辑器导航增强（表格 Tab + Shift+Enter 跳出）')
            .setDesc('表格单元格 Tab/Shift+Tab 跳转；引用/Callout 内 Shift+Enter 快速跳出。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableEditorNavigation)
                .onChange(async (value) => {
                    this.plugin.settings.enableEditorNavigation = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启大纲编辑（Outliner）')
            .setDesc('在列表项上使用 Tab/Shift+Tab 缩进/反缩进；提供折叠命令。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableOutliner)
                .onChange(async (value) => {
                    this.plugin.settings.enableOutliner = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启表格操作（Advanced Tables Lite）')
            .setDesc('提供表格列插入/删除、对齐、格式化等命令与右键入口（不自动改写）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTableOps)
                .onChange(async (value) => {
                    this.plugin.settings.enableTableOps = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启智能格式切换')
            .setDesc('智能处理加粗、斜体、行内代码（按下快捷键时，若光标在标记内则自动取消，避免符号叠加）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartToggle)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartToggle = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启斜杠命令')
            .setDesc('支持通过 "/"、"、" 或反斜杠（\\）触发命令菜单；支持拼音首字母搜索（MVP）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSlashCommand)
                .onChange(async (value) => {
                    this.plugin.settings.enableSlashCommand = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启右键菜单增强')
            .setDesc('在编辑器右键菜单中添加 "块包装" 和 "表格快速操作"。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableContextMenu)
                .onChange(async (value) => {
                    this.plugin.settings.enableContextMenu = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启智能粘贴链接')
            .setDesc('选中文字后粘贴 URL，将自动变为 Markdown 链接（例如：选中 "Obsidian" 后粘贴 https://... -> [Obsidian](https://...)）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartPasteUrl)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartPasteUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启打字机滚动（光标居中）')
            .setDesc('让光标行尽量保持在屏幕中间，适合长文写作。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTypewriterScroll)
                .onChange(async (value) => {
                    this.plugin.settings.enableTypewriterScroll = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第二组：任务与智能输入 ---
        containerEl.createEl('h3', { text: '✅ 任务与智能输入' });

        new Setting(containerEl)
            .setName('开启任务快捷键')
            .setDesc('提供任务状态循环命令（普通文本 / 待办 / 完成），可在 Obsidian 的快捷键设置中自行绑定。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTaskHotkeys)
                .onChange(async (value) => {
                    this.plugin.settings.enableTaskHotkeys = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启智能输入展开 (@today / @time / @now)')
            .setDesc('输入特殊片段后自动展开为日期/时间。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartInput)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartInput = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启到期高亮 (@due)')
            .setDesc('在编辑器中高亮 `@due(YYYY-MM-DD)`：过期标红、今天标黄。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableOverdueHighlighter)
                .onChange(async (value) => {
                    this.plugin.settings.enableOverdueHighlighter = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('看板文件路径')
            .setDesc('库内相对路径（例如: Kanban.board 或 Projects/Kanban.board）。点击侧边栏图标将创建/打开此文件。')
            .addText(text => text
                .setPlaceholder('Kanban.board')
                .setValue(this.plugin.settings.kanbanFilePath)
                .onChange(async (value) => {
                    this.plugin.settings.kanbanFilePath = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第三组：标题管理 ---
        containerEl.createEl('h3', { text: '⌨️ 标题快捷键' });

        new Setting(containerEl)
            .setName('开启标题快捷转换')
            .setDesc('提供设置标题等级的命令（1~6 级），可在 Obsidian 的快捷键设置中自行绑定。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHeadingHotkeys)
                .onChange(async (value) => {
                    this.plugin.settings.enableHeadingHotkeys = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第四组：自动化 ---
        containerEl.createEl('h3', { text: '🤖 自动化 (YAML)' });

        new Setting(containerEl)
            .setName('开启 YAML 自动更新')
            .setDesc('自动维护笔记的 "创建时间" 和 "修改时间" 元数据（Frontmatter）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableYaml)
                .onChange(async (value) => {
                    this.plugin.settings.enableYaml = value;
                    if (this.plugin.yamlManager) {
                        this.plugin.yamlManager.updateSettings({
                             enableYaml: value,
                             createdKey: this.plugin.settings.yamlCreatedKey,
                             updatedKey: this.plugin.settings.yamlUpdatedKey,
                             dateFormat: this.plugin.settings.yamlDateFormat
                        });
                    }
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('日期格式')
            .setDesc('时间戳的显示格式 (例如: YYYY-MM-DD HH:mm)。')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD HH:mm')
                .setValue(this.plugin.settings.yamlDateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.yamlDateFormat = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第五组：预览渲染 ---
        containerEl.createEl('h3', { text: '🖼️ 预览渲染' });

        new Setting(containerEl)
            .setName('开启 Infographic 渲染器')
            .setDesc('在预览/阅读模式渲染 ` ```infographic` 代码块。关闭后表示“禁用渲染器”，需要重载插件生效。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableInfographicRenderer)
                .onChange(async (value) => {
                    this.plugin.settings.enableInfographicRenderer = value;
                    await this.plugin.saveSettings();
                }));
    }
}
