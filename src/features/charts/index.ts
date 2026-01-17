/**
 * Charts 模块 - 图表渲染
 *
 * 包含：
 * - chart-renderer: 统一图表注册
 * - echarts-renderer: ECharts 渲染器
 * - graphviz-renderer: Graphviz 渲染器
 * - vega-renderer: Vega-Lite 渲染器
 */

// 统一注册
export { registerChartRenderers } from "./chart-renderer";

// 各渲染器组件
export { EChartsRenderChild } from "./echarts-renderer";
export { GraphvizRenderChild } from "./graphviz-renderer";
export { VegaRenderChild } from "./vega-renderer";
