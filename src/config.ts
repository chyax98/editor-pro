import { McpSettings, MCP_DEFAULT_SETTINGS } from "./features/mcp/mcp-types";
export interface EditorProSettings {
    mcp: McpSettings;

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

    // Homepage 设置
    enableHomepage: boolean;
    homepageReplaceNewTab: boolean;
    homepageShowOnStartup: boolean;
    homepageDailyNotesFolder: string;
    homepageTrackedFolders: string; // 每行一个: path:name:icon:showInFlow:order
    homepageShowGreeting: boolean;
    homepageShowDailyNote: boolean;
    homepageShowFolderStats: boolean;
    homepageShowRecentFiles: boolean;
    homepageShowPinnedNotes: boolean;
    homepageShowReminders: boolean;
    homepageRecentFilesCount: number;
    homepagePinnedNotes: string[];
    homepageWeeklyCleanDay: number;
    homepageReminderFolders: string; // 每行一个: path:name:maxDays:maxItems
    homepageShowMonthlyOverview: boolean;
    homepageMonthlyPattern: string;

    // Vault Guardian 设置
    enableVaultGuardian: boolean;
    vaultGuardianAllowedRoots: string; // 每行一个根目录
    vaultGuardianFolderRules: string; // 每行一个: path:allowSubfolders:maxDepth:pattern
    vaultGuardianBlockCreation: boolean;
    vaultGuardianShowNotification: boolean;
    vaultGuardianCheckOnStartup: boolean;

    // v0.3.0 Template Center
}

export interface UserTemplate {
    id: string;
    name: string;
    description: string;
    type: "full" | "homepage" | "guardian";
    data: Partial<EditorProSettings>;
    created: number;
}

export const DEFAULT_SETTINGS: EditorProSettings = {
    mcp: MCP_DEFAULT_SETTINGS,
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

    enableInfographicRenderer: true,
    enableVegaLite: false,
    enableGraphviz: false,
    enableECharts: false,

    // 文件列表增强（默认关闭）
    enableInlineDecorator: false,
    enableFileTreeHighlight: false,

    // YAML 配置
    yamlCreatedKey: "created",
    yamlUpdatedKey: "updated",
    yamlDateFormat: "YYYY-MM-DD HH:mm",

    // 模板配置
    templateFolderPath: "Templates",

    // Homepage 配置（默认关闭）
    enableHomepage: false,
    homepageReplaceNewTab: false,
    homepageShowOnStartup: false,
    homepageDailyNotesFolder: "Daily",
    homepageTrackedFolders:
        "Inbox:Inbox:📥:true:1\nWorking:Working:🔧:true:2\nNotes:Notes:📚:true:3",
    homepageShowGreeting: true,
    homepageShowDailyNote: true,
    homepageShowFolderStats: true,
    homepageShowRecentFiles: true,
    homepageShowPinnedNotes: true,
    homepageShowReminders: true,
    homepageRecentFilesCount: 5,
    homepagePinnedNotes: [],
    homepageWeeklyCleanDay: 0,
    homepageReminderFolders: "Inbox:Inbox:7:10",
    homepageShowMonthlyOverview: false,
    homepageMonthlyPattern: "",

    // Vault Guardian 配置（默认关闭）
    enableVaultGuardian: false,
    vaultGuardianAllowedRoots: "",
    vaultGuardianFolderRules: "",
    vaultGuardianBlockCreation: false,
    vaultGuardianShowNotification: true,
    vaultGuardianCheckOnStartup: false,

};

export interface SettingItem {
    name: string;
    desc: string;
    longDesc?: string;
    key: keyof EditorProSettings;
    type: "toggle" | "text";
    placeholder?: string;
    tooltip?: string;
    /** 是否为多行输入（用于"每行一个"类型的配置），会渲染为 TextArea */
    multiline?: boolean;
}

export interface SettingSection {
    title: string;
    icon: string;
    settings: SettingItem[];
}

export interface SettingsTabDefinition {
    id: string;
    title: string;
    icon: string;
    sectionTitles?: Set<string>;
    render?: (container: HTMLElement) => void;
}

