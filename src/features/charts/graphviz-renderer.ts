import { MarkdownRenderChild } from "obsidian";
import { Graphviz } from "@hpcc-js/wasm";

export class GraphvizRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, private source: string) {
        super(containerEl);
    }

    onload() {
        void (async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                const graphviz = await Graphviz.load();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                const svg = graphviz.layout(this.source, "svg", "dot");
                // eslint-disable-next-line @microsoft/sdl/no-inner-html
                this.containerEl.innerHTML = svg as string;
                
                // Ensure SVG scales correctly
                const svgEl = this.containerEl.querySelector('svg');
                if (svgEl) {
                    // eslint-disable-next-line obsidianmd/no-static-styles-assignment
                    svgEl.style.setProperty("width", "100%");
                    // eslint-disable-next-line obsidianmd/no-static-styles-assignment
                    svgEl.style.setProperty("height", "auto");
                }
            } catch (e) {
                const errorDiv = this.containerEl.createDiv({ cls: "editor-pro-chart-error" });
                errorDiv.createEl("strong", { text: "Graphviz Error:" });
                errorDiv.createEl("pre", { text: (e as Error).message });
            }
        })();
    }
}
