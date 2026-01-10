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
    yamlDateFormat: 'YYYY-MM-DD HH:mm'
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
        
        containerEl.createEl('h2', { text: 'Editor Pro Settings' });

        new Setting(containerEl)
            .setName('Enable Smart Toggle')
            .setDesc('Enable smart formatting for Bold, Italic, etc. (Cmd+B/I/etc.)')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartToggle)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartToggle = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable Slash Command')
            .setDesc('Trigger commands with "/" or "、"')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSlashCommand)
                .onChange(async (value) => {
                    this.plugin.settings.enableSlashCommand = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Enable Context Menu')
            .setDesc('Add "Format" and "Wrap" options to editor right-click menu')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableContextMenu)
                .onChange(async (value) => {
                    this.plugin.settings.enableContextMenu = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable Heading Hotkeys')
            .setDesc('Use Cmd+1~6 for headings')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHeadingHotkeys)
                .onChange(async (value) => {
                    this.plugin.settings.enableHeadingHotkeys = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Enable Task Hotkeys')
            .setDesc('Use Cmd+L to toggle task status')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTaskHotkeys)
                .onChange(async (value) => {
                    this.plugin.settings.enableTaskHotkeys = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'YAML Frontmatter' });

        new Setting(containerEl)
            .setName('Enable YAML Auto-update')
            .setDesc('Automatically manage created/updated fields')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableYaml)
                .onChange(async (value) => {
                    this.plugin.settings.enableYaml = value;
                    this.plugin.yamlManager.updateSettings({
                         enableYaml: value,
                         createdKey: this.plugin.settings.yamlCreatedKey,
                         updatedKey: this.plugin.settings.yamlUpdatedKey,
                         dateFormat: this.plugin.settings.yamlDateFormat
                    });
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Date Format')
            .setDesc('Format for dates (e.g. YYYY-MM-DD HH:mm)')
            .addText(text => text
                .setValue(this.plugin.settings.yamlDateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.yamlDateFormat = value;
                    await this.plugin.saveSettings();
                }));
    }
}