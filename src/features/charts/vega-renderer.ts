import { MarkdownRenderChild } from "obsidian";
import embed from "vega-embed";

export class VegaRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, private source: string) {
        super(containerEl);
    }

    onload() {
        void (async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const spec = JSON.parse(this.source);
                const isDark = document.body.classList.contains("theme-dark");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                await embed(this.containerEl, spec, {
                    actions: false,
                    theme: isDark ? 'dark' : undefined
                });
            } catch (e) {
                const errorDiv = this.containerEl.createDiv({ cls: "editor-pro-chart-error" });
                errorDiv.createEl("strong", { text: "Vega-Lite Error:" });
                errorDiv.createEl("pre", { text: (e as Error).message });
            }
        })();
    }
}
