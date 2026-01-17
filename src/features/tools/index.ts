/**
 * Tools 模块 - 小工具集合
 * 
 * 包含：
 * - footnotes: 脚注插入
 * - inline-calc: 行内计算
 * - random-generator: 随机生成（UUID、随机数、骰子）
 * - text-transformer: 文本转换
 */

// 脚注
export { insertFootnote } from './footnotes';

// 行内计算
export { inlineCalcReplaceSelection } from './inline-calc';

// 随机生成
export { insertUuid, insertRandomIntPrompt, insertDiceRollPrompt } from './random-generator';

// 文本转换
export { transformEditorText } from './text-transformer';
