import { App, Plugin, TFile, debounce } from "obsidian";
import { generateDate } from "../../utils/markdown-generators";

export interface YamlSettings {
	enableYaml: boolean;
	createdKey: string;
	updatedKey: string;
	dateFormat: string;
}

type SupportedDateFormat = "YYYY-MM-DD" | "HH:mm" | "YYYY-MM-DD HH:mm";

function normalizeDateFormat(format: string): SupportedDateFormat {
	if (
		format === "YYYY-MM-DD" ||
		format === "HH:mm" ||
		format === "YYYY-MM-DD HH:mm"
	)
		return format;
	return "YYYY-MM-DD HH:mm";
}

export class YamlManager {
	private app: App;
	private settings: YamlSettings;
	private updateDebounced: (file: TFile) => void;
	// Prevent infinite loops where updating the file triggers the modify event again
	private inProgressFiles: Set<string> = new Set();
	// Track timeout IDs for cleanup (use ReturnType for Node/Browser compatibility)
	private timeoutIds: Map<string, ReturnType<typeof setTimeout>> = new Map();

	constructor(app: App, settings: YamlSettings) {
		this.app = app;
		this.settings = settings;

		// Use Obsidian's official debounce
		// 1000ms delay to batch rapid edits
		this.updateDebounced = debounce(
			(file: TFile) => this.updateFile(file),
			2000,
			true,
		);
	}

	register(plugin: Plugin) {
		plugin.registerEvent(
			this.app.vault.on("create", (file) => {
				if (!this.settings.enableYaml) return;
				if (file instanceof TFile && file.extension === "md") {
					void this.addCreatedDate(file);
				}
			}),
		);

		plugin.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (!this.settings.enableYaml) return;
				if (file instanceof TFile && file.extension === "md") {
					if (this.inProgressFiles.has(file.path)) return;
					this.updateDebounced(file);
				}
			}),
		);
	}

	updateSettings(newSettings: YamlSettings) {
		this.settings = newSettings;
	}

	private async addCreatedDate(file: TFile) {
		try {
			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter) => {
					const fm = frontmatter as Record<string, unknown>;
					if (!fm[this.settings.createdKey]) {
						fm[this.settings.createdKey] = generateDate(
							normalizeDateFormat(this.settings.dateFormat),
						);
					}
				},
			);
		} catch (error) {
			console.error(
				`[Editor Pro] Failed to add created date to ${file.path}`,
				error,
			);
		}
	}

	private async updateFile(file: TFile) {
		if (this.inProgressFiles.has(file.path)) return;
		this.inProgressFiles.add(file.path);

		try {
			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter) => {
					const fm = frontmatter as Record<string, unknown>;
					const now = generateDate(
						normalizeDateFormat(this.settings.dateFormat),
					);
					const current = fm[this.settings.updatedKey];

					// Only update if time has actually changed (minute precision)
					if (current !== now) {
						fm[this.settings.updatedKey] = now;
					}
				},
			);
		} catch (error) {
			console.error(
				`[Editor Pro] Failed to update date for ${file.path}`,
				error,
			);
		} finally {
			// Release the lock after a short delay to allow file system to settle
			// Track timeout for potential cleanup
			const timeoutId = setTimeout(() => {
				this.inProgressFiles.delete(file.path);
				this.timeoutIds.delete(file.path);
			}, 500);
			this.timeoutIds.set(file.path, timeoutId);
		}
	}

	/**
	 * Cleanup method to clear all pending timeouts
	 * Call this when the plugin is unloaded
	 */
	cleanup() {
		for (const [filePath, timeoutId] of this.timeoutIds) {
			clearTimeout(timeoutId);
			this.inProgressFiles.delete(filePath);
		}
		this.timeoutIds.clear();
	}
}
