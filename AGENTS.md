# Obsidian community plugin

## Project overview

- Target: Obsidian Community Plugin (TypeScript → bundled JavaScript).
- Entry point: `main.ts` compiled to `main.js` and loaded by Obsidian.
- Required release artifacts: `main.js`, `manifest.json`, and optional `styles.css`.

## Environment & tooling

- Node.js: use current LTS (Node 18+ recommended).
- **Package manager: npm** (required for this sample - `package.json` defines npm scripts and dependencies).
- **Bundler: esbuild** (required for this sample - `esbuild.config.mjs` and build scripts depend on it). Alternative bundlers like Rollup or webpack are acceptable for other projects if they bundle all external dependencies into `main.js`.
- Types: `obsidian` type definitions.

**Note**: This sample project has specific technical dependencies on npm and esbuild. If you're creating a plugin from scratch, you can choose different tools, but you'll need to replace the build configuration accordingly.

### Install

```bash
npm install
```

### Dev (watch)

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Linting

- To use eslint install eslint from terminal: `npm install -g eslint`
- To use eslint to analyze this project use this command: `eslint main.ts`
- eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder: `eslint ./src/`

## File & folder conventions

- **Organize code into multiple files**: Split functionality across separate modules rather than putting everything in `main.ts`.
- Source lives in `src/`. Keep `main.ts` small and focused on plugin lifecycle (loading, unloading, registering commands).
- **Example file structure**:
  ```
  src/
    main.ts           # Plugin entry point, lifecycle management
    settings.ts       # Settings interface and defaults
    commands/         # Command implementations
      command1.ts
      command2.ts
    ui/              # UI components, modals, views
      modal.ts
      view.ts
    utils/           # Utility functions, helpers
      helpers.ts
      constants.ts
    types.ts         # TypeScript interfaces and types
  ```
- **Do not commit build artifacts**: Never commit `node_modules/`, `main.js`, or other generated files to version control.
- Keep the plugin small. Avoid large dependencies. Prefer browser-compatible packages.
- Generated output should be placed at the plugin root or `dist/` depending on your build setup. Release artifacts must end up at the top level of the plugin folder in the vault (`main.js`, `manifest.json`, `styles.css`).

## Manifest rules (`manifest.json`)

- Must include (non-exhaustive):  
  - `id` (plugin ID; for local dev it should match the folder name)  
  - `name`  
  - `version` (Semantic Versioning `x.y.z`)  
  - `minAppVersion`  
  - `description`  
  - `isDesktopOnly` (boolean)  
  - Optional: `author`, `authorUrl`, `fundingUrl` (string or map)
- Never change `id` after release. Treat it as stable API.
- Keep `minAppVersion` accurate when using newer APIs.
- Canonical requirements are coded here: https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml

## Testing

- Manual install for testing: copy `main.js`, `manifest.json`, `styles.css` (if any) to:
  ```
  <Vault>/.obsidian/plugins/<plugin-id>/
  ```
- Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Commands & settings

- Any user-facing commands should be added via `this.addCommand(...)`.
- If the plugin has configuration, provide a settings tab and sensible defaults.
- Persist settings using `this.loadData()` / `this.saveData()`.
- Use stable command IDs; avoid renaming once released.

## Versioning & releases

- Bump `version` in `manifest.json` (SemVer) and update `versions.json` to map plugin version → minimum app version.
- Create a GitHub release whose tag exactly matches `manifest.json`'s `version`. Do not use a leading `v`.
- Attach `manifest.json`, `main.js`, and `styles.css` (if present) to the release as individual assets.
- After the initial release, follow the process to add/update your plugin in the community catalog as required.

## Security, privacy, and compliance

Follow Obsidian's **Developer Policies** and **Plugin Guidelines**. In particular:

- Default to local/offline operation. Only make network requests when essential to the feature.
- No hidden telemetry. If you collect optional analytics or call third-party services, require explicit opt-in and document clearly in `README.md` and in settings.
- Never execute remote code, fetch and eval scripts, or auto-update plugin code outside of normal releases.
- Minimize scope: read/write only what's necessary inside the vault. Do not access files outside the vault.
- Clearly disclose any external services used, data sent, and risks.
- Respect user privacy. Do not collect vault contents, filenames, or personal information unless absolutely necessary and explicitly consented.
- Avoid deceptive patterns, ads, or spammy notifications.
- Register and clean up all DOM, app, and interval listeners using the provided `register*` helpers so the plugin unloads safely.

## UX & copy guidelines (for UI text, commands, settings)

- Prefer sentence case for headings, buttons, and titles.
- Use clear, action-oriented imperatives in step-by-step copy.
- Use **bold** to indicate literal UI labels. Prefer "select" for interactions.
- Use arrow notation for navigation: **Settings → Community plugins**.
- Keep in-app strings short, consistent, and free of jargon.

