# Vega-Lite 深度语法参考手册 (Expert Guide)

> **版本**: vega-lite 6.4.2 / vega 6.2.0 / vega-embed 7.1.0

Vega-Lite 是基于 JSON 的声明式可视化语法，特别适合**探索性数据分析 (EDA)** 和**统计图表**。

## 🗺️ 官方配置索引 (Configuration Index)

AI 在构建配置时，应参考此顶级属性清单。

| 属性 | 说明 | 关键用途 |
| :--- | :--- | :--- |
| **`data`** | 数据源 | `values` (内联数据) 或 `url` (远程数据) |
| **`mark`** | 图形标记 | `bar`, `line`, `point`, `area`, `rect`, `rule`, `text` |
| **`encoding`** | 视觉通道映射 | `x`, `y`, `color`, `size`, `shape`, `tooltip` |
| **`transform`** | 数据变换 | `filter`, `calculate`, `aggregate`, `bin` |
| **`layer`** | 图层叠加 | 将多个 view 叠加在一起（如：柱状图 + 平均线） |
| **`hconcat/vconcat`** | 拼接 | 水平/垂直拼接多个图表 |
| **`facet`** | 分面 | 基于字段将数据拆分为网格小图 (Small Multiples) |
| **`selection`** | 交互选择 | 定义鼠标点击、框选等交互行为 |

---

## 📊 1. 核心图表模式 (Core Patterns)

### 1.1 聚合柱状图 (aggregated Bar Chart)
自动计算平均值或总和。

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "A", "b": 91}, {"a": "B", "b": 81}, {"a": "C", "b": 53}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative", "aggregate": "mean"} // 自动求平均
  }
}
```

### 1.2 直方图 (Histogram)
自动分箱统计分布。

```json
{
  "mark": "bar",
  "encoding": {
    "x": {"field": "IMDB Rating", "bin": true}, // 自动分箱
    "y": {"aggregate": "count"} // 计数
  }
}
```

### 1.3 散点图与气泡图 (Scatter & Bubble)

```json
{
  "mark": "circle",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
    "color": {"field": "Origin", "type": "nominal"},
    "size": {"field": "Acceleration", "type": "quantitative"}
  }
}
```

---

## 🔄 2. 数据变换 (Transformations)

Vega-Lite 最强的功能之一是可以在渲染前处理数据。

### 2.1 筛选与计算
```json
{
  "transform": [
    { "filter": "datum.year >= 2000" }, // 筛选
    { "calculate": "datum.sex == 1 ? 'Male' : 'Female'", "as": "gender" } // 计算新字段
  ],
  "mark": "bar",
  "encoding": { ... }
}
```

---

## 🏗️ 3. 复合视图 (Composition)

### 3.1 叠加视图 (Layering)
例如：在柱状图上叠加平均值线。

```json
{
  "layer": [
    {
      "mark": "bar",
      "encoding": { "x": {"field": "date"}, "y": {"field": "price"} }
    },
    {
      "mark": "rule", // 平均线
      "encoding": { "y": {"aggregate": "mean", "field": "price"}, "color": {"value": "red"} }
    }
  ]
}
```

### 3.2 分面 (Faceting) / Trellis Plot
将数据拆分为多个子图。

```json
{
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
    "row": {"field": "Origin"} // 按 Origin 拆分成多行
  }
}
```

---

## 🖱️ 4. 交互 (Interaction)

### 4.1 简单的 Tooltip 与 缩放
所有图表默认支持 `tooltip`。
如果要支持缩放和平移：在 `selection` 中添加 `grid`。

```json
{
  "selection": {
    "grid": {
      "type": "interval", "bind": "scales" // 绑定滚轮缩放
    }
  },
  "mark": "circle",
  "encoding": { ... }
}
```

### 4.2 多视图协调 (Brushing & Linking) - 高级交互
这是 Vega-Lite 的精髓。在一个视图中框选 (Brush)，在另一个视图中过滤 (Link)。

```json
{
  "data": {"url": "data/cars.json"},
  "vconcat": [
    {
      "mark": "point",
      "selection": {
        "brush": {"type": "interval"} // 定义框选器
      },
      "encoding": {
        "x": {"field": "Horsepower", "type": "quantitative"},
        "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
        "color": {
          "condition": {"selection": "brush", "field": "Origin", "type": "nominal"}, // 选中时显示颜色
          "value": "grey" // 未选显示灰色
        }
      }
    },
    {
      "transform": [
        {"filter": {"selection": "brush"}} // 接收上一个视图的筛选
      ],
      "mark": "bar",
      "encoding": {
        "x": {"field": "Origin", "type": "nominal"},
        "y": {"aggregate": "count", "type": "quantitative"}
      }
    }
  ]
}
```

---

## ⏳ 5. 时间序列 (Temporal Data)

处理时间数据时，务必正确使用 `timeUnit`。

```json
{
  "mark": "line",
  "encoding": {
    "x": {
      "timeUnit": "yearmonth", // 聚合到年月 (e.g., 2020-01)
      "field": "date",
      "axis": {"format": "%Y-%m", "labelAngle": -45}
    },
    "y": {"aggregate": "sum", "field": "price"}
  }
}
```
