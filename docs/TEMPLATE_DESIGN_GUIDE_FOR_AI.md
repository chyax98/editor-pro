# Editor Pro 模板设计指南 (Template Design Guide for AI)

> **Role**: AI Configuration Architect
> **Goal**: Generate precise, valid, and purposeful `UserTemplate` JSON files for Editor Pro.

## 简介 (Introduction)

Editor Pro 插件采用**文件化配置管理**。用户配置预设（Templates/Presets）存储为独立的 `.json` 文件，路径通常位于 `.obsidian/plugins/editor-pro/presets/`。

AI 助手可以通过读取本指南，理解如何构建合法的 Configuration JSON，从而帮助用户初始化仓库配置、分享最佳实践或迁移设置。

## 1. 模板文件结构 (Schema Structure)

每个模板文件必须是一个标准的 JSON 对象，符合 `UserTemplate` 接口。

```typescript
interface UserTemplate {
  id: string;          // 唯一标识符，建议使用 timestamps 或 uuid，或者语义化 ID (如 "para-workflow-v1")
  name: string;        // 用户可见的模板名称
  description?: string;// 模板功能的简短描述
  type: TemplateType;  // 模板类型，决定了应用范围
  data: Partial<EditorProSettings>; // 实际的设置数据
  created: number;     // 创建时间戳 (Date.now())
}

type TemplateType = "full" | "homepage" | "guardian" | "other";
```

### 字段详解

- **`type`**: 
  - `"full"`: 意图覆盖大部分或所有设置。通常用于备份或整体工作流切换。
  - `"homepage"`: 仅包含 Homepage 相关的设置。
  - `"guardian"`: 仅包含 Vault Guardian (文件加固) 相关的设置。
  - `"other"`: 其他特定功能的组合 (如仅用于排版)。

- **`data`**:
  - 这是一个 `Partial` 对象。**不需要包含所有设置**。
  - 应用模板时，只会覆盖 `data` 中存在的字段。未包含的字段将保持用户当前设置不变。
  - **AI 最佳实践**: 仅包含与模板目的相关的字段，保持配置的模块化和纯净。

---

## 2. 配置字段完整字典 (Complete Settings Dictionary)

`data` 对象支持以下 Key。请根据用户需求选择开启或关闭。

> ⚠️ **重要**：标记为 `[多行]` 的 string 类型配置项，值中使用 `\n` 进行换行，表示"每行一个"的格式。

### A. 基础编辑 (Basic Editing)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableKeyshots` | boolean | `true` | 键盘行操作（上移/下移/复制/删除行） |
| `enableSmartTyping` | boolean | `true` | 输入增强（自动配对括号、智能退格、中英自动空格） |
| `enableEditorNavigation` | boolean | `true` | 引用块/Callout 跳出 (Shift+Enter) |
| `enableOutliner` | boolean | `true` | 大纲操作（Tab缩进列表，折叠列表块） |

### B. 格式化与转换 (Formatting & Transform)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSmartToggle` | boolean | `true` | 智能格式切换（加粗/斜体不叠加） |
| `enableTextTransformer` | boolean | `true` | 文本转换器命令（大小写、排序行等） |
| `enableSaveCleaner` | boolean | `false` | 保存时自动清理行尾空格 |

### C. 快捷键与命令 (Hotkeys & Commands)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSlashCommand` | boolean | `true` | 启用斜杠命令 (`/` 或 `、`) |
| `enableSmartInput` | boolean | `true` | 智能日期展开 (`@today`, `@time`) |
| `enableTaskHotkeys` | boolean | `true` | 任务状态循环快捷键 |
| `enableHeadingHotkeys` | boolean | `true` | 标题等级快捷设置 (1-6) |

### D. 智能粘贴 (Smart Paste)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSmartPasteUrl` | boolean | `true` | 选中文本粘贴 URL 自动转 Markdown 链接 |
| `enableSmartLinkTitle` | boolean | `false` | 粘贴 URL 自动获取标题 (本地优先) |
| `enableSmartLinkTitleNetwork` | boolean | `false` | 允许联网获取网页标题 (GET请求) |
| `enableSmartImagePaste` | boolean | `false` | 图片粘贴自动重命名与归档 |
| `enableAutoDownloadImages` | boolean | `false` | 自动下载粘贴内容中的远程图片 |

### E. 辅助功能 (Utilities)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableContextMenu` | boolean | `true` | 右键菜单增强 (块包装/表格操作) |
| `enableSearchInSelection` | boolean | `false` | 选区内查找替换 |
| `enableMagicInput` | boolean | `false` | 魔法输入符号替换 (`-->`转箭头等) |
| `enableOverdueHighlighter` | boolean | `false` | `@due` 日期过期高亮 |

### F. 写作体验 (Writing Experience)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableTypewriterScroll` | boolean | `false` | 打字机滚动（光标始终居中） |
| `enableCursorMemory` | boolean | `false` | 记忆文件光标位置 |

