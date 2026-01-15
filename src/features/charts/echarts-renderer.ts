import { MarkdownRenderChild } from "obsidian";
import * as echarts from "echarts";

export class EChartsRenderChild extends MarkdownRenderChild {
    private chart: echarts.ECharts | null = null;
    private resizeObserver: ResizeObserver | null = null;

    constructor(containerEl: HTMLElement, private source: string) {
        super(containerEl);
    }

    onload() {
        void (async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let option: any;
                try {
                    // Try JSON first
                    option = JSON.parse(this.source);
                } catch (e) {
                    // Fallback to Function evaluation for advanced options (functions)
                    // This is potentially unsafe but common for chart plugins to support formatters
                    // eslint-disable-next-line @typescript-eslint/no-implied-eval
                    const func = new Function("return " + this.source);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    option = func();
                }

                // eslint-disable-next-line obsidianmd/no-static-styles-assignment
                this.containerEl.style.setProperty("height", "400px");
                // eslint-disable-next-line obsidianmd/no-static-styles-assignment
                this.containerEl.style.setProperty("width", "100%");

                this.chart = echarts.init(this.containerEl);
                this.chart.setOption(option);

                this.resizeObserver = new ResizeObserver(() => {
                    this.chart?.resize();
                });
                this.resizeObserver.observe(this.containerEl);

            } catch (e) {
                const errorDiv = this.containerEl.createDiv({ cls: "editor-pro-chart-error" });
                errorDiv.createEl("strong", { text: "ECharts Error:" });
                errorDiv.createEl("pre", { text: (e as Error).message });
            }
        })();
    }

    onunload() {
        this.resizeObserver?.disconnect();
        this.chart?.dispose();
    }
}
