import type EditorProPlugin from "../../main"; // Import type to avoid cycle
import { VegaRenderChild } from "./vega-renderer";
import { GraphvizRenderChild } from "./graphviz-renderer";
import { EChartsRenderChild } from "./echarts-renderer";

export function registerChartRenderers(plugin: EditorProPlugin) {
    if (plugin.settings.enableVegaLite) {
        plugin.registerMarkdownCodeBlockProcessor("vega-lite", (source, el, ctx) => {
            ctx.addChild(new VegaRenderChild(el, source));
        });
    }

    if (plugin.settings.enableGraphviz) {
        plugin.registerMarkdownCodeBlockProcessor("graphviz", (source, el, ctx) => {
            ctx.addChild(new GraphvizRenderChild(el, source));
        });
    }

    if (plugin.settings.enableECharts) {
        plugin.registerMarkdownCodeBlockProcessor("echarts", (source, el, ctx) => {
            ctx.addChild(new EChartsRenderChild(el, source));
        });
    }
}
