/**
 * Homepage Feature - Manager
 * 管理首页视图的注册、命令、右键菜单
 */

import { WorkspaceLeaf, Notice, TFile, Menu } from 'obsidian';
import { HomepageView, HOMEPAGE_VIEW_TYPE } from './homepage-view';
import type EditorProPluginType from '../../main';

export class HomepageManager {
    private plugin: EditorProPluginType;

    constructor(plugin: EditorProPluginType) {
        this.plugin = plugin;
    }

    register(): void {
        const plugin = this.plugin;

        // Register view
        plugin.registerView(
            HOMEPAGE_VIEW_TYPE,
            (leaf) => new HomepageView(leaf, plugin)
        );

        // Add ribbon icon
        plugin.addRibbonIcon('home', '打开首页 (Homepage)', () => {
            void this.activateHomepage();
        });

        // Add commands
        plugin.addCommand({
            id: 'open-homepage',
            name: '打开首页 (Open Homepage)',
            callback: () => {
                void this.activateHomepage();
            },
        });

        plugin.addCommand({
            id: 'open-homepage-new-tab',
            name: '在新标签页打开首页 (Open Homepage in New Tab)',
            callback: () => {
                void this.activateHomepageNewTab();
            },
        });

        // Replace new tab behavior
        if (plugin.settings.homepageReplaceNewTab) {
            plugin.registerEvent(
                plugin.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf | null) => {
                    if (!plugin.settings.homepageReplaceNewTab) return;
                    if (leaf && leaf.view.getViewType() !== HOMEPAGE_VIEW_TYPE) {
                        const state = leaf.getViewState();
                        if (state.type === 'empty' && !state.state?.file) {
                            void this.replaceWithHomepage(leaf);
                        }
                    }
                })
            );
        }

        // Register file menu for pinning notes
        plugin.registerEvent(
            plugin.app.workspace.on('file-menu', (menu: Menu, file) => {
                if (!(file instanceof TFile)) return;

                const pinnedNotes = plugin.settings.homepagePinnedNotes;
                const isPinned = pinnedNotes.includes(file.path);

                menu.addItem((item) => {
                    item
                        .setTitle(isPinned ? '从首页取消置顶' : '置顶到首页')
                        .setIcon(isPinned ? 'pin-off' : 'pin')
                        .onClick(async () => {
                            const notes = [...pinnedNotes];
                            if (isPinned) {
                                const idx = notes.indexOf(file.path);
                                if (idx > -1) notes.splice(idx, 1);
                            } else {
                                notes.push(file.path);
                            }
                            plugin.settings.homepagePinnedNotes = notes;
                            await plugin.saveSettings();
                            this.refreshHomepageViews();
                            new Notice(isPinned ? '已取消置顶' : '已置顶到首页');
                        });
                });
            })
        );

        // Open on startup if enabled
        if (plugin.settings.homepageShowOnStartup) {
            plugin.app.workspace.onLayoutReady(() => {
                setTimeout(() => {
                    void this.activateHomepage();
                }, 100);
            });
        }

        // Register cleanup
        plugin.register(() => this.cleanup());
    }

    async activateHomepage(): Promise<void> {
        const { workspace } = this.plugin.app;
        const leaves = workspace.getLeavesOfType(HOMEPAGE_VIEW_TYPE);

        if (leaves.length > 0 && leaves[0]) {
            void workspace.revealLeaf(leaves[0]);
        } else {
            const leaf = workspace.getLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: HOMEPAGE_VIEW_TYPE,
                    active: true,
                });
            }
        }
    }

    async activateHomepageNewTab(): Promise<void> {
        const leaf = this.plugin.app.workspace.getLeaf(true);
        if (leaf) {
            await leaf.setViewState({
                type: HOMEPAGE_VIEW_TYPE,
                active: true,
            });
        }
    }

    private async replaceWithHomepage(leaf: WorkspaceLeaf): Promise<void> {
        await leaf.setViewState({
            type: HOMEPAGE_VIEW_TYPE,
            active: true,
        });
    }

    refreshHomepageViews(): void {
        const leaves = this.plugin.app.workspace.getLeavesOfType(HOMEPAGE_VIEW_TYPE);
        for (const leaf of leaves) {
            if (leaf.view instanceof HomepageView) {
                leaf.view.refresh();
            }
        }
    }

    cleanup(): void {
        this.plugin.app.workspace.getLeavesOfType(HOMEPAGE_VIEW_TYPE).forEach((leaf) => {
            leaf.detach();
        });
    }
}
