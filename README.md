# Editor Pro (Obsidian Community Plugin)

Editor Pro 是一个“编辑增强”插件：把常用的编辑器效率功能整合到一个插件里（智能格式切换、块转换、斜杠命令、表格增强、YAML 自动化、轻量看板等），尽量减少额外插件依赖与配置成本。

## 功能概览

- 智能格式切换：加粗/斜体/删除线/高亮/行内代码（避免符号叠加）
- 块转换：选中内容一键包裹为 Callout 或代码块
- 斜杠命令：`/`、`、`、`\\` 触发命令菜单（支持拼音首字母 MVP）
- 表格增强：Tab 在单元格间跳转
- YAML 自动化：自动维护 frontmatter 的 `created`/`updated`
- 项目看板：`.board`（JSON）文件的拖拽看板视图
- Infographic：` ```infographic` 代码块在预览/阅读模式渲染为 SVG

## 安装（手动）

把本仓库构建产物复制到你的 vault：

```
<Vault>/.obsidian/plugins/editor-pro/
  main.js
  manifest.json
  styles.css
```

## 使用

### 1) 打开项目看板

- 点击左侧边栏图标 **打开项目看板**
- 插件会在库内创建/打开设置里的 `.board` 文件（默认 `Kanban.board`）

### 2) 斜杠命令

在编辑器中输入以下任意一个触发符号即可唤起菜单：

- `/`
- `、`（中文顿号）
- `\\`（反斜杠）

### 3) 快捷键

Editor Pro **不会内置默认快捷键**（避免与用户已有快捷键冲突）。请在 Obsidian 中自行绑定：

**Settings → Hotkeys** → 搜索 “Editor Pro” 对应命令。

## 开发

### 环境

- Node.js 18+
- 包管理器：npm
- 打包：esbuild（见 `esbuild.config.mjs`）

### 命令

```bash
npm install
npm run dev    # watch
npm run build  # 生产构建（生成 main.js，但 main.js 不应提交到 Git）
npm test
npm run lint
```

## 设计与需求文档

见 `docs/`：

- `docs/requirements.md`
- `docs/task-board.md`
- `docs/research-painpoints.md`

## 仓库内文档（可随 git 同步）

由于本机的 `docs/` 可能是软链接（用于指向笔记库），为保证他人接手时可直接在仓库中查看，关键文档也会同步到：

- `repo-docs/README.md`
