# Editor Pro 开发标准作业程序 (SOP)

本文档旨在规范 Editor Pro 插件的开发流程，确保每次新增功能或修复 Bug 时，都能保持高质量的代码标准和卓越的用户体验。

## 🌟 核心原则：用户体验优先 (User First)

在编写任何代码之前，先问自己三个问题：
1. **这个功能解决了什么痛点？**（不要为了开发而开发）
2. **用户会感到困惑吗？**（配置项是否太多？行为是否符合预期？）
3. **是否干扰了用户的正常写作？**（这是编辑器的底线）

---

## 📁 一、目录结构规范

### Feature 分类原则

| 分类 | 目录 | 职责 | 示例 |
|------|------|------|------|
| **编辑器核心** | `editor/` | 直接操作编辑器内容 | keyshots, smart-toggle, outliner |
| **输入增强** | `input/` | 拦截/增强用户输入 | smart-input, slash-command |
| **Callout** | `callout/` | Callout 相关 | picker, wrapper |
| **图表** | `charts/` | 代码块图表渲染 | ECharts, Graphviz, Vega |
| **模板** | `templates/` | 模板和代码片段 | template-modal, snippets |
| **导航** | `navigation/` | 光标/文件导航 | cursor-memory, recent-files |
| **UI** | `ui/` | 界面增强组件 | focus-mode, outline, status-bar |
| **文件操作** | `file-ops/` | 文件元数据管理 | YAML, tags, save-cleaner |
| **小工具** | `tools/` | 独立小功能 | footnotes, calc, random |
| **可视化** | `visuals/` | 阅读模式渲染 | overdue, infographic |
| **首页** | `homepage/` | 首页仪表板 | homepage-view |
| **守护** | `vault-guardian/` | 目录结构守护 | rules, health-check |
| **MCP** | `mcp/` | AI Agent 服务 | mcp-server |

### Feature 目录结构

每个 Feature 目录**必须**包含：

```
feature-name/
├── index.ts           # 必须：模块统一导出
├── types.ts           # 可选：私有类型定义
├── [feature]-manager.ts # 可选：功能管理器
├── [component].ts     # 功能实现文件
└── [component].tsx    # React 组件（如有）
```

### 类型定义规范

| 类型范围 | 位置 | 说明 |
|----------|------|------|
| **全局类型** | `src/types/` | 多模块共用的类型 |
| **私有类型** | `feature/types.ts` | 仅该功能使用的类型 |
| **Settings** | `settings.ts` | 插件配置接口 |

---

## 🚀 二、新功能开发流程

### 1. 设计与评估
*   **文档先行**：新功能必须先在 `docs/USER_GUIDE.md` 和 `README.md` 中进行规划和描述。
*   **侵入性评估**：
    *   该功能是否会**修改用户文件**？如果是，必须默认关闭，并添加醒目的警告（如 YAML 自动更新）。
    *   该功能是否需要**联网**？如果是，必须明确告知用户并处理超时/断网情况。
*   **性能评估**：
    *   避免在主线程进行繁重计算（如全库扫描）。
    *   耗时操作必须异步执行，并提供 UI 反馈（如 Notice）。

### 2. 配置项设计 (Settings)
*   **开关控制**：所有新功能必须可以通过设置关闭。
*   **默认值原则**：
    *   ✅ **纯增强/无副作用**（如：快捷键、UI 美化）：默认 `true`。
    *   ⚠️ **有副作用/修改文件/联网**（如：SaveCleaner、自动下载图片）：默认 `false`。
*   **加入预设 (Presets)**：
    *   必须将开关加入 `minimal` / `writer` / `power` 预设。
*   **文案规范**：
    *   `name`: 简明扼要。
    *   `desc`: 一句话说明作用。
    *   `longDesc`: 详细说明副作用、依赖关系或使用技巧（支持 `\n` 换行）。
*   **多行输入规范 (`multiline`)**：
    *   当配置项需要用户输入"**每行一个**"格式的数据时（如目录列表、规则配置），**必须**在 `SettingItem` 中设置 `multiline: true`。
    *   设置 `multiline: true` 后，UI 会渲染为 `TextArea` 多行文本框，用户可正常使用 Enter 键换行。
    *   **反例**：使用 `addText()` 渲染单行输入框会导致用户无法换行，体验极差。
    *   **示例**：
        ```typescript
        {
            name: "追踪目录配置",
            desc: "每行一个目录，格式: path:name:icon",
            key: "homepageTrackedFolders",
            type: "text",
            multiline: true, // ← 关键！
        }
        ```

### 3. 代码实现规范 (Implementation)
*   **输入法兼容性 (IME)**：
    *   涉及 `keydown` 或 `editor-change` 的功能，必须检查 `isComposing` 状态。
*   **资源管理 (Lifecycle)**：
    *   必须在 `main.ts` 的 `onunload()` 中调用清理方法，防止内存泄漏。
*   **模块导出**：
    *   外部模块应通过 `index.ts` 导入，而非直接引用内部文件。

### 4. 测试规范 (Testing)
*   **单元测试**：
    *   核心逻辑（Utils, Rules）必须编写 Jest 测试 (`npm test`)。
*   **边界测试**：
    *   空文件、空行、光标在行首/行尾。

---

## 🔗 三、文件联动指南 (File Linkage Guide)

当你进行以下操作时，**必须**检查并修改对应的相关文件，切勿遗漏。

### 场景 A：开发一个新功能

1.  **确定目录**：根据分类原则选择正确的 Feature 目录。
2.  **创建文件**：
    *   `src/features/[category]/[feature].ts` - 功能实现
    *   更新 `src/features/[category]/index.ts` - 添加导出
3.  **`src/settings.ts`**：
    *   `EditorProSettings` 接口：添加 `enableFeature` 开关。
    *   `DEFAULT_SETTINGS`：设置合理的默认值。
    *   `SETTING_PRESETS`：**关键！** 将此开关加入 `minimal` / `writer` / `power` 等合适的预设中。
    *   `SECTIONS`：在设置面板添加开关 UI。
4.  **`src/main.ts`**：
    *   `onload()`：添加功能初始化的入口点。
    *   `onunload()`：**关键！** 确保调用功能的 cleanup 方法。
5.  **文档更新**：
    *   更新 `README.md` 和 `docs/USER_GUIDE.md`。

### 场景 B：添加新的 Slash Command (斜杠命令)
1.  **`src/features/input/menu.ts`**：
    *   `COMMANDS` 数组：添加命令定义 (id, name, aliases)。
    *   `executeCommand()`：在 switch case 中添加执行逻辑。

---

## 🐛 四、Bug 修复流程
1. **复现与定位**：不要猜测，先在测试用例中复现问题。
2. **修复**：修改代码。
3. **回归测试**：运行所有测试 (`npm test`) 确保没有引入新 Bug。

---

## ✅ 五、发布前检查清单 (Checklist)

在提交代码前，请逐一核对：

- [ ] **目录规范**：新功能是否放入了正确的 Feature 分类？
- [ ] **模块导出**：是否更新了 `index.ts` 导出？
- [ ] **文件联动**：是否按照文件联动指南修改了所有相关文件？
- [ ] **设置同步**：新功能是否已加入 `SETTING_PRESETS`？
- [ ] **资源清理**：`onunload` 是否清理了所有定时器和监听器？
- [ ] **测试通过**：`npm test` 是否全绿？
- [ ] **文档一致**：README 和 User Guide 是否已更新？

---

> **记住：我们不只是在写代码，我们是在为用户创造愉悦的写作体验。**
