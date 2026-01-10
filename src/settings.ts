import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
    enableSmartToggle: boolean;
    enableSlashCommand: boolean;
    enableContextMenu: boolean;
    enableHeadingHotkeys: boolean;
    enableTaskHotkeys: boolean;
    enableYaml: boolean;
    yamlCreatedKey: string;
    yamlUpdatedKey: string;
    yamlDateFormat: string;
    kanbanFilePath: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
    enableSmartToggle: true,
    enableSlashCommand: true,
    enableContextMenu: true,
    enableHeadingHotkeys: true,
    enableTaskHotkeys: true,
    enableYaml: true,
    yamlCreatedKey: 'created',
    yamlUpdatedKey: 'updated',
    yamlDateFormat: 'YYYY-MM-DD HH:mm',
    kanbanFilePath: 'Kanban.board'
}

export class EditorProSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        
        containerEl.createEl('h1', { text: 'Editor Pro 插件设置' });

        // --- 第一组：核心编辑 ---
        containerEl.createEl('h3', { text: '📝 核心编辑与格式化' });
        
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
            .setDesc('支持通过 "/" 或中文顿号 "、" 触发命令菜单。支持全量拼音首字母搜索。')
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

        // --- 第二组：看板与任务 ---
        containerEl.createEl('h3', { text: '📋 看板与任务管理' });

        new Setting(containerEl)
            .setName('开启任务快捷键')
            .setDesc('Cmd+L 循环切换任务状态（普通文本 / 待办 / 完成）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTaskHotkeys)
                .onChange(async (value) => {
                    this.plugin.settings.enableTaskHotkeys = value;
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
            .setDesc('使用 Cmd+1~6 快速设置当前行的标题等级。')
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
    }
}
