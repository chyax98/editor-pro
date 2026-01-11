# Editor Pro 代码规范系统审查（2026-01-11）

本审查聚焦“代码规范/工程质量/可维护性”，以仓库现状为准，不包含功能需求评审。

## 1) 自动化检查结果（当前仓库状态）

- ESLint：通过（`npm run lint` → `eslint src`）
- TypeScript：通过（`npm run build` 内含 `tsc -noEmit`）
- 单元测试：通过（`npm test`，当前 81 tests / 18 suites）

结论：**当前代码在编译/类型/基础 lint 维度无阻塞问题**。

## 2) 工程约定与目录结构（对照 AGENTS.md）

### 2.1 项目形态

- Obsidian Community Plugin（TypeScript → esbuild 打包 JS）
- 入口：`src/main.ts`（编译为根目录 `main.js`）
- 发行物料：`main.js`、`manifest.json`、`styles.css`

### 2.2 目录职责清晰度

现状整体是“功能分模块 + `src/main.ts` 集中注册”的形态：

- `src/features/**`：功能实现（已符合“拆文件、单一职责”原则）
- `src/views/**`：视图类（`.board`、Flow board）
- `src/ui/**`：Modal/UI 组件
- `src/utils/**`：工具函数

主要偏离点（影响可维护性）：

- `src/main.ts` 行数过大（约 945 行），并承担了大量 feature wiring/命令定义/事件注册/业务编排；与“保持 `main.ts` 轻量、仅生命周期”目标不一致。
- `src/settings.ts` 行数过大（约 537 行），同时包含：设置结构、默认值、SettingTab UI、开关逻辑与文案，后续迭代会持续膨胀。
- `src/views/board-app.tsx` 行数过大（约 649 行），同时包含：拖拽逻辑、过滤、菜单、右侧详情面板渲染等多个关注点。

## 3) TypeScript 规范审查

### 3.1 类型严格性

`tsconfig.json` 已启用多个关键严格选项：

- `noImplicitAny: true`
- `strictNullChecks: true`
- `useUnknownInCatchVariables: true`
- `noUncheckedIndexedAccess: true`
- `isolatedModules: true`

扫描结果（`src/`）：

- 未发现 `any`、`@ts-ignore`、`@ts-expect-error`、`eslint-disable`

建议（非阻塞）：

- 在不破坏现有代码的前提下，考虑显式开启 `strict: true`（会额外打开如 `strictFunctionTypes` 等），并用 “逐文件修复” 的方式推进；避免一次性全量开启导致大量编译问题。

## 4) Obsidian 插件规范审查（生命周期/清理/文件写入）

### 4.1 事件/DOM 监听清理

总体表现良好：

- 大部分监听使用 `plugin.registerEvent` / `plugin.registerDomEvent` 注册（可随插件卸载自动清理）。
- React 组件内对 `window.addEventListener` 的使用（例如 `src/views/board-app.tsx`）配套 `useEffect` cleanup；视图卸载时 React unmount 会触发清理。

建议（非阻塞）：

- 对“全局 `window` 监听”的功能，优先考虑通过 View/Plugin 统一管理（例如把全局快捷键监听收敛到 view 层，避免未来多个 view/组件重复绑定）。

### 4.2 Vault 写入策略

符合“编辑当前文件用 Editor API，不用 Vault.modify”的约定：

- 编辑器相关功能主要走 `Editor`（快捷键/格式化/包裹/粘贴等）。
- `vault.modify` 仅用于：
  - `.board` 文件保存（`src/views/board-view.tsx`）
  - Flow board 回写当前 markdown（`src/views/flow-board-view.tsx`）
  - 保存清理器（`src/features/editing/save-cleaner.ts`）
  - YAML 自动化（`src/features/yaml/auto-update.ts`）

建议（非阻塞）：

- 对于“自动写入”的功能（YAML、Save Cleaner），确保所有入口都受设置开关控制、且有节流/防抖/死循环保护（当前已有 debounce/锁，建议在文档里明确策略）。

### 4.3 View 注册与崩溃风险

已对 Obsidian 的 view 重复注册异常做了防护（`src/main.ts` 内 `safeRegisterView`），避免：

- `Attempting to register an existing view type ...` 导致插件直接失败

结论：该类 crash 风险已被控制。

## 5) UI/交互规范审查（可维护性角度）

`.board` 看板相关：

- 现已使用 “左侧看板 + 右侧详情面板” 的交互模型（`src/views/board-app.tsx`），并明确展示不可编辑字段。
- 样式集中在 `styles.css`，与 Obsidian theme token 兼容（大量使用 `var(--background-*)`/`var(--text-*)`）。

建议（非阻塞）：

- 后续继续增强 UI 时，建议把看板样式拆出为模块化块（例如以 `.editor-pro-board` 为前缀分段归类），并避免对全局样式产生副作用。

## 6) 依赖/发布规范审查

- `main.js` 已在 `.gitignore`，不会被提交（符合“不要提交构建产物”）。
- 当前依赖包含 `react`/`react-dom`（已被 esbuild bundle 进 `main.js`），符合“单文件发布”要求。
- `manifest.json`：`isDesktopOnly: false`，需持续确认没有引入 desktop-only API（目前核心是 editor/DOM/Codemirror，基本可移动端兼容；但看板交互与拖拽在移动端体验仍需额外测试）。

## 7) 主要改进清单（按收益/侵入性排序）

### P0（强烈建议，主要是结构/可维护性）

- 拆分 `src/main.ts`：把命令注册与 feature wiring 移到 `src/plugin/` 或 `src/commands/` 下，`main.ts` 仅保留生命周期与少量 glue。
- 拆分 `src/settings.ts`：至少拆成 `settings/schema.ts`（interface/defaults）+ `settings/tab.ts`（SettingTab UI）两部分。

### P1（建议）

- 拆分 `src/views/board-app.tsx`：把纯函数（过滤/排序/拖拽）与 UI 组件（Column、Card、DetailsPanel）拆开，降低单文件复杂度。
- 文案/i18n：将中英文混合字符串逐步集中管理（未来如果做多语言会更容易）。

### P2（可选）

- `tsconfig.json` 逐步收紧到 `strict: true`（小步提交，避免一次性爆炸）。

## 8) 总结

当前仓库在 “可编译/可测试/基础 lint” 维度已经稳定；主要的规范问题集中在 **少数文件过大**（`src/main.ts`、`src/settings.ts`、`src/views/board-app.tsx`），这会在后续扩展（尤其继续集成大量插件能力）时放大维护成本。

下一步最优解是 **先做结构性拆分**，把 wiring 与业务逻辑解耦；功能本身不用改，但会显著降低未来继续堆功能的风险与心智负担。

