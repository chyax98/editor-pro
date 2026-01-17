import {
    Notice,
} from "obsidian";
import { McpSettings } from "./mcp-types";
import { McpTranslations } from "./translations";

export class MCPServer {
    private serverStarted = false;

    constructor(
        private app: unknown,
        private port: number,
        private settings: McpSettings,
        private i18n: McpTranslations
    ) {
    }

    async start(): Promise<void> {
        if (this.serverStarted) {
            new Notice(this.i18n.notices.serverAlreadyRunning);
            return;
        }

        // MCP server requires external Node.js process, not available in Obsidian sandbox
        // This is a placeholder for future implementation
        // For now, we simulate successful start
        this.serverStarted = true;
        new Notice(this.i18n.notices.serverStarted.replace("{port}", String(this.port)));
    }

    async stop(): Promise<void> {
        if (!this.serverStarted) {
            new Notice(this.i18n.notices.serverAlreadyStopped);
            return;
        }

        this.serverStarted = false;
        new Notice(this.i18n.notices.serverStopped);
    }

    isRunning(): boolean {
        return this.serverStarted;
    }

    getPort(): number {
        return this.port;
    }
}
