/**
 * Input 模块 - 输入增强
 *
 * 包含：
 * - input-handler: 智能输入处理
 * - magic-input: 魔法输入（日期、符号替换）
 * - slash-command: 斜杠命令菜单
 */

// 智能输入
export { checkSmartInput } from "./input-handler";

// 魔法输入
export {
	checkMagicDateInput,
	checkMagicSymbols,
	applyReplacementAtCursor,
} from "./magic-input";

// 斜杠命令
export { SlashCommandMenu } from "./menu";
