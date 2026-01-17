/**
 * Homepage Feature - View
 * ItemView wrapper for the Homepage React component
 */

import { ItemView, WorkspaceLeaf, TFile, TFolder, moment } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HomepageComponent } from "./homepage-component";
import type EditorProPluginType from "../../main";

export const HOMEPAGE_VIEW_TYPE = "editor-pro-homepage";

export class HomepageView extends ItemView {
	private root: ReactDOM.Root | null = null;
	private plugin: EditorProPluginType;

	constructor(leaf: WorkspaceLeaf, plugin: EditorProPluginType) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return HOMEPAGE_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "首页 (Homepage)";
	}

	getIcon(): string {
		return "home";
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;
		container.empty();
		container.addClass("homepage-view");

		this.root = ReactDOM.createRoot(container);
		this.renderComponent();
	}

	private renderComponent(): void {
		if (!this.root) return;

		const element = React.createElement(HomepageComponent, {
			app: this.app,
			settings: this.plugin.settings,
			onOpenFile: (path: string) => {
				void this.handleOpenFile(path);
			},
			onCreateDailyNote: () => {
				void this.handleCreateDailyNote();
			},
			onOpenFolder: this.handleOpenFolder.bind(this),
			onRefresh: this.handleRefresh.bind(this),
		});

		this.root.render(element);
	}

	private async handleOpenFile(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf(false).openFile(file);
		}
	}

	private async handleCreateDailyNote(): Promise<void> {
		const folder = this.plugin.settings.homepageDailyNotesFolder;
		const today = moment().format("YYYY-MM-DD");
		const path = `${folder}/${today}.md`;

		// Ensure folder exists
		const folderObj = this.app.vault.getAbstractFileByPath(folder);
		if (!folderObj) {
			await this.app.vault.createFolder(folder);
		}

		// Create note
		const content = `# ${today}\n\n`;
		const file = await this.app.vault.create(path, content);
		await this.app.workspace.getLeaf(false).openFile(file);
	}

	private handleOpenFolder(path: string): void {
		const folder = this.app.vault.getAbstractFileByPath(path);
		if (folder instanceof TFolder) {
			// Reveal folder in file explorer
			const fileExplorer =
				this.app.workspace.getLeavesOfType("file-explorer")[0];
			if (fileExplorer && fileExplorer.view) {
				(
					fileExplorer.view as {
						revealInFolder?: (f: TFolder) => void;
					}
				).revealInFolder?.(folder);
			}
		}
	}

	private handleRefresh(): void {
		this.renderComponent();
	}

	async onClose(): Promise<void> {
		this.root?.unmount();
		this.root = null;
	}

	// Public method to update from outside
	public refresh(): void {
		this.renderComponent();
	}
}
