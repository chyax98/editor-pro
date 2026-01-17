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

### A. 智能排版与格式 (Smart Typography)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableSmartQuotes` | boolean | `true` |启用智能引号（将直引号转换为弯引号） |
| `enableCompactQuotes`| boolean | `false`|紧凑引号模式（引号内侧不添加空格） |
| `enableSmartDash` | boolean | `true` |智能破折号（将 -- 转换为 —） |
| `enableEnDash` | boolean | `true` |智能连接号 |
| `enableEllipsis` | boolean | `true` |智能省略号 (...) |
| `enableAutoFormat` | boolean | `false`|输入时实时自动格式化（中英文空格等） |
| `enableAutoSpace` | boolean | `false`|中英文之间自动插入空格 |
| `enableAutoCapitalize`| boolean | `false`|英文句首自动大写 |
| `enableFormatOnPaste`| boolean | `false`|粘贴文本时自动应用格式化规则 |

### B. 智能输入与增强 (Smart Input & Enhancements)
| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableMagicInput` | boolean | `true` |启用魔法输入（通过特定字符触发动作） |
| `magicInputTrigger` | string | `":"` |魔法输入触发键 |
| `enableSmartToggle` | boolean | `true` |智能开关（快速切换 True/False, TODO/DONE 等） |
| `smartToggleRules` | string | *(json)*|自定义切换规则 (JSON string) |
| `enableBlockNavigation`| boolean | `true` |启用块级导航 |

### C. 核心组件 (Core Features)

#### Homepage (主页与统计)
| Key | Type | Description |
| :--- | :--- | :--- |
| `enableHomepage` | boolean | 是否启用 Homepage 视图 |
| `homepageTrackedFolders` | string | **核心配置**。定义要追踪的文件夹。格式: `Path:Alias:Icon:ShowStats:Order` (每行一个)。<br>示例: `Inbox:收件箱:📥:true:1` |
| `homepageShowFolderStats`| boolean | 是否在卡片上显示文件计数 |

#### Vault Guardian (库卫士/文件结构保护)
| Key | Type | Description |
| :--- | :--- | :--- |
| `enableVaultGuardian` | boolean | 是否启用文件结构保护 |
| `vaultGuardianAllowedRoots`| string | 允许的根目录列表 (每行一个)。非此列表中的根目录将被视为违规。 |
| `vaultGuardianFolderRules` | string | 文件夹规则。格式: `Folder:Strict:MaxDepth:FileTypes`。<br>示例: `Projects:true:2:md,canvas` |

#### MCP (Model Context Protocol)
| Key | Type | Description |
| :--- | :--- | :--- |
| `enableMcp` | boolean | 是否启用 MCP 客户端功能 |

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
