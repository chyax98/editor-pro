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
            .setName('开启图片智能粘贴（重命名归档）')
            .setDesc('粘贴图片时按“笔记名+时间戳”重命名，并按 Obsidian 的附件规则写入文件，再插入 `![[...]]`。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartImagePaste)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartImagePaste = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启链接智能粘贴（自动标题）')
            .setDesc('粘贴 URL 时尽量获取标题并插入 Markdown 链接；优先使用剪贴板 HTML，不联网。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartLinkTitle)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartLinkTitle = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('允许联网抓取网页标题')
            .setDesc('当剪贴板没有标题时，尝试联网请求网页并读取 `<title>`；失败会降级为纯 URL。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSmartLinkTitleNetwork)
                .onChange(async (value) => {
                    this.plugin.settings.enableSmartLinkTitleNetwork = value;
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

        new Setting(containerEl)
            .setName('开启光标记忆（Cursor memory）')
            .setDesc('记忆并恢复每个文件的光标与滚动位置。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableCursorMemory)
                .onChange(async (value) => {
                    this.plugin.settings.enableCursorMemory = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启最近文件 HUD')
            .setDesc('提供一个最近文件选择器（命令触发）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableQuickHud)
                .onChange(async (value) => {
                    this.plugin.settings.enableQuickHud = value;
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
            .setName('开启魔法输入（自然语言日期 + 符号替换）')
            .setDesc('例如：`@tomorrow`/`@next mon`/`@下周一`；以及 `-->` → `→`（仅在光标处生效）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableMagicInput)
                .onChange(async (value) => {
                    this.plugin.settings.enableMagicInput = value;
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

        // --- 第四组：文本处理 ---
        containerEl.createEl('h3', { text: '🧹 文本处理与清理' });

        new Setting(containerEl)
            .setName('开启保存时清理（Save cleaner）')
            .setDesc('保存时自动移除行尾空格，并确保文件以换行符结尾（尽量低侵入）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSaveCleaner)
                .onChange(async (value) => {
                    this.plugin.settings.enableSaveCleaner = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启文本转换器（Text transformer）')
            .setDesc('提供大小写/排序/去空行等转换命令，并可在右键菜单中使用。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableTextTransformer)
                .onChange(async (value) => {
                    this.plugin.settings.enableTextTransformer = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启选区查找替换（Search in selection）')
            .setDesc('只在选中文本范围内做查找替换（命令与右键入口）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSearchInSelection)
                .onChange(async (value) => {
                    this.plugin.settings.enableSearchInSelection = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第五组：专注与导航 ---
        containerEl.createEl('h3', { text: '🧭 专注与导航' });

        new Setting(containerEl)
            .setName('开启状态栏统计（字数/阅读时间/选中数）')
            .setDesc('在状态栏显示统计信息（可关闭）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableStatusBarStats)
                .onChange(async (value) => {
                    this.plugin.settings.enableStatusBarStats = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启界面清理（Focus UI / Zen）')
            .setDesc('提供一个命令，用 CSS 隐藏侧边栏/状态栏等界面元素。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFocusUi)
                .onChange(async (value) => {
                    this.plugin.settings.enableFocusUi = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启浮动大纲（Floating outline）')
            .setDesc('提供一个命令，弹出极简目录（Esc 关闭）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFloatingOutline)
                .onChange(async (value) => {
                    this.plugin.settings.enableFloatingOutline = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启局部聚焦（Heading/List zoom）')
            .setDesc('提供命令：聚焦当前标题段落 / 聚焦当前列表块（在弹窗里编辑并应用回原文）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableZoom)
                .onChange(async (value) => {
                    this.plugin.settings.enableZoom = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启文档流看板（Flow board）')
            .setDesc('提供命令：用“标题=列、列表块=卡片”的方式重组文章结构（拖拽会改写当前文档）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFlowBoard)
                .onChange(async (value) => {
                    this.plugin.settings.enableFlowBoard = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第六组：小工具 ---
        containerEl.createEl('h3', { text: '🧰 小工具' });

        new Setting(containerEl)
            .setName('开启脚注助手（Footnotes）')
            .setDesc('提供命令：插入 `[^n]` 并在文末追加 `[^n]: `。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFootnotes)
                .onChange(async (value) => {
                    this.plugin.settings.enableFootnotes = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启行内计算（Inline calc）')
            .setDesc('提供命令：选中表达式后计算并替换（仅支持 + - * / ^ 和括号）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableInlineCalc)
                .onChange(async (value) => {
                    this.plugin.settings.enableInlineCalc = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启随机生成器（Random generator）')
            .setDesc('提供命令：插入 UUID / 随机整数 / 掷骰子。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRandomGenerator)
                .onChange(async (value) => {
                    this.plugin.settings.enableRandomGenerator = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第七组：文件列表增强 ---
        containerEl.createEl('h3', { text: '🎨 文件列表增强' });

        new Setting(containerEl)
            .setName('开启 Frontmatter 图标/头图（Inline decorator）')
            .setDesc('从 Frontmatter 读取 `icon`/`banner`，在文件列表展示图标，并在笔记顶部展示头图（轻量实现）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableInlineDecorator)
                .onChange(async (value) => {
                    this.plugin.settings.enableInlineDecorator = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('开启文件树高亮（File tree highlight）')
            .setDesc('提供命令：为文件/文件夹加高亮标记（用于项目文件夹）。')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFileTreeHighlight)
                .onChange(async (value) => {
                    this.plugin.settings.enableFileTreeHighlight = value;
                    await this.plugin.saveSettings();
                }));

        // --- 第八组：自动化 ---
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
