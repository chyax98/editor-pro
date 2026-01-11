# Editor Pro 项目状态（给你勾选用）

> 定位：Editor Pro 是“编辑器体验增强”插件——偏键盘、偏无感、偏低负担。尽量把常见必装插件的**核心体验**融合进来，并提供设置开关（默认开启）。

## 0) 一览（已实现 / 待办）

| 已实现 ✅（核心可用） | 待办 ⬜️（你勾选后逐个做） |
|---|---|
| Smart Toggle（加粗/斜体/高亮/行内码） | Outliner 最小集（列表缩进/移动更像 Workflowy） |
| 包裹选区 + 智能退格（括号体验） | Advanced Tables：列/对齐/格式化等入口补齐 |
| 智能粘贴 URL（Notion 风格） | Smart Typography（引号/破折号/省略号，谨慎可关） |
| Slash command（`/` `、` `\\`） | Focus/Dim（专注写作：高亮当前行/淡化段落） |
| Typewriter scroll（光标居中） | Linter Lite（少量安全规则，默认开/关待定） |
| `.board` 看板（React 视图） | Slash command：动态模板 Lite（极简变量，不做脚本） |
| YAML created/updated 自动维护 |（更多候选见下方“候选池”） |

---

## 1) 初心（为什么做 Editor Pro）

- 把 Obsidian “写字/改字”的幸福感拉满：更少手部移动、更少光标微操、更少无意义符号操作。
- 默认“无感”：不引入复杂 UI，不要求用户先学一套新系统。
- 可控：所有增强都可以在设置里关闭；默认开启，做到“装上就舒服”。
- 离线优先：不引入必须联网才能用的核心能力。

## 2) 架构（怎么组织代码）

- 插件入口：`src/main.ts`
- 设置页：`src/settings.ts`（只放开关与少量路径/格式配置）
- 功能模块：`src/features/*`（每个文件只干一件事）
- 看板视图：`src/views/*`（`.board` JSON + React UI）
- 预览渲染：`src/features/infographic/renderer.ts`
- 构建：TypeScript + esbuild（`esbuild.config.mjs`）
- 测试：Jest（`tests/*` + `__mocks__/obsidian.ts`）
- 文档：仓库内可追踪文档放在 `repo-docs/`（本机 `docs/` 是软链接，不保证可同步）

## 3) 已实现功能（完整清单）

### 3.1 编辑体验（无感增强）

- [x] 包裹选区（Surround selection）：选中文本按 `()` `[]` `{}` `""` `''` 以及 `【】《》“”（）「」` 自动包裹  
  - 代码：`src/features/editing/smart-typography.ts`
- [x] 智能退格（Smart backspace）：在 `(|)` 中 Backspace 一次删除一对括号  
  - 代码：`src/features/editing/smart-typography.ts`
- [x] 智能粘贴链接（Paste URL into selection）：选中标题后粘贴 `http(s)` URL -> `[标题](URL)`  
  - 代码：`src/features/editing/smart-paste-url.ts`
- [x] 打字机滚动（Typewriter scroll）：光标行尽量保持在屏幕中间  
  - 代码：`src/features/editing/typewriter-mode.ts`
- [x] 行操作（Keyshots）：上移/下移/复制/删除/选中当前行（命令提供，用户自行绑定快捷键）  
  - 代码：`src/features/editing/keyshots.ts`
- [x] 中英自动空格（Smart spacing）：中英混排自动插入空格（目前默认启用）  
  - 代码：`src/features/editing/smart-typography.ts`

### 3.2 智能格式（Smart Toggle）

