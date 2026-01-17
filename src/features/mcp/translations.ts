export type TranslationDict = Record<string, string>;

export interface McpTranslations {
    commands: {
        startServer: string;
        stopServer: string;
        restartServer: string;
    };
    notices: {
        serverRunning: string;
        serverStopped: string;
        serverAlreadyRunning: string;
        serverAlreadyStopped: string;
        serverStartFailed: string;
        serverStarted: string;
        serverRestarted: string;
        invalidPort: string;
        endpointCopied: string;
    };
    labels: {
        serverSettings: string;
        port: string;
        autoStart: string;
        endpoint: string;
        copy: string;
        tools: string;
        toolsHint: string;
        restartHint: string;
        restartServer: string;
    };
    groups: {
        workspace: string;
        vault: string;
        metadata: string;
        commands: string;
        fileManager: string;
        fileOps: string;
        search: string;
        frontmatter: string;
        tasks: string;
        tags: string;
        canvas: string;
    };
}

const zh: McpTranslations = {
    commands: {
        startServer: "启动 MCP 服务器",
        stopServer: "停止 MCP 服务器",
        restartServer: "重启 MCP 服务器",
    },
    notices: {
        serverRunning: "MCP 服务器正在运行",
        serverStopped: "MCP 服务器已停止",
        serverAlreadyRunning: "MCP 服务器已在运行",
        serverAlreadyStopped: "MCP 服务器已停止",
        serverStartFailed: "启动 MCP 服务器失败: {error}",
        serverStarted: "MCP 服务器已启动，端口: {port}",
        serverRestarted: "MCP 服务器已重启",
        invalidPort: "无效的端口号。请输入 1 到 65535 之间的数字。",
        endpointCopied: "MCP 端点已复制",
    },
    labels: {
        serverSettings: "服务器设置",
        port: "端口",
        autoStart: "自动启动 MCP",
        endpoint: "MCP 端点",
        copy: "复制",
        tools: "工具权限",
        toolsHint: "高风险工具已在描述中标注，请确认用户明确指令后再执行。",
        restartHint: "工具变更需要重启 MCP 服务器才能生效。",
        restartServer: "重启 MCP 服务器",
    },
    groups: {
        workspace: "工作区",
        vault: "Vault",
        metadata: "元数据",
        commands: "命令",
        fileManager: "文件管理",
        fileOps: "文件操作",
        search: "搜索",
        frontmatter: "Frontmatter",
        tasks: "任务",
        tags: "标签",
        canvas: "Canvas",
    },
};

const en: McpTranslations = {
    commands: {
        startServer: "Start MCP Server",
        stopServer: "Stop MCP Server",
        restartServer: "Restart MCP Server",
    },
    notices: {
        serverRunning: "MCP Server is running.",
        serverStopped: "MCP Server stopped.",
        serverAlreadyRunning: "MCP Server is already running.",
        serverAlreadyStopped: "MCP Server is already stopped.",
        serverStartFailed: "Failed to start MCP Server: {error}",
        serverStarted: "MCP Server started on port {port}",
        serverRestarted: "MCP Server restarted.",
        invalidPort: "Invalid port number. Please enter a number between 1 and 65535.",
        endpointCopied: "MCP endpoint copied.",
    },
    labels: {
        serverSettings: "Server Settings",
        port: "Port",
        autoStart: "Auto start MCP",
        endpoint: "MCP Endpoint",
        copy: "Copy",
        tools: "Tool Permissions",
        toolsHint: "High-risk tools are marked in descriptions. Only execute them after explicit user confirmation.",
        restartHint: "Tool changes require MCP Server restart to take effect.",
        restartServer: "Restart MCP Server",
    },
    groups: {
        workspace: "Workspace",
        vault: "Vault",
        metadata: "Metadata",
        commands: "Commands",
        fileManager: "File Manager",
        fileOps: "File Ops",
        search: "Search",
        frontmatter: "Frontmatter",
        tasks: "Tasks",
        tags: "Tags",
        canvas: "Canvas",
    },
};

export function getMcpTranslations(language: string): McpTranslations {
    return language.toLowerCase().startsWith("zh") ? zh : en;
}

export function formatTemplate(template: string, params: Record<string, string> = {}): string {
    return Object.entries(params).reduce(
        (value, [key, entry]) => value.replace(`{${key}}`, entry),
        template
    );
}
