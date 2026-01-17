# Infographic 深度语法参考手册 (Expert Guide)

> **版本**: @antv/infographic 0.2.10

Infographic 渲染器基于 `@antv/infographic` 库，这是 AntV 推出的**下一代声明式信息图可视化引擎**。它专为**写作场景**设计，通过极简的 DSL 快速生成高质量的信息图，让笔记更加生动专业。

> **💡 为什么 Infographic 在写作场景中比 ECharts/Mermaid 更强大？**
> - **零配置美观**: 内置 200+ 精心设计的模板，开箱即用
> - **语义化数据**: 使用 `label`/`desc`/`value` 等自然语义描述数据
> - **AI 友好**: 简洁的 DSL 语法，非常适合 AI 生成
> - **SVG 高清输出**: 任何分辨率都清晰锐利

---

## 📐 DSL 核心语法 (Core Syntax)

### 基本结构
```text
infographic <template-name>
data
  items
    - label <文本>
      desc <描述>
      value <数值>
```

### 语法规则
- **入口**: `infographic <template-name>` 指定模板
- **缩进**: 必须使用 **2 个空格**（对缩进非常敏感！）
- **数据字段**: 统一使用 **`items`** 作为数据字段名
- **键值对**: 使用空格分隔 `key value`
- **数组**: 使用 `-` 换行表示数组项

---

## 🎨 模板分类与使用场景 (Templates by Category)

### 1️⃣ 列表类 (List) - 清单、功能列表

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `list-row-simple-horizontal-arrow` | 水平箭头步骤 | **流程概览**（推荐！） |
| `list-row-horizontal-icon-arrow` | 带图标的水平步骤 | 功能介绍 |
| `list-grid-compact-card` | 网格卡片 | 功能清单、产品特性 |
| `list-column-simple-vertical-arrow` | 垂直箭头列表 | 任务清单 |
| `list-grid-simple` | 简单网格 | 要点列表 |

**示例 - 步骤流程（官方验证）**:
```infographic
infographic list-row-simple-horizontal-arrow
data
  items
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete
```

**示例 - 功能网格**:
```infographic
infographic list-grid-compact-card
data
  items
    - label 智能输入
      desc 自动补全与纠错
    - label 图表渲染
      desc 支持多种图表
    - label 快捷键
      desc 高效编辑体验
```

### 2️⃣ 序列类 (Sequence) - 时间线、步骤流程

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `sequence-timeline-simple` | 简洁时间线 | 历史/版本记录 |
| `sequence-steps-simple` | 步骤流程 | 操作指南 |
| `sequence-stairs-front-simple` | 阶梯式 | 等级/层次 |
| `sequence-snake-steps-simple` | 蛇形步骤 | 长流程 |
| `sequence-roadmap-vertical-simple` | 垂直路线图 | 项目规划 |

**示例 - 时间线**:
```infographic
infographic sequence-timeline-simple
data
  items
    - label v1.0
      desc 初始发布
    - label v1.1
      desc 修复关键 Bug
    - label v2.0
      desc 全新 UI 设计
```

**示例 - 操作步骤**:
```infographic
infographic sequence-steps-simple
data
  items
    - label 下载
      desc 获取安装包
    - label 安装
      desc 运行安装程序
    - label 配置
      desc 完成初始化设置
```

### 3️⃣ 层级类 (Hierarchy) - 组织结构、思维导图

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `hierarchy-mindmap` | 思维导图 | 头脑风暴 |
| `hierarchy-structure` | 层级结构 | 分类体系 |
| `hierarchy-tree` | 树形结构 | 组织架构 |

**示例 - 思维导图**:
```infographic
infographic hierarchy-mindmap
data
  items
    - label 核心概念
      children
        - label 子概念 1
        - label 子概念 2
    - label 扩展功能
      children
        - label 功能 A
        - label 功能 B
```

### 4️⃣ 对比类 (Compare) - 对比分析、四象限

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `quadrant-quarter-simple-card` | 四象限卡片 | SWOT、优先级矩阵 |
| `compare-swot` | SWOT 分析 | 战略分析 |
| `compare-binary-horizontal-simple-vs` | 二元对比 | A vs B |

**示例 - 四象限分析**:
```infographic
infographic quadrant-quarter-simple-card
data
  items
    - label 紧急且重要
      desc 立即处理
    - label 重要不紧急
      desc 计划安排
    - label 紧急不重要
      desc 委托他人
    - label 不紧急不重要
      desc 考虑删除
```

