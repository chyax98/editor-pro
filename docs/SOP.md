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
*   **侵入性评估**：
    *   该功能是否会**修改用户文件**？如果是，必须默认关闭，并添加醒目的警告（如 YAML 自动更新）。
    *   该功能是否需要**联网**？如果是，必须明确告知用户并处理超时/断网情况。
    *   该功能是否影响**多设备同步**？（如时间戳更新）。
*   **性能评估**：
    *   避免在主线程进行繁重计算（如全库扫描）。
    *   耗时操作必须异步执行，并提供 UI 反馈（如 Notice）。
*   **目录评估**：
    *   确定功能属于哪个分类（参考上表）。
    *   如果功能跨越多个分类，放入**主要职责**对应的目录。

### 2. 配置项设计 (Settings)
*   **开关控制**：所有新功能必须可以通过设置关闭。
*   **默认值原则**：
    *   ✅ **纯增强/无副作用**（如：快捷键、UI 美化）：默认 `true`。
    *   ⚠️ **有副作用/修改文件/联网**（如：SaveCleaner、自动下载图片）：默认 `false`。
*   **加入预设 (Presets)**：
    *   新功能应根据性质加入到 `minimal`、`writer` 或 `power` 预设中，方便用户一键开启。
*   **文案规范**：
    *   `name`: 简明扼要。
    *   `desc`: 一句话说明作用。
    *   `longDesc`: 详细说明副作用、依赖关系或使用技巧（支持 `\\n` 换行）。
    *   **一致性检查**：代码行为必须与设置描述**严格一致**。

### 3. 代码实现规范 (Implementation)
*   **输入法兼容性 (IME)**：
    *   涉及 `keydown` 或 `editor-change` 的功能，必须检查 `isComposing` 状态。
    *   **严禁**在中文输入过程中干扰选词。
*   **资源管理 (Lifecycle)**：
    *   涉及定时器 (`setTimeout`)、DOM 事件监听、网络请求的功能，必须实现 `cleanup()` 方法。
    *   必须在 `main.ts` 的 `onunload()` 中调用清理方法，防止内存泄漏。
*   **禁止魔法数字 (Magic Numbers)**：
    *   ❌ `i < line - 50`
    *   ✅ `i >= 0` (依赖正确的逻辑边界，而非随意设定的数字)
*   **避免硬编码 (Hardcoding)**：
    *   ❌ 硬编码下拉列表（如 Callout 类型）。
    *   ✅ 尽量完整支持官方标准，或提供扩展能力。
*   **模块导出**：
    *   每个 Feature 目录必须有 `index.ts` 统一导出。
    *   外部模块应通过 `index.ts` 导入，而非直接引用内部文件。

### 4. 测试规范 (Testing)
*   **单元测试**：
    *   核心逻辑必须编写 Jest 测试 (`npm test`)。
    *   特别是涉及文本转换、正则匹配的功能。
*   **边界测试**：
    *   空文件、空行、光标在行首/行尾。
    *   代码块内、特殊符号干扰。

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

### 场景 B：添加新的 Slash Command (斜杠命令)
1.  **`src/features/input/menu.ts`**：
    *   `COMMANDS` 数组：添加命令定义 (id, name, aliases)。
    *   `executeCommand()`：在 switch case 中添加执行逻辑。

### 场景 C：添加新的快捷键命令
1.  **`src/main.ts`**：
    *   `addCommand()`：注册 Obsidian 官方命令面板命令。
2.  **`src/settings.ts`**：
    *   如果该快捷键功能有对应的 toggle 开关，确保开关状态与命令可用性联动。

### 场景 D：添加新的模板/片段
1.  **`src/features/templates/snippets.ts`**：
    *   `BUILTIN_TEMPLATES`：添加新的模板定义。

---

## 🐛 四、Bug 修复流程
1. **复现与定位**：不要猜测，先在测试用例中复现问题。
2. **分析根因**：
    *   是逻辑错误？
    *   还是并没有真正理解用户的需求？
3. **修复与回归**：
    *   修复代码。
    *   运行所有测试 (`npm test`) 确保没有引入新 Bug。

---

## ✅ 五、发布前检查清单 (Checklist)

在提交代码前，请逐一核对：

- [ ] **目录规范**：新功能是否放入了正确的 Feature 分类？
- [ ] **模块导出**：是否更新了 `index.ts` 导出？
- [ ] **文件联动**：是否按照文件联动指南修改了所有相关文件？
- [ ] **用户体验**：是否解决了痛点？默认值是否合理？
- [ ] **设置同步**：新功能是否已加入 `SETTING_PRESETS`？
- [ ] **IME 兼容**：是否在中文输入法下测试过？
- [ ] **资源清理**：`onunload` 是否清理了所有定时器和监听器？
- [ ] **魔法数字**：代码中是否有无法解释的数字常量？
- [ ] **测试通过**：`npm test` 是否全绿？
- [ ] **文档一致**：README 和设置页面的描述是否与代码行为一致？

---

> **记住：我们不只是在写代码，我们是在为用户创造愉悦的写作体验。**
