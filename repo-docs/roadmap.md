# Editor Pro 路线图（当前实现版）

目标：把“编辑器相关的必装插件体验”高密度融合进 Editor Pro，默认即用、可随时关闭，并尽量避免全库扫描/重度 UI。

## 已完成（✅）

- 智能格式切换（Smart Toggle）：`src/features/formatting/smart-toggle.ts`
- Slash command（`/` `、` `\\` 触发 + 拼音首字母 MVP）：`src/features/slash-command/*`
  - 代码块插入：Mermaid/D2/DOT/Infographic（默认插入空代码块）
  - 内置模板（Lite）：支持 `{{date}}` `{{time}}` `{{now}}` `{{fileName}}` `{{cursor}}`
- Outliner 最小集：Tab/Shift+Tab 缩进；折叠/展开命令；列表项“整块移动”  
  - `src/features/editing/outliner.ts` + `src/features/editing/keyshots.ts`
- Typewriter scroll：`src/features/editing/typewriter-mode.ts`
- Smart typing：自动配对/智能退格/中英空格：`src/features/editing/smart-typography.ts`
- Magic input：自然语言日期/符号替换：`src/features/editing/magic-input.ts`
- Smart paste URL：选区粘贴 URL -> Markdown link：`src/features/editing/smart-paste-url.ts`
- Auto link title：剪贴板 HTML 优先 + 可选联网抓 title：`src/features/editing/smart-link-title.ts`
- Smart image paste：粘贴图片重命名归档：`src/features/editing/smart-image-paste.ts`
- Advanced tables（Lite）：列插入/删除/对齐/格式化（命令 + 右键入口）：`src/features/table/table-ops.ts`
- Save cleaner：保存时清理：`src/features/editing/save-cleaner.ts`
- Text transformer + Search in selection：`src/features/editing/text-transformer.ts`、`src/ui/search-selection-modal.ts`
- Cursor memory + 最近文件 HUD：`src/features/navigation/*`
- Focus UI + Floating outline + 状态栏统计：`src/features/ui/*`
- Footnotes / Inline calc / Random generator：`src/features/editing/*`
- `.board` 看板（React）+ 重置命令：`src/views/board-view.tsx`
- Flow board（标题=列、列表块=卡片，拖拽会改写文档）：`src/views/flow-board-view.tsx`
- Infographic 渲染器（AntV）：`src/features/infographic/renderer.ts`
- 文件列表增强：Frontmatter icon/banner + 文件树高亮：`src/features/ui/inline-decorator.ts`、`src/features/ui/file-tree-highlight.ts`

## 后续可选（不影响当前交付）

- D2 / DOT 预览渲染器：默认 Obsidian 不渲染，需要额外渲染方案（体积/离线策略需评估）
- 更完整的拼音搜索（替换 MVP 映射表）：可接入成熟库（体积/性能需评估）

