/**
 * Homepage Feature - Type Definitions
 * 通用首页仪表板功能
 */

export interface TrackedFolder {
	path: string; // 目录路径
	name: string; // 显示名称
	icon: string; // 图标
	showInFlow: boolean; // 在流向图中显示
	order: number; // 排序
}

export interface ReminderFolder {
	path: string; // 目录路径
	name: string; // 显示名称
	maxDays: number; // 超过多少天提醒
	maxItems: number; // 超过多少项提醒
}

export interface FolderStats {
	path: string;
	name: string;
	icon: string;
	count: number;
	needsAttention: boolean;
	attentionReason?: string;
}

export interface RecentFile {
	path: string;
	name: string;
	folder: string;
	mtime: number;
	mtimeDisplay: string;
}

export interface ReminderItem {
	folder: string;
	message: string;
	daysLeft?: number;
	itemCount?: number;
}
