# Obsidian 插件融合映射表（Editor Pro 评审版）

用途：把“常见必装插件”拆成**可实现的编辑器能力**，标记：是否纳入 Editor Pro、默认开关策略、当前状态。
原则：Editor Pro 主线只做 **编辑体验/快捷键/低负担**；不复制他人代码，只复刻体验。

状态说明：

- ✅ 已实现（Editor Pro 已有）
- 🚧 部分实现（缺入口/缺边界/缺设置）
- ⬜ 待做（确定要做）
- 💤 候选/暂缓（先放池子里）
- ❌ 不做/不在主线（偏框架/编辑器模式/重度系统）

---

## 1) 你这份表中「编辑体验主线」优先融合清单

| 来源插件                                   | 我们要的精华能力                                    | Editor Pro 方案（低负担）                             | 默认开关建议                 | 状态  |
| ------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------- | ---------------------------- | ----- |
| Advanced Tables / Table Enhancer           | 表格导航、行列操作、对齐、格式化                    | Tab 导航 + 列插入/删除 + 列对齐 + 表格格式化（命令+右键入口） | 默认开                         | ✅    |
| Outliner                                   | 列表缩进/反缩进、子树移动、折叠/展开                | Tab/Shift+Tab 缩进/反缩进 + 折叠命令 + 列表项整块移动（复用 move-line-up/down） | 默认开（仅列表）             | ✅    |
| Typewriter Mode / Focus Mode / Zen         | 光标居中、高亮当前行、淡出非当前段落、禅模式隐藏 UI | 居中（已做）+ 禅模式隐藏 UI（CSS）                     | 默认开                         | ✅    |
| Paste URL into Selection                   | 选区粘贴 URL -> Markdown 链接                       | 已实现；仅在选区 + http(s) 时接管                     | 默认开                       | ✅    |
| Auto Link Title                            | URL 获取网页标题                                    | 剪贴板 HTML 优先；可选联网抓 `<title>`；失败降级为纯 URL | 默认开（联网默认关）          | ✅    |
| Remember Cursor Position                   | 文件级光标/滚动记忆                                 | 轻量缓存（文件级）                                    | 默认开                       | ✅    |
| Natural Language Dates                     | `today/tomorrow/next mon`                           | 离线最小解析（中英常用）                               | 默认开（仅识别时）            | ✅    |
| Linter / Save Cleaner                      | 保存/格式化清理                                     | Save cleaner：保存时移除行尾空格 + 结尾换行            | 默认开（规则很保守）          | ✅    |
| Text Format / Split and Join / Transformer | 大小写/合并分割/排序/去空行                         | 命令 + 右键入口                                        | 默认开                       | ✅    |
| Find & Replace in Selection                | 选区内查找替换                                      | 选区查找替换 Modal（命令 + 右键入口）                  | 默认开                       | ✅    |
| Paste Image Rename                         | 图片粘贴重命名/归档                                 | 粘贴图片钩子 + 附件策略安全落盘 + 插入 `![[...]]`       | 默认开                       | ✅    |

---

## 2) 你表格中「已实现/已覆盖」对应关系（Editor Pro）

| 能力                                   | 我们现状          | 位置                                         |
| -------------------------------------- | ----------------- | -------------------------------------------- |
| Paste URL into selection               | ✅ 已实现（离线） | `src/features/editing/smart-paste-url.ts`  |
| Typewriter scroll（光标居中）          | ✅ 已实现         | `src/features/editing/typewriter-mode.ts`  |
| Auto pair / smart backspace / surround | ✅ 已实现         | `src/features/editing/smart-typography.ts` |
| 表格 Tab 导航                          | ✅ 已实现         | `src/features/table/table-navigation.ts`   |
| 智能格式切换                           | ✅ 已实现         | `src/features/formatting/smart-toggle.ts`  |

---

## 3) 明确「不做/不在主线」的（避免把插件做成大杂烩）

| 插件/能力                           | 原因                                       | 结论           |
| ----------------------------------- | ------------------------------------------ | -------------- |
| Obsidian Vim / Neovim / Emacs       | 属于编辑器模式体系，侵入性强、维护成本高   | ❌             |
| Meta Bind / Modal Form              | 更像“交互式应用/表单系统”，偏项目/数据库 | 💤（不在主线） |
| Longform / Lineage                  | 长文项目管理/编译导出，偏工作流系统        | 💤（后置）     |
| Commander / Note Toolbar / 工具栏类 | 偏 UI 按钮编排，不是“编辑体验核心”       | 💤（可选）     |

---

## 4) 你要勾选的「本轮确认清单」

> 你在这里打勾，我就按顺序推进实现（每个功能都会加设置开关；默认是否开启按上表建议）。

- [X] Outliner 最小集（缩进/反缩进/整块移动/折叠展开）
- [X] Advanced Tables：补齐列/对齐/格式化入口
- [X] Auto Link Title（联网可选）：URL 粘贴获取标题（失败降级）
- [X] Paste Image Rename：图片粘贴重命名归档
- [X] Remember Cursor Position：光标/滚动记忆
- [X] Natural Language Dates：自然语言日期（离线最小集）
- [X] Text Transformer：大小写/去空行/合并多行/排序
- [X] Focus UI：禅模式（隐藏侧边栏/状态栏等）