- [x] 智能加粗 `smart-bold`（`**`）
- [x] 智能斜体 `smart-italic`（`*`）
- [x] 智能删除线 `smart-strikethrough`（`~~`）
- [x] 智能高亮 `smart-highlight`（`==`）
- [x] 智能行内代码 `smart-code`（`` ` ``）
- 代码：`src/features/formatting/smart-toggle.ts`

### 3.3 块转换（选区包装）

- [x] 选区 → Callout（含类型选择器）`wrap-callout`  
  - 代码：`src/features/callout/*`
- [x] 选区 → 代码块 `wrap-codeblock`  
  - 代码：`src/features/callout/wrap-callout.ts`

### 3.4 Slash Command（轻量版 / 插入为主）

- [x] 触发字符：`/`、`、`、`\\`（仅单字符触发）  
  - 代码：`src/features/slash-command/utils.ts`
- [x] 拼音首字母搜索：MVP 映射表（足够支撑“辅助功能阶段”）  
  - 代码：`src/features/slash-command/utils.ts`
- [x] 命令集（插入/变换）
  - Callout / 代码块 / 引用
  - 表格 / 日期 / 时间 / 数学公式 / HTML
  - Mermaid / D2 / Graph(DOT) / Infographic（均为“插入空代码块”，Mermaid 由 Obsidian 原生渲染）
  - Daily / Weekly 模板
  - H1/H2/H3
  - 代码：`src/features/slash-command/menu.ts`

### 3.5 表格增强（编辑器内）

- [x] Tab/Shift+Tab 在 Markdown 表格单元格间移动  
  - 代码：`src/features/table/*`
- [x] 右键菜单：在下方插入行  
  - 代码：`src/utils/markdown-generators.ts` + `src/main.ts`

### 3.6 自动化 / 视觉反馈

- [x] YAML 自动维护：`created` / `updated`  
  - 代码：`src/features/yaml/auto-update.ts`
- [x] 智能输入展开：`@today` / `@time` / `@now`  
  - 代码：`src/features/smart-input/input-handler.ts`
- [x] `@due(YYYY-MM-DD)` 过期/今天到期高亮（编辑器内）  
  - 代码：`src/features/visuals/overdue-highlighter.ts`

### 3.7 看板（.board / JSON，自定义视图）

- [x] 点击侧边栏图标：创建/打开 `Kanban.board`（可配置路径）  
  - 代码：`src/main.ts`
- [x] React 看板视图：列/卡片增删、拖拽移动、点击编辑 Modal、排序字段 `order`（兼容旧数据）  
  - 代码：`src/views/board-view.tsx`、`src/views/board-app.tsx`、`src/views/card-modal.ts`

### 3.8 预览渲染器

- [x] ` ```infographic` 代码块预览渲染（AntV Infographic）+ 错误展示（摘要 + 可展开源码）  
  - 代码：`src/features/infographic/renderer.ts`
- [x] 语法参考文档（给 AI 输出用）：`repo-docs/diagram-syntax.md`

### 3.9 测试与质量

- [x] 单测覆盖核心边界：smart toggle / slash trigger / table nav / yaml automation / kanban due-date 等（当前 70+ tests 全绿）  
  - 目录：`tests/`

## 4) 待办（你勾选后我就按顺序做）

### T0：幸福感爆炸（低负担）
- [ ] Outliner 最小集（来源：Outliner）  
  - [ ] 列表项 Tab/Shift+Tab 缩进/反缩进（只在列表行生效）  
  - [ ] Alt+↑↓ 移动 list item（含子项）  
  - [ ] 可选：折叠/展开当前列表分支（快捷键）
- [ ] Typewriter 模式增强（来源：Typewriter Mode）  
  - [ ] 可选：高亮当前行  
  - [ ] 可选：淡化非当前段落（Focus / Dim）
- [ ] 设置开关补齐（目前只给了部分开关；希望做到“所有增强都有开关，且默认开启”）

### T1：效率增强（中等负担）
- [ ] Advanced Tables 入口补齐（来源：Advanced Tables）  
  - [ ] 插列/删列  
  - [ ] 左/中/右对齐  
  - [ ] 一键格式化/对齐 `|`（谨慎，避免误改）
- [ ] Smart Typography（来源：Smart Typography）  
  - [ ] 仅做最小、安全、可关闭的替换集（比如 `...`->`…`，`--`->`—` 等）  
  - [ ] 明确“只在编辑时触发/可撤销/可关闭”
- [ ] Slash command：动态模板 Lite（非脚本）  
  - [ ] 支持 `{{date}}` `{{time}}` `{{cursor}}`（不做复杂变量系统）  
  - [ ] 可选：只提供“内置模板管理”，不让用户写规则（降低负担）

### T2：后置（高风险/高负担，先不做）
- [ ] Linter Lite（来源：Linter）：只做极少数规则（默认建议关闭）  
- [ ] Tag Wrangler 类能力：需要全库扫描/重命名，风险高

## 5) 候选池（已收集但未承诺）

> 这些来自社区高口碑插件/文章，但可能会增加负担或偏离“编辑器增强”的主线，先放这里让你打勾筛选。

- [ ] Editor Width Slider：编辑区宽度快捷调节（可能用 CSS 变量/类名做）
- [ ] 语法辅助：更多 Markdown 结构块插入（但避免把 Slash 命令做成“功能大杂烩”）
- [ ] Grammar/Spell（LanguageTool/Harper）：体积/离线/隐私需要评估
- [ ] “发布/同步/采集”类：不属于 editor 主线（默认不做）

## 6) 融合来源（搜索/调研的候选插件）

> 说明：我们不会复制对方代码，只复刻体验；涉及 license/体积/隐私会单独评估。

- Paste URL into selection（Notion-style linking）：https://github.com/denolehov/obsidian-url-into-selection
- Typewriter Mode（typewriter + focus）：https://github.com/davisriedel/obsidian-typewriter-mode
- Outliner（Workflowy-like lists）：https://github.com/vslinko/obsidian-outliner
- Advanced Tables（table editing）：https://github.com/tgrosinger/advanced-tables-obsidian
- Linter（format/styling rules）：https://github.com/platers/obsidian-linter

