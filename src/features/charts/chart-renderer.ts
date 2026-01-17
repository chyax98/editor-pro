import type EditorProPlugin from "../../main"; // Import type to avoid cycle
import { VegaRenderChild } from "./vega-renderer";
import { GraphvizRenderChild } from "./graphviz-renderer";
import { EChartsRenderChild } from "./echarts-renderer";

export function registerChartRenderers(plugin: EditorProPlugin) {
	if (plugin.settings.enableVegaLite) {
		// 支持 vega-lite 和 vegalite 两种写法
		const vegaProcessor = (source: string, el: HTMLElement, ctx: import("obsidian").MarkdownPostProcessorContext) => {
			ctx.addChild(new VegaRenderChild(el, source));
		};
		plugin.registerMarkdownCodeBlockProcessor("vega-lite", vegaProcessor);
		plugin.registerMarkdownCodeBlockProcessor("vegalite", vegaProcessor);
	}

	if (plugin.settings.enableGraphviz) {
		// 支持 graphviz 和 dot 两种写法
		const graphvizProcessor = (source: string, el: HTMLElement, ctx: import("obsidian").MarkdownPostProcessorContext) => {
			ctx.addChild(new GraphvizRenderChild(el, source));
		};
		plugin.registerMarkdownCodeBlockProcessor("graphviz", graphvizProcessor);
		plugin.registerMarkdownCodeBlockProcessor("dot", graphvizProcessor);
	}

	if (plugin.settings.enableECharts) {
		plugin.registerMarkdownCodeBlockProcessor(
			"echarts",
			(source, el, ctx) => {
				ctx.addChild(new EChartsRenderChild(el, source));
			},
		);
	}
}
