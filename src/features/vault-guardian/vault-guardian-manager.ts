/**
 * Vault Guardian Feature - Manager
 * 管理目录结构守护功能
 */

import { TFolder, Notice } from "obsidian";
import {
	ViolationReport,
	parseAllowedRootFolders,
	parseFolderRules,
} from "./types";
import { checkCreationAllowed, runHealthCheck } from "./rules";
import { VaultGuardianWarningModal } from "./warning-modal";
import { VaultGuardianHealthReportModal } from "./health-report-modal";
import type EditorProPluginType from "../../main";

export class VaultGuardianManager {
	private plugin: EditorProPluginType;

	constructor(plugin: EditorProPluginType) {
		this.plugin = plugin;
	}

	register(): void {
		const plugin = this.plugin;

		// Add health check command
		plugin.addCommand({
			id: "vault-guardian-health-check",
			name: "Vault Guardian: 目录结构检查",
			callback: () => {
				this.runHealthCheckCommand();
			},
		});

		// Monitor folder creation
		plugin.registerEvent(
			plugin.app.vault.on("create", (file) => {
				if (!plugin.settings.enableVaultGuardian) return;
				if (!(file instanceof TFolder)) return;

				const allowedRoots = parseAllowedRootFolders(
					plugin.settings.vaultGuardianAllowedRoots,
				);
				const folderRules = parseFolderRules(
					plugin.settings.vaultGuardianFolderRules,
				);

				const result = checkCreationAllowed(
					allowedRoots,
					folderRules,
					file.path,
					true,
				);

				if (!result.allowed && result.violation) {
					this.handleViolation(result.violation, file.path);
				}
			}),
		);

		// Run health check on startup if enabled
		if (plugin.settings.vaultGuardianCheckOnStartup) {
			plugin.app.workspace.onLayoutReady(() => {
				setTimeout(() => {
					this.runSilentHealthCheck();
				}, 2000);
			});
		}

		// Register cleanup
		plugin.register(() => this.cleanup());
	}

	private handleViolation(violation: ViolationReport, path: string): void {
		const settings = this.plugin.settings;

		if (settings.vaultGuardianShowNotification) {
			new Notice(`⚠️ Vault Guardian: ${violation.message}`, 5000);
		}

		if (settings.vaultGuardianBlockCreation) {
			// Show modal with blocking behavior
			new VaultGuardianWarningModal(
				this.plugin.app,
				violation,
				true,
				() => {}, // onProceed - disabled
				() => {
					// Delete the created folder
					const folder =
						this.plugin.app.vault.getAbstractFileByPath(path);
					if (folder instanceof TFolder) {
						void this.plugin.app.fileManager.trashFile(folder);
					}
				},
			).open();
		} else {
			// Show warning only
			new VaultGuardianWarningModal(
				this.plugin.app,
				violation,
				false,
				() => {}, // onProceed - allow
				() => {
					// Delete on cancel
					const folder =
						this.plugin.app.vault.getAbstractFileByPath(path);
					if (folder instanceof TFolder) {
						void this.plugin.app.fileManager.trashFile(folder);
					}
				},
			).open();
		}
	}

	private runHealthCheckCommand(): void {
		const settings = this.plugin.settings;
		const allowedRoots = parseAllowedRootFolders(
			settings.vaultGuardianAllowedRoots,
		);
		const folderRules = parseFolderRules(settings.vaultGuardianFolderRules);

		const result = runHealthCheck(
			this.plugin.app,
			allowedRoots,
			folderRules,
		);
		new VaultGuardianHealthReportModal(this.plugin.app, result).open();
	}

	private runSilentHealthCheck(): void {
		const settings = this.plugin.settings;
		const allowedRoots = parseAllowedRootFolders(
			settings.vaultGuardianAllowedRoots,
		);
		const folderRules = parseFolderRules(settings.vaultGuardianFolderRules);

		const result = runHealthCheck(
			this.plugin.app,
			allowedRoots,
			folderRules,
		);

		if (!result.isHealthy) {
			new Notice(
				`⚠️ Vault Guardian: 发现 ${result.violations.length} 个目录结构问题`,
				5000,
			);
		}
	}

	cleanup(): void {
		// No resources to clean up
	}
}
