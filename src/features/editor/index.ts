/**
 * Editor 模块 - 编辑器核心增强
 * 
 * 包含：
 * - keyshots: 行操作快捷键（上移、下移、复制、删除）
 * - smart-toggle: 智能格式切换（加粗、斜体等）
 * - smart-typography: 智能配对和空格
 * - outliner: 大纲编辑增强
 * - typewriter: 打字机模式
 * - task-toggle: 任务状态切换
 * - heading-utils: 标题工具
 * - block-navigation: 块导航
 * - smart-paste: 智能粘贴
 * - smart-image: 图片粘贴
 * - smart-link: 链接标题获取
 */

// 行操作
export { moveLineUp, moveLineDown, duplicateLine, deleteLine, selectLine } from './keyshots';

// 格式切换
export { smartToggle } from './smart-toggle';
export { toggleTask } from './task-toggle';

// 智能输入
export { handleAutoPair, handleSmartBackspace, handleSmartSpacing } from './smart-typography';

// 大纲编辑
export { handleOutlinerIndent, toggleFold } from './outliner';

// 打字机模式
export { createTypewriterScrollExtension } from './typewriter-mode';

// 标题和块导航
export { setHeading } from './heading-utils';
export { handleBlockNavigation } from './block-navigation';

// 粘贴增强
export { smartPasteUrlIntoSelection } from './smart-paste-url';
export { handleSmartImagePaste } from './smart-image-paste';
export { extractTitleFromClipboardHtml, fetchPageTitle, isHttpUrl } from './smart-link-title';
export { RemoteImageTaskScheduler } from './remote-image-scheduler';