### G. 界面增强 (UI Enhancement)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableStatusBarStats` | boolean | `false` | 状态栏统计（字数、阅读时间） |
| `enableFocusUi` | boolean | `false` | 专注模式（一键隐藏侧栏） |
| `enableFloatingOutline` | boolean | `false` | 浮动大纲目录 |
| `enableZoom` | boolean | `false` | 局部聚焦模式 |

### H. 小工具 (Tools)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableFootnotes` | boolean | `false` | 脚注助手 |
| `enableInlineCalc` | boolean | `false` | 行内数学计算 |
| `enableRandomGenerator` | boolean | `false` | 随机数与UUID生成 |
| `enableQuickHud` | boolean | `false` | 最近文件快速切换器 |

### I. 文件与元数据 (File & Metadata)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableInlineDecorator` | boolean | `false` | Frontmatter 图标与头图显示 |
| `enableFileTreeHighlight` | boolean | `false` | 文件树颜色高亮 |
| `enableYaml` | boolean | `false` | YAML 时间戳自动更新 (created/updated) |
| `yamlCreatedKey` | string | `"created"` | YAML created 字段名 |
| `yamlUpdatedKey` | string | `"updated"` | YAML updated 字段名 |
| `yamlDateFormat` | string | `"YYYY-MM-DD HH:mm"` | YAML 时间格式 (moment.js) |
| `templateFolderPath` | string | `"Templates"` | 用户自定义模板文件夹路径 |

### J. 可视化图表 (Visualization)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableInfographicRenderer` | boolean | `false` | 渲染 `infographic` 代码块 |
| `enableVegaLite` | boolean | `false` | 渲染 `vega-lite` 统计图表 |
| `enableGraphviz` | boolean | `false` | 渲染 `graphviz` 关系图 |
| `enableECharts` | boolean | `false` | 渲染 `echarts` 交互图表 |

### K. 首页仪表板 (Homepage Dashboard)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableHomepage` | boolean | `false` | 是否启用 Homepage 视图 |
| `homepageReplaceNewTab` | boolean | `false` | 新标签页自动显示首页 |
| `homepageShowOnStartup` | boolean | `false` | Obsidian 启动时打开首页 |
| `homepageDailyNotesFolder` | string | `"Daily"` | 日记文件所在目录 |
| `homepageTrackedFolders` | string | `[多行]` | **核心配置**。追踪目录配置。格式: `path:name:icon:showInFlow:order`<br>示例: `Inbox:Inbox:📥:true:1\nWorking:Working:🔧:true:2` |
| `homepageShowGreeting` | boolean | `true` | 显示问候语 |
| `homepageShowDailyNote` | boolean | `true` | 显示今日日记入口 |
| `homepageShowFolderStats` | boolean | `true` | 显示目录统计卡片 |
| `homepageShowRecentFiles` | boolean | `true` | 显示最近文件 |
| `homepageShowPinnedNotes` | boolean | `true` | 显示置顶笔记 |
| `homepageShowReminders` | boolean | `true` | 显示清理提醒 |
| `homepageRecentFilesCount` | number | `5` | 最近文件显示数量 (5-20) |
| `homepagePinnedNotes` | string[] | `[]` | 置顶笔记路径列表 |
| `homepageWeeklyCleanDay` | number | `0` | 每周清理提醒日 (0=周日) |
| `homepageReminderFolders` | string | `[多行]` | 提醒文件夹配置。格式: `path:name:maxDays:maxItems`<br>示例: `Inbox:Inbox:7:10` |
| `homepageShowMonthlyOverview` | boolean | `false` | 显示月度概览 |
| `homepageMonthlyPattern` | string | `""` | 月度笔记匹配模式 |

### L. 目录结构守护 (Vault Guardian)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableVaultGuardian` | boolean | `false` | 是否启用目录结构保护 |
| `vaultGuardianAllowedRoots` | string | `[多行]` | 允许的根目录列表。每行一个目录名。<br>示例: `Daily\nInbox\nWorking` |
| `vaultGuardianFolderRules` | string | `[多行]` | 目录规则配置。格式: `path:allowSubfolders:maxDepth:pattern`<br>示例: `Inbox:false:1:\nNotes:true:3:` |
| `vaultGuardianBlockCreation` | boolean | `false` | 是否直接阻止创建违规目录 |
| `vaultGuardianShowNotification` | boolean | `true` | 违规时显示通知 |
| `vaultGuardianCheckOnStartup` | boolean | `false` | 启动时自动检查目录结构 |

---

## 3. 分场景配置示例 (Scenario-Based Examples)

### 场景 1: "Strict PARA" (严格的知识管理)

此模板强制执行 PARA 结构，防止文件乱放。

