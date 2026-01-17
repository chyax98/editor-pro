# Infographic 深度语法参考手册 (Expert Guide)

Infographic 渲染器基于 `@antv/infographic` 库，旨在通过极简的 DSL 快速生成美观的静态信息图。

## 📐 DSL 核心语法 (Core Syntax)

DSL 解析器对缩进非常敏感。请务必遵守 **2空格缩进** 规则。

### 通用结构
```text
infographic <chart-type-id>
data
  <key> <value>
  <object-key>
    <property> <value>
  <list-key>
    - <item-property> <value>
```

---

## 🎨 1. 核心图表类型 (Core Charts)

### 1.1 步骤流程图 (Process Steps)
**ID**: `list-row-simple-horizontal-arrow`
**场景**: 教程步骤、产品流程。

```infographic
infographic list-row-simple-horizontal-arrow
data
  title 部署流程 (Deployment)
  items
    - label Build
      desc 编译代码
    - label Test
      desc 运行单元测试
    - label Deploy
      desc 发布到生产环境
```

### 1.2 时间线 (Timeline)
**ID**: `sequence-timeline-simple`
**场景**: 历史大事记、版本发布记录。

```infographic
infographic sequence-timeline-simple
data
  title 版本历史
  items
    - label v1.0
      desc 初始发布
    - label v1.1
      desc 修复 Bug
    - label v2.0
      desc 全新 UI 设计
```

### 1.3 简易柱状图 (Simple Column)
**ID**: `chart-column-simple`
**场景**: 简单的对比数据，不需要 ECharts 那么重。

```infographic
infographic chart-column-simple
data
  title 年度营收
  items
    - label 2022
      value 500
    - label 2023
      value 850
    - label 2024
      value 1200
```

### 1.4 组织架构树 (Hierarchy Tree)
**ID**: `hierarchy-tree-tech-style-rounded-rect-node`
**场景**: 公司结构、思维脑图。

```infographic
infographic hierarchy-tree-tech-style-rounded-rect-node
data
  title 研发中心
  items
    - label CTO
      children
        - label 前端组
          children
            - label 基础架构
            - label 业务研发
        - label 后端组
```

---

## 🧩 2. 通用属性与样式 (Common Attributes)

虽然不同图表类型的 Schema 不同，但以下属性通常是通用的：

### 2.1 标题配置 (Title)
大多数图表都支持 `title` 属性，部分支持 `description`。

```text
data
  title 我的精美图表
  description 这是关于...的详细描述
```

### 2.2 样式微调 (Style Hints)
*注意：Infographic 的设计初衷是“零配置”，因此样式通常由 Type ID 决定。如果特定的 Type ID 包含 `tech-style` 或 `simple` 等后缀，这通常代表了其预设风格。*

*   `...-tech-style-...`: 科技风（通常是深色/蓝色）。
*   `...-simple-...`: 极简风（白底/黑字）。

---

## 💡 3. AI 生成技巧 (Tips for Generation)

### 3.1 文本换行
DSL 不支持复杂的长文本换行。如果 `desc` 过长，建议精简语言，或拆分为多个步骤。

### 3.2 数据量控制
*   **步骤图**: 建议 3-6 个步骤。太多会拥挤。
*   **时间线**: 建议 5-10 个节点。
*   **柱状图**: 建议 < 12 个条目。如果数据很多，请转用 ECharts。

### 3.3 容错处理
如果生成后图表空白或报错，通常是因为：
1.  **缩进错误**：必须是 2 个空格。
2.  **关键字错误**：比如把 `desc` 写成了 `description`（在某些模板中不支持）。请严格参考上述 Schema。

---

> **Looking for more?**
> Infographic 库正在持续更新中。如果用户请求了上述 4 种以外的图表（如饼图、雷达图），请**果断降级 (Fallback)** 使用 ECharts 或 Mermaid，不要尝试猜测 Infographic 的未文档化语法。
