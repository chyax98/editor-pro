# ECharts 深度语法参考手册 (Expert Guide)

> **版本**: echarts 6.0.0

ECharts 是一个基于 JavaScript 的开源可视化图表库。在 Editor Pro 中，我们通过 JSON 配置来渲染图表。

## 🗺️ 官方配置索引 (Configuration Index)

AI 在构建配置时，应参考此清单以确保不遗漏关键组件。

### 1. 核心容器与数据
*   **`dataset`**: (推荐) 独立的数据集，支持多图表复用数据。
*   **`series`**: 系列列表（核心），决定图表类型 (`line`, `bar`, `pie`, `scatter`, `heatmap`, ...)。
*   **`color`**: 全局调色盘数组。
*   **`darkMode`**: 是否开启自动暗色模式 (Boolean)。

### 2. 坐标系 (Coordinate Systems)
*   **`grid`**: 直角坐标系底板（控制 `left`, `right`, `top`, `bottom`）。
*   **`xAxis` / `yAxis`**: 直角坐标轴。
*   **`polar`**: 极坐标系底板。
*   **`radiusAxis` / `angleAxis`**: 极坐标轴。
*   **`radar`**: 雷达图坐标系。
*   **`geo`**: 地理坐标系（地图）。
*   **`calendar`**: 日历坐标系。

### 3. 组件 (Components)
*   **`title`**: 标题组件。
*   **`legend`**: 图例组件。
*   **`tooltip`**: 提示框组件（交互核心）。
*   **`toolbox`**: 工具栏（下载、缩放、切换类型）。
*   **`dataZoom`**: 区域缩放（滑动条）。
*   **`visualMap`**: 视觉映射（颜色/大小随数值变化）。
*   **`timeline`**: 时间轴（动态播放）。
*   **`graphic`**: 原生图形元素（水印、文本、图片）。
*   **`axisPointer`**: 坐标轴指示器。

---

## 🛡️ 工程设计规范 (Design Specs)

### 1. 配色规范 (Color Palette)
不要使用默认刺眼的颜色。推荐使用以下专业配色方案之一：
*   **科技蓝**: `['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']`
*   **柔和盘**: `['#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C', '#ff9f7f']`
*   **深色适配**: 背景色建议设为 `transparent` 或 `#1e1e1e`（视 Obsidian 主题而定），文字颜色设为 `#ccc`。

### 2. 交互规范 (Interaction)
*   **Tooltip**: 必须开启。对于多系列图表，设置 `trigger: 'axis'`；对于饼图/散点，设置 `trigger: 'item'`。
*   **DataZoom**: 当数据条目 > 20 时，**必须**添加 `dataZoom` 组件以保证可读性。

### 3. 性能规范 (Performance)
*   **Sampling**: 对于超大数据量（>10k）的折线图，开启降采样 `sampling: 'lttb'`。
*   **Animation**: 对于实时更新场景，关闭动画 `animation: false`。

---

## ⚠️ 关键限制与格式说明

1.  **推荐 JSON 格式**：标准配置应为合法的 JSON。
    *   ✅ 属性名必须用双引号包裹。
    *   ✅ 字符串值使用双引号。
2.  **JS 函数支持 (高级)**：
    *   插件支持解析返回 Option 对象的 JavaScript 代码。如果需要 `formatter` 回调函数，可输出 JS 代码块（而非 JSON），但必须确保语法无误。
    *   *示例*: `return { ... tooltip: { formatter: (params) => { ... } } };`
3.  **容器大小**：默认容器高度约为 400px，宽度自适应。

### 1.1 标题 (Title) - 支持富文本
```json
{
  "title": {
    "text": "主标题\n{sub|副标题}", 
    "textStyle": {
      "rich": {
        "sub": { "color": "#999", "fontSize": 12, "padding": [5, 0] }
      }
    },
    "subtext": "支持链接跳转",
    "sublink": "https://example.com",
    "left": "center"
  }
}
```

### 1.2 图例 (Legend) - 高级控制
```json
{
  "legend": {
    "type": "scroll", // 图例过多时滚动
    "orient": "vertical",
    "right": 10,
    "top": 20,
    "bottom": 20,
    "data": ["A", "B"],
    "formatter": "Series {name}" // 字符串模板
  }
}
```

### 1.3 工具栏 (Toolbox) - 交互利器
```json
{
  "toolbox": {
    "show": true,
    "feature": {
      "dataZoom": { "yAxisIndex": "none" },
      "dataView": { "readOnly": false },
      "magicType": { "type": ["line", "bar"] }, // 动态切换图表类型
      "restore": {},
      "saveAsImage": {}
    }
  }
}
```

---

## 🎨 2. 样式与美化 (Styling)

### 2.1 颜色配置 (Color / ItemStyle)
ECharts 支持声明式渐变色（在 JSON 中可用）。

