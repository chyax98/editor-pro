# Editor Pro 开发交接文档

## 项目概述

Editor Pro 是一个 Obsidian 编辑增强插件，目标是整合常用编辑功能，让用户不需要安装 20+ 个插件就能获得舒适的编辑体验。

**核心定位**：富文本编辑器风格的 Markdown 编辑体验

---

## 项目结构

```
editor-pro/
├── src/
│   ├── main.ts              # 插件入口
│   ├── settings.ts          # 设置页面
│   ├── features/            # 功能模块
│   │   ├── formatting/      # 格式化（智能 toggle）
│   │   ├── callout/         # Callout 转换
│   │   └── slash-command/   # 斜杠命令
│   ├── utils/               # 工具函数
│   └── types/               # 类型定义
├── tests/                   # 测试文件
├── __mocks__/               # Mock Obsidian API
├── docs/                    # 设计文档（软链接到笔记库）
└── ...
```

---

## MVP 功能清单（第一版）

### 1. 智能 Toggle 格式化

**优先级**：P0（核心功能）

**问题描述**：
Obsidian 原生 Cmd+B 在已加粗文本上按下会添加更多 `**`，而非取消加粗。用户期望的行为是：
- 选中普通文本 → 加粗
- 选中已加粗文本 → 取消加粗
- 光标在加粗文本中 → 取消加粗

**需要实现的命令**：

| 命令 | 快捷键建议 | 标记符 |
|------|-----------|--------|
| 智能加粗 | Cmd+B | `**text**` |
| 智能斜体 | Cmd+I | `*text*` 或 `_text_` |
| 智能删除线 | Cmd+Shift+S | `~~text~~` |
| 智能高亮 | Cmd+Shift+H | `==text==` |
| 智能行内代码 | Cmd+` | `` `text` `` |

**实现思路**：

```typescript
// src/features/formatting/smart-toggle.ts

interface ToggleConfig {
  marker: string;      // 如 "**", "~~", "==" 等
  markerLength: number;
}

function smartToggle(editor: Editor, config: ToggleConfig) {
  const selection = editor.getSelection();
  const cursor = editor.getCursor();

  if (selection) {
    // 有选中文本的情况
    if (isWrappedWith(selection, config.marker)) {
      // 已有标记 → 移除
      const unwrapped = unwrap(selection, config.marker);
      editor.replaceSelection(unwrapped);
    } else {
      // 无标记 → 添加
      editor.replaceSelection(wrap(selection, config.marker));
    }
  } else {
    // 无选中文本，检查光标所在位置
    const line = editor.getLine(cursor.line);
    const wordRange = findWordBoundary(line, cursor.ch, config.marker);

    if (wordRange && isWrappedWith(line.slice(wordRange.from, wordRange.to), config.marker)) {
      // 光标在已标记文本中 → 移除标记
      // ...
    } else {
      // 直接插入空标记
      editor.replaceRange(config.marker + config.marker, cursor);
      editor.setCursor({ line: cursor.line, ch: cursor.ch + config.markerLength });
    }
  }
}
```

**参考插件**：
- [Smarter MD Hotkeys](https://github.com/chrisgrieser/obsidian-smarter-md-hotkeys) - 核心参考
- [Easy Typing](https://github.com/Yaozhuwa/easy-typing-obsidian) - 输入增强思路

**边界情况**：
1. 选中文本跨越多行
2. 选中文本部分包含标记（如选中 `te**xt**`）
3. 嵌套标记（如 `***bold italic***`）
4. 光标在标记符号上（如光标在 `**` 中间）

---

### 2. 选中文字转 Callout

**优先级**：P0（核心功能）

**问题描述**：
Obsidian Callout 需要每行前面加 `>`，编辑麻烦。用户想要：选中文字 → 按快捷键 → 变成 Callout。

**命令**：

| 命令 | 快捷键建议 |
|------|-----------|
| 转为 Callout | Cmd+Shift+C |
| 转为代码块 | Cmd+Shift+K |
| 转为引用块 | Cmd+Shift+Q |

**实现思路**：

```typescript
// src/features/callout/wrap-callout.ts

interface CalloutOptions {
  type: string;        // "info", "warning", "tip" 等
  title?: string;
  foldable?: boolean;
}

function wrapWithCallout(editor: Editor, options: CalloutOptions) {
  const selection = editor.getSelection();
  if (!selection) return;

  const lines = selection.split('\n');
  const calloutLines = lines.map(line => `> ${line}`);

  const header = options.foldable
    ? `> [!${options.type}]- ${options.title || ''}`
    : `> [!${options.type}] ${options.title || ''}`;

  const result = [header, ...calloutLines].join('\n');
  editor.replaceSelection(result);
}
```

**交互设计**：
1. 按快捷键后弹出类型选择菜单
2. 支持直接输入自定义类型
3. 记住上次使用的类型

**参考插件**：
- [Callout Manager](https://github.com/eth-p/obsidian-callout-manager) - Callout 样式管理
- [Code Block from Selection](https://github.com/dy-sh/obsidian-code-block-from-selection) - 选中转换思路

---

### 3. 斜杠命令菜单

**优先级**：P1

**问题描述**：
类似 Notion 的 `/` 命令菜单，快速插入各种元素。

**特殊需求**：
1. 支持英文 `/` 触发
2. 支持中文顿号 `、` 触发（中文输入法下无需切换）
3. 支持拼音首字母搜索（如 `/dmk` → 代码块）

**实现思路**：

```typescript
// src/features/slash-command/menu.ts

