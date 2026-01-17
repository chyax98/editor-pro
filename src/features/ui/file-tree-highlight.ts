import { App, Plugin, debounce } from "obsidian";

export type HighlightColor =
	| "red"
	| "orange"
	| "yellow"
	| "green"
	| "blue"
	| "purple";

export class FileTreeHighlightManager {
	private app: App;
	private enabled: () => boolean;
	private getHighlights: () => Record<string, HighlightColor>;
	private observer: MutationObserver | null = null;
	private observerCallback: (() => void) | null = null;
	private updateDebounced: () => void;

	constructor(options: {
		app: App;
		enabled: () => boolean;
		getHighlights: () => Record<string, HighlightColor>;
	}) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.getHighlights = options.getHighlights;
		this.updateDebounced = debounce(() => this.update(), 200, true);
	}

	register(plugin: Plugin) {
		plugin.register(() => this.disconnect());
		plugin.registerEvent(
			this.app.workspace.on("layout-change", () =>
				this.updateDebounced(),
			),
		);
		plugin.registerEvent(
			this.app.vault.on("rename", () => this.updateDebounced()),
		);
		plugin.registerEvent(
			this.app.vault.on("delete", () => this.updateDebounced()),
		);

		this.connect();
		this.updateDebounced();
	}

	private connect() {
		if (this.observer) return;
		// Save callback reference for cleanup
		this.observerCallback = () => this.updateDebounced();
		this.observer = new MutationObserver(this.observerCallback);

		// 优化：缩小观察范围到 .nav-files-container 而非整个 document.body
		const containers = Array.from(
			document.querySelectorAll<HTMLElement>(".nav-files-container"),
		);
		for (const container of containers) {
			this.observer.observe(container, {
				childList: true,
				subtree: true,
			});
		}

		// 如果没有找到容器，则回退到观察 document.body（但只监听新增的容器）
		if (containers.length === 0) {
			this.observer.observe(document.body, {
				childList: true,
				subtree: false,
			});
		}
	}

	private disconnect() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
		// Clear callback reference to help garbage collection
		this.observerCallback = null;
	}

	cleanup() {
		this.disconnect();
	}

	update() {
		if (!this.enabled()) return;

		const highlights = this.getHighlights();
		const containers = Array.from(
			document.querySelectorAll<HTMLElement>(".nav-files-container"),
		);
		for (const container of containers) {
			const nodes = Array.from(
				container.querySelectorAll<HTMLElement>("[data-path]"),
			);
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
				node.classList.add(
					"editor-pro-filetree-highlight",
					`editor-pro-filetree-${color}`,
				);
			}
		}
	}
}
