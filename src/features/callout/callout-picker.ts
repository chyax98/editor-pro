import { App, SuggestModal } from "obsidian";

/**
 * Obsidian 官方支持的 Callout 类型
 * 来源：https://help.obsidian.md/Editing+and+formatting/Callouts
 *
 * 格式：[icon] type (alias1, alias2, ...)
 * - 主类型是 Obsidian 渲染时使用的标识
 * - 别名会渲染为相同的样式
 *
 * 注意：Obsidian 也支持用户通过 CSS 自定义类型，
 * 但目前 Obsidian API 未提供获取自定义类型的方法。
 */
const CALLOUT_TYPES = [
	// 信息类
	{ icon: "📝", type: "note" },
	{ icon: "📄", type: "abstract", aliases: ["summary", "tldr"] },
	{ icon: "ℹ️", type: "info" },
	{ icon: "💡", type: "tip", aliases: ["hint", "important"] },

	// 任务类
	{ icon: "✅", type: "todo" },
	{ icon: "✔️", type: "success", aliases: ["check", "done"] },

	// 问答类
	{ icon: "❓", type: "question", aliases: ["help", "faq"] },

	// 警告类
	{ icon: "⚠️", type: "warning", aliases: ["caution", "attention"] },
	{ icon: "❌", type: "failure", aliases: ["fail", "missing"] },
	{ icon: "⚡", type: "danger", aliases: ["error"] },
	{ icon: "🐞", type: "bug" },

	// 其他
	{ icon: "📝", type: "example" },
	{ icon: "💬", type: "quote", aliases: ["cite"] },
];

export class CalloutTypePicker extends SuggestModal<string> {
	onChoose: (result: string) => void;

	constructor(app: App, onChoose: (result: string) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getSuggestions(query: string): string[] {
		const q = query.toLowerCase();
		const results: string[] = [];

		for (const callout of CALLOUT_TYPES) {
			// 搜索主类型
			const displayText = `${callout.icon} ${callout.type}`;
			if (callout.type.includes(q)) {
				results.push(displayText);
				continue;
			}
			// 搜索别名
			if (callout.aliases?.some((alias) => alias.includes(q))) {
				results.push(displayText);
			}
		}

		// 如果没有匹配但有输入，允许用户输入自定义类型
		if (results.length === 0 && query.trim()) {
			results.push(`🔧 ${query.trim()} (自定义)`);
		}

		return results.length > 0
			? results
			: CALLOUT_TYPES.map((c) => `${c.icon} ${c.type}`);
	}

	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}

	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		// 提取类型名称
		// 格式: "icon type" 或 "icon type (自定义)"
		const match = item.match(/^\S+\s+(\S+)/);
		const type = match?.[1] ?? item;
		this.onChoose(type);
	}
}