export const SECTIONS: SettingSection[] = [
    {
        title: "基础编辑",
        icon: "✏️",
        settings: [
            {
                name: "开启键盘行操作（Keyshots）",
                desc: '提供类 IDE 的行操作命令：上移/下移/复制/删除/选中当前行。在 Settings → Hotkeys 搜索 "Editor Pro" 绑定快捷键（推荐：Alt+↑/↓/D）。',
                key: "enableKeyshots",
                type: "toggle",
            },
            {
                name: "开启输入增强（自动配对/智能退格/中英空格）",
                desc: "输入 `(` 自动补全 `)`；选中文字后输入 `(` 自动包裹；在 `(|)` 中按退格同时删除两个符号；中英文之间自动加空格。",
                key: "enableSmartTyping",
                type: "toggle",
            },
            {
                name: "开启编辑器导航增强（Shift+Enter 跳出）",
                desc: "在引用块（> 开头）或 Callout 内按 Shift+Enter，快速跳出到下一行普通文本，无需手动删除 > 符号。",
                key: "enableEditorNavigation",
                type: "toggle",
            },
            {
                name: "开启大纲编辑（Outliner）",
                desc: "在列表项上按 Tab 缩进，Shift+Tab 反缩进（会连带移动子项）。还提供“折叠/展开”命令用于快速缩放列表块。",
                key: "enableOutliner",
                type: "toggle",
            },
        ],
    },
    {
        title: "格式化与转换",
        icon: "🎨",
        settings: [
            {
                name: "开启智能格式切换",
                desc: "智能切换加粗/斜体/删除线/高亮/行内代码：光标在已格式化文字内按快捷键会取消格式，而不是叠加符号。需在 Hotkeys 中绑定快捷键。",
                key: "enableSmartToggle",
                type: "toggle",
            },
            {
                name: "开启文本转换器（Text transformer）",
                desc: "提供文本转换命令：大写/小写/标题格式/句首大写、排序行、去除空行、去除行尾空格、合并为一行。可通过命令面板或右键菜单使用。",
                key: "enableTextTransformer",
                type: "toggle",
            },
            {
                name: "开启保存时清理（Save cleaner）",
                desc: "保存时自动移除行尾空格，并确保文件以换行符结尾（尽量低侵入）。⚠️ 注意：与 YAML 自动更新同时使用可能产生冲突。",
                longDesc:
                    '此功能会在文件保存（Ctrl+S）时触发。\n它会扫描每一行，移除末尾多余的空白字符，并确保文件最后一行是空行（POSIX 标准）。\n\n冲突警告：\n如果同时开启了 "YAML 自动更新" 或其他会在保存时修改文件的插件（如 Linter），可能会导致竞争冲突（文件被多次写入）。建议排查是否与其他插件功能重叠。',
                key: "enableSaveCleaner",
                type: "toggle",
            },
        ],
    },
    {
        title: "快捷键与命令",
        icon: "⌨️",
        settings: [
            {
                name: "开启斜杠命令",
                desc: '支持通过 "/"、"、" 或反斜杠（\\）触发命令菜单；支持拼音首字母搜索（MVP）。',
                key: "enableSlashCommand",
                type: "toggle",
            },
            {
                name: "开启智能输入展开 (@today / @time)",
                desc: "输入 `@today` 展开为当前日期，`@time` 展开为当前时间，`@now` 展开为日期+时间。输入后自动替换，无需按键确认。",
                key: "enableSmartInput",
                type: "toggle",
            },
            {
                name: "开启任务快捷键",
                desc: "提供任务状态循环命令（普通文本 / 待办 / 完成），可在 Obsidian 的快捷键设置中自行绑定。",
                key: "enableTaskHotkeys",
                type: "toggle",
            },
            {
                name: "开启标题快捷转换",
                desc: "提供设置标题等级的命令（1~6 级），可在 Obsidian 的快捷键设置中自行绑定。",
                key: "enableHeadingHotkeys",
                type: "toggle",
            },
        ],
    },
    {
        title: "智能粘贴",
        icon: "📋",
        settings: [
            {
                name: "开启智能粘贴链接",
                desc: '选中文字后粘贴 URL，将自动变为 Markdown 链接（例如：选中 "Obsidian" 后粘贴 https://... -> [Obsidian](https://...)）。',
                key: "enableSmartPasteUrl",
                type: "toggle",
            },
            {
                name: "开启链接智能粘贴（自动标题）",
                desc: "粘贴 URL 时尽量获取标题并插入 Markdown 链接；优先使用剪贴板 HTML，不联网。",
                key: "enableSmartLinkTitle",
                type: "toggle",
            },
            {
                name: "允许联网抓取网页标题",
                desc: "当剪贴板没有标题时，尝试联网请求网页并读取 `<title>`；失败会降级为纯 URL。⚠️ 需要网络访问，已阻止内网地址保护隐私。",
                longDesc:
                    "工作原理：\n插件会发送 HTTP GET 请求到目标 URL，解析返回的 HTML 寻找 <title> 标签。\n\n隐私与安全：\n1. 请求直接从您的本地机器发出，不经过任何中间服务器。\n2. 已内置黑名单，禁止请求局域网 IP（如 192.168.x.x, 127.0.0.1）以防止 SSRF 攻击。\n3. 部分网站（如 Twitter/X）可能需要 cookies 或有反爬虫机制，可能无法获取标题。",
                key: "enableSmartLinkTitleNetwork",
                type: "toggle",
            },
            {
                name: "开启图片智能粘贴（重命名归档）",
                desc: '粘贴图片时按"笔记名+时间戳"重命名，并按 Obsidian 的附件规则写入文件，再插入 `![[...]]`。',
                key: "enableSmartImagePaste",
                type: "toggle",
            },
            {
                name: "开启自动下载远程图片",
                desc: "粘贴包含远程图片链接的文本时，自动将其下载到本地并替换链接。",
                longDesc:
                    '基于 RemoteImageTaskScheduler 的高级下载器：\n1. 队列机制：图片会加入后台队列，不会卡顿编辑器。\n2. 并发控制：同时最多下载 3 张，避免网络拥堵。\n3. 智能重试：失败后会自动重试（最多 3 次）。\n4. 智能替换：下载完成后，如果文件仍打开则无感替换（保留光标/撤销历史）；若已关闭则后台修改。\n\n使用方式：\n直接粘贴包含 `![image](http...)` 的 Markdown 文本，或使用命令 "下载当前笔记中的远程图片"。',
                key: "enableAutoDownloadImages",
                type: "toggle",
            },
        ],
    },
    {
        title: "辅助功能",
        icon: "🔧",
        settings: [
            {
                name: "开启右键菜单增强",
                desc: '在编辑器右键菜单中添加 "块包装" 和 "表格快速操作"。',
                key: "enableContextMenu",
                type: "toggle",
            },
            {
                name: "开启选区查找替换（Search in selection）",
                desc: "只在选中文本范围内做查找替换（命令与右键入口）。",
                key: "enableSearchInSelection",
                type: "toggle",
            },
            {
                name: "开启魔法输入（符号替换）",
                desc: "输入时自动替换符号：`-->` → `→`，`<--` → `←`，`<->` → `↔`，`...` → `…`。还支持中英文日期：`@明天`、`@下周一` 等。",
                key: "enableMagicInput",
                type: "toggle",
            },
            {
                name: "开启到期高亮 (@due)",
                desc: "在编辑器中高亮 `@due(YYYY-MM-DD)`：过期标红、今天标黄。💡 依赖特定日期格式。",
                key: "enableOverdueHighlighter",
                type: "toggle",
            },
        ],
    },
    {
        title: "写作体验",
        icon: "✍️",
        settings: [
            {
                name: "开启打字机滚动（光标居中）",
                desc: "打字时自动滚动，让光标所在行始终保持在屏幕中央。适合长文写作，减少视线移动。开启后立即生效，无需额外操作。",
                key: "enableTypewriterScroll",
                type: "toggle",
            },
            {
                name: "开启光标记忆（Cursor memory）",
                desc: "自动记住每个文件的光标位置和滚动位置。重新打开文件时，自动恢复到上次编辑的位置。数据保存在插件配置中。",
                key: "enableCursorMemory",
                type: "toggle",
            },
        ],
    },
    {
        title: "界面增强",
        icon: "🖼️",
        settings: [
            {
                name: "开启状态栏统计（字数/阅读时间/选中数）",
                desc: "在底部状态栏实时显示：总字数（中英文分别计数）、预计阅读时间（按 220 词/分钟）。选中文字时显示选区字符数。",
                key: "enableStatusBarStats",
                type: "toggle",
            },
            {
                name: "开启界面清理（Focus UI / Zen）",
                desc: '在命令面板中搜索 "切换专注模式" 可一键隐藏侧边栏、状态栏等界面元素，进入无干扰写作模式。再次执行命令恢复。',
                key: "enableFocusUi",
                type: "toggle",
            },
            {
                name: "开启浮动大纲（Floating outline）",
                desc: '在命令面板中搜索 "切换浮动大纲" 可在编辑器右侧弹出极简目录。点击标题跳转，按 Esc 或点击 × 关闭。',
                key: "enableFloatingOutline",
                type: "toggle",
            },
            {
                name: "开启局部聚焦（Heading/List zoom）",
                desc: '在命令面板搜索 "聚焦当前标题" 或 "聚焦当前列表"，在弹窗中专注编辑当前段落/列表，编辑完成后自动同步回原文。',
                key: "enableZoom",
                type: "toggle",
            },
        ],
    },
    {
        title: "小工具",
        icon: "🧰",
        settings: [
            {
                name: "开启脚注助手（Footnotes）",
                desc: '在命令面板搜索 "插入脚注"，在光标处插入 `[^n]` 引用标记，并在文档末尾自动添加 `[^n]: ` 定义区域，编号自动递增。',
                key: "enableFootnotes",
                type: "toggle",
            },
            {
                name: "开启行内计算（Inline calc）",
                desc: '选中数学表达式（如 `1+2*3`），在命令面板搜索 "行内计算" 将其替换为计算结果。支持：+ - * / ^（次方）和括号。',
                key: "enableInlineCalc",
                type: "toggle",
            },
            {
                name: "开启随机生成器（Random generator）",
                desc: '在命令面板中提供三个命令："插入 UUID"（标准 v4 格式）、"插入随机整数"（指定范围 如 1-100）、"掷骰子"（如 2d6 = 两个六面骰）。',
                key: "enableRandomGenerator",
                type: "toggle",
            },
            {
                name: "开启最近文件 HUD",
                desc: '在命令面板搜索 "最近文件" 弹出快速选择器，显示最近打开的文件列表，支持键盘上下选择和 Enter 跳转。',
                key: "enableQuickHud",
                type: "toggle",
            },
        ],
    },
    {
        title: "文件与库管理",
        icon: "📁",
        settings: [
            {
                name: "开启 Frontmatter 图标/头图（Inline decorator）",
                desc: "在笔记的 Frontmatter 中添加 `icon: ❤️` 或 `banner: path/to/image.png`，插件会在文件列表显示图标，并在笔记顶部展示头图。",
                key: "enableInlineDecorator",
                type: "toggle",
            },
            {
                name: "开启文件树高亮（File tree highlight）",
                desc: '在命令面板搜索 "文件树：高亮当前文件"，可为文件/文件夹设置 6 种颜色高亮标记，方便在文件列表中区分项目文件夹。',
                key: "enableFileTreeHighlight",
                type: "toggle",
            },
            {
                name: "开启 YAML 自动更新",
                desc: '自动维护笔记的 "创建时间" 和 "修改时间" 元数据。⚠️ 会自动修改文件，多设备同步时可能产生冲突。',
                longDesc:
                    "此功能会监控文件修改事件。\n\n- 新建文件时：自动添加 `created` 字段。\n- 修改文件时：自动更新 `updated` 字段（防抖 2 秒）。\n\n⚠️ 重要警告：\n1. 多设备同步：如果您使用 iCloud / Dropbox / Syncthing 等同步工具，每次编辑都会更新时间戳，可能导致同步冲突。\n2. 与其他插件冲突：与 SaveCleaner、Linter 等会在保存时修改文件的插件同时使用可能产生竞争。\n3. 外部编辑：如果您用外部编辑器修改文件，时间戳不会自动更新。\n\n建议仅在单设备使用或明确了解影响的情况下开启。",
                key: "enableYaml",
                type: "toggle",
            },
            {
                name: "YAML 日期格式",
                desc: "时间戳的显示格式，使用 moment.js 语法。常用格式：YYYY-MM-DD（仅日期）或 YYYY-MM-DD HH:mm（日期+时间）。",
                key: "yamlDateFormat",
                type: "text",
                placeholder: "YYYY-MM-DD HH:mm",
            },
            {
                name: "模板文件夹路径",
                desc: '存放自定义模板的文件夹（相对于库根目录）。模板文件支持 `{{date}}`、`{{title}}`、`{{cursor}}` 等变量。在命令面板搜索 "插入模板" 使用。',
                key: "templateFolderPath",
                type: "text",
                placeholder: "Templates",
            },
        ],
    },
    {
        title: "可视化",
        icon: "📊",
        settings: [
            {
                name: "开启 Infographic 渲染器",
                desc: "在预览/阅读模式渲染 ` ```infographic` 代码块。",
                key: "enableInfographicRenderer",
                type: "toggle",
            },
            {
                name: "开启 Vega-Lite 统计图表",
                desc: "在预览/阅读模式渲染 ` ```vega-lite` 代码块（基于 vega-embed）。",
                longDesc:
                    "Vega-Lite 是一个高层次的语法，用于快速构建交互式统计图表。\n\n用途：折线图、柱状图、散点图、热力图等数据分析场景。\n文档：请参考插件根目录下的 `DOCS_CHARTS.md` 查看示例代码。\n\n注意：开启后可能需要重启 Obsidian 生效。",
                key: "enableVegaLite",
                type: "toggle",
            },
            {
                name: "开启 Graphviz 关系图",
                desc: "在预览/阅读模式渲染 ` ```graphviz` 代码块（基于 @hpcc-js/wasm）。",
                longDesc:
                    "Graphviz 使用 DOT 语言绘制结构化的图形。\n\n用途：流程图、状态机、依赖关系图、类图等。\n引擎：使用 WebAssembly 版 Graphviz，性能优异且无需本地安装。\n文档：请参考 `DOCS_CHARTS.md`。",
                key: "enableGraphviz",
                type: "toggle",
            },
            {
                name: "开启 ECharts 交互图表",
                desc: "在预览/阅读模式渲染 ` ```echarts` 代码块。",
                longDesc:
                    "Apache ECharts 是一个基于 JavaScript 的开源可视化图表库。\n\n用途：复杂的交互式图表、桑基图、漏斗图、大屏展示。\n文档：请参考 `DOCS_CHARTS.md`。\n支持：支持 JSON 格式配置，也支持简单的 JS 函数配置（不推荐用于不可信来源）。",
                key: "enableECharts",
                type: "toggle",
            },
        ],
    },
    {
        title: "首页仪表板",
        icon: "🏠",
        settings: [
            {
                name: "开启首页仪表板（Homepage）",
                desc: '提供个性化首页，显示日记入口、目录统计、最近文件、清理提醒等。在命令面板搜索 "打开首页" 或点击左侧 Home 图标。',
                longDesc:
                    "首页仪表板功能：\n\n1. 智能问候：根据时间显示问候语和日期\n2. 今日日记：快速打开或创建今日日记\n3. 仓库状态：显示追踪目录的文件数量流向（如 Inbox → Working → Notes）\n4. 最近编辑：显示最近修改的文件\n5. 置顶笔记：右键文件可添加到首页置顶\n6. 清理提醒：Weekly/Monthly 清理提醒\n\n所有功能都可以单独开关。",
                key: "enableHomepage",
                type: "toggle",
            },
            {
                name: "替换新标签页",
                desc: "开启后，新建空白标签页时自动显示首页。",
                key: "homepageReplaceNewTab",
                type: "toggle",
            },
            {
                name: "启动时打开首页",
                desc: "Obsidian 启动时自动打开首页。",
                key: "homepageShowOnStartup",
                type: "toggle",
            },
            {
                name: "显示问候语",
                desc: "显示时间问候语和日期。",
                key: "homepageShowGreeting",
                type: "toggle",
            },
            {
                name: "显示今日日记入口",
                desc: "显示今日日记的快速入口。",
                key: "homepageShowDailyNote",
                type: "toggle",
            },
            {
                name: "显示目录统计",
                desc: "显示追踪目录的文件数量和流向图。",
                key: "homepageShowFolderStats",
                type: "toggle",
            },
            {
                name: "显示最近文件",
                desc: "显示最近编辑的文件列表。",
                key: "homepageShowRecentFiles",
                type: "toggle",
            },
            {
                name: "显示置顶笔记",
                desc: "显示手动置顶的笔记。",
                key: "homepageShowPinnedNotes",
                type: "toggle",
            },
            {
                name: "显示清理提醒",
                desc: "显示 Weekly/Monthly 清理提醒。",
                key: "homepageShowReminders",
                type: "toggle",
            },
            {
                name: "Daily Notes 目录",
                desc: "日记文件所在的目录路径。",
                key: "homepageDailyNotesFolder",
                type: "text",
                placeholder: "Daily",
            },
            {
                name: "追踪目录配置",
                desc: "每行一个目录，格式: path:name:icon:showInFlow:order",
                longDesc:
                    "追踪目录配置格式：每行一个目录\n\n格式：path:name:icon:showInFlow:order\n- path: 目录路径\n- name: 显示名称\n- icon: 图标（emoji）\n- showInFlow: 是否在流向图中显示（true/false）\n- order: 排序数字\n\n示例：\nInbox:Inbox:📥:true:1\nWorking:Working:🔧:true:2\nNotes:Notes:📚:true:3",
                key: "homepageTrackedFolders",
                type: "text",
                placeholder: "Inbox:Inbox:📥:true:1",
                multiline: true,
            },
            {
                name: "最近文件数量",
                desc: "显示的最近文件数量（5-20）。",
                key: "homepageRecentFilesCount",
                type: "text",
                placeholder: "5",
            },
        ],
    },
    {
        title: "目录结构守护",
        icon: "🛡️",
        settings: [
            {
                name: "开启目录结构守护（Vault Guardian）",
                desc: "保护仓库目录结构，防止目录膨胀。在创建违规目录时给出警告或阻止。",
                longDesc:
                    'Vault Guardian 功能：\n\n1. 根目录白名单：只允许指定的根目录存在\n2. 子目录控制：可禁止某些目录创建子目录（如 Inbox 保持扁平）\n3. 深度限制：限制目录嵌套深度\n4. 命名规则：子目录名称正则匹配\n5. 健康检查：命令面板搜索 "Vault Guardian: 目录结构检查" 查看报告\n\n⚠️ 此功能会监控目录创建，可能与某些自动化工具冲突。',
                key: "enableVaultGuardian",
                type: "toggle",
            },
            {
                name: "阻止创建违规目录",
                desc: "开启后直接阻止创建违规目录；关闭则仅显示警告。",
                key: "vaultGuardianBlockCreation",
                type: "toggle",
            },
            {
                name: "显示违规通知",
                desc: "创建违规目录时显示桌面通知。",
                key: "vaultGuardianShowNotification",
                type: "toggle",
            },
            {
                name: "启动时检查目录结构",
                desc: "Obsidian 启动时自动运行目录健康检查。",
                key: "vaultGuardianCheckOnStartup",
                type: "toggle",
            },
            {
                name: "根目录白名单",
                desc: "允许的根目录列表，每行一个。留空则不限制。",
                longDesc:
                    "每行填写一个允许的根目录名称。\n\n示例：\nDaily\nInbox\nWorking\nNotes\nResources\nArchive\n2026\n\n留空表示不限制根目录。",
                key: "vaultGuardianAllowedRoots",
                type: "text",
                placeholder: "Daily\nInbox\nWorking",
                multiline: true,
            },
            {
                name: "目录规则配置",
                desc: "每行一个目录规则，格式: path:allowSubfolders:maxDepth:pattern",
                longDesc:
                    "目录规则配置格式：每行一个规则\n\n格式：path:allowSubfolders:maxDepth:pattern\n- path: 目录路径\n- allowSubfolders: 是否允许子目录（true/false）\n- maxDepth: 最大嵌套深度（0=不限制）\n- pattern: 子目录名称正则模式（可选）\n\n示例：\nInbox:false:1:\nDaily:false:1:\nWorking:true:2:\nNotes:true:3:\n2026:true:3:^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$",
                key: "vaultGuardianFolderRules",
                type: "text",
                placeholder: "Inbox:false:1:",
                multiline: true,
            },
        ],
    },
];
