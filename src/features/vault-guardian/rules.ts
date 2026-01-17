/**
 * Vault Guardian Feature - Rule Engine
 * 规则检查引擎
 */

import { App, TFolder } from "obsidian";
import { ViolationReport, HealthCheckResult, FolderRule } from "./types";

/**
 * 检查是否可以在指定路径创建文件/目录
 */
export function checkCreationAllowed(
    allowedRootFolders: string[],
    folderRules: Record<string, FolderRule>,
    path: string,
    isFolder: boolean,
): { allowed: boolean; violation?: ViolationReport } {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) {
        return { allowed: true };
    }

    const rootFolder = parts[0] ?? "";

    // Check 1: Root folder whitelist
    if (allowedRootFolders.length > 0) {
        if (!allowedRootFolders.includes(rootFolder)) {
            if (parts.length === 1 && isFolder) {
                return {
                    allowed: false,
                    violation: {
                        type: "root",
                        path,
                        message: `不允许在根目录创建 "${rootFolder}"`,
                        suggestion: `只允许以下根目录: ${allowedRootFolders.join(", ")}`,
                    },
                };
            }
        }
    }

    // Check 2: Folder-specific rules
    const rule = folderRules[rootFolder];
    if (rule && parts.length > 1) {
        if (isFolder && !rule.allowSubfolders && parts.length > 1) {
            const depth = parts.length;
            if (depth === 2) {
                return {
                    allowed: false,
                    violation: {
                        type: "subfolder",
                        path,
                        message: `"${rootFolder}" 不允许创建子目录`,
                        suggestion: `请直接在 ${rootFolder}/ 根目录下创建文件`,
                    },
                };
            }
        }

        const depth = parts.length - 1;
        if (isFolder && rule.maxDepth > 0 && depth > rule.maxDepth) {
            return {
                allowed: false,
                violation: {
                    type: "depth",
                    path,
                    message: `超过 "${rootFolder}" 的最大嵌套深度 (${rule.maxDepth})`,
                    suggestion: `当前深度: ${depth}，最大允许: ${rule.maxDepth}`,
                },
            };
        }

        if (isFolder && rule.allowedSubfolderPattern && parts.length === 2) {
            const subfolderName = parts[1] ?? "";
            const pattern = new RegExp(rule.allowedSubfolderPattern);
            if (!pattern.test(subfolderName)) {
                return {
                    allowed: false,
                    violation: {
                        type: "pattern",
                        path,
                        message: `子目录名 "${subfolderName}" 不符合命名规则`,
                        suggestion: `期望模式: ${rule.allowedSubfolderPattern}`,
                    },
                };
            }
        }
    }

    return { allowed: true };
}

/**
 * 运行目录结构健康检查
 */
export function runHealthCheck(
    app: App,
    allowedRootFolders: string[],
    folderRules: Record<string, FolderRule>,
): HealthCheckResult {
    const violations: ViolationReport[] = [];
    let totalFolders = 0;
    let maxDepthFound = 0;
    const rootFolders = new Set<string>();

    const checkFolder = (folder: TFolder, depth: number) => {
        totalFolders++;
        if (depth > maxDepthFound) maxDepthFound = depth;

        const parts = folder.path.split("/").filter(Boolean);
        const rootName = parts[0] ?? "";

        if (rootName) {
            rootFolders.add(rootName);
        }

        // Check root folder whitelist
        if (parts.length === 1 && allowedRootFolders.length > 0) {
            if (!allowedRootFolders.includes(rootName)) {
                violations.push({
                    type: "root",
                    path: folder.path,
                    message: `根目录 "${rootName}" 不在白名单中`,
                });
            }
        }

        // Check folder rules
        if (parts.length > 1 && rootName) {
            const rule = folderRules[rootName];
            if (rule) {
                if (!rule.allowSubfolders && parts.length > 1) {
                    violations.push({
                        type: "subfolder",
                        path: folder.path,
                        message: `"${rootName}" 内发现子目录 (违规)`,
                    });
                }

                const relativeDepth = parts.length - 1;
                if (rule.maxDepth > 0 && relativeDepth > rule.maxDepth) {
                    violations.push({
                        type: "depth",
                        path: folder.path,
                        message: `超过最大深度 (${relativeDepth} > ${rule.maxDepth})`,
                    });
                }

                if (rule.allowedSubfolderPattern && parts.length === 2) {
                    const subName = parts[1] ?? "";
                    const pattern = new RegExp(rule.allowedSubfolderPattern);
                    if (!pattern.test(subName)) {
                        violations.push({
                            type: "pattern",
                            path: folder.path,
                            message: `子目录名不符合命名规则`,
                        });
                    }
                }
            }
        }

        for (const child of folder.children) {
            if (child instanceof TFolder) {
                checkFolder(child, depth + 1);
            }
        }
    };

    const root = app.vault.getRoot();
    for (const child of root.children) {
        if (child instanceof TFolder) {
            checkFolder(child, 1);
        }
    }

    return {
        isHealthy: violations.length === 0,
        violations,
        stats: {
            totalFolders,
            rootFolders: rootFolders.size,
            maxDepthFound,
        },
    };
}
