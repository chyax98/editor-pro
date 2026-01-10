import { Infographic } from "@antv/infographic";
import { MarkdownRenderChild, Plugin } from "obsidian";

export function registerInfographicRenderer(plugin: Plugin) {
	plugin.registerMarkdownCodeBlockProcessor("infographic", (source, el, ctx) => {
		const container = el.createDiv({ cls: "editor-pro-infographic" });

		let infographic: Infographic | null = null;

		const child = new (class extends MarkdownRenderChild {
			onload() {
				const input = source.trim();
				if (!input) {
					container.createEl("div", {
						text: "Editor Pro：Infographic 代码块为空",
						cls: "editor-pro-infographic-empty",
					});
					return;
				}

				try {
					infographic = new Infographic({
						container,
						width: "100%",
					});
					infographic.render(input);
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					container.empty();
					container.createEl("div", {
						text: `Editor Pro：Infographic 渲染失败：${message}`,
						cls: "editor-pro-infographic-error",
					});
					container.createEl("pre", { text: input });
				}
			}

			onunload() {
				infographic?.destroy();
				infographic = null;
			}
		})(container);

		ctx.addChild(child);
	});
}
