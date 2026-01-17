# Editor Pro 目录结构

本文档描述了 Editor Pro 插件的最终目录结构。

## 目录总览

```
src/
├── core/                   # 核心基础层
│   ├── FeatureRegistry.ts  # 功能注册器
│   └── index.ts            # 核心导出
│
├── types/                  # 全局类型定义
│   ├── index.ts            # 类型主导出
│   ├── plugin.ts           # 插件相关类型
│   └── common.ts           # 通用工具类型
│
├── features/               # 功能模块层
│   ├── editor/             # 编辑器核心增强
│   ├── input/              # 输入增强
│   ├── callout/            # Callout 增强
│   ├── charts/             # 图表渲染
│   ├── templates/          # 模板系统
│   ├── navigation/         # 导航功能
│   ├── ui/                 # UI 增强
│   ├── file-ops/           # 文件操作
│   ├── tools/              # 小工具
│   ├── visuals/            # 可视化渲染
│   ├── homepage/           # 首页仪表板
│   ├── vault-guardian/     # 目录守护
│   └── mcp/                # MCP Server
│
├── utils/                  # 工具函数
└── views/                  # 自定义视图
```

## Feature 分类说明

| 目录 | 职责 | 包含功能 |
|------|------|----------|
| `editor/` | 编辑器核心 | keyshots, smart-toggle, outliner, typewriter, paste等 |
| `input/` | 输入增强 | smart-input, magic-input, slash-command |
| `callout/` | Callout | picker, wrapper, integrator |
| `charts/` | 图表渲染 | ECharts, Graphviz, Vega-Lite |
| `templates/` | 模板系统 | modal, engine, snippets, loader |
| `navigation/` | 导航 | cursor-memory, recent-files |
| `ui/` | UI增强 | focus-mode, outline, status-bar, modals |
| `file-ops/` | 文件操作 | YAML, tags, save-cleaner, decorator |
| `tools/` | 小工具 | footnotes, calc, random, transform |
| `visuals/` | 可视化 | overdue, infographic, nldates |
| `homepage/` | 首页 | homepage-view, homepage-manager |
| `vault-guardian/` | 守护 | rules, health-check, modals |
| `mcp/` | MCP | mcp-server, mcp-feature |

## Feature 目录规范

每个 Feature 目录应包含：

```
feature-name/
├── index.ts           # 必须：模块统一导出
├── types.ts           # 可选：私有类型定义
├── [feature]-manager.ts # 可选：功能管理器
└── [component].ts     # 功能实现文件
```

## 类型定义规范

| 类型范围 | 位置 |
|----------|------|
| 全局类型 | `src/types/` |
| 私有类型 | `feature/types.ts` |
| Settings | `settings.ts` |

---

*迁移完成：2026-01-18*
