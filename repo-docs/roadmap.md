# Editor Pro 路线图（低负担版本）

目标：把“必装插件”的**关键体验**逐个融合进 Editor Pro，但不引入复杂 UI、不强迫用户配置，默认即用、可随时关闭。

规则：
- 默认不开新概念（尽量复用现有 Obsidian 心智：命令、快捷键、少量设置开关）
- 高风险/高负担功能（全库扫描、复杂模板语言、重度 UI）后置

## 0. 现状（已完成）

| 项目 | 体验点 | 状态 | 位置 |
|---|---|---|---|
| Surround selection | 选区按括号直接包裹 | ✅ | `src/features/editing/smart-typography.ts` |
| Smart backspace | `(|)` 退格同时删一对 | ✅ | `src/features/editing/smart-typography.ts` |
| Smart paste URL | 选中文字粘贴 URL -> Markdown 链接 | ✅ | `src/features/editing/smart-paste-url.ts` |
| Smart toggle | 加粗/斜体/高亮/行内码智能切换 | ✅ | `src/features/formatting/smart-toggle.ts` |
| Slash command | `/` `、` `\\` 触发插入 | ✅ | `src/features/slash-command/*` |
| Board v2 (React) | `.board` 看板（拖拽/编辑） | ✅ | `src/views/board-*` |

## 1. T0（核心幸福感，零学习成本）

| 优先级 | 功能 | 用户怎么用 | 默认 | 负担 | 预计 |
|---|---|---|---|---|---|
| T0-1 | Typewriter scroll | 打开开关，光标行保持居中 | 开 | 低 | ✅ 已完成 |
| T0-2 | Outliner 最小集 | 在列表里 Tab 缩进/Shift+Tab 反缩进；Alt+↑↓ 移动列表项 | 关（仅命令） | 中 | Soon |
| T0-3 | Smart typography（谨慎） | 可选将 `...`->`…`、`--`->`—` 等 | 关 | 中 | Later |

## 2. T1（效率增强，可选入口）

| 优先级 | 功能 | 用户怎么用 | 默认 | 负担 | 说明 |
|---|---|---|---|---|---|
| T1-1 | Advanced tables 补齐入口 | 右键/命令暴露“插列/删列/对齐/格式化” | 关（避免误触） | 中 | 我们已实现部分算法但缺入口 |
| T1-2 | Slash command: 动态模板（Lite） | 只支持少量变量：`{{date}}` `{{time}}` `{{cursor}}` | 关 | 中/高 | 不做脚本语言，不做“必须配置” |
| T1-3 | Auto Link Title（可选联网） | 粘贴 URL 自动抓标题，失败降级 | 关 | 中 | 涉及隐私/网络，单独开关 |
| T1-4 | Paste Image Rename | 粘贴图片重命名归档 | 开 | 中 | 高价值但要做安全回退 |
| T1-5 | Cursor Memory | 恢复光标/滚动位置 | 开 | 中 | 需谨慎避免抢占原生行为 |
| T1-6 | Text Transformer | 右键/命令：大小写、去空行、合并多行 | 开 | 中 | 纯编辑器能力 |

## 3. T2（管理/视觉，后置）

| 优先级 | 功能 | 风险点 |
|---|---|---|
| T2-1 | Tag Wrangler 类能力 | 全库扫描、性能/误改风险高 |
| T2-2 | Linter 类能力 | “统一格式”容易引发争议，默认必须关闭 |

## 执行方式（我会怎么“慢慢做”）

1. 每次只上一个“可验证”的小功能（≤ 1 天工作量）
2. 每次都带：单测（能测则测）、lint/build 通过、部署到你的 vault 插件目录
3. 每次更新：`repo-docs/feature-checklist.md` + 这份路线图的状态
