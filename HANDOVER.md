# Editor Pro 插件项目交接文档

## 1. 项目概述

Editor Pro 是一个 Obsidian 编辑增强插件，目标是将常用编辑能力（智能格式切换、块转换、斜杠命令、表格增强、YAML 自动化、任务/看板等）整合到一个插件内，减少用户安装多个插件的成本。

- 插件 ID：`editor-pro`（见 `manifest.json`）
- 入口：`src/main.ts`（构建产物为仓库根目录的 `main.js`，但该文件不应提交到 Git）
- 构建：TypeScript + esbuild（见 `package.json`、`esbuild.config.mjs`）

## 2. 开发与构建

在仓库根目录执行：

```bash
npm install
npm run dev     # watch
npm run build   # 生产构建（会生成 main.js，但该文件已在 .gitignore 中忽略）
npm test
```

## 3. 部署与验证

手动安装位置：

```
<Vault>/.obsidian/plugins/editor-pro/
```

当前机器的已部署路径（仅供参考）：

`/Users/chyax/note/note/.obsidian/plugins/editor-pro/`

## 4. 代码结构（当前）

核心入口与设置：

- `src/main.ts`：生命周期 + 命令/视图注册（当前约 250 行，仍可继续瘦身）
- `src/settings.ts`：设置项与设置面板

功能模块（示例）：

- `src/features/formatting/`：智能格式切换、任务状态切换、Shift+Enter 块跳出
- `src/features/callout/`：Callout 类型选择器、选区包裹
- `src/features/slash-command/`：斜杠命令触发/匹配/菜单
- `src/features/table/`：Tab 表格导航
- `src/features/yaml/`：Frontmatter created/updated 自动维护
- `src/features/visuals/`：@due 过期高亮
- `src/views/`：看板相关视图与卡片编辑 Modal
- `src/features/board/board-model.ts`：`.board`（JSON）数据模型

## 5. 功能状态（对照 docs 原始需求）

对照 `docs/requirements.md` 与 `docs/task-board.md`（`docs/` 为本机软链接目录）：

### 已实现（可用）
- 智能格式切换：加粗/斜体/删除线/高亮/行内代码（`src/features/formatting/smart-toggle.ts`）
- 选区转换：Callout、代码块（`src/features/callout/wrap-callout.ts`）
- 斜杠命令：支持 `/` 与中文顿号 `、` 触发；提供表格、Mermaid、多种模板、HTML 片段等（`src/features/slash-command/`）
- 标题快捷键：Cmd+1~6（`src/main.ts`）
- YAML 自动化：created/updated 自动维护（`src/features/yaml/auto-update.ts`）
- 表格增强：Tab 键在单元格间跳转（`src/features/table/table-navigation.ts`）
- Shift+Enter 块跳出：引用/Callout 内快速换行（`src/features/formatting/block-navigation.ts`）
- 看板（JSON）：侧边栏图标创建/打开 `Kanban.board`，支持拖拽、详情编辑（`src/views/board-view.ts`、`src/views/card-modal.ts`）

### 部分实现 / 需要校准
- 拼音首字母搜索：当前为最小映射表（`src/features/slash-command/utils.ts`），若要“全量拼音”需接入成熟库或完整算法
- 引用块转换：有实现（`wrapWithQuote` / slash 命令 `quote`），但未作为独立快捷键命令对外暴露
- 任务状态循环：当前 `Cmd+L` 逻辑为 Plain → Todo → Done → Plain（`src/features/formatting/task-toggle.ts`），与“Todo → Doing → Done → Plain”的目标不一致
- 表格行列操作：算法与测试存在（`src/utils/table-generators.ts` 等），但当前 UI/命令暴露不完整（`src/main.ts` 已移除部分命令）

### 未实现（在原始需求中但代码未覆盖或未接入）
- D2 图表集成 / AI 图表
- Callout 样式管理（除类型选择器外的样式系统）
- 自定义模板系统（目前仅 Daily/Weekly 生成器）
- YAML Tags 管理与自定义 meta 扩展（当前仅 created/updated）
- LaTeX 公式预览（当前仅插入块级 `$$ $$` 模板）

## 6. 质量与测试状态

- 单测：`npm test`（当前 14 suites / 65 tests 通过）
- 构建：`npm run build` 通过
- Lint：`npm run lint` 当前不通过（主要是 eslint project service 未覆盖 tests/__mocks__，以及部分规则与当前实现冲突；建议作为后续整理项）

## 7. 已知问题与建议修复（高优先级）

- `README.md` 仍是 sample plugin 模板文档，建议更新为 Editor Pro 实际说明（功能/命令/安装）
- `src/settings.ts` 文案与真实功能存在不一致（例如提到 “Cmd+Shift+→ 移动任务到下一列” 但命令已被移除）
- `src/views/board-view.ts`/`src/views/kanban-view.ts` 存在未使用 import/未注册视图等历史残留，建议统一看板路线（Markdown vs JSON）并删除不用的路径

## 8. 后续演进建议（含 React 方向）

如果后续看板/复杂 UI 继续增长：

- 建议优先保持核心逻辑与 UI 解耦：模型（data）、操作（actions）、视图（render）
- 若引入 React：用 `esbuild` 打包 JSX；在 Obsidian `ItemView`/`FileView` 中挂载 root，并在 `onClose`/`onunload` 中 `unmount`，避免泄漏
- 体积与移动端：React 体积较大，可评估 Preact/Lit/Svelte；并根据实际使用的桌面 API 决定是否将 `manifest.json:isDesktopOnly` 置为 `true`

