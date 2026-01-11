# 功能清单（Editor Pro）

本文用于交接时快速确认：当前仓库里“已经有什么”、入口在哪、对应代码在哪。

> 原始需求参考：`docs/`（本机软链接目录，仅作参考）；可追踪文档以 `repo-docs/` 为准。

## 已实现（✅）

### 编辑器增强（键盘幸福感）
- 智能格式切换（Smart Toggle）：`src/features/formatting/smart-toggle.ts`
- 任务状态循环（Todo → Doing → Done → Plain）：`src/features/formatting/task-toggle.ts`
- Keyshots：行上移/下移/复制/删除/选中；列表项上移/下移会“整块移动”：`src/features/editing/keyshots.ts`
- Outliner：列表 Tab/Shift+Tab 缩进；折叠命令：`src/features/editing/outliner.ts`
- Typewriter scroll（光标居中）：`src/features/editing/typewriter-mode.ts`
- Smart typing（自动配对/智能退格/中英空格）：`src/features/editing/smart-typography.ts`
- Magic input（自然语言日期 + 符号替换）：`src/features/editing/magic-input.ts`
- Smart input（@today/@time/@now 展开）：`src/features/smart-input/input-handler.ts`
- Block break（引用/Callout 内 Shift+Enter 跳出）：`src/features/formatting/block-navigation.ts`

### 粘贴增强
- Paste URL into selection：`src/features/editing/smart-paste-url.ts`
- Auto link title（HTML 优先 + 可选联网抓 title）：`src/features/editing/smart-link-title.ts`
- Smart image paste（重命名归档 + 插入 `![[...]]`）：`src/features/editing/smart-image-paste.ts`

### 文本处理
- Save cleaner（保存时清理）：`src/features/editing/save-cleaner.ts`
- Text transformer（大小写/排序/去空行/合并多行）：`src/features/editing/text-transformer.ts`
- Search in selection（选区查找替换）：`src/ui/search-selection-modal.ts`

### 导航与专注
- 最近文件 HUD：`src/features/navigation/recent-files-hud.ts`
- 光标/滚动记忆：`src/features/navigation/cursor-memory.ts`
- Focus UI（Zen）：`src/features/ui/focus-ui.ts`
- 状态栏统计：`src/features/ui/status-bar-stats.ts`
- Floating outline：`src/features/ui/floating-outline.ts`
- Heading/List zoom：`src/ui/zoom-modal.ts`

### 表格增强（Advanced Tables Lite）
- Tab/Shift+Tab 单元格导航：`src/features/table/table-navigation.ts`
- 列插入/删除/对齐/格式化（命令 + 右键入口）：`src/features/table/table-ops.ts`

### Slash command
- 触发字符：`/`、`、`、`\\`：`src/features/slash-command/utils.ts`
- 命令：Callout/代码块/引用/表格/日期/时间/Math/HTML、Mermaid/D2/DOT/Infographic（空代码块）、Daily/Weekly、内置模板：`src/features/slash-command/menu.ts`
- 内置模板变量：`src/features/templates/template-engine.ts`

### 结构化视图
- `.board` JSON 看板：`src/views/board-view.tsx`
- Flow board（标题=列，列表块=卡片，拖拽改写文档）：`src/views/flow-board-view.tsx`

### 预览渲染
- Infographic 渲染器（AntV）：`src/features/infographic/renderer.ts`

### 文件列表增强
- Frontmatter icon/banner：`src/features/ui/inline-decorator.ts`
- 文件树高亮：`src/features/ui/file-tree-highlight.ts`

### 小工具
- Footnotes：`src/features/editing/footnotes.ts`
- Inline calc：`src/features/editing/inline-calc.ts`
- Random generator：`src/features/editing/random-generator.ts`

## 可选后续（⬜️，非必须）

- D2 / DOT 预览渲染器（默认 Obsidian 不渲染，需要额外方案）
- 更完整拼音搜索（替换 MVP 映射表）

