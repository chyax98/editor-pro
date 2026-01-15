# Editor Pro 功能特性 (Feature Guide)

Editor Pro 整合了大量实用功能，旨在提供一站式的 Obsidian 编辑增强体验。

## 1. 核心编辑 (Core Editing)

- **Keyshots (行操作)**: 类似 IDE 的快捷操作。
    - 上移/下移当前行
    - 向下复制当前行
    - 删除当前行
    - 选中当前行
- **Smart Typing (智能输入)**:
    - **自动配对**: 输入 `(` 自动补全 `)`，选中文字输入 `(` 自动包裹。
    - **智能退格**: 在 `(|)` 中按退格键，同时删除左右括号。
    - **中英空格**: 在中文和英文/数字之间自动插入空格（实时）。
- **Outliner (大纲增强)**:
    - 列表项中使用 `Tab` / `Shift+Tab` 进行缩进/反缩进。
    - 快捷折叠/展开当前列表块。
- **Editor Navigation**:
    - 在引用块 (`>`) 或 Callout 中，按 `Shift+Enter` 快速跳出引用块到下一行。

## 2. 格式化与转换 (Formatting & Transformation)

- **智能格式切换**:
    - 加粗/斜体/删除线/高亮/代码：如果在已格式化的文本中按快捷键，会智能取消格式而不是叠加符号。
- **Text Transformer (文本转换器)**:
    - 大小写转换 (Upper/Lower/Title/Sentence Case)。
    - 去除空行、去除行尾空格。
    - 行排序 (A-Z, Z-A)。
    - 合并行为一行。
- **Save Cleaner**: 保存文件时自动清理行尾空格（可配置）。

## 3. 智能输入与命令 (Smart Input)

- **Slash Command (斜杠命令)**:
    - 输入 `/`、`、` 或 `\` 唤起命令菜单。
    - 支持拼音首字母搜索（如 `/dmk` 匹配 "代码块"）。
- **Smart Input (输入展开)**:
    - 输入 `@today` -> 当前日期。
    - 输入 `@time` -> 当前时间。
- **Magic Input (魔法符号)**:
    - `-->` 自动变为 `→`
    - `<--` 自动变为 `←`
    - `<=>` 自动变为 `⇔`
    - `>=` -> `≥`, `<=` -> `≤`, `!=` -> `≠`
    - `...` -> `…`
    - `(c)` -> `©`, `(r)` -> `®`, `(tm)` -> `™`

## 4. 智能粘贴 (Smart Paste)

- **Smart Paste URL**: 选中文字粘贴 URL，自动变为 `[文字](URL)` 链接。
- **Auto Link Title**: 粘贴 URL 时，尝试自动获取网页标题（支持离线解析和可选的联网获取）。
- **Remote Image Scheduler**:
    - 粘贴远程图片链接 (`![img](http...)`) 时，自动加入后台队列下载图片。
    - 支持并发控制、失败重试、智能替换（下载完成后替换链接为本地 `![[...]]`）。
- **Smart Image Paste**: 粘贴截图/图片时，按 "文件名+时间戳" 自动重命名并归档到附件文件夹。

## 5. 可视化 (Visualization)

- **Infographic**: 渲染 ` ```infographic` 代码块（AntV）。
- **Vega-Lite**: 渲染 ` ```vega-lite` 统计图表。
- **Graphviz**: 渲染 ` ```graphviz` 关系图 (DOT)。
- **ECharts**: 渲染 ` ```echarts` 交互图表。

## 6. 界面增强 (UI Enhancements)

- **Focus UI**: 专注模式，一键隐藏侧边栏和状态栏。
- **Floating Outline**: 浮动目录，在编辑器右侧临时显示大纲。
- **Status Bar Stats**: 状态栏显示字数、阅读时间、选区字符数。
- **Inline Decorator**: 在文件列表显示 Frontmatter 中的 `icon`，在笔记顶部显示 `banner`。
- **File Tree Highlight**: 允许给特定的文件/文件夹设置颜色高亮。
- **Recent Files HUD**: 快捷键呼出最近文件列表。

## 7. 小工具 (Widgets)

- **Footnotes**: 快捷插入 `[^1]` 并在文末生成对应注脚。
- **Inline Calc**: 选中数学表达式（如 `1+2*3`），执行命令替换为结果 `7`。
- **Random Generator**: 插入 UUID、随机数、掷骰子。
- **Search in Selection**: 仅在选中文本范围内进行查找替换。
- **Overdue Highlighter**: 高亮编辑器中的 `@due(YYYY-MM-DD)` 标签（过期红/今天黄）。
- **Calendar**: 简单的日历视图，点击日期创建/跳转日记。

## 8. 自动化 (Automation)

- **YAML Manager**: 自动维护 `created` 和 `updated` 时间。
- **Cursor Memory**: 记住每个文件的光标位置和滚动位置，重新打开时恢复。
- **Tag Manager**: 提供重命名标签功能（右键或命令），支持批量修改。
- **Template Engine**:
    - 插入模板（支持 `{{date}}`, `{{title}}`, `{{cursor}}` 等变量）。
    - 支持 `{{js: ...}}` 执行简单的 JavaScript。
