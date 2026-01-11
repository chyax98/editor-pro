import { App, Plugin, debounce } from "obsidian";

export type HighlightColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export class FileTreeHighlightManager {
	private app: App;
	private enabled: () => boolean;
	private getHighlights: () => Record<string, HighlightColor>;
	private observer: MutationObserver | null = null;
	private updateDebounced: () => void;

	constructor(options: { app: App; enabled: () => boolean; getHighlights: () => Record<string, HighlightColor> }) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.getHighlights = options.getHighlights;
		this.updateDebounced = debounce(() => this.update(), 200, true);
	}

	register(plugin: Plugin) {
		plugin.register(() => this.disconnect());
		plugin.registerEvent(this.app.workspace.on("layout-change", () => this.updateDebounced()));
		plugin.registerEvent(this.app.vault.on("rename", () => this.updateDebounced()));
		plugin.registerEvent(this.app.vault.on("delete", () => this.updateDebounced()));

		this.connect();
		this.updateDebounced();
	}

	private connect() {
		if (this.observer) return;
		this.observer = new MutationObserver(() => this.updateDebounced());
		this.observer.observe(document.body, { childList: true, subtree: true });
	}

	private disconnect() {
		this.observer?.disconnect();
		this.observer = null;
	}

	update() {
		if (!this.enabled()) return;

		const highlights = this.getHighlights();
		const containers = Array.from(document.querySelectorAll<HTMLElement>(".nav-files-container"));
		for (const container of containers) {
			const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-path]"));
			for (const node of nodes) {
				const path = node.getAttribute("data-path");
				if (!path) continue;

				// Clear previous highlight classes.
				node.classList.remove(
					"editor-pro-filetree-highlight",
					"editor-pro-filetree-red",
					"editor-pro-filetree-orange",
					"editor-pro-filetree-yellow",
					"editor-pro-filetree-green",
					"editor-pro-filetree-blue",
					"editor-pro-filetree-purple",
				);

				const color = highlights[path];
				if (!color) continue;
				node.classList.add("editor-pro-filetree-highlight", `editor-pro-filetree-${color}`);
			}
		}
	}
}