```json
{
  "itemStyle": {
    "color": {
      "type": "linear",
      "x": 0, "y": 0, "x2": 0, "y2": 1,
      "colorStops": [
        { "offset": 0, "color": "red" }, 
        { "offset": 1, "color": "blue" }
      ]
    },
    "borderRadius": [5, 5, 0, 0], // 圆角柱子
    "shadowBlur": 10,
    "shadowColor": "rgba(0, 0, 0, 0.5)"
  }
}
```

### 2.2 标签富文本 (Label Rich Text)
让标签像 HTML 一样排版。

```json
{
  "label": {
    "show": true,
    "formatter": "{b}\n{c}",
    "rich": {
      "a": { "color": "red", "lineHeight": 10 },
      "b": { "backgroundColor": "#eee", "padding": [2, 4], "borderRadius": 2 }
    }
  }
}
```

---

## 📈 3. 高级功能 (Advanced Features)

### 3.1 标注系统 (MarkPoint / MarkLine)
自动标出最大值、最小值、平均值。

```json
{
  "series": [{
    "type": "line",
    "markPoint": {
      "data": [
        { "type": "max", "name": "Max" },
        { "type": "min", "name": "Min" },
        { "coord": [10, 20], "name": "自定义点" }
      ]
    },
    "markLine": {
      "data": [
        { "type": "average", "name": "Avg" },
        [
          { "symbol": "none", "x": "90%", "yAxis": "max" },
          { "symbol": "circle", "label": { "position": "start", "formatter": "Max" }, "type": "max", "name": "最高点" }
        ]
      ]
    },
    "markArea": {
      "itemStyle": { "color": "rgba(255, 173, 177, 0.4)" },
      "data": [
        [
          { "name": "早高峰", "xAxis": "07:30" },
          { "xAxis": "10:00" }
        ]
      ]
    }
  }]
}
```

### 3.2 数据集 (Dataset)
分离数据与视图，支持多图共用数据。

```json
{
  "dataset": {
    "source": [
      ["product", "2015", "2016", "2017"],
      ["Matcha Latte", 43.3, 85.8, 93.7],
      ["Milk Tea", 83.1, 73.4, 55.1]
    ]
  },
  "series": [
    { "type": "bar", "seriesLayoutBy": "row" },
    { "type": "bar", "seriesLayoutBy": "row" }
  ]
}
```

---

## 🧩 4. 复杂图表模板

### 4.1 组合图 (Mix Chart) - 柱状+折线+双Y轴
```json
{
  "tooltip": { "trigger": "axis", "axisPointer": { "type": "cross" } },
  "legend": { "data": ["Evaporation", "Precipitation", "Temperature"] },
  "xAxis": [{ "type": "category", "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
  "yAxis": [
    { "type": "value", "name": "Water", "min": 0, "max": 250, "interval": 50, "axisLabel": { "formatter": "{value} ml" } },
    { "type": "value", "name": "Temp", "min": 0, "max": 25, "interval": 5, "axisLabel": { "formatter": "{value} °C" } }
  ],
  "series": [
    { "name": "Evaporation", "type": "bar", "data": [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6] },
    { "name": "Precipitation", "type": "bar", "data": [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6] },
    { "name": "Temperature", "type": "line", "yAxisIndex": 1, "data": [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3] }
  ]
}
```

### 4.2 盒须图 (Boxplot) - 统计分布
插件已内置 `dataTool` 扩展，支持从原始数据自动计算统计值。

```json
{
  "title": [{ "text": "Boxplot", "left": "center" }],
  "dataset": [
    {
      "source": [
        [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980],
        [960, 940, 960, 1140, 1150, 1000, 1100, 1000, 1050, 1150, 1000, 1050]
      ]
    },
    {
      "transform": {
        "type": "boxplot", // 使用内置转换器
        "config": { "itemNameFormatter": "Expr {value}" }
      }
    },
    { "fromDatasetIndex": 1, "fromTransformResult": 1 }
  ],
  "xAxis": { "type": "category", "axisLabel": { "formatter": "Expr {value}" } },
  "yAxis": { "type": "value", "name": "km/s minus 299,000" },
  "series": [
    { "name": "boxplot", "type": "boxplot", "datasetIndex": 1 }
  ]
}
```

### 4.3 热力图 (Heatmap) - 笛卡尔坐标系
```json
{
  "visualMap": { "min": 0, "max": 10, "calculable": true, "orient": "horizontal", "left": "center", "bottom": "15%" },
  "xAxis": { "type": "category", "data": ["12a", "1a", "2a"], "splitArea": { "show": true } },
  "yAxis": { "type": "category", "data": ["Sat", "Fri", "Thu"], "splitArea": { "show": true } },
  "series": [{
    "name": "Punch Card",
    "type": "heatmap",
    "data": [[0,0,5],[0,1,1],[0,2,0],[1,0,3],[1,1,2],[1,2,6],[2,0,1],[2,1,2],[2,2,3]],
    "label": { "show": true }
  }]
}
```
