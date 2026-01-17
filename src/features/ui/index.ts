/**
 * UI 模块 - 界面增强
 *
 * 包含：
 * - focus-ui: 专注模式
 * - floating-outline: 浮动大纲
 * - status-bar-stats: 状态栏统计
 * - file-tree-highlight: 文件树高亮
 * - zoom-modal: 局部聚焦弹窗
 * - search-selection-modal: 选区搜索弹窗
 * - modals: 通用弹窗组件
 */

// 专注模式
export { FocusUiManager } from "./focus-ui";

// 浮动大纲
export { FloatingOutline } from "./floating-outline";

// 状态栏统计
export { StatusBarStats } from "./status-bar-stats";

// 文件树高亮
export {
	FileTreeHighlightManager,
	type HighlightColor,
} from "./file-tree-highlight";

// 局部聚焦
export { zoomCurrentHeading, zoomCurrentListBlock } from "./zoom-modal";

// 搜索弹窗
export { SearchInSelectionModal } from "./search-selection-modal";
