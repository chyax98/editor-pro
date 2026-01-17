/**
 * Vault Guardian Feature - Type Definitions
 * 目录结构守护功能
 */

export interface FolderRule {
	allowSubfolders: boolean; // 允许创建子目录
	maxDepth: number; // 最大嵌套深度 (从该目录开始计算)
	allowedSubfolderPattern?: string; // 子目录名称正则模式
}

export interface ViolationReport {
	type: "root" | "subfolder" | "depth" | "pattern";
	path: string;
	message: string;
	suggestion?: string;
}

export interface HealthCheckResult {
	isHealthy: boolean;
	violations: ViolationReport[];
	stats: {
		totalFolders: number;
		rootFolders: number;
		maxDepthFound: number;
	};
}

/**
 * 解析根目录白名单（每行一个目录名）
 */
export function parseAllowedRootFolders(config: string): string[] {
	if (!config.trim()) return [];
	return config
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"));
}

/**
 * 解析目录规则配置
 * 格式: "path:allowSubfolders:maxDepth:pattern" 每行一个
 */
export function parseFolderRules(config: string): Record<string, FolderRule> {
	if (!config.trim()) return {};
	const rules: Record<string, FolderRule> = {};

	config
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"))
		.forEach((line) => {
			const parts = line.split(":");
			const path = parts[0];
			if (path) {
				rules[path] = {
					allowSubfolders: parts[1] !== "false",
					maxDepth: parseInt(parts[2] || "0", 10),
					allowedSubfolderPattern: parts[3] || undefined,
				};
			}
		});

	return rules;
}
