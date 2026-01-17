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

## 2. 配置字段字典 (Settings Dictionary)

`data` 对象支持以下 Key。请根据用户需求选择开启或关闭。

### A. 智能排版与编辑 (Smart Editing & Typography)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSmartToggle` | boolean | `true` | 智能格式切换（加粗/斜体不叠加） |
| `enableKeyshots` | boolean | `true` | 键盘行操作（上移/下移/复制/删除行） |
| `enableSmartTyping` | boolean | `true` | 输入增强（自动配对括号、智能退格、中英自动空格） |
| `enableEditorNavigation`| boolean | `true` | 引用块/Callout 跳出 (Shift+Enter) |
| `enableOutliner` | boolean | `true` | 大纲操作（Tab缩进列表，折叠列表块） |
| `enableTextTransformer` | boolean | `true` | 文本转换器命令（大小写、排序行等） |
| `enableSaveCleaner` | boolean | `false`| 保存时自动清理行尾空格 |
| `enableTypewriterScroll`| boolean | `false`| 打字机滚动（光标始终居中） |
| `enableCursorMemory` | boolean | `false`| 记忆文件光标位置 |

### B. 智能输入与命令 (Smart Input & Commands)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSlashCommand` | boolean | `true` | 启用斜杠命令 (`/` 或 `、`) |
| `enableSmartInput` | boolean | `true` | 智能与日期展开 (`@today`, `@time`) |
| `enableMagicInput` | boolean | `false`| 魔法输入符号替换 (`-->`转箭头等) |
| `enableTaskHotkeys` | boolean | `true` | 任务状态循环快捷键 |
| `enableHeadingHotkeys`| boolean | `true` | 标题等级快捷设置 (1-6) |

### C. 链接与图片 (Links & Images)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSmartPasteUrl` | boolean | `true` | 选中文本粘贴 URL 自动转 Markdown 链接 |
| `enableSmartLinkTitle`| boolean | `false`| 粘贴 URL 自动获取标题 (本地优先) |
| `enableSmartLinkTitleNetwork`| boolean | `false`| 允许联网获取网页标题 (GET请求) |
| `enableSmartImagePaste`| boolean | `false`| 图片粘贴自动重命名与归档 |
| `enableAutoDownloadImages`| boolean | `false` | 自动下载粘贴内容中的远程图片 |

### D. 界面增强与小工具 (UI & Tools)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableStatusBarStats`| boolean | `false`| 状态栏统计（字数、阅读时间） |
| `enableFocusUi` | boolean | `false`| 专注模式（一键隐藏侧栏） |
| `enableFloatingOutline`| boolean | `false`| 浮动大纲目录 |
| `enableZoom` | boolean | `false`| 局部聚焦模式 |
| `enableQuickHud` | boolean | `false`| 最近文件快速切换器 |
| `enableContextMenu` | boolean | `true` | 右键菜单增强 (块包装/表格操作) |
| `enableSearchInSelection`| boolean | `false`| 选区内查找替换 |
| `enableOverdueHighlighter`| boolean | `false`| `@due` 日期过期高亮 |
| `enableFootnotes` | boolean | `false`| 脚注助手 |
| `enableInlineCalc` | boolean | `false`| 行内数学计算 |
| `enableRandomGenerator`| boolean | `false`| 随机数与UUID生成 |

### E. 可视化图表 (Visualization)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableInfographicRenderer`| boolean | `false`| 渲染 `infographic` 代码块 |
| `enableVegaLite` | boolean | `false`| 渲染 `vega-lite` 统计图表 |
| `enableGraphviz` | boolean | `false`| 渲染 `graphviz` 关系图 |
| `enableECharts` | boolean | `false`| 渲染 `echarts` 交互图表 |

### F. 文件与元数据 (File & Metadata)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableInlineDecorator`| boolean | `false`| Frontmatter 图标与头图显示 |
| `enableFileTreeHighlight`| boolean | `false`| 文件树颜色高亮 |
| `enableYaml` | boolean | `false`| YAML 时间戳自动更新 (created/updated) |
| `yamlDateFormat` | string | `"YYYY-MM-DD HH:mm"` | YAML 时间格式 |
| `templateFolderPath` | string | `"Templates"` | 用户自定义模板文件夹路径 |

### G. 核心特大组件 (Core Features)

#### Homepage (主页与统计)
| Key | Type | Description |
| :--- | :--- | :--- |
| `enableHomepage` | boolean | 是否启用 Homepage 视图 |
| `homepageTrackedFolders` | string | **核心配置**。定义要追踪的文件夹。格式: `Path:Alias:Icon:ShowStats:Order` (每行一个)。<br>示例: `Inbox:收件箱:📥:true:1` |
| `homepageShowFolderStats`| boolean | 是否在卡片上显示文件计数 |
| `homepageShowGreeting` | boolean | 显示问候语 |
| `homepageShowDailyNote` | boolean | 显示今日日记入口 |
| `homepageShowRecentFiles`| boolean | 显示最近文件 |
| `homepageShowPinnedNotes`| boolean | 显示置顶笔记 |
| `homepageShowReminders` | boolean | 显示清理提醒 |

#### Vault Guardian (库卫士/文件结构保护)
| Key | Type | Description |
| :--- | :--- | :--- |
| `enableVaultGuardian` | boolean | 是否启用文件结构保护 |
| `vaultGuardianAllowedRoots`| string | 允许的根目录列表 (每行一个)。 |
| `vaultGuardianFolderRules` | string | 文件夹规则。格式: `Folder:Strict:MaxDepth:FileTypes`。 |
| `vaultGuardianBlockCreation`| boolean | 是否直接阻止创建违规目录 |

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
    "vaultGuardianAllowedRoots": "1. Projects\n2. Areas\n3. Resources\n4. Archives\nInbox",
    "vaultGuardianFolderRules": "Inbox:false:1:md\n1. Projects:true:3:md,canvas\n4. Archives:true:5:"
  }
}
```

### 场景 2: "Zen Writer" (沉浸式写作)
此模板关闭干扰，开启自动格式化，提供极致的写作体验。

```json
{
  "id": "zen-writer-v1",
  "name": "Zen Writer Flow",
  "description": "Auto-formatting enabled, strict structure disabled. Pure writing focus.",
  "type": "other",
  "created": 1705555555555,
  "data": {
    "enableVaultGuardian": false,
    "enableAutoFormat": true,
    "enableAutoSpace": true,
    "enableSmartQuotes": true,
    "enableFormatOnPaste": true,
    "enableHomepage": false
  }
}
```

### 场景 3: "Smart Coder" (开发者模式)
关闭自动大写和智能引号（防止破坏代码），开启魔法输入。

```json
{
  "id": "smart-coder-v1",
  "name": "Developer Mode",
  "description": "Disables smart quotes to prevent code syntax errors.",
  "type": "other",
  "created": 1705555555555,
  "data": {
    "enableSmartQuotes": false,
    "enableSmartDash": false,
    "enableAutoCapitalize": false,
    "enableMagicInput": true,
    "magicInputTrigger": ">>"
  }
}
```

## 4. AI 初始化指令 (Instructions for AI Initialization)

当用户要求“初始化 Editor Pro”或“帮我配置一个适合学术研究的环境”时，AI 应：

1.  **分析需求**：确定用户是侧重写作、管理、还是代码。
2.  **构造 JSON**：基于上述 Schema 和字典，构造一个合法的 JSON 字符串。
3.  **提供操作指南**：告诉用户将此 JSON 代码复制，然后在 Editor Pro 设置页面的 Template Center 点击“**导入模板代码**”即可。

---
*Generated by Editor Pro Team*