### 5️⃣ 统计类 (Chart) - 数据展示

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `chart-column-simple` | 简易柱状图 | 对比数据 |
| `chart-bar-plain-text` | 水平条形图 | 排名数据 |
| `chart-pie-simple` | 饼图 | 占比分布 |

**示例 - 销售数据**:
```infographic
infographic chart-column-simple
data
  items
    - label Q1
      value 120
    - label Q2
      value 180
    - label Q3
      value 150
    - label Q4
      value 200
```

### 6️⃣ 关系类 (Relation) - 流程图、关系网络

| 模板 ID | 描述 | 最佳场景 |
|---------|------|---------|
| `relation-circle-circular-progress` | 环形进度 | 进度展示 |
| `relation-network` | 网络关系 | 关系图谱 |

---

## 🎯 数据项字段参考 (Data Field Reference)

> ⚠️ **重要**: 统一使用 **`items`** 作为数据字段名，这是官方推荐的通用字段。

### 通用字段
| 字段 | 类型 | 说明 |
|-----|------|------|
| `label` | string | 显示文本（**必填**） |
| `desc` | string | 描述文本 |
| `value` | number | 数值 |
| `children` | array | 子项（用于层级结构） |

---

## 🎨 主题配置 (Theme)

Infographic 支持多种主题风格：

```infographic
infographic list-row-simple-horizontal-arrow
theme rough
data
  items
    - label 步骤1
    - label 步骤2
```

可用主题：
- `default`: 默认简洁风格
- `rough`: 手绘风格
- `pattern`: 图案填充
- `gradient`: 渐变色

---

## 💡 AI 生成最佳实践

### 1. 场景选择指南

| 用户意图 | 推荐模板 |
|---------|---------|
| "列出几个要点" | `list-grid-compact-card` |
| "展示步骤/流程" | `list-row-simple-horizontal-arrow` 或 `sequence-steps-simple` |
| "画个时间线" | `sequence-timeline-simple` |
| "思维导图" | `hierarchy-mindmap` |
| "对比分析" | `compare-swot` |
| "四象限/优先级" | `quadrant-quarter-simple-card` |
| "简单数据对比" | `chart-column-simple` |

### 2. 数据量建议
- **步骤图**: 3-6 个步骤最佳
- **时间线**: 5-10 个节点
- **统计图**: < 12 个条目（更多请用 ECharts）
- **层级树**: 3 层以内

### 3. 常见错误排查

| 问题 | 可能原因 | 解决方案 |
|-----|---------|---------| 
| 图表空白 | 缩进错误 | 确保使用 **2 个空格**缩进 |
| 渲染失败 | 数据字段名错误 | 使用 `items` 而非 `lists`/`sequences` |
| 数据不显示 | 字段名错误 | 使用 `label` 而非 `name`/`title` |
| 模板不存在 | 模板名拼写错误 | 参考本文档的模板列表 |

---

## 🚀 完整模板列表 (Template List)

### List 类
- `list-row-simple-horizontal-arrow` ⭐ 推荐
- `list-row-horizontal-icon-arrow`
- `list-row-horizontal-icon-line`
- `list-grid-compact-card` ⭐ 推荐
- `list-grid-simple`
- `list-grid-badge-card`
- `list-column-simple-vertical-arrow`
- `list-pyramid-compact-card`

### Sequence 类
- `sequence-steps-simple` ⭐ 推荐
- `sequence-timeline-simple` ⭐ 推荐
- `sequence-stairs-front-simple`
- `sequence-snake-steps-simple`
- `sequence-roadmap-vertical-simple`
- `sequence-funnel-simple`

### Hierarchy 类
- `hierarchy-mindmap` ⭐ 推荐
- `hierarchy-structure`
- `hierarchy-tree`

### Compare 类
- `quadrant-quarter-simple-card` ⭐ 推荐
- `compare-swot`
- `compare-binary-horizontal-simple-vs`

### Chart 类
- `chart-column-simple` ⭐ 推荐
- `chart-bar-plain-text`
- `chart-pie-simple`

---

> **Fallback 规则**: 如果用户需求超出 Infographic 能力（如复杂交互/动态图表），请果断使用 ECharts 或 Mermaid。
