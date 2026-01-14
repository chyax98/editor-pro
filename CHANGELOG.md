# Editor Pro - 变更日志 (Changelog)

本文档记录了项目从初始化到当前版本的所有功能特性递进与代码关联。

## [v0.1.1] - 仓库清理与维护 (Current)

**日期**: 2026-01-14

**变更内容**:
1.  **仓库清理**:
    *   移除了 16 个代码评审临时文件 (`.review-checklist*.md`)。
    *   这些文件是 v0.1.0 发布前代码评审过程的迭代记录，现已完成使命。
2.  **功能兼容性核查**:
    *   对比 Obsidian 1.11.4 官方更新，确认所有 Editor Pro 功能仍有独立价值：
        - Bases 表格增强 ≠ Markdown 表格增强（Editor Pro 专注于 Markdown 表格）
        - 官方未提供：斜杠命令、智能格式切换、块转换、YAML 自动化等功能
    *   **结论**：无需移除任何现有功能。

---

## [v0.1.0-final] - 全功能交互式看板与全量交付

**实现内容**:
1.  **交互式看板视图 (Kanban View)**:
    *   实现了基于 DOM 的三列看板视图。
    *   支持 HTML5 拖拽 (Drag & Drop) 进行任务流转与排序。
    *   支持点击文字进行所见即所得编辑 (Inline Editing)。
    *   自动解析 `#Tag` 和 `@due` 为可视化胶囊标签。
2.  **数据模型层 (Kanban Model)**:
    *   实现了 Markdown <-> Object 的双向转换器，确保数据纯文本存储。
3.  **视觉增强**:
    *   实现了过期任务高亮 (Overdue Highlighting) 的编辑器扩展。
4.  **表格终极增强**:
    *   实现了表格列的插入 (Insert Column Right) 和删除 (Delete Column)。
    *   重写表格解析算法，完美支持转义管道符 `\|`。
5.  **全面汉化**:
    *   将设置页面、命令面板、右键菜单全部汉化为中文。

**关联代码**:
- `src/views/kanban-view.ts` (核心视图)
- `src/features/kanban/kanban-model.ts` (数据解析与序列化)
- `src/features/visuals/overdue-highlighter.ts` (编辑器装饰器)
- `src/utils/table-generators.ts` (表格列操作算法)
- `styles.css` (看板与高亮样式)

---

## [v0.0.5] - 文本流看板逻辑 (Text-First Kanban)

**实现内容**:
1.  **看板流转逻辑**:
    *   `Cmd+Shift+Right` 将任务在 Todo -> Doing -> Done 之间移动。
    *   移动时自动切换 `- [ ]` / `- [/]` / `- [x]` 状态。
    *   自动追加 `@started` 和 `@completed` 时间戳。
2.  **时间管理**:
    *   `Set Due Date` 命令追加截止日期。
3.  **归档管理**:
    *   `Archive Completed Tasks` 命令一键归档已完成任务。

**关联代码**:
- `src/features/kanban/kanban-logic.ts` (流转算法)
- `src/features/kanban/due-date.ts`
- `src/features/kanban/archive.ts`
- `tests/kanban-*.test.ts` (相关单元测试)

---

## [v0.0.4] - 表格行操作与 YAML 自动化

**实现内容**:
1.  **表格行操作**:
    *   在当前行下方插入新行 (Insert Row Below)。
    *   删除当前行 (Delete Row)。
2.  **YAML 自动化**:
    *   监听文件修改事件，自动更新 `updated` 字段。
    *   实现了防抖 (Debounce) 和死循环保护机制。
3.  **表格导航**:
    *   实现了 Tab 键在单元格间跳转的功能。

**关联代码**:
- `src/utils/markdown-generators.ts` (行操作逻辑)
- `src/features/yaml/auto-update.ts` (自动化逻辑)
- `src/features/table/table-navigation.ts` (Tab 键拦截)

---

## [v0.0.3] - 任务聚合与智能输入 (Smart Input)

**实现内容**:
1.  **智能输入**:
    *   输入 `@today` 自动展开为当前日期。
    *   输入 `@time` 自动展开为当前时间。
2.  **任务聚合 (已废弃)**:
    *   *(注：该功能在 v0.0.5 被看板功能替代，代码已移除)*

**关联代码**:
- `src/features/smart-input/input-handler.ts`

---

## [v0.0.2] - 斜杠命令 (Slash Command)

**实现内容**:
1.  **命令菜单**:
    *   支持 `/` 和中文顿号 `、` 触发命令菜单。
    *   实现了拼音首字母搜索 (如 `/bg` -> 表格)。
2.  **生成器**:
    *   支持插入表格、Mermaid 图表 (流程图/时序图/甘特图)、日期时间。

**关联代码**:
- `src/features/slash-command/menu.ts` (UI 逻辑)
- `src/features/slash-command/utils.ts` (触发与拼音匹配)

---

## [v0.0.1] - 智能格式与块转换 (MVP Core)

**实现内容**:
1.  **智能格式化 (Smart Toggle)**:
    *   `Cmd+B` 等快捷键智能识别光标上下文，避免标记叠加。
    *   `Cmd+L` 循环切换任务状态。
2.  **块转换 (Wrap Selection)**:
    *   `Cmd+Shift+C` 将选中内容转为 Callout。
    *   支持代码块和引用块转换。
3.  **块导航**:
    *   支持 `Shift+Enter` 从引用/Callout 中跳出换行。

**关联代码**:
- `src/features/formatting/smart-toggle.ts`
- `src/features/formatting/block-navigation.ts`
- `src/features/callout/wrap-callout.ts`
- `src/features/callout/callout-picker.ts`
