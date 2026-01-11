# Editor Pro 项目状态（交接版）

> 定位：Editor Pro 是“编辑器体验增强”插件——偏键盘、偏无感、偏低负担。所有能力均提供设置开关（默认开启），并尽量避免全库扫描/重度 UI。

## 1) 架构与入口

- 插件入口：`src/main.ts`（生命周期、命令/视图/监听注册）
- 设置：`src/settings.ts`（开关与少量配置项）
- 功能模块：`src/features/*`
- 视图：`src/views/*`
  - `.board` JSON 看板：`src/views/board-view.tsx`
  - 文档流看板（Flow board）：`src/views/flow-board-view.tsx`
- 文档（可追踪）：`repo-docs/`（本机 `docs/` 为软链接，不保证同步）

## 2) 交付状态（已实现 ✅）

### 2.1 编辑体验（键盘幸福感）

- Smart Toggle（智能加粗/斜体/删除线/高亮/行内代码）：`src/features/formatting/smart-toggle.ts`
- Keyshots（上移/下移/复制/删除/选中当前行；在列表项上会“整块移动”含子项）：`src/features/editing/keyshots.ts` + `src/features/editing/outliner.ts`
- Outliner（列表 Tab/Shift+Tab 缩进/反缩进；折叠/展开命令）：`src/features/editing/outliner.ts`
- Typewriter scroll（光标居中）：`src/features/editing/typewriter-mode.ts`
- Block break（引用/Callout 内 Shift+Enter 跳出）：`src/features/formatting/block-navigation.ts`
- Smart typing（自动配对、智能退格、中文/英文空格）：`src/features/editing/smart-typography.ts`
- Magic input（自然语言日期 + 符号替换）：`src/features/editing/magic-input.ts`
- Smart input（@today/@time/@now 展开）：`src/features/smart-input/input-handler.ts`

### 2.2 粘贴与自动化

- Paste URL into selection（选区粘贴 URL -> Markdown link）：`src/features/editing/smart-paste-url.ts`
- Auto link title（优先读剪贴板 HTML；可选联网抓 `<title>`）：`src/features/editing/smart-link-title.ts`
- Smart image paste（粘贴图片按“笔记名+时间戳”重命名并按附件规则写入）：`src/features/editing/smart-image-paste.ts`
- Save cleaner（保存时移除行尾空格 + 确保文件结尾换行）：`src/features/editing/save-cleaner.ts`
- YAML 自动维护 created/updated：`src/features/yaml/auto-update.ts`

### 2.3 文本处理

- Text transformer（大小写/排序/去空行/合并多行等）：`src/features/editing/text-transformer.ts`
- Search in selection（选区查找替换）：`src/ui/search-selection-modal.ts`

### 2.4 导航与专注

- 最近文件 HUD：`src/features/navigation/recent-files-hud.ts`
- 光标/滚动记忆：`src/features/navigation/cursor-memory.ts`
- Focus UI（CSS 隐藏侧边栏/状态栏等）：`src/features/ui/focus-ui.ts`
- 状态栏统计（字数/阅读时间/选中数）：`src/features/ui/status-bar-stats.ts`
- Floating outline（极简目录浮层，Esc 关闭）：`src/features/ui/floating-outline.ts`
- Heading/List zoom（弹窗聚焦编辑并回写）：`src/ui/zoom-modal.ts`

### 2.5 表格增强（Advanced Tables Lite）

- Tab/Shift+Tab 单元格导航：`src/features/table/table-navigation.ts`
- 列插入/删除/对齐/格式化（命令 + 右键入口）：`src/features/table/table-ops.ts` + `src/utils/table-generators.ts`

### 2.6 结构化视图

- `.board` JSON 看板（React UI，拖拽/编辑/列增删）：`src/views/board-view.tsx` `src/views/board-app.tsx` `src/views/card-modal.ts`
- `.board` 解析失败不再自动覆盖文件：会展示“修复面板”（可直接编辑 JSON 并应用/或重置）：`src/views/board-app.tsx` + `src/views/board-view.tsx`
- 看板文件管理：`open-board` / `recreate-board`（删除并重建）：`src/main.ts`
- Flow board（“标题=列、列表块=卡片”，拖拽会改写当前文档）：`src/views/flow-board-view.tsx` + `src/features/flow-board/flow-parser.ts`

### 2.7 小工具

- Footnotes（插入 `[^n]` 并追加 `[^n]: `）：`src/features/editing/footnotes.ts`
- Inline calc（选区表达式计算）：`src/features/editing/inline-calc.ts`
- Random generator（UUID/随机整数/掷骰子）：`src/features/editing/random-generator.ts`

### 2.8 文件列表增强

- Frontmatter `icon`（文件列表前置图标）+ `banner`（笔记顶部头图）：`src/features/ui/inline-decorator.ts`
- File tree highlight（命令高亮当前文件/文件夹）：`src/features/ui/file-tree-highlight.ts`

### 2.9 Slash command

- 触发：`/`、中文顿号 `、`、反斜杠 `\\`
- 命令：Callout/代码块/引用/表格/日期/时间/Math/HTML、Mermaid/D2/DOT/Infographic（默认插入空代码块）、Daily/Weekly、内置模板（{{date}}/{{time}}/{{now}}/{{cursor}}）：`src/features/slash-command/menu.ts`

### 2.10 预览渲染

- ` ```infographic`（AntV Infographic）预览/阅读模式渲染，错误展示（摘要 + 可展开源码）：`src/features/infographic/renderer.ts`
- 语法参考：`repo-docs/diagram-syntax.md`

## 3) 数据与兼容性

- 插件数据已升级为结构化存储：`{ version: 2, settings, cursorMemory, fileTreeHighlights }`（向后兼容旧版仅 settings 的存储）
- 不提交构建产物：`main.js` 在 `.gitignore` 中（发布时需打包到 vault 插件目录或 Release 资产）

## 4) 构建/测试

- `npm test`：全部通过
- `npm run build`：通过
