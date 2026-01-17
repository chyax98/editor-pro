/**
 * Templates 模块 - 模板系统
 *
 * 包含：
 * - template-modal: 模板选择弹窗
 * - template-engine: 模板引擎
 * - snippets: 内置代码片段
 * - loader: 模板加载器
 */

// 模板弹窗
export { TemplateModal } from "./template-modal";

// 模板引擎
export { TemplateEngine } from "./template-engine";

// 内置片段
export { BUILTIN_TEMPLATES } from "./snippets";

// 加载器
export { TemplateLoader, type TemplateFile } from "./loader";
