import { App, PluginSettingTab, Setting } from "obsidian";
import EditorProPlugin from "./main";

export interface EditorProSettings {

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

    enableOverdueHighlighter: boolean;
    enableInfographicRenderer: boolean;
    enableVegaLite: boolean;
    enableGraphviz: boolean;
    enableECharts: boolean;
    enableSmartImagePaste: boolean;
    enableAutoDownloadImages: boolean; // Auto download remote images
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


    enableFootnotes: boolean;

    enableInlineCalc: boolean;
    enableRandomGenerator: boolean;

    enableInlineDecorator: boolean;
    enableFileTreeHighlight: boolean;

    yamlCreatedKey: string;
    yamlUpdatedKey: string;
    yamlDateFormat: string;

    // 模板设置
    templateFolderPath: string;
}



export const DEFAULT_SETTINGS: EditorProSettings = {
    // 核心编辑功能（默认开启）
    enableSmartToggle: true,
    enableKeyshots: true,
    enableSmartTyping: true,
    enableEditorNavigation: true,
    enableOutliner: true,

    enableTaskHotkeys: true,
    enableHeadingHotkeys: true,
    enableContextMenu: true,
    enableSmartPasteUrl: true,
    enableTextTransformer: true,

    // 智能输入功能（默认开启）
    enableSmartInput: true,
    enableSlashCommand: true,

    // 辅助功能（默认关闭，降低侵入性）
    enableYaml: false,
    enableSaveCleaner: false,
    enableSmartLinkTitle: false,
    enableSmartLinkTitleNetwork: false,
    enableSmartImagePaste: false,
    enableAutoDownloadImages: false,
    enableTypewriterScroll: false,
    enableCursorMemory: false,
    enableMagicInput: false,
    enableOverdueHighlighter: false,

    // UI 功能（默认关闭）
    enableStatusBarStats: false,
    enableFocusUi: false,
    enableFloatingOutline: false,
    enableZoom: false,
    enableQuickHud: false,

    // 小工具（默认关闭）
    enableFootnotes: false,
    enableInlineCalc: false,
    enableRandomGenerator: false,
    enableSearchInSelection: false,

    enableInfographicRenderer: false,
    enableVegaLite: false,
    enableGraphviz: false,
    enableECharts: false,


    // 文件列表增强（默认关闭）
    enableInlineDecorator: false,
    enableFileTreeHighlight: false,

    // YAML 配置
    yamlCreatedKey: 'created',
    yamlUpdatedKey: 'updated',
    yamlDateFormat: 'YYYY-MM-DD HH:mm',

    // 模板配置
    templateFolderPath: 'Templates',
}


interface SettingItem {
    name: string;
    desc: string;
    longDesc?: string; // 详细说明（可折叠）
    key: keyof EditorProSettings;
    type: 'toggle' | 'text';
    placeholder?: string;
    tooltip?: string; // 额外的悬停提示信息
}

interface SettingSection {
    title: string;
    icon: string;
    settings: SettingItem[];
}

