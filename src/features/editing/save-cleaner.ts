import { App, Plugin, TFile, debounce } from "obsidian";

export interface SaveCleanerOptions {
	app: App;
	enabled: () => boolean;
}

function cleanMarkdown(text: string): string {
	const lines = text.split("\n").map((l) => l.replace(/[ \t]+$/g, ""));
	let cleaned = lines.join("\n");
	// Ensure exactly one trailing newline.
	cleaned = cleaned.replace(/\s*$/g, "");
	return cleaned.length ? cleaned + "\n" : "";
}

export class SaveCleaner {
	private app: App;
	private enabled: () => boolean;
	private internalWrite = new Set<string>();
	private runDebounced: (file: TFile) => void;

	constructor(options: SaveCleanerOptions) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.runDebounced = debounce((file: TFile) => void this.run(file), 400, true);
	}

	register(plugin: Plugin) {
		plugin.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (!this.enabled()) return;
				if (!(file instanceof TFile)) return;
				if (file.extension !== "md") return;
				if (this.internalWrite.has(file.path)) return;
				this.runDebounced(file);
			}),
		);
	}

	private async run(file: TFile) {
		try {
			const current = await this.app.vault.read(file);
			const next = cleanMarkdown(current);
			if (next === current) return;

			this.internalWrite.add(file.path);
			try {
				await this.app.vault.modify(file, next);
			} finally {
				window.setTimeout(() => this.internalWrite.delete(file.path), 500);
			}
		} catch (e) {
			// Silent by default: save-cleaner should never block editing.
			console.error("[Editor Pro] SaveCleaner failed", e);
		}
	}
}