```json
{
  "id": "strict-para-v1",
  "name": "Strict PARA Method",
  "description": "Enforces Tiago Forte's PARA system with Vault Guardian.",
  "type": "guardian",
  "created": 1705555555555,
  "data": {
    "enableVaultGuardian": true,
    "vaultGuardianBlockCreation": true,
    "vaultGuardianShowNotification": true,
    "vaultGuardianAllowedRoots": "1. Projects\n2. Areas\n3. Resources\n4. Archives\nInbox",
    "vaultGuardianFolderRules": "Inbox:false:1:\n1. Projects:true:3:\n2. Areas:true:2:\n3. Resources:true:3:\n4. Archives:true:5:"
  }
}
```

### 场景 2: "Zen Writer" (沉浸式写作)

此模板开启打字机滚动和专注模式，提供极致的写作体验。

```json
{
  "id": "zen-writer-v1",
  "name": "Zen Writer Flow",
  "description": "Typewriter scroll, focus mode, minimal distractions.",
  "type": "other",
  "created": 1705555555555,
  "data": {
    "enableTypewriterScroll": true,
    "enableFocusUi": true,
    "enableCursorMemory": true,
    "enableStatusBarStats": true,
    "enableVaultGuardian": false,
    "enableHomepage": false
  }
}
```

### 场景 3: "Academic Researcher" (学术研究者)

开启脚注、引用管理和智能链接功能。

```json
{
  "id": "academic-researcher-v1",
  "name": "Academic Researcher",
  "description": "Footnotes, smart links, and YAML metadata for academic writing.",
  "type": "other",
  "created": 1705555555555,
  "data": {
    "enableFootnotes": true,
    "enableSmartLinkTitle": true,
    "enableSmartLinkTitleNetwork": true,
    "enableYaml": true,
    "yamlDateFormat": "YYYY-MM-DD",
    "enableFloatingOutline": true,
    "enableSearchInSelection": true
  }
}
```

### 场景 4: "Homepage Dashboard" (首页仪表板)

配置一个完整的首页仪表板。

```json
{
  "id": "homepage-dashboard-v1",
  "name": "GTD Homepage",
  "description": "A GTD-style homepage with Inbox tracking and reminders.",
  "type": "homepage",
  "created": 1705555555555,
  "data": {
    "enableHomepage": true,
    "homepageReplaceNewTab": true,
    "homepageShowOnStartup": true,
    "homepageDailyNotesFolder": "Daily",
    "homepageTrackedFolders": "Inbox:收件箱:📥:true:1\nWorking:进行中:🔧:true:2\nNotes:笔记:📚:true:3\nArchive:归档:🗄️:false:4",
    "homepageShowGreeting": true,
    "homepageShowDailyNote": true,
    "homepageShowFolderStats": true,
    "homepageShowRecentFiles": true,
    "homepageRecentFilesCount": 10,
    "homepageShowReminders": true,
    "homepageReminderFolders": "Inbox:收件箱:7:20"
  }
}
```

---

## 4. AI 初始化指令 (Instructions for AI Initialization)

当用户要求"初始化 Editor Pro"或"帮我配置一个适合 XXX 的环境"时，AI 应：

1.  **分析需求**：确定用户是侧重写作、管理、学术研究还是其他场景。
2.  **构造 JSON**：基于上述 Schema 和字典，构造一个合法的 JSON 字符串。
    - **只包含相关配置**：不要输出所有配置项，只输出与场景相关的。
    - **注意多行字符串**：`homepageTrackedFolders` 等字段使用 `\n` 换行。
3.  **提供操作指南**：告诉用户将此 JSON 代码复制，然后在 Editor Pro 设置页面的 Template Center 点击"**导入模板代码**"即可。

---

## 5. 配置项详细格式说明

### 多行配置项格式

以下配置项支持多行输入，在 JSON 中使用 `\n` 表示换行：

#### `homepageTrackedFolders`
```
格式: path:name:icon:showInFlow:order
字段说明:
  - path: 目录路径 (相对于仓库根目录)
  - name: 显示名称
  - icon: Emoji 图标
  - showInFlow: 是否在流向图中显示 (true/false)
  - order: 排序顺序 (数字)

示例:
Inbox:Inbox:📥:true:1
Working:Working:🔧:true:2
Notes:Notes:📚:true:3
```

#### `vaultGuardianAllowedRoots`
```
格式: 每行一个目录名
示例:
Daily
Inbox
Working
Notes
Archive
```

#### `vaultGuardianFolderRules`
```
格式: path:allowSubfolders:maxDepth:pattern
字段说明:
  - path: 目录路径
  - allowSubfolders: 是否允许创建子目录 (true/false)
  - maxDepth: 最大嵌套深度 (0=不限制)
  - pattern: 子目录名称正则匹配模式 (可选)

示例:
Inbox:false:1:
Daily:false:1:
Working:true:2:
Notes:true:3:
2026:true:3:^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$
```

#### `homepageReminderFolders`
```
格式: path:name:maxDays:maxItems
字段说明:
  - path: 目录路径
  - name: 显示名称
  - maxDays: 超过多少天提醒清理
  - maxItems: 超过多少文件提醒清理

示例:
Inbox:收件箱:7:10
```

---
*Generated by Editor Pro Team | Last Updated: 2026-01-18*