interface SlashCommand {
  id: string;
  name: string;           // 显示名称
  aliases: string[];      // 别名（含拼音首字母）
  icon: string;
  action: (editor: Editor) => void;
}

const commands: SlashCommand[] = [
  {
    id: 'codeblock',
    name: '代码块',
    aliases: ['dmk', 'codeblock', 'code'],
    icon: 'code',
    action: (editor) => insertCodeBlock(editor)
  },
  {
    id: 'callout',
    name: '提示块',
    aliases: ['tsk', 'callout', 'tip'],
    icon: 'alert-circle',
    action: (editor) => insertCallout(editor)
  },
  // ...
];
```

**拼音搜索实现**：
- 使用 [pinyin-pro](https://github.com/zh-lx/pinyin-pro) 库生成拼音
- 或参考 [Fuzzy Chinese Pinyin](https://github.com/lazyloong/obsidian-fuzzy-chinese) 的算法

**参考插件**：
- [Fuzzy Chinese Pinyin](https://github.com/lazyloong/obsidian-fuzzy-chinese) - 拼音搜索算法

---

## 后续功能（P2）

### 4. 标题快捷键
- Cmd+1~6 设置对应级别标题

### 5. 任务状态切换
- Cmd+L 切换任务复选框

### 6. 表格增强
- 快捷插入表格
- 行列操作

---

## 技术要点

### Editor API 使用

```typescript
// 获取当前编辑器
const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

// 常用方法
editor.getSelection()           // 获取选中文本
editor.replaceSelection(text)   // 替换选中文本
editor.getCursor()              // 获取光标位置
editor.getLine(lineNum)         // 获取指定行内容
editor.replaceRange(text, from, to)  // 替换指定范围
editor.setCursor(pos)           // 设置光标位置
```

### 注册命令

```typescript
this.addCommand({
  id: 'smart-bold',
  name: 'Smart Toggle Bold',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    smartToggle(editor, { marker: '**', markerLength: 2 });
  },
  hotkeys: [{ modifiers: ['Mod'], key: 'b' }]
});
```

### 避坑指南

1. **不要用 `Vault.modify`**：编辑当前文件用 `Editor` 接口
2. **类型检查**：使用 `instanceof` 而非类型断言
3. **路径处理**：使用 `normalizePath()` 规范化路径
4. **事件注册**：使用 `this.registerEvent()` 确保卸载时清理
5. **性能**：高频事件要防抖，大文件用 `Vault.process()`

详见 `docs/dev-pitfalls.md`

---

## 测试策略

### Jest 配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^obsidian$': '<rootDir>/__mocks__/obsidian.ts'
  }
};
```

### Mock Obsidian API

```typescript
// __mocks__/obsidian.ts
export class Editor {
  private content = '';
  private selection = '';
  private cursor = { line: 0, ch: 0 };

  getSelection() { return this.selection; }
  replaceSelection(text: string) { /* ... */ }
  getCursor() { return this.cursor; }
  // ...
}
```

### 测试重点

1. **单元测试**：smartToggle 的各种边界情况
2. **集成测试**：命令注册和执行
3. **手动测试**：实际 Obsidian 中的 UI 交互

---

## 开发命令

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（监听文件变化）
npm run build      # 构建生产版本
npm run lint       # 代码检查
npm run test       # 运行测试（需配置 Jest）
```

---

## 参考资源

### 官方
- [官方插件模板](https://github.com/obsidianmd/obsidian-sample-plugin)
- [API 文档](https://docs.obsidian.md/Plugins)
- [API 类型定义](https://github.com/obsidianmd/obsidian-api)

### 参考插件
- [Smarter MD Hotkeys](https://github.com/chrisgrieser/obsidian-smarter-md-hotkeys) - 智能 toggle 核心参考
- [Easy Typing](https://github.com/Yaozhuwa/easy-typing-obsidian) - 输入增强
- [Fuzzy Chinese Pinyin](https://github.com/lazyloong/obsidian-fuzzy-chinese) - 拼音搜索

### 设计文档
项目 `docs/` 目录下有详细的调研和设计文档：
- `requirements.md` - 需求清单
- `dev-pitfalls.md` - 开发避坑
- `git-repos.md` - 参考仓库列表
- `research-painpoints.md` - 用户痛点调研
