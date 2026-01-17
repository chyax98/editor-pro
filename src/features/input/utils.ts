export interface SlashCommand {
	id: string;
	name: string;
	aliases?: string[];
}

// 恢复误删的 shouldTriggerSlashCommand
export function shouldTriggerSlashCommand(
	line: string,
	cursorCh: number,
): { query: string } | null {
	const textBeforeCursor = line.slice(0, cursorCh);

	// 智能触发条件，避免误触发：
	// 1. 触发符在行首 -> 允许
	// 2. 触发符前有空格 -> 允许
	// 3. 避免匹配 URL 协议 (https://, http://, ftp://, file://)
	// 4. 避免匹配 Windows 路径 (C:/, D:/ 等)
	// 5. 避免匹配 Unix 路径连续斜杠 (//)

	// 检查是否包含 URL 协议或 Windows 路径
	// https://, http://, ftp://, file://, C:/, D:/ 等
	const urlOrWindowsPathPattern = /[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
	if (urlOrWindowsPathPattern.test(textBeforeCursor)) {
		return null;
	}

	// 检查是否有连续的斜杠（可能是 URL 或路径的一部分）
	// 如：https://example.com 中的 ://
	if (
		textBeforeCursor.includes("://") ||
		/[^a-zA-Z0-9]\/\//.test(textBeforeCursor)
	) {
		return null;
	}

	// 正则匹配：
	// (?:^|\s) - 行首或空格
	// ([/、\\]) - 触发符（/ 、 或 \）
	// ([^/、\\]*) - 查询内容（不包含触发符）
	const regex = /(?:^|\s)([/、\\])([^/、\\]*)$/;

	const match = textBeforeCursor.match(regex);

	if (match && typeof match[2] === "string") {
		const query = match[2];
		const triggerChar = match[1];

		// 额外的安全检查：避免路径误触发
		// 如果触发符是 / 或 \，且前面看起来像路径的一部分
		if ((triggerChar === "/" || triggerChar === "\\") && query.length > 0) {
			const beforeTrigger = textBeforeCursor.slice(0, -query.length - 1);
			const trimmedBefore = beforeTrigger.trim();

			// 如果触发符前有内容，且不是纯空格，检查是否像路径
			// 路径特征：包含字母、数字、下划线、点等
			if (trimmedBefore.length > 0 && /[\w.-]$/.test(trimmedBefore)) {
				// 可能是路径的一部分，比如 "path/to" 中的 "/to"
				// 但如果前面有空格分隔，应该是有效的触发
				// 例如 "Hello /code" 应该触发，但 "path/to" 不应该
				if (!/\s$/.test(beforeTrigger)) {
					return null;
				}
			}
		}

		return { query };
	}

	return null;
}

export function matchCommand(query: string, command: SlashCommand): boolean {
	if (!query) return true;

	const q = query.toLowerCase();

	// 1. Match Name
	if (command.name.toLowerCase().includes(q)) return true;

	// 2. Match Aliases
	if (
		command.aliases &&
		command.aliases.some((a) => a.toLowerCase().includes(q))
	)
		return true;

	return false;
}
