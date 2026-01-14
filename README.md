# Editor Pro (Obsidian Community Plugin)

Editor Pro 是一个"编辑增强"插件：把常用的编辑器效率功能整合到一个插件里，尽量减少额外插件依赖与配置成本。

## 功能概览

### 编辑器增强
- **智能格式切换**：加粗/斜体/删除线/高亮/行内代码（避免符号叠加）
- **Keyshots**：行上移/下移/复制/删除/选中；列表项整块移动
- **Outliner**：列表 Tab/Shift+Tab 缩进、折叠/展开
- **Smart Typing**：自动配对、智能退格、中英空格
- **Block Break**：引用/Callout 内 Shift+Enter 跳出

### 斜杠命令
- 触发字符：`/`、`、`、`\\`
- 支持拼音首字母搜索（如 `/dmk` → 代码块）
- 内置命令：Callout/代码块/表格/日期/Mermaid/Infographic 等

### 表格增强
- Tab/Shift+Tab 单元格导航
- 列插入/删除/对齐/格式化

### 智能粘贴
- URL into selection（选中文字粘贴 URL 变链接）
- Auto link title（自动获取网页标题）
- Smart image paste（图片重命名归档）

### 自动化
- YAML 自动维护 `created`/`updated`
- 保存时清理（去行尾空格）
- 光标/滚动位置记忆

### 可视化
- Infographic 渲染器（AntV，支持 219 种模板）
- 浮动大纲、状态栏统计、Focus UI

### 小工具
- 脚注助手、行内计算、随机生成器（UUID/骰子）
- 文本转换器、选区查找替换

## 安装

把构建产物复制到你的 vault：

```
<Vault>/.obsidian/plugins/editor-pro/
  main.js
  manifest.json
  styles.css
```

## 使用

### 斜杠命令

在编辑器中输入 `/`、`、` 或 `\\` 即可唤起命令菜单。

### 快捷键

Editor Pro **不会内置默认快捷键**（避免冲突）。请在 Obsidian 中自行绑定：

**Settings → Hotkeys** → 搜索 "Editor Pro"

## 开发

```bash
npm install
npm run dev    # watch
npm run build  # 生产构建
npm test       # 测试
npm run lint   # 代码检查
```

详见 `DEVELOPMENT.md`。

## 文档

- `CHANGELOG.md` - 版本变更记录
- `DEVELOPMENT.md` - 开发指南
