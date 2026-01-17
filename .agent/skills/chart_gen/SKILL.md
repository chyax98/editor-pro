---
name: Chart Generation Skill
description: A specialized skill for generating complex visualization charts within Editor Pro, supporting Mermaid, Graphviz (DOT), ECharts, Vega-Lite, and D2.
---

# Chart Generation Skill

This skill provides guidelines and templates for generating visualization charts in Editor Pro.

## 🧭 Strategy: Choosing the Right Engine

| Engine | Best For | Format | Complexity |
|--------|----------|--------|------------|
| **Mermaid** | Simple flowcharts, sequence diagrams, gantt charts, git graphs. | DSL (Text) | Low |
| **Graphviz (DOT)** | Complex structural diagrams, dependency graphs, state machines, clusters. | DSL (DOT) | Medium |
| **ECharts** | Interactive data visualization (Bar, Line, Pie, Radar, Sankey), complex dashboards. | JSON | High |
| **Vega-Lite** | Statistical analysis, scientific plotting, data distributions. | JSON | High |
| **D2** | Modern, aesthetic diagrams comparable to Mermaid but with better syntax. | DSL (D2) | Low/Medium |
| **Infographic** | Simple infographic widgets (built-in). | DSL | Low |

---

## 🎨 1. Mermaid Generation
**Use when:** User needs standard diagrams like flowcharts or sequences quickly.

### Prompt Strategy
- Use `graph TD` or `graph LR` for flowcharts.
- Ensure correct indentation.
- **Example:**
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?};
    B -- Yes --> C[Great!];
    B -- No --> D[Debug];
\`\`\`

---

## 🕸️ 2. Graphviz (DOT) Generation
**Use when:** User needs to visualize complex hierarchies, network topologies, or state machines.

### Prompt Strategy
- Always use `digraph G { ... }`.
- Use `rankdir=LR` for left-to-right graphs (better for wide screens).
- Subgraphs must start with `cluster_` to have a visible border.
- **Example:**
\`\`\`graphviz
digraph G {
    rankdir=LR;
    node [shape=box, style="filled,rounded", color=lightblue, fontname="Arial"];
    
    Client -> LoadBalancer;
    LoadBalancer -> ServiceA;
    LoadBalancer -> ServiceB;
    
    subgraph cluster_db {
        label="Data Layer";
        style=dashed;
        DatabasePrimary;
        DatabaseReplica;
    }
    
    ServiceA -> DatabasePrimary;
    ServiceB -> DatabaseReplica;
}
\`\`\`

---

## 📊 3. ECharts Generation
**Use when:** User has quantitative data (sales, performance metrics) and needs interactivity.

### Prompt Strategy
- **CRITICAL**: The output must be **valid JSON**. No JavaScript functions (like `formatter: function()`).
- Always include `tooltip`, `legend`, and comprehensive `grid` settings.
- For dark mode compatibility, consider specific color palettes if requested.

### Template (Bar/Line)
\`\`\`echarts
{
  "title": { "text": "Quarterly Performance", "left": "center" },
  "tooltip": { "trigger": "axis" },
  "legend": { "top": "bottom" },
  "grid": { "left": "3%", "right": "4%", "bottom": "10%", "containLabel": true },
  "xAxis": { "type": "category", "data": ["Q1", "Q2", "Q3", "Q4"] },
  "yAxis": { "type": "value" },
  "series": [
    {
      "name": "Revenue",
      "type": "bar",
      "data": [12000, 18000, 15000, 22000],
      "itemStyle": { "color": "#5470c6" }
    }
  ]
}
\`\`\`

---

## 📈 4. Vega-Lite Generation
**Use when:** User needs scientific/statistical charts (scatter plots, histograms).

### Prompt Strategy
- Use valid JSON.
- Specify `$schema`.
- **Example:**
\`\`\`vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}
\`\`\`

---

## 🛠️ Usage Instructions for Agent

1.  **Analyze Request**: Determine the best chart engine based on the user's data and intent.
2.  **Generate Code**: Create the code block using the syntax above.
3.  **Wrap**: Wrap the code in the appropriate markdown fence (e.g., \`\`\`echarts ... \`\`\`).
4.  **Confirm Settings**: Remind the user that they might need to enable the specific renderer in `Settings -> Editor Pro -> Visualization` if the chart doesn't render.

**Important Note on JSON**: For ECharts and Vega-Lite, ensure the JSON is strictly valid (keys in quotes, no trailing commas).
