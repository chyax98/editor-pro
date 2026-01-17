import { MarkdownRenderChild } from "obsidian";
import { Graphviz } from "@hpcc-js/wasm";

export class GraphvizRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, private source: string) {
        super(containerEl);
    }

    onload() {
        void (async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const graphviz = await Graphviz.load();

                // Extract layout engine from source (e.g. layout=neato)
                const engineMatch = this.source.match(/layout\s*=\s*(?:")?(\w+)(?:")?/);
                let engine = "dot";
                if (engineMatch && engineMatch[1] && ["dot", "neato", "fdp", "circo", "osage", "twopi"].includes(engineMatch[1])) {
                    engine = engineMatch[1];
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                const svg = graphviz.layout(this.source, "svg", engine as any);
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
