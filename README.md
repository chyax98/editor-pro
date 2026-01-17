# Editor Pro for Obsidian

> **The Ultimate Writing Enhancement Suite for Obsidian.**
> 打造 Obsidian 上最流畅、最沉浸的写作体验。

[![Release](https://img.shields.io/github/v/release/chyax98/editor-pro)](https://github.com/chyax98/editor-pro/releases)
[![License](https://img.shields.io/github/license/chyax98/editor-pro)](LICENSE)

Editor Pro 是一个功能强大的 Obsidian 插件，旨在通过**智能输入**、**可视化增强**和**工作流优化**，让写作回归本质。它不只是一个工具，更是一套精心设计的写作习惯。

---

## ✨ 核心特性 (Features)

### 🏠 仪表板 (Homepage)
全新的启动页体验，让这不仅仅是一个笔记软件，而是你的个人工作台。
*   **智能问候**：根据时间显示贴心问候。
*   **工作流概览**：清晰展示 Inbox、进行中和归档状态。
*   **置顶笔记**：右键菜单一键置顶重要笔记。
*   **清理提醒**：自动检测堆积的 Inbox 和周记，提醒定期整理。

### 🛡️ 结构守护 (Vault Guardian)
告别混乱的文件夹结构，Editor Pro 帮你守护 Vault 的整洁。
*   **根目录保护**：防止文件随意散落在根目录，强制分类。
*   **规则引擎**：自定义允许的根目录、子文件夹深度和命名规范。
*   **健康检查**：一键扫描 Vault，发现并修复结构问题。

### ✍️ 智能写作 (Smart Writing)
*   **Magic Input**: 输入 `->` 变 `→`，`@today` 变日期，自然流畅。
*   **Slash Commands**: `/` 呼出全能菜单，插入表格、图表、Callout、模板。
*   **Smart Paste**: 粘贴链接自动获取网页标题，粘贴图片自动重命名。
*   **Focus Mode**: 也就是“专注模式”，高亮当前段落，淡化其他上下文。

### 📊 可视化引擎 (Visualization)
无需安装额外插件，直接渲染专业图表：
*   **Mermaid** & **Graphviz**: 流程图、架构图。
*   **ECharts** & **Vega-Lite**: 交互式数据图表、统计图。
*   **Infographic**: 简易信息图组件。
*   **Overdue Highlight**: 自动高亮过期任务和日期。

### 🛠️ 效率工具 (Power Tools)
*   **Typewriter Mode**: 打字机滚动，保持光标在屏幕中央。
*   **Auto Pairs**: 智能符号配对和中英空格自动插入。
*   **Snippets**: 强大的 JavaScript 模板引擎。

---

## 📥 安装 (Installation)

### 通过 BRAT 安装 (Beta)
1. 安装 **BRAT** 插件。
2. 添加仓库：`chyax98/editor-pro`。
3. 启用插件，打开设置页根据需要开启功能。

### 手动安装
1. 从 [Releases](https://github.com/chyax98/editor-pro/releases) 下载 `main.js`, `manifest.json`, `styles.css`。
2. 放入 `.obsidian/plugins/editor-pro/` 文件夹。
3. 重启 Obsidian。

---

## 📚 文档指南 (Documentation)

*   📖 **[用户指南 (User Guide)](docs/USER_GUIDE.md)**: 完整的功能使用手册。
*   🏗️ **[项目架构 (Architecture)](AGENTS.md)**: 技术架构与模块说明。
*   🛠️ **[开发规范 (SOP)](docs/SOP.md)**: 代码目录结构与贡献指南。
*   🔄 **[迁移指南 (Migration)](docs/MIGRATION.md)**: 了解最新的架构变更。

---

## 🤝 贡献 (Contributing)
欢迎提交 Issue 或 PR！在提交代码前，请务必阅读 **[开发规范 (SOP)](docs/SOP.md)** 以确保代码符合规范。

## 📄 License
MIT License
