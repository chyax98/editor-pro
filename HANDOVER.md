# Editor Pro 插件项目交接文档

## 1. 项目概述

Editor Pro 是一个 Obsidian 编辑增强插件，目标是把“编辑器相关的必装插件体验”整合进一个插件里：更少手部移动、更少光标微操、更少符号叠加，同时保持低负担与可控（全部能力都有开关，默认开启）。

- 插件 ID：`editor-pro`（见 `manifest.json`）
- 入口：`src/main.ts`（构建产物为仓库根目录的 `main.js`，该文件不应提交到 Git）
- 构建：TypeScript + esbuild（见 `package.json`、`esbuild.config.mjs`）
- 文档：仓库可追踪文档在 `repo-docs/`（本机 `docs/` 为软链接目录，不保证同步）

## 2. 开发与构建

```bash
npm install
npm run dev     # watch
npm run build   # 生产构建（会生成 main.js，但已在 .gitignore 忽略）
npm test
npm run lint
```

## 3. 部署与验证

手动安装位置：

```
<Vault>/.obsidian/plugins/editor-pro/
```

本机参考路径：

`/Users/chyax/note/note/.obsidian/plugins/editor-pro/`

需要拷贝的发布物：
- `main.js`
- `manifest.json`
- `styles.css`

## 4. 数据存储

插件数据使用结构化格式（向后兼容旧版仅 settings 的数据）：

```json
{
  "version": 2,
  "settings": { "...": "..." },
  "cursorMemory": { "...": "..." },
  "fileTreeHighlights": { "...": "..." }
}
```

## 5. 代码结构（当前）

- `src/main.ts`：生命周期 + 命令/视图/监听注册
- `src/settings.ts`：设置项与设置面板
- `src/features/`：功能实现
  - `editing/`：smart typing、粘贴增强、save cleaner、text transformer、inline calc、随机生成器等
  - `formatting/`：smart toggle、task toggle、块跳出
  - `slash-command/`：触发/匹配/菜单
  - `table/`：表格导航 + 列操作
  - `yaml/`：created/updated 自动维护
  - `ui/`：Focus UI、状态栏统计、浮动大纲、文件列表增强、高亮等
  - `flow-board/`：Flow board 解析/回写
- `src/views/`：React 视图
  - `.board` 看板：`board-view.tsx` / `board-app.tsx`
  - 文档流看板：`flow-board-view.tsx` / `flow-board-app.tsx`
- `tests/`：Jest 单测

## 6. 功能清单（已实现）

以 `repo-docs/project-status.md` 和 `repo-docs/feature-checklist.md` 为准；核心包括：

- 编辑器增强：Smart Toggle、任务循环（Todo→Doing→Done→Plain）、Keyshots、Outliner、Typewriter scroll、Smart typing、Magic input、Shift+Enter 跳出
- 粘贴增强：URL into selection、URL 自动标题（可选联网）、图片粘贴重命名归档
- 文本处理：Save cleaner、Text transformer、Search in selection
- 导航与专注：最近文件 HUD、光标/滚动记忆、Focus UI、状态栏统计、浮动大纲、Heading/List zoom
- 表格增强（Lite）：列插入/删除/对齐/格式化 + Tab 导航
- 结构化视图：`.board` JSON 看板 + Flow board（拖拽改写文档）
- 预览渲染：AntV Infographic 渲染器
- 文件列表增强：Frontmatter icon/banner + 文件树高亮
- 小工具：Footnotes、Inline calc、Random generator

## 7. 质量状态

- `npm test`：通过（当前 80+ tests）
- `npm run build`：通过
- `npm run lint`：通过

