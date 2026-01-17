import { Infographic } from "@antv/infographic";
import { MarkdownRenderChild, Plugin } from "obsidian";

export function registerInfographicRenderer(plugin: Plugin) {
	plugin.registerMarkdownCodeBlockProcessor(
		"infographic",
		(source, el, ctx) => {
			const container = el.createDiv({ cls: "editor-pro-infographic" });
			// 设置最小高度确保内容可见
			// eslint-disable-next-line obsidianmd/no-static-styles-assignment
			container.style.minHeight = "200px";
			// eslint-disable-next-line obsidianmd/no-static-styles-assignment
			container.style.width = "100%";

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
						console.debug("[Editor Pro] Infographic input:", input);

						infographic = new Infographic({
							container,
							width: "100%",
							height: "auto",
						});

						infographic.render(input);

						// 检查渲染后容器是否有内容
						setTimeout(() => {
							if (container.children.length === 0 ||
								(container.querySelector("svg") === null && container.innerText.trim() === "")) {
								console.warn("[Editor Pro] Infographic rendered but container is empty");
								container.createEl("div", {
									text: "Editor Pro：Infographic 渲染完成但内容为空，请检查 DSL 语法",
									cls: "editor-pro-infographic-warning",
								});
								const details = container.createEl("details");
								details.createEl("summary", { text: "显示源代码" });
								details.createEl("pre", { text: input });
							}
						}, 100);

					} catch (error) {
						console.error("[Editor Pro] Infographic error:", error);
						const message =
							error instanceof Error
								? error.message
								: String(error);
						container.empty();
						const errorEl = container.createDiv({
							cls: "editor-pro-infographic-error",
						});
						errorEl.createEl("div", {
							text: `Editor Pro：Infographic 渲染失败：${message}`,
						});

						const details = errorEl.createEl("details", {
							cls: "editor-pro-infographic-error-details",
						});
						details.createEl("summary", { text: "显示源代码" });
						details.createEl("pre", { text: input });
					}
				}

				onunload() {
					infographic?.destroy();
					infographic = null;
				}
			})(container);

			ctx.addChild(child);
		},
	);
}

