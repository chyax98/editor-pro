/**
 * Homepage Feature - Utility Functions
 */

import { App, TFile, TFolder, moment } from "obsidian";
import {
	FolderStats,
	RecentFile,
	ReminderItem,
	TrackedFolder,
	ReminderFolder,
} from "./types";

/**
 * 解析追踪目录配置字符串
 * 格式: "path:name:icon:showInFlow:order" 每行一个
 */
export function parseTrackedFolders(config: string): TrackedFolder[] {
	if (!config.trim()) return [];
	return config
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"))
		.map((line, idx) => {
			const parts = line.split(":");
			return {
				path: parts[0] || "",
				name: parts[1] || parts[0] || "",
				icon: parts[2] || "📁",
				showInFlow: parts[3] !== "false",
				order: parseInt(parts[4] || String(idx), 10),
			};
		})
		.filter((f) => f.path);
}

/**
 * 解析提醒目录配置字符串
 * 格式: "path:name:maxItems" 每行一个
 */
export function parseReminderFolders(config: string): ReminderFolder[] {
	if (!config.trim()) return [];
	return config
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"))
		.map((line) => {
			const parts = line.split(":");
			return {
				path: parts[0] || "",
				name: parts[1] || parts[0] || "",
				maxDays: parseInt(parts[2] || "7", 10),
				maxItems: parseInt(parts[3] || "10", 10),
			};
		})
		.filter((f) => f.path);
}

/**
 * 获取问候语
 */
export function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 6) return "夜深了";
	if (hour < 9) return "早上好";
	if (hour < 12) return "上午好";
	if (hour < 14) return "中午好";
	if (hour < 18) return "下午好";
	if (hour < 22) return "晚上好";
	return "夜深了";
}

/**
 * 获取今日日期的显示格式
 */
export function getTodayDisplay(): {
	date: string;
	weekday: string;
	full: string;
} {
	const now = moment();
	const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
	return {
		date: now.format("M月D日"),
		weekday: weekdays[now.day()] ?? "周日",
		full: now.format("YYYY年M月D日"),
	};
}

/**
 * 获取今日日记路径
 */
export function getTodayNotePath(folder: string): string {
	const today = moment().format("YYYY-MM-DD");
	return `${folder}/${today}.md`;
}

/**
 * 检查今日日记是否存在
 */
export function checkTodayNoteExists(app: App, folder: string): boolean {
	const path = getTodayNotePath(folder);
	return app.vault.getAbstractFileByPath(path) instanceof TFile;
}

/**
 * 统计目录中的文件数量
 */
export function countFilesInFolder(app: App, folderPath: string): number {
	const folder = app.vault.getAbstractFileByPath(folderPath);
	if (!(folder instanceof TFolder)) return 0;

	let count = 0;
	const countRecursive = (f: TFolder) => {
		for (const child of f.children) {
			if (child instanceof TFile) {
				count++;
			} else if (child instanceof TFolder) {
				countRecursive(child);
			}
		}
	};
	countRecursive(folder);
	return count;
}

/**
 * 获取目录统计信息
 */
export function getFolderStats(
	app: App,
	trackedFolders: TrackedFolder[],
	reminderFolders: ReminderFolder[],
): FolderStats[] {
	return trackedFolders
		.sort((a, b) => a.order - b.order)
		.map((tf) => {
			const count = countFilesInFolder(app, tf.path);
			const reminder = reminderFolders.find((rf) => rf.path === tf.path);
			let needsAttention = false;
			let attentionReason: string | undefined;

			if (reminder && count > reminder.maxItems) {
				needsAttention = true;
				attentionReason = `超过 ${reminder.maxItems} 项`;
			}

			return {
				path: tf.path,
				name: tf.name,
				icon: tf.icon,
				count,
				needsAttention,
				attentionReason,
			};
		});
}

/**
 * 获取最近编辑的文件
 */
export function getRecentFiles(
	app: App,
	limit: number,
	excludeFolders: string[] = [],
): RecentFile[] {
	const files = app.vault.getMarkdownFiles();
	const recentlyOpened = app.workspace.getLastOpenFiles();

	const filesWithTime = files
		.filter(
			(f) =>
				!excludeFolders.some((folder) =>
					f.path.startsWith(folder + "/"),
				),
		)
		.map((file) => {
			let lastAccessTime = 0;
			const openIndex = recentlyOpened.indexOf(file.path);
			if (openIndex !== -1) {
				lastAccessTime = Date.now() - openIndex * 60 * 1000;
			}
			const lastTime = Math.max(file.stat.mtime, lastAccessTime);
			return { file, lastTime };
		});

	return filesWithTime
		.sort((a, b) => b.lastTime - a.lastTime)
		.slice(0, limit)
		.map(({ file }) => ({
			path: file.path,
			name: file.basename,
			folder: file.parent?.path || "",
			mtime: file.stat.mtime,
			mtimeDisplay: formatRelativeTime(file.stat.mtime),
		}));
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;

	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 1) return "刚刚";
	if (minutes < 60) return `${minutes} 分钟前`;
	if (hours < 24) return `${hours} 小时前`;
	if (days === 1) return "昨天";
	if (days < 7) return `${days} 天前`;
	return moment(timestamp).format("MM-DD");
}

/**
 * 获取清理提醒
 */
export function getReminders(
	app: App,
	reminderFolders: ReminderFolder[],
	weeklyCleanDay: number,
): ReminderItem[] {
	const reminders: ReminderItem[] = [];
	const today = moment();
	const currentDay = today.day();

	// Weekly reminder
	let daysUntilClean = weeklyCleanDay - currentDay;
	if (daysUntilClean <= 0) daysUntilClean += 7;
	if (daysUntilClean <= 3) {
		reminders.push({
			folder: "Weekly",
			message: `Weekly 清理：还剩 ${daysUntilClean} 天`,
			daysLeft: daysUntilClean,
		});
	}

	// Monthly reminder (end of month)
	const endOfMonth = today.clone().endOf("month");
	const daysUntilMonthEnd = endOfMonth.diff(today, "days");
	if (daysUntilMonthEnd <= 7) {
		reminders.push({
			folder: "Monthly",
			message: `月末整理：还剩 ${daysUntilMonthEnd} 天`,
			daysLeft: daysUntilMonthEnd,
		});
	}

	// Folder-specific reminders
	for (const rf of reminderFolders) {
		const count = countFilesInFolder(app, rf.path);
		if (count > rf.maxItems) {
			reminders.push({
				folder: rf.name,
				message: `${rf.name} 有 ${count} 项，建议清理`,
				itemCount: count,
			});
		}
	}

	return reminders;
}

/**
 * 获取月度概览路径
 */
export function getMonthlyOverviewPath(pattern: string): string | null {
	if (!pattern) return null;
	const now = moment();
	return pattern
		.replace("YYYY", now.format("YYYY"))
		.replace("MMM", now.format("MMM"))
		.replace("MM", now.format("MM"));
}
