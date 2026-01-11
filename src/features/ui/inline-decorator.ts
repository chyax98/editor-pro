import { App, MarkdownView, Plugin, TFile, debounce, normalizePath } from "obsidian";

type Frontmatter = Record<string, unknown> & { icon?: unknown; banner?: unknown };

function getFrontmatter(app: App, file: TFile): Frontmatter | null {
	const cache = app.metadataCache.getFileCache(file);
	return (cache?.frontmatter ?? null) as Frontmatter | null;
}

function readString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

export class InlineDecorator {
	private app: App;
	private enabled: () => boolean;
	private updateDebounced: () => void;
	private bannerEl: HTMLElement | null = null;

	constructor(options: { app: App; enabled: () => boolean }) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.updateDebounced = debounce(() => this.updateAll(), 200, true);
	}

	register(plugin: Plugin) {
		plugin.register(() => this.cleanup());
		plugin.registerEvent(this.app.workspace.on("layout-change", () => this.updateDebounced()));
		plugin.registerEvent(this.app.workspace.on("file-open", () => this.updateDebounced()));
		plugin.registerEvent(this.app.metadataCache.on("changed", () => this.updateDebounced()));

		this.updateDebounced();
	}

	private cleanup() {
		this.bannerEl?.remove();
		this.bannerEl = null;
	}

	private ensureBannerEl(view: MarkdownView) {
		if (this.bannerEl && this.bannerEl.isConnected) {
			if (this.bannerEl.parentElement === view.contentEl) return;
			this.bannerEl.remove();
			this.bannerEl = null;
		}

		this.bannerEl = document.createElement("div");
		this.bannerEl.addClass("editor-pro-note-banner");
		view.contentEl.insertBefore(this.bannerEl, view.contentEl.firstChild);
	}

	private updateBanner() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = view?.file;
		if (!view || !file) return;

		if (!this.enabled()) {
			this.bannerEl?.remove();
			this.bannerEl = null;
			return;
		}

		const fm = getFrontmatter(this.app, file);
		const bannerRaw = fm ? readString(fm.banner) : null;
		if (!bannerRaw) {
			this.bannerEl?.remove();
			this.bannerEl = null;
			return;
		}

		this.ensureBannerEl(view);

		let url = bannerRaw;
		// Support vault-relative path.
		if (!/^https?:\/\//i.test(bannerRaw)) {
			const normalized = normalizePath(bannerRaw);
			const bannerFile = this.app.vault.getAbstractFileByPath(normalized);
			if (bannerFile instanceof TFile) {
				url = this.app.vault.getResourcePath(bannerFile);
			}
		}

		// Avoid setting raw style attributes; keep the mutation scoped to a single CSS property.
		// Also ignore suspicious schemes (users can still use vault-relative paths).
		if (/^(https?:\/\/|app:\/\/)/i.test(url)) {
			if (this.bannerEl) this.bannerEl.setCssProps({ "background-image": `url("${url}")` });
		} else {
			if (this.bannerEl) this.bannerEl.setCssProps({ "background-image": "" });
		}
	}

	private updateFileListIcons() {
		if (!this.enabled()) return;

		const containers = Array.from(document.querySelectorAll<HTMLElement>(".nav-files-container"));
		for (const container of containers) {
			const titles = Array.from(container.querySelectorAll<HTMLElement>(".nav-file-title"));
			for (const title of titles) {
				const path = title.getAttribute("data-path");
				if (!path) continue;
				const abs = this.app.vault.getAbstractFileByPath(path);
				if (!(abs instanceof TFile)) continue;

				const fm = getFrontmatter(this.app, abs);
				const icon = fm ? readString(fm.icon) : null;

				let iconEl = title.querySelector<HTMLElement>(".editor-pro-file-icon");

				if (icon) {
					if (!iconEl) {
						iconEl = title.createSpan({ cls: "editor-pro-file-icon" });
						const content = title.querySelector(".nav-file-title-content");
						if (content) content.before(iconEl);
					}
					iconEl.setText(icon);
				} else {
					iconEl?.remove();
				}
			}
		}
	}

	private updateAll() {
		this.updateFileListIcons();
		this.updateBanner();
	}
}
