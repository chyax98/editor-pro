# 功能清单与缺口（Editor Pro）

本文用于对照“原始需求”与“当前实现”，快速看到：哪些已完成、哪些部分完成、哪些还没做。

> 原始需求参考：`docs/requirements.md`、`docs/task-board.md`（本机 `docs/` 可能是软链接）

## 已实现（可用）

### 核心编辑
- 智能格式切换（Smart Toggle）
  - `smart-bold`：智能加粗（`**`）
  - `smart-italic`：智能斜体（`*`）
  - `smart-strikethrough`：智能删除线（`~~`）
  - `smart-highlight`：智能高亮（`==`）
  - `smart-code`：智能行内代码（`` ` ``）
  - 代码：`src/features/formatting/smart-toggle.ts`，注册：`src/main.ts`
- 智能输入展开：`@today` / `@time` / `@now`
  - 代码：`src/features/smart-input/input-handler.ts`，注册：`src/main.ts`
- 引用/Callout 内跳出
  - Shift+Enter 在引用/Callout 中插入“跳出”的换行
  - 代码：`src/features/formatting/block-navigation.ts`，注册：`src/main.ts`
- 智能粘贴链接（Paste URL into selection）
  - 选中文字后粘贴 URL -> `[...] (URL)`（Notion 风格）
  - 代码：`src/features/editing/smart-paste-url.ts`，注册：`src/main.ts`

### 块转换
- 选区 → Callout（带类型选择器）
  - 命令：`wrap-callout`
  - 代码：`src/features/callout/*`
- 选区 → 代码块
  - 命令：`wrap-codeblock`
  - 代码：`src/features/callout/wrap-callout.ts`
- 引用（Quote）
  - 已在斜杠命令提供（见下）

### 斜杠命令（EditorSuggest）
- 触发字符：`/`、`、`、`\\`
  - 代码：`src/features/slash-command/utils.ts`
- 命令集（当前）
  - Callout、代码块、引用
  - 表格、日期/时间、数学公式、HTML 片段
  - Mermaid/D2/Graph(DOT)（插入代码块）
  - Infographic（空代码块插入；预览支持渲染）
  - 日记/周记模板
  - H1/H2/H3
  - 代码：`src/features/slash-command/menu.ts`
- 拼音首字母搜索：MVP 映射表
  - 代码：`src/features/slash-command/utils.ts`

### 表格增强
- Tab 在 Markdown 表格单元格间跳转（含 Shift+Tab）
  - 代码：`src/features/table/*`
- 表格行操作（插入行）
  - 入口：编辑器右键菜单 “在下方插入行”
  - 代码：`src/utils/markdown-generators.ts` + `src/main.ts`

### YAML 自动化
- 自动维护 frontmatter：`created` / `updated`
  - 启用开关：插件设置
  - 代码：`src/features/yaml/auto-update.ts`

### 轻量看板（.board / JSON）
- 侧边栏图标：创建/打开 `.board` 文件（默认 `Kanban.board`）
- 自定义视图：拖拽卡片、编辑卡片详情（Modal）
- 代码：`src/views/board-view.tsx`、`src/views/board-app.tsx`、`src/views/card-modal.ts`、`src/features/board/board-model.ts`

### 预览渲染
- ` ```infographic` 代码块渲染（预览/阅读模式）
  - 代码：`src/features/infographic/renderer.ts`

## 部分完成（存在缺口 / 待完善）

- 标题快捷键
  - 已提供 `set-heading-1`~`set-heading-6` 命令
  - 当前策略：不内置默认快捷键（避免冲突），需用户在 **Settings → Hotkeys** 自行绑定
- 任务状态循环
  - 当前 `toggle-task`：Plain → Todo → Done → Plain
  - 原计划里提到的 “Doing” 状态（`- [/]`）未接入该循环
  - 代码：`src/features/formatting/task-toggle.ts`
- 表格行列/对齐操作
  - 算法与测试已存在（插入列、删除列、对齐）
  - 但未暴露成命令/菜单入口（目前只有“插入行”入口）
  - 代码：`src/utils/table-generators.ts`
- D2 / Mermaid
  - 目前 D2/Mermaid 以“插入代码块”为主
  - Mermaid 由 Obsidian 原生渲染；D2 目前未做内置渲染

## 未实现（原始需求中提到，但当前未覆盖）

- Callout 样式管理（主题/图标/全局样式体系）
- 自定义模板系统（除 Daily/Weekly 之外的可配置模板）
- LaTeX 公式预览增强（目前仅插入 `$$ $$` 模板）
- HTML/MDX “编辑即预览”体验（目前仅插入 HTML 片段）
- “语雀/Notion 级”斜杠命令交互（更丰富命令、排序、上下文感知）
- 拼音搜索全量能力（目前是 MVP 映射表）
