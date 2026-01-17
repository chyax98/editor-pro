/**
 * Homepage Feature - React Component
 * 通用首页仪表板
 */

import * as React from "react";
import { App, TFile, moment } from "obsidian";
import { FolderStats, RecentFile, ReminderItem } from "./types";
import {
	getGreeting,
	getTodayDisplay,
	getTodayNotePath,
	checkTodayNoteExists,
	getFolderStats,
	getRecentFiles,
	getReminders,
	getMonthlyOverviewPath,
	parseTrackedFolders,
	parseReminderFolders,
} from "./utils";
import type { EditorProSettings } from "../../settings";

interface HomepageProps {
	app: App;
	settings: EditorProSettings;
	onOpenFile: (path: string) => void;
	onCreateDailyNote: () => void;
	onOpenFolder: (path: string) => void;
	onRefresh: () => void;
}

export const HomepageComponent: React.FC<HomepageProps> = ({
	app,
	settings,
	onOpenFile,
	onCreateDailyNote,
	onOpenFolder,
	onRefresh,
}) => {
	const [folderStats, setFolderStats] = React.useState<FolderStats[]>([]);
	const [recentFiles, setRecentFiles] = React.useState<RecentFile[]>([]);
	const [reminders, setReminders] = React.useState<ReminderItem[]>([]);
	const [todayNoteExists, setTodayNoteExists] = React.useState(false);

	const today = getTodayDisplay();
	const greeting = getGreeting();

	const trackedFolders = React.useMemo(
		() => parseTrackedFolders(settings.homepageTrackedFolders),
		[settings.homepageTrackedFolders],
	);
	const reminderFolders = React.useMemo(
		() => parseReminderFolders(settings.homepageReminderFolders),
		[settings.homepageReminderFolders],
	);

	// Load data
	const loadData = React.useCallback(() => {
		if (settings.homepageShowFolderStats) {
			setFolderStats(
				getFolderStats(app, trackedFolders, reminderFolders),
			);
		}
		if (settings.homepageShowRecentFiles) {
			setRecentFiles(
				getRecentFiles(app, settings.homepageRecentFilesCount),
			);
		}
		if (settings.homepageShowReminders) {
			setReminders(
				getReminders(
					app,
					reminderFolders,
					settings.homepageWeeklyCleanDay,
				),
			);
		}
		if (settings.homepageShowDailyNote) {
			setTodayNoteExists(
				checkTodayNoteExists(app, settings.homepageDailyNotesFolder),
			);
		}
	}, [app, settings, trackedFolders, reminderFolders]);

	React.useEffect(() => {
		loadData();

		// Register file change events
		const onModify = app.vault.on("modify", loadData);
		const onCreate = app.vault.on("create", loadData);
		const onDelete = app.vault.on("delete", loadData);
		const onRename = app.vault.on("rename", loadData);

		// Refresh every minute for relative time
		const timer = setInterval(loadData, 60000);

		return () => {
			app.vault.offref(onModify);
			app.vault.offref(onCreate);
			app.vault.offref(onDelete);
			app.vault.offref(onRename);
			clearInterval(timer);
		};
	}, [app, loadData]);

	const handleDailyNoteClick = () => {
		if (todayNoteExists) {
			onOpenFile(getTodayNotePath(settings.homepageDailyNotesFolder));
		} else {
			onCreateDailyNote();
		}
	};

	const monthlyPath = settings.homepageShowMonthlyOverview
		? getMonthlyOverviewPath(settings.homepageMonthlyPattern)
		: null;

	return (
		<div className="homepage-container">
			{/* Header: Greeting */}
			{settings.homepageShowGreeting && (
				<div className="homepage-header">
					<div className="homepage-greeting">{greeting}</div>
					<div className="homepage-date">
						<span className="homepage-date-full">{today.full}</span>
						<span className="homepage-date-weekday">
							{today.weekday}
						</span>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="homepage-quick-actions">
				{settings.homepageShowDailyNote && (
					<button
						className={`homepage-action-card ${todayNoteExists ? "exists" : "create"}`}
						onClick={handleDailyNoteClick}
					>
						<span className="action-icon">📖</span>
						<span className="action-label">今日日记</span>
						<span className="action-hint">
							{todayNoteExists ? "打开" : "创建"}
						</span>
					</button>
				)}
				{monthlyPath && (
					<button
						className="homepage-action-card"
						onClick={() => onOpenFile(monthlyPath)}
					>
						<span className="action-icon">📅</span>
						<span className="action-label">本月概览</span>
						<span className="action-hint">
							{moment().format("MMM")}
						</span>
					</button>
				)}
			</div>

			{/* Folder Stats / Flow */}
			{settings.homepageShowFolderStats && folderStats.length > 0 && (
				<div className="homepage-section">
					<div className="homepage-section-title">仓库状态</div>
					<div className="homepage-folder-flow">
						{folderStats
							.filter(
								(fs) =>
									trackedFolders.find(
										(tf) => tf.path === fs.path,
									)?.showInFlow,
							)
							.map((fs, idx, arr) => (
								<React.Fragment key={fs.path}>
									<button
										className={`homepage-folder-card ${fs.needsAttention ? "attention" : ""}`}
										onClick={() => onOpenFolder(fs.path)}
										title={fs.attentionReason}
									>
										<span className="folder-icon">
											{fs.icon}
										</span>
										<span className="folder-name">
											{fs.name}
										</span>
										<span className="folder-count">
											{fs.count} 篇
										</span>
										{fs.needsAttention && (
											<span className="folder-attention">
												⚠️
											</span>
										)}
									</button>
									{idx < arr.length - 1 && (
										<span className="folder-flow-arrow">
											→
										</span>
									)}
								</React.Fragment>
							))}
					</div>
				</div>
			)}

			{/* Recent Files */}
			{settings.homepageShowRecentFiles && recentFiles.length > 0 && (
				<div className="homepage-section">
					<div className="homepage-section-title">最近编辑</div>
					<div className="homepage-recent-list">
						{recentFiles.map((file) => (
							<button
								key={file.path}
								className="homepage-recent-item"
								onClick={() => onOpenFile(file.path)}
							>
								<span className="recent-icon">📄</span>
								<span className="recent-name">{file.name}</span>
								<span className="recent-folder">
									{file.folder}
								</span>
								<span className="recent-time">
									{file.mtimeDisplay}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Pinned Notes */}
			{settings.homepageShowPinnedNotes &&
				settings.homepagePinnedNotes.length > 0 && (
					<div className="homepage-section">
						<div className="homepage-section-title">
							📌 置顶笔记
						</div>
						<div className="homepage-pinned-list">
							{settings.homepagePinnedNotes.map((path) => {
								const file =
									app.vault.getAbstractFileByPath(path);
								if (!(file instanceof TFile)) return null;
								return (
									<button
										key={path}
										className="homepage-pinned-item"
										onClick={() => onOpenFile(path)}
									>
										<span className="pinned-name">
											{file.basename}
										</span>
										<span className="pinned-folder">
											{file.parent?.path || ""}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

			{/* Reminders */}
			{settings.homepageShowReminders && reminders.length > 0 && (
				<div className="homepage-section homepage-reminders">
					<div className="homepage-section-title">⏰ 清理提醒</div>
					<div className="homepage-reminder-list">
						{reminders.map((reminder, idx) => (
							<div key={idx} className="homepage-reminder-item">
								<span className="reminder-icon">📌</span>
								<span className="reminder-message">
									{reminder.message}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="homepage-footer">
				<button
					className="homepage-refresh-btn"
					onClick={onRefresh}
					title="刷新"
				>
					🔄
				</button>
			</div>
		</div>
	);
};
