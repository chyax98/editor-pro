import { MarkdownRenderChild } from "obsidian";
import embed from "vega-embed";

export class VegaRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, private source: string) {
        super(containerEl);
    }

    onload() {
        void (async () => {
            try {
                const spec = JSON.parse(this.source);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
                await embed(this.containerEl, spec, { actions: false });
            } catch (e) {
                const errorDiv = this.containerEl.createDiv({ cls: "editor-pro-chart-error" });
                errorDiv.createEl("strong", { text: "Vega-Lite Error:" });
                errorDiv.createEl("pre", { text: (e as Error).message });
            }
        })();
    }
}
