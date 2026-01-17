/**
 * Visuals 模块 - 可视化渲染
 *
 * 包含：
 * - charts: 图表渲染（ECharts, Graphviz, Vega-Lite）
 * - infographic: 信息图渲染
 * - overdue-highlighter: 过期日期高亮
 * - nldates: 自然语言日期解析
 */

// 图表渲染
export { registerChartRenderers } from "../charts/chart-renderer";

// 信息图
export { registerInfographicRenderer } from "./infographic-renderer";

// 过期高亮
export { createOverdueHighlighter } from "./overdue-highlighter";
