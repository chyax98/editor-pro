import { App, SuggestModal, TFile } from "obsidian";

export class RecentFilesHud extends SuggestModal<TFile> {
	private files: TFile[];

	constructor(app: App) {
		super(app);
		this.setPlaceholder("最近文件…");
		this.files = this.getRecentFiles();
	}

	private getRecentFiles(): TFile[] {
		const paths = this.app.workspace.getLastOpenFiles();
		const out: TFile[] = [];
		for (const p of paths) {
			const f = this.app.vault.getAbstractFileByPath(p);
			if (f instanceof TFile) out.push(f);
		}
		return out;
	}

	getSuggestions(query: string): TFile[] {
		const q = query.trim().toLowerCase();
		if (!q) return this.files;
		return this.files.filter(
			(f) =>
				f.path.toLowerCase().includes(q) ||
				f.basename.toLowerCase().includes(q),
		);
	}

	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.createEl("div", {
			text: value.basename,
			attr: { "aria-label": `文件名：${value.basename}` },
		});
		el.createEl("div", {
			text: value.path,
			cls: "editor-pro-hud-path",
			attr: { "aria-label": `路径：${value.path}` },
		});
	}

	onChooseSuggestion(item: TFile): void {
		const leaf = this.app.workspace.getLeaf(true);
		void leaf.openFile(item, { active: true });
	}
}
