# Editor Pro 用户使用指南 (User Guide)

> **Editor Pro** 是 Obsidian 的"瑞士军刀"，旨在通过一系列精心设计的增强功能，提升您的写作流 (Flow) 体验。

---

## 📚 目录

1.  [🚀 快速开始](#-快速开始-quick-start)
2.  [✍️ 写作体验增强](#-写作体验增强-writing-experience)
    *   [智能输入 (Magic Input)](#1-智能输入-magic-input)
    *   [打字机滚动 (Typewriter Scroll)](#2-打字机滚动-typewriter-scroll)
    *   [专注模式 (Focus Mode)](#3-专注模式-focus-mode)
    *   [智能排版 (Smart Typography)](#4-智能排版-smart-typography)
3.  [🛠️ 编辑效率工具](#-编辑效率工具-editing-tools)
    *   [行操作快捷键 (Keyshots)](#1-行操作快捷键-keyshots)
    *   [智能粘贴 (Smart Paste)](#2-智能粘贴-smart-paste)
    *   [大纲操作 (Outliner)](#3-大纲操作-outliner)
    *   [智能配对 (Smart Toggle)](#4-智能配对-smart-toggle)
4.  [🤖 智能辅助功能](#-智能辅助功能-intelligence)
    *   [斜杠命令 (Slash Commands)](#1-斜杠命令-slash-commands)
    *   [Callout 增强](#2-callout-增强)
    *   [模板引擎 (Template Engine)](#3-模板引擎-template-engine)
    *   [YAML 自动维护](#4-yaml-自动维护)
5.  [📊 可视化与 UI](#-可视化与-ui-visualization)
    *   [图表渲染 (Charts)](#1-图表渲染-charts)
    *   [状态栏统计](#2-状态栏统计)
    *   [悬浮大纲](#3-悬浮大纲)
6.  [🔌 实用小工具](#-实用小工具-widgets)

---

## 🚀 快速开始 (Quick Start)

安装插件后，请前往 **Settings** -> **Editor Pro** 顶部，选择一个适合您的**预设配置 (Preset)**：

| 预设模式 | 图标 | 适用人群 | 开启功能 |
| :--- | :--- | :--- | :--- |
| **极简模式** | 🎯 | 纯粹主义者 | 仅开启快捷键和基础行操作，**0 侵入性**。 |
| **写作模式** | ✍️ | 作家/博主 | 开启**打字机滚动**、**专注模式**、**光标记忆**，提供沉浸体验。 |
| **全功能模式**| ⚡ | 极客/重度用户 | 开启**图表渲染**、**脚本执行**、**YAML自动化**等所有高级功能。 |

---

## ✍️ 写作体验增强 (Writing Experience)

### 1. 智能输入 (Magic Input)
无需记忆 Markdown 语法，自然输入即可触发转换。
*   **符号替换**：
    *   `->` → `→`
    *   `!=` → `≠`
    *   `>=` → `≥`, `<=` → `≤`
    *   `(c)` → `©`, `(tm)` → `™`
*   **日期时间**：
    *   `@today` → 插入今日日期 (e.g. `2024-03-21`)
    *   `@tomorrow` / `@yesterday`
    *   `@next fri` → 下个周五的日期
    *   `@time` → 当前时间 (e.g. `14:30`)

### 2. 打字机滚动 (Typewriter Scroll)
*   **开启方式**：设置中开启 `Enable Typewriter Scroll`。
*   **效果**：当您打字时，当前行始终保持在屏幕中央，避免视线频繁上下移动，保护颈椎。

### 3. 专注模式 (Focus Mode)
*   **开启方式**：设置中开启 `Enable Focus UI`。
*   **效果**：自动隐藏侧边栏、状态栏和标题栏，让界面只剩下编辑器。鼠标移动到边缘时会自动显示。

### 4. 智能排版 (Smart Typography)
*   **功能**：自动在中英文、中文与数字之间添加空格。
*   **示例**：输入 `正在使用Obsidian写作` → 自动变为 `正在使用 Obsidian 写作`。

---

## 🛠️ 编辑效率工具 (Editing Tools)

### 1. 行操作快捷键 (Keyshots)
大幅提升编辑速度的核心快捷键：
*   **`Alt + Up/Down`**：上下移动当前行（或选中的多行）。
*   **`Alt + Shift + Up/Down`**：向上/下复制当前行。
*   **`Mod + D`**：多光标选中下一个相同单词（类似 VSCode）。
*   **`Mod + L`**：选中当前行。

### 2. 智能粘贴 (Smart Paste)
*   **链接增强**：复制 URL 后粘贴，自动获取网页标题并生成 `[标题](URL)` 格式。
*   **图片增强**：(需开启) 粘贴网络图片链接时，自动下载图片到本地。

### 3. 大纲操作 (Outliner)
在列表 (`- `) 状态下：
*   **`Tab` / `Shift + Tab`**：缩进/反缩进列表项。
*   **`Enter`**：在当前层级新建列表项（包含 Checkbox 状态）。
*   **`Cmd + Shift + Up/Down`**：移动列表项及其所有子项（整个分支移动）。

### 4. 智能配对 (Smart Toggle)
*   选中文字后按下 `[`，自动变为 `[[选中文本]]`。
*   选中文字后按下 `*`，自动变为 `*选中文本*`。
*   选中文字后按下 `` ` ``，自动变为 `` `选中文本` ``。

---

## 🤖 智能辅助功能 (Intelligence)

### 1. 斜杠命令 (Slash Commands)
输入 `/` 即可呼出全能菜单：
*   `/callout`：插入提示块。
*   `/table`：插入 3x3 表格。
*   `/mermaid` / `/echarts`：插入图表。
*   `/daily` / `/weekly`：插入日记模板。
*   `/h1` - `/h6`：快速设置标题。

### 2. Callout 增强
*   **快速插入**：使用 `/callout` 命令，支持 20+ 种官方类型（如 Note, Tip, Warning, Bug 等）。
*   **类型切换**：在 Callout 标题行右键或使用命令，可快速更改颜色类型。

### 3. 模板引擎 (Template Engine)
支持执行 JavaScript 的动态模板：
*   **语法**：`{{js: return new Date().getFullYear(); }}`
*   **内置变量**：`{{date}}`, `{{time}}`, `{{title}}`
*   **使用**：将模板文件放入 `Templates` 文件夹（可在设置中修改路径），然后使用 `/模板名` 插入。

### 4. YAML 自动维护
*(需在设置中手动开启)*
*   自动在文档头部维护 `created` (创建时间) 和 `updated` (更新时间) 字段。
*   **⚠️ 注意**：可能会影响第三方同步工具（如 Syncthing），请谨慎开启。

---

## 📊 可视化与 UI (Visualization)

### 1. 图表渲染 (Charts)
Editor Pro 内置了强大的渲染引擎，无需安装额外插件即可渲染代码块：

*   **Mermaid**: 流程图、时序图。
*   **ECharts**: 交互式数据图表（需使用 JSON 格式）。
*   **Graphviz (DOT)**: 结构图、网络拓扑。
*   **Vega-Lite**: 统计图表。

> 💡 **AI 辅助**：您可以询问 AI 助手 "帮我画一个季度销售额的柱状图"，它会为您生成对应的代码块。

### 2. 状态栏统计
在底部状态栏显示：
*   字数统计 / 字符数
*   阅读时间预估 (Reading Time)
*   选区统计

### 3. 悬浮大纲 (Floating Outline)
*   在编辑器右侧（或左侧）显示当前文档的悬浮大纲，方便长文导航。
*   支持点击跳转，不占用侧边栏空间。

---

## 🔌 实用小工具 (Widgets)

*   **行内计算器**：选中算式（如 `128 * 45`）并按下绑定的快捷键（默认未绑定，请在设置中配置），自动替换为结果。
*   **搜索选区**：选中文字后，在右键菜单中选择 "Search in Selection"，快速在当前文档中搜索。
*   **随机生成器**：使用命令生成 UUID、随机密码等。

---

## ❓ 常见问题 (FAQ)

**Q: 为什么有些功能不起作用？**
A: 请检查 **Settings** -> **Editor Pro**。为了保持轻量，很多高级功能（如图表、YAML）默认是关闭的。建议尝试切换到 **✨ 全功能模式 (Power Preset)**。

**Q: 如何自定义快捷键？**
A: Editor Pro 的所有命令都注册在 Obsidian 的快捷键面板中。打开 **Settings** -> **Hotkeys**，搜索 "Editor Pro" 即可查看并绑定。

**Q: 插件会修改我的文件吗？**
A: 除了您主动触发的格式化（如 Smart Typography）和 YAML 自动更新（如果开启）外，插件**绝不会**在后台偷偷修改您的文件内容。
