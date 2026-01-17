---
name: obsidian-chart-blocks
description: |
  Write chart code blocks directly into Obsidian Markdown files for data visualization.
  Supported: Mermaid (flowcharts, sequence diagrams, mindmaps), ECharts (bar/line/pie charts),
  Graphviz (network topology, state machines), Vega-Lite (statistical analysis), Infographic (banners).

  AUTO-TRIGGER WHEN DETECTING:
  - Active document is a .md file AND user mentions drawing/charting/visualizing
  - Keywords detected: 画, 图, draw, chart, visualize, diagram, plot, 流程图, 架构图, 时序图, 柱状图, 饼图, 思维导图
  - User provides structured data (tables, lists, numbers) that could benefit from visualization
  - Context suggests a chart would enhance the note content
---

# Obsidian 图表代码块生成 (Chart Code Block Generator)

## 🎯 这个 Skill 是什么？

在 **Obsidian 笔记**中，用户可以通过特定的代码块语法嵌入图表。**Editor Pro 插件**会自动渲染这些代码块为可视化图表。

**你的任务**：当用户在编辑 Markdown 笔记时需要图表，**直接在笔记文件中写入**对应的代码块。代码块写入后，Obsidian 会自动渲染为可视化图表。

### 使用场景

- 用户正在编辑一个 `.md` 文件，要求"画个流程图"
- 用户给了一些数据，要求"可视化展示"
- 用户要求在笔记中添加图表

**操作方式**：使用 `write_to_file` 或 `replace_file_content` 工具将代码块写入用户的笔记文件。

### 支持的代码块语法

| 语法 | 引擎 | 典型用途 |
|-----|------|---------|
| ` ```mermaid ` | Mermaid | 流程图、时序图、类图、思维导图、甘特图 |
| ` ```echarts ` | ECharts | 柱状图、折线图、饼图、热力图、仪表盘 |
| ` ```graphviz ` | Graphviz | 复杂网络拓扑、状态机、DOT 语言 |
| ` ```vega-lite ` 或 ` ```vegalite ` | Vega-Lite | 统计分析、数据探索、声明式图表 |
| ` ```infographic ` | Infographic | 信息卡片、Banner、时间线 |

---

## ⚡ 工作流程 (4 步)

### Step 1: 理解用户意图

| 用户想要... | 选择引擎 |
|------------|---------|
| 展示**流程/逻辑/架构** | Mermaid 或 Graphviz |
| 展示**数据趋势/对比** | ECharts（柱状图/折线图） |
| 展示**占比/分布** | ECharts（饼图）或 Vega-Lite |
| 展示**思维导图** | Mermaid (`mindmap`) |
| 展示**时序/交互** | Mermaid (`sequenceDiagram`) |
| 展示**统计分析** | Vega-Lite |
| 展示**简洁信息卡片** | Infographic |

### Step 2: 查阅语法参考 (CRITICAL!)

> ⚠️ **不要猜测语法！** 必须使用 `view_file` 工具读取对应的参考文档。

| 引擎 | 参考文档路径 | 核心内容 |
|-----|-------------|---------|
| **Mermaid** | `.agent/skills/obsidian-chart-blocks/reference/mermaid.md` | flowchart, sequenceDiagram, classDiagram, mindmap, gantt, timeline, stateDiagram |
| **ECharts** | `.agent/skills/obsidian-chart-blocks/reference/echarts.md` | bar, line, pie, scatter, heatmap, radar, dataset, tooltip, dataZoom |
| **Graphviz** | `.agent/skills/obsidian-chart-blocks/reference/graphviz.md` | digraph, subgraph, cluster, layout engines (dot, neato, fdp) |
| **Vega-Lite** | `.agent/skills/obsidian-chart-blocks/reference/vegalite.md` | $schema, data, mark, encoding, transform, layer, facet |
| **Infographic** | `.agent/skills/obsidian-chart-blocks/reference/infographic.md` | banner, timeline, steps, column DSL |

### Step 3: 构建代码

- **ECharts / Vega-Lite**: 必须是**合法 JSON**（无尾随逗号，属性名双引号）
- **Mermaid / Graphviz**: 使用各自的 DSL 语法
- **背景透明**: ECharts 建议 `"backgroundColor": "transparent"` 适配明暗主题

### Step 4: 输出完整代码块

输出格式必须是**可直接复制使用的 Markdown 代码块**：