const SECTIONS: SettingSection[] = [
    {
        title: '基础编辑',
        icon: '✏️',
        settings: [
            { name: '开启键盘行操作（Keyshots）', desc: '提供类 IDE 的行操作命令：上移/下移/复制/删除/选中当前行。在 Settings → Hotkeys 搜索 "Editor Pro" 绑定快捷键（推荐：Alt+↑/↓/D）。', key: 'enableKeyshots', type: 'toggle' },
            { name: '开启输入增强（自动配对/智能退格/中英空格）', desc: '输入 `(` 自动补全 `)`；选中文字后输入 `(` 自动包裹；在 `(|)` 中按退格同时删除两个符号；中英文之间自动加空格。', key: 'enableSmartTyping', type: 'toggle' },
            { name: '开启编辑器导航增强（Shift+Enter 跳出）', desc: '在引用块（> 开头）或 Callout 内按 Shift+Enter，快速跳出到下一行普通文本，无需手动删除 > 符号。', key: 'enableEditorNavigation', type: 'toggle' },
            { name: '开启大纲编辑（Outliner）', desc: '在列表项上按 Tab 缩进，Shift+Tab 反缩进（会连带移动子项）。还提供“折叠/展开”命令用于快速缩放列表块。', key: 'enableOutliner', type: 'toggle' },

        ],
    },
    {
        title: '格式化与转换',
        icon: '🎨',
        settings: [
            { name: '开启智能格式切换', desc: '智能切换加粗/斜体/删除线/高亮/行内代码：光标在已格式化文字内按快捷键会取消格式，而不是叠加符号。需在 Hotkeys 中绑定快捷键。', key: 'enableSmartToggle', type: 'toggle' },
            { name: '开启文本转换器（Text transformer）', desc: '提供文本转换命令：大写/小写/标题格式/句首大写、排序行、去除空行、去除行尾空格、合并为一行。可通过命令面板或右键菜单使用。', key: 'enableTextTransformer', type: 'toggle' },
            {
                name: '开启保存时清理（Save cleaner）',
                desc: '保存时自动移除行尾空格，并确保文件以换行符结尾（尽量低侵入）。⚠️ 注意：与 YAML 自动更新同时使用可能产生冲突。',
                longDesc: '此功能会在文件保存（Ctrl+S）时触发。\n它会扫描每一行，移除末尾多余的空白字符，并确保文件最后一行是空行（POSIX 标准）。\n\n冲突警告：\n如果同时开启了 "YAML 自动更新" 或其他会在保存时修改文件的插件（如 Linter），可能会导致竞争冲突（文件被多次写入）。建议排查是否与其他插件功能重叠。',
                key: 'enableSaveCleaner',
                type: 'toggle'
            },
        ],
    },
    {
        title: '快捷键与命令',
        icon: '⌨️',
        settings: [
            { name: '开启斜杠命令', desc: '支持通过 "/"、"、" 或反斜杠（\\）触发命令菜单；支持拼音首字母搜索（MVP）。', key: 'enableSlashCommand', type: 'toggle' },
            { name: '开启智能输入展开 (@today / @time)', desc: '输入 `@today` 展开为当前日期，`@time` 展开为当前时间，`@now` 展开为日期+时间。输入后自动替换，无需按键确认。', key: 'enableSmartInput', type: 'toggle' },
            { name: '开启任务快捷键', desc: '提供任务状态循环命令（普通文本 / 待办 / 完成），可在 Obsidian 的快捷键设置中自行绑定。', key: 'enableTaskHotkeys', type: 'toggle' },
            { name: '开启标题快捷转换', desc: '提供设置标题等级的命令（1~6 级），可在 Obsidian 的快捷键设置中自行绑定。', key: 'enableHeadingHotkeys', type: 'toggle' },
        ],
    },
    {
        title: '智能粘贴',
        icon: '📋',
        settings: [
            { name: '开启智能粘贴链接', desc: '选中文字后粘贴 URL，将自动变为 Markdown 链接（例如：选中 "Obsidian" 后粘贴 https://... -> [Obsidian](https://...)）。', key: 'enableSmartPasteUrl', type: 'toggle' },
            { name: '开启链接智能粘贴（自动标题）', desc: '粘贴 URL 时尽量获取标题并插入 Markdown 链接；优先使用剪贴板 HTML，不联网。', key: 'enableSmartLinkTitle', type: 'toggle' },
            {
                name: '允许联网抓取网页标题',
                desc: '当剪贴板没有标题时，尝试联网请求网页并读取 `<title>`；失败会降级为纯 URL。⚠️ 需要网络访问，已阻止内网地址保护隐私。',
                longDesc: '工作原理：\n插件会发送 HTTP GET 请求到目标 URL，解析返回的 HTML 寻找 <title> 标签。\n\n隐私与安全：\n1. 请求直接从您的本地机器发出，不经过任何中间服务器。\n2. 已内置黑名单，禁止请求局域网 IP（如 192.168.x.x, 127.0.0.1）以防止 SSRF 攻击。\n3. 部分网站（如 Twitter/X）可能需要 cookies 或有反爬虫机制，可能无法获取标题。',
                key: 'enableSmartLinkTitleNetwork',
                type: 'toggle'
            },
            { name: '开启图片智能粘贴（重命名归档）', desc: '粘贴图片时按"笔记名+时间戳"重命名，并按 Obsidian 的附件规则写入文件，再插入 `![[...]]`。', key: 'enableSmartImagePaste', type: 'toggle' },
            {
                name: '开启自动下载远程图片',
                desc: '粘贴包含远程图片链接的文本时，自动将其下载到本地并替换链接。',
                longDesc: '基于 RemoteImageTaskScheduler 的高级下载器：\n1. 队列机制：图片会加入后台队列，不会卡顿编辑器。\n2. 并发控制：同时最多下载 3 张，避免网络拥堵。\n3. 智能重试：失败后会自动重试（最多 3 次）。\n4. 智能替换：下载完成后，如果文件仍打开则无感替换（保留光标/撤销历史）；若已关闭则后台修改。\n\n使用方式：\n直接粘贴包含 `![image](http...)` 的 Markdown 文本，或使用命令 "下载当前笔记中的远程图片"。',
                key: 'enableAutoDownloadImages',
                type: 'toggle'
            },
        ],
    },
    {
        title: '辅助功能',
        icon: '🔧',
        settings: [
            { name: '开启右键菜单增强', desc: '在编辑器右键菜单中添加 "块包装" 和 "表格快速操作"。', key: 'enableContextMenu', type: 'toggle' },
            { name: '开启选区查找替换（Search in selection）', desc: '只在选中文本范围内做查找替换（命令与右键入口）。', key: 'enableSearchInSelection', type: 'toggle' },
            { name: '开启魔法输入（符号替换）', desc: '输入时自动替换符号：`-->` → `→`，`<--` → `←`，`<->` → `↔`，`...` → `…`。还支持中英文日期：`@明天`、`@下周一` 等。', key: 'enableMagicInput', type: 'toggle' },
            { name: '开启到期高亮 (@due)', desc: '在编辑器中高亮 `@due(YYYY-MM-DD)`：过期标红、今天标黄。💡 依赖特定日期格式。', key: 'enableOverdueHighlighter', type: 'toggle' },
        ],
    },
    {
        title: '写作体验',
        icon: '✍️',
        settings: [
            { name: '开启打字机滚动（光标居中）', desc: '打字时自动滚动，让光标所在行始终保持在屏幕中央。适合长文写作，减少视线移动。开启后立即生效，无需额外操作。', key: 'enableTypewriterScroll', type: 'toggle' },
            { name: '开启光标记忆（Cursor memory）', desc: '自动记住每个文件的光标位置和滚动位置。重新打开文件时，自动恢复到上次编辑的位置。数据保存在插件配置中。', key: 'enableCursorMemory', type: 'toggle' },
        ],
    },
    {
        title: '界面增强',
        icon: '🖼️',
        settings: [
            { name: '开启状态栏统计（字数/阅读时间/选中数）', desc: '在底部状态栏实时显示：总字数（中英文分别计数）、预计阅读时间（按 220 词/分钟）。选中文字时显示选区字符数。', key: 'enableStatusBarStats', type: 'toggle' },
            { name: '开启界面清理（Focus UI / Zen）', desc: '在命令面板中搜索 "切换专注模式" 可一键隐藏侧边栏、状态栏等界面元素，进入无干扰写作模式。再次执行命令恢复。', key: 'enableFocusUi', type: 'toggle' },
            { name: '开启浮动大纲（Floating outline）', desc: '在命令面板中搜索 "切换浮动大纲" 可在编辑器右侧弹出极简目录。点击标题跳转，按 Esc 或点击 × 关闭。', key: 'enableFloatingOutline', type: 'toggle' },
            { name: '开启局部聚焦（Heading/List zoom）', desc: '在命令面板搜索 "聚焦当前标题" 或 "聚焦当前列表"，在弹窗中专注编辑当前段落/列表，编辑完成后自动同步回原文。', key: 'enableZoom', type: 'toggle' },

        ],
    },
    {
        title: '小工具',
        icon: '🧰',
        settings: [
            { name: '开启脚注助手（Footnotes）', desc: '在命令面板搜索 "插入脚注"，在光标处插入 `[^n]` 引用标记，并在文档末尾自动添加 `[^n]: ` 定义区域，编号自动递增。', key: 'enableFootnotes', type: 'toggle' },
            { name: '开启行内计算（Inline calc）', desc: '选中数学表达式（如 `1+2*3`），在命令面板搜索 "行内计算" 将其替换为计算结果。支持：+ - * / ^（次方）和括号。', key: 'enableInlineCalc', type: 'toggle' },
            { name: '开启随机生成器（Random generator）', desc: '在命令面板中提供三个命令："插入 UUID"（标准 v4 格式）、"插入随机整数"（指定范围 如 1-100）、"掷骰子"（如 2d6 = 两个六面骰）。', key: 'enableRandomGenerator', type: 'toggle' },
            { name: '开启最近文件 HUD', desc: '在命令面板搜索 "最近文件" 弹出快速选择器，显示最近打开的文件列表，支持键盘上下选择和 Enter 跳转。', key: 'enableQuickHud', type: 'toggle' },
        ],
    },
    {
        title: '文件与库管理',
        icon: '📁',
        settings: [
            { name: '开启 Frontmatter 图标/头图（Inline decorator）', desc: '在笔记的 Frontmatter 中添加 `icon: ❤️` 或 `banner: path/to/image.png`，插件会在文件列表显示图标，并在笔记顶部展示头图。', key: 'enableInlineDecorator', type: 'toggle' },
            { name: '开启文件树高亮（File tree highlight）', desc: '在命令面板搜索 "文件树：高亮当前文件"，可为文件/文件夹设置 6 种颜色高亮标记，方便在文件列表中区分项目文件夹。', key: 'enableFileTreeHighlight', type: 'toggle' },
            {
                name: '开启 YAML 自动更新',
                desc: '自动维护笔记的 "创建时间" 和 "修改时间" 元数据（Frontmatter）。⚠️ 会自动修改文件内容，与 SaveCleaner 同时使用可能产生冲突。',
                longDesc: '此功能会监控文件修改事件。\n\n- 新建文件时：自动添加 `created` 字段。\n- 修改文件时：自动更新 `updated` 字段。\n\n注意：这会直接修改文件开头的 YAML Frontmatter 区域。如果您的工作流依赖外部工具同步文件，请确保此行为不会造成干扰。',
                key: 'enableYaml',
                type: 'toggle'
            },
            { name: 'YAML 日期格式', desc: '时间戳的显示格式，使用 moment.js 语法。常用格式：YYYY-MM-DD（仅日期）或 YYYY-MM-DD HH:mm（日期+时间）。', key: 'yamlDateFormat', type: 'text', placeholder: 'YYYY-MM-DD HH:mm' },
            { name: '模板文件夹路径', desc: '存放自定义模板的文件夹（相对于库根目录）。模板文件支持 `{{date}}`、`{{title}}`、`{{cursor}}` 等变量。在命令面板搜索 "插入模板" 使用。', key: 'templateFolderPath', type: 'text', placeholder: 'Templates' },
        ],
    },
    {
        title: '可视化',
        icon: '📊',
        settings: [
            { name: '开启 Infographic 渲染器', desc: '在预览/阅读模式渲染 ` ```infographic` 代码块。', key: 'enableInfographicRenderer', type: 'toggle' },
            {
                name: '开启 Vega-Lite 统计图表',
                desc: '在预览/阅读模式渲染 ` ```vega-lite` 代码块（基于 vega-embed）。',
                longDesc: 'Vega-Lite 是一个高层次的语法，用于快速构建交互式统计图表。\n\n用途：折线图、柱状图、散点图、热力图等数据分析场景。\n文档：请参考插件根目录下的 `DOCS_CHARTS.md` 查看示例代码。\n\n注意：开启后可能需要重启 Obsidian 生效。',
                key: 'enableVegaLite',
                type: 'toggle'
            },
            {
                name: '开启 Graphviz 关系图',
                desc: '在预览/阅读模式渲染 ` ```graphviz` 代码块（基于 @hpcc-js/wasm）。',
                longDesc: 'Graphviz 使用 DOT 语言绘制结构化的图形。\n\n用途：流程图、状态机、依赖关系图、类图等。\n引擎：使用 WebAssembly 版 Graphviz，性能优异且无需本地安装。\n文档：请参考 `DOCS_CHARTS.md`。',
                key: 'enableGraphviz',
                type: 'toggle'
            },
            {
                name: '开启 ECharts 交互图表',
                desc: '在预览/阅读模式渲染 ` ```echarts` 代码块。',
                longDesc: 'Apache ECharts 是一个基于 JavaScript 的开源可视化图表库。\n\n用途：复杂的交互式图表、桑基图、漏斗图、大屏展示。\n文档：请参考 `DOCS_CHARTS.md`。\n支持：支持 JSON 格式配置，也支持简单的 JS 函数配置（不推荐用于不可信来源）。',
                key: 'enableECharts',
                type: 'toggle'
            },
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

        // Header with welcome message
        const headerContainer = containerEl.createDiv({ cls: 'editor-pro-header' });
        headerContainer.createEl('h1', { text: 'Editor Pro 插件设置' });

        // Welcome message for new users (using safe DOM API)
        const welcomeEl = headerContainer.createDiv({ cls: 'editor-pro-welcome' });
        const welcomeTitle = welcomeEl.createEl('p');
        welcomeTitle.createEl('strong').setText('欢迎使用 Editor Pro！');
        welcomeEl.createEl('p').setText('本插件提供丰富的编辑增强功能，默认已启用核心编辑功能以确保最佳体验。');

        const quickStartTitle = welcomeEl.createEl('p');
        quickStartTitle.createEl('strong').setText('💡 快速入门：');

        const quickStartList = welcomeEl.createEl('ul');
        const items = [
            '📝 基础编辑：行操作（上移/下移/复制）、智能配对、表格编辑',
            '⌨️ 快捷键：在 Settings → Hotkeys 中绑定命令',
            '🎨 格式化：选中文字后使用快捷键或右键菜单',
            '🔧 更多功能：在下方分类中按需开启'
        ];
        items.forEach(item => {
            quickStartList.createEl('li').setText(item);
        });

        const helpLink = welcomeEl.createEl('p', { cls: 'editor-pro-help-link' });
        helpLink.setText('💬 需要帮助？访问 GitHub 或查看文档。');

        // Add welcome styles
        this.addWelcomeStyles(containerEl);

        // Search bar with accessibility support
        const searchContainer = containerEl.createDiv({ cls: 'editor-pro-settings-search' });
        searchContainer.createEl('input', {
            type: 'text',
            placeholder: '🔍 搜索设置... (输入关键词过滤)',
            cls: 'editor-pro-search-input',
            attr: {
                'aria-label': '搜索设置',
                'aria-describedby': 'editor-pro-search-help',
                'role': 'searchbox',
            }
        }, (el) => {
            this.searchInput = el;
            el.addEventListener('input', () => this.filterSettings());
            // Add keyboard shortcut hint
            el.setAttribute('title', '输入以过滤设置选项');
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

    private addWelcomeStyles(container: HTMLElement): void {
        const doc = container.ownerDocument;
        if (!doc) return;

        if (doc.getElementById('editor-pro-welcome-styles')) {
            return; // Already added
        }

        const style = container.createEl('style', { attr: { id: 'editor-pro-welcome-styles' } });
        style.innerHTML = `
            .editor-pro-header {
                margin-bottom: 20px;
            }
            .editor-pro-header h1 {
                margin-bottom: 12px;
            }
            .editor-pro-welcome {
                background: var(--background-secondary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            .editor-pro-welcome p {
                margin: 8px 0;
            }
            .editor-pro-welcome ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            .editor-pro-welcome li {
                margin: 4px 0;
            }
            .editor-pro-help-link {
                font-size: 0.9em;
                color: var(--text-faint);
                margin-top: 12px;
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

        // Section header with collapse toggle and accessibility
        const headerEl = sectionContainer.createEl('h3', {
            cls: 'editor-pro-section-title',
            attr: {
                'role': 'button',
                'tabindex': '0',
                'aria-expanded': 'true',
                'aria-controls': `${section.title}-settings`,
            }
        });
        // Use safe DOM API instead of innerHTML to prevent XSS
        const toggleSpan = headerEl.createEl('span', {
            cls: 'editor-pro-section-toggle',
            attr: { 'aria-hidden': 'true' }
        });
        toggleSpan.setText('▼');
        const titleSpan = headerEl.createEl('span');
        titleSpan.setText(`${section.icon} ${section.title}`);

        // Settings container with ID for accessibility
        const settingsContainer = sectionContainer.createDiv({
            cls: 'editor-pro-section-settings',
            attr: { id: `${section.title}-settings` }
        });

        // Toggle collapse on click and keyboard
        const toggle = headerEl.querySelector('.editor-pro-section-toggle') as HTMLElement;
        let isCollapsed = false;

        const toggleCollapse = () => {
            isCollapsed = !isCollapsed;
            toggle.classList.toggle('collapsed', isCollapsed);
            headerEl.setAttribute('aria-expanded', String(!isCollapsed));

            if (settingsContainer) {
                settingsContainer.style.display = isCollapsed ? 'none' : 'block';
            }
        };

        headerEl.addEventListener('click', toggleCollapse);
        headerEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
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

    private renderSetting(container: HTMLElement, setting: SettingItem): void {
        const settingEl = container.createDiv({ cls: 'editor-pro-setting-item' });
        settingEl.dataset.name = setting.name.toLowerCase();
        settingEl.dataset.desc = setting.desc.toLowerCase();

        // Add tooltip if available
        if (setting.tooltip) {
            settingEl.setAttribute('title', `${setting.name}: ${setting.tooltip}`);
        }

        const descFragment = document.createDocumentFragment();
        descFragment.append(setting.desc);

        if (setting.longDesc) {
            const details = document.createElement('details');
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            details.style.marginTop = '8px';
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            details.style.color = 'var(--text-muted)';
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            details.style.fontSize = '0.9em';

            const summary = document.createElement('summary');
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            summary.style.cursor = 'pointer';
            summary.textContent = '详细说明';

            const content = document.createElement('div');
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            content.style.paddingLeft = '1em';
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            content.style.marginTop = '4px';
            // eslint-disable-next-line obsidianmd/no-static-styles-assignment
            content.style.whiteSpace = 'pre-wrap'; // Preserve newlines
            content.textContent = setting.longDesc;

            details.appendChild(summary);
            details.appendChild(content);
            descFragment.appendChild(details);
        }

        if (setting.type === 'toggle') {
            new Setting(settingEl)
                .setName(setting.name)
                .setDesc(descFragment)
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
                .setDesc(descFragment)
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
            const headerEl = sectionEl.querySelector('.editor-pro-section-title') as HTMLElement;

            if (searchTerm !== '' && hasVisibleSettings) {
                toggle?.classList.remove('collapsed');
                if (settingsContainer) {
                    settingsContainer.style.display = 'block';
                }
                // Update ARIA state for accessibility
                if (headerEl) {
                    headerEl.setAttribute('aria-expanded', 'true');
                }
            }
        }
    }
}