## Performance

- Keep startup light. Defer heavy work until needed.
- Avoid long-running tasks during `onload`; use lazy initialization.
- Batch disk access and avoid excessive vault scans.
- Debounce/throttle expensive operations in response to file system events.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **Keep `main.ts` minimal**: Focus only on plugin lifecycle (onload, onunload, addCommand calls). Delegate all feature logic to separate modules.
- **Split large files**: If any file exceeds ~200-300 lines, consider breaking it into smaller, focused modules.
- **Use clear module boundaries**: Each file should have a single, well-defined responsibility.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Avoid Node/Electron APIs if you want mobile compatibility; set `isDesktopOnly` accordingly.
- Prefer `async/await` over promise chains; handle errors gracefully.

## Mobile

- Where feasible, test on iOS and Android.
- Don't assume desktop-only behavior unless `isDesktopOnly` is `true`.
- Avoid large in-memory structures; be mindful of memory and storage constraints.

## Agent do/don't

**Do**
- Add commands with stable IDs (don't rename once released).
- Provide defaults and validation in settings.
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals.
- Use `this.register*` helpers for everything that needs cleanup.

**Don't**
- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and consented.

## Common tasks

### Organize code across multiple files

**main.ts** (minimal, lifecycle only):
```ts
import { Plugin } from "obsidian";
import { MySettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";

export default class MyPlugin extends Plugin {
  settings: MySettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    registerCommands(this);
  }
}
```

**settings.ts**:
```ts
export interface MySettings {
  enabled: boolean;
  apiKey: string;
}

export const DEFAULT_SETTINGS: MySettings = {
  enabled: true,
  apiKey: "",
};
```

**commands/index.ts**:
```ts
import { Plugin } from "obsidian";
import { doSomething } from "./my-command";

export function registerCommands(plugin: Plugin) {
  plugin.addCommand({
    id: "do-something",
    name: "Do something",
    callback: () => doSomething(plugin),
  });
}
```

### Add a command

```ts
this.addCommand({
  id: "your-command-id",
  name: "Do the thing",
  callback: () => this.doTheThing(),
});
```

### Persist settings

```ts
interface MySettings { enabled: boolean }
const DEFAULT_SETTINGS: MySettings = { enabled: true };

async onload() {
  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  await this.saveData(this.settings);
}
```

### Register listeners safely

```ts
this.registerEvent(this.app.workspace.on("file-open", f => { /* ... */ }));
this.registerDomEvent(window, "resize", () => { /* ... */ });
this.registerInterval(window.setInterval(() => { /* ... */ }, 1000));
```

## Troubleshooting

- Plugin doesn't load after build: ensure `main.js` and `manifest.json` are at the top level of the plugin folder under `<Vault>/.obsidian/plugins/<plugin-id>/`. 
- Build issues: if `main.js` is missing, run `npm run build` or `npm run dev` to compile your TypeScript source code.
- Commands not appearing: verify `addCommand` runs after `onload` and IDs are unique.
- Settings not persisting: ensure `loadData`/`saveData` are awaited and you re-render the UI after changes.
- Mobile-only issues: confirm you're not using desktop-only APIs; check `isDesktopOnly` and adjust.

## References

- Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- API documentation: https://docs.obsidian.md
- Developer policies: https://docs.obsidian.md/Developer+policies
- Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Style guide: https://help.obsidian.md/style-guide

---

# Editor Pro 开发指南

## 插件定位

Editor Pro 是一个 **编辑增强** 插件，目标是整合常用编辑功能（智能格式化、Callout 转换、斜杠命令等），让用户不需要安装 20+ 个插件就能获得舒适的编辑体验。

**核心理念**：富文本编辑器风格的 Markdown 编辑体验

## MVP 任务清单

### P0（必须完成）

#### 1. 智能 Toggle 格式化

**问题**：Obsidian 原生 Cmd+B 在已加粗文本上按下会添加更多 `**`，而非取消加粗。

**需实现**：

| 命令 ID | 名称 | 标记符 | 快捷键 |
|---------|------|--------|--------|
| `smart-bold` | Smart Bold | `**` | Cmd+B |
| `smart-italic` | Smart Italic | `*` | Cmd+I |
| `smart-strikethrough` | Smart Strikethrough | `~~` | Cmd+Shift+S |
| `smart-highlight` | Smart Highlight | `==` | Cmd+Shift+H |
| `smart-code` | Smart Inline Code | `` ` `` | Cmd+` |

**核心逻辑**：
```
if (有选中文本) {
  if (选中文本已被标记包裹) → 移除标记
  else → 添加标记
} else {
  if (光标在已标记词内) → 移除该词的标记
  else → 插入空标记并将光标置于中间
}
```

**参考**: [Smarter MD Hotkeys](https://github.com/chrisgrieser/obsidian-smarter-md-hotkeys)

**文件位置**: `src/features/formatting/smart-toggle.ts`

#### 2. 选中转 Callout

**问题**：Callout 需要每行加 `>`，编辑麻烦。

**需实现**：

| 命令 ID | 名称 | 快捷键 |
|---------|------|--------|
| `wrap-callout` | Wrap with Callout | Cmd+Shift+C |
| `wrap-codeblock` | Wrap with Code Block | Cmd+Shift+K |
| `wrap-quote` | Wrap with Quote | Cmd+Shift+Q |

**Callout 交互**：按快捷键 → 弹出类型选择器 → 选择后转换

**文件位置**: `src/features/callout/wrap-callout.ts`

### P1（第二批）

#### 3. 斜杠命令

**问题**：想要 Notion 风格的 `/` 命令菜单。

**特殊需求**：
- 英文 `/` 触发
- 中文顿号 `、` 触发（中文输入法下无需切换）
- 支持拼音首字母搜索（`/dmk` → 代码块）

**参考**: [Fuzzy Chinese Pinyin](https://github.com/lazyloong/obsidian-fuzzy-chinese)

**文件位置**: `src/features/slash-command/`

#### 4. 标题快捷键

| 命令 ID | 名称 | 快捷键 |
|---------|------|--------|
| `set-heading-1` | Set Heading 1 | Cmd+1 |
| `set-heading-2` | Set Heading 2 | Cmd+2 |
| ... | ... | ... |
| `set-heading-6` | Set Heading 6 | Cmd+6 |

## 项目结构

```
src/
├── main.ts                    # 入口，只做注册
├── settings.ts                # 设置
├── features/
│   ├── formatting/
│   │   ├── index.ts           # 导出
│   │   ├── smart-toggle.ts    # 核心逻辑
│   │   └── utils.ts           # 辅助函数
│   ├── callout/
│   │   ├── index.ts
│   │   ├── wrap-callout.ts
│   │   └── type-picker.ts     # 类型选择器 UI
│   └── slash-command/
│       ├── index.ts
│       ├── menu.ts            # 菜单 UI
│       ├── commands.ts        # 命令定义
│       └── pinyin.ts          # 拼音匹配
├── utils/
│   └── editor.ts              # Editor 工具函数
└── types/
    └── index.ts               # 类型定义
```

## 避坑清单

1. **编辑当前文件用 Editor 接口**，不要用 `Vault.modify`
2. **类型检查用 `instanceof`**，不要直接断言 `as`
3. **路径用 `normalizePath()`** 规范化
4. **事件注册用 `this.registerEvent()`**，确保卸载时清理
5. **高频事件要防抖**

## 测试

- 单元测试：`tests/` 目录，Jest 框架
- Mock：`__mocks__/obsidian.ts`
- 重点测试 smartToggle 的边界情况（跨行选中、嵌套标记等）

## 功能收敛计划

以下功能计划逐步整合到 Editor Pro，以替代现有插件：

### 待实现功能

| 功能 | 替代插件 | 优先级 | 复杂度 |
|------|---------|-------|--------|
| **模板引擎** | templater-obsidian | P1 | 中 |
| 支持变量插值 `{{date}}`、脚本执行、模板文件夹管理 | | | |
| **日历视图** | calendar | P2 | 高 |
| 周视图/月视图、每日笔记关联、日程展示 | | | |
| **自然语言日期** | nldates-obsidian | P1 | 低 |
| 解析 "今天下周三"、"3天后" 等输入 | | | |
| **标签管理** | tag-wrangler | P2 | 中 |
| 标签重命名/合并、批量操作、标签面板 | | | |
| **样式管理** | obsidian-style-settings | P2 | 高 |
| CSS 变量可视化编辑、主题切换、颜色预设 | | | |

### 已替代功能（已完成）

| 功能 | 原插件 | 实现位置 |
|------|--------|---------|
| Outliner | obsidian-outliner | `src/features/editor/` |
| URL into selection | url-into-selection | `src/features/paste/` |
| Auto link title | obsidian-auto-link-title | `src/features/paste/` |
| Smart typing | easy-typing-obsidian | `src/features/editor/` |
| Callout manager | callout-manager | `src/features/callout/` |
| Zoom | obsidian-zoom | `src/features/visuals/` |
| Linter (基础) | obsidian-linter | `src/features/formatting/` |

### 实现策略

1. **模板引擎**：参考 Templater 核心功能，简化为常用场景（日期时间、文件名、属性变量）
2. **自然语言日期**：集成到斜杠命令中，输入 `/今天` 自动展开
3. **标签管理**：先实现批量重命名，再扩展到标签面板
4. **日历视图**：作为视图扩展（View），而非独立插件

## 详细文档

更多细节见 `docs/` 目录（软链接到笔记库的设计文档）和 `DEVELOPMENT.md`。