````markdown
```echarts
{
  "xAxis": { "type": "category", "data": ["A", "B", "C"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [10, 20, 30] }]
}
```
````

---

## 📝 各引擎快速示例

### 1. Mermaid 流程图

````markdown
```mermaid
flowchart TD
    A[用户请求] --> B{验证通过?}
    B -->|是| C[处理请求]
    B -->|否| D[返回错误]
    C --> E[返回结果]
```
````

### 2. Mermaid 思维导图

````markdown
```mermaid
mindmap
  root((项目管理))
    计划
      需求分析
      时间估算
    执行
      开发
      测试
    监控
      进度跟踪
      风险管理
```
````

### 3. ECharts 柱状图

````markdown
```echarts
{
  "backgroundColor": "transparent",
  "xAxis": { "type": "category", "data": ["Q1", "Q2", "Q3", "Q4"] },
  "yAxis": { "type": "value" },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150, 80],
    "itemStyle": { "color": "#5470c6" }
  }]
}
```
````

### 4. ECharts 饼图

````markdown
```echarts
{
  "backgroundColor": "transparent",
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "pie",
    "radius": "50%",
    "data": [
      { "value": 1048, "name": "搜索引擎" },
      { "value": 735, "name": "直接访问" },
      { "value": 580, "name": "邮件营销" }
    ]
  }]
}
```
````

### 5. Vega-Lite 柱状图

````markdown
```vegalite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```
````

### 6. Graphviz 架构图

````markdown
```graphviz
digraph G {
    rankdir=LR;
    node [shape=box];
    
    subgraph cluster_frontend {
        label="Frontend";
        Web; Mobile;
    }
    
    subgraph cluster_backend {
        label="Backend";
        API; Auth; DB;
    }
    
    Web -> API;
    Mobile -> API;
    API -> Auth;
    API -> DB;
}
```
````

### 7. Infographic Banner

````markdown
```infographic
type: banner
icon: 🚀
title: 项目启动
value: 85%
color: #4caf50
```
````

---

## ⚠️ 常见错误与排查

| 问题 | 原因 | 解决方案 |
|-----|-----|---------|
| **ECharts 空白** | JSON 格式错误（尾随逗号、单引号） | 检查 JSON 合法性 |
| **Mermaid 渲染失败** | 节点 ID 含特殊字符/空格 | 用引号包裹: `A["中文节点"]` |
| **Vega-Lite 不渲染** | 用户未开启设置 / 需重启 | 检查 Editor Pro 设置 → 可视化 → 开启 Vega-Lite |
| **颜色在暗色主题下不可见** | 硬编码浅色背景 | 使用 `"backgroundColor": "transparent"` |
| **ECharts 数据太多挤成一团** | 缺少 dataZoom | 数据 >20 条时添加 `"dataZoom": [{"type": "slider"}]` |

---

## 🎨 主题适配建议

插件会自动检测 Obsidian 主题（明/暗）。建议：

- **ECharts**: `"backgroundColor": "transparent"`，文字颜色使用默认或高对比度
- **Mermaid**: 使用 `%%{init: {'theme': 'neutral'}}%%` 配置主题
- **Vega-Lite**: 插件自动处理 `theme: 'dark'`

---

## 📚 深度参考文档

当需要更复杂的图表配置时，**必须**使用 `view_file` 阅读以下文档：

- **Mermaid 全量语法**: `.agent/skills/obsidian-chart-blocks/reference/mermaid.md`
  - 包含: 10+ 图表类型、节点形状、连线样式、子图、样式类、init 配置
- **ECharts 高级配置**: `.agent/skills/obsidian-chart-blocks/reference/echarts.md`
  - 包含: 组件索引、双Y轴、dataZoom、visualMap、热力图、dataset
- **Graphviz DOT 语法**: `.agent/skills/obsidian-chart-blocks/reference/graphviz.md`
  - 包含: 布局引擎、cluster、HTML 标签、rankdir
- **Vega-Lite 声明式语法**: `.agent/skills/obsidian-chart-blocks/reference/vegalite.md`
  - 包含: transform、layer、facet、brushing
- **Infographic DSL**: `.agent/skills/obsidian-chart-blocks/reference/infographic.md`
  - 包含: banner、timeline、steps、column

---

> **记住**: 当用户需要图表时，**直接在用户的笔记文件中写入代码块**（使用 `write_to_file` 或 `replace_file_content` 工具）。写入后 Obsidian 会自动渲染图表。
