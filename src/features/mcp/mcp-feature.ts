import { Notice, getLanguage } from "obsidian";
import type EditorProPlugin from "../../main";
import { MCPServer } from "./mcp-server";
import {
    MCP_DEFAULT_SETTINGS,
    MCP_PORT_MAX,
    MCP_PORT_MIN,
    MCP_RESTART_DELAY_MS,
    McpSettings,
} from "./mcp-types";
import { formatTemplate, getMcpTranslations } from "./translations";

export class McpFeature {
    private server?: MCPServer;
    private settings: McpSettings;

    constructor(private plugin: EditorProPlugin) {
        this.settings = { ...MCP_DEFAULT_SETTINGS };
    }

    async load() {
        await this.loadSettings();
        this.registerCommands();

        if (this.settings.startOnStartup) {
            this.startServer();
        }
    }

    async unload() {
        this.stopServer();
    }

    getSettings(): McpSettings {
        return this.settings;
    }

    async saveSettings(next: McpSettings) {
        this.settings = next;
        this.plugin.settings.mcp = next;
        await this.plugin.saveSettings();
    }

    startServer() {
        const i18n = this.getTranslations();
        if (this.server) {
            new Notice(i18n.notices.serverAlreadyRunning);
            return;
        }

        try {
            this.server = new MCPServer(
                this.plugin.app,
                this.settings.port,
                this.settings,
                i18n
            );
            void this.server.start();
            new Notice(
                formatTemplate(i18n.notices.serverStarted, {
                    port: this.settings.port.toString(),
                })
            );
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Failed to start MCP Server:", error);
            new Notice(
                formatTemplate(i18n.notices.serverStartFailed, {
                    error: message,
                })
            );
            this.server = undefined;
        }
    }

    stopServer() {
        const i18n = this.getTranslations();
        if (this.server) {
            void this.server.stop();
            this.server = undefined;
            new Notice(i18n.notices.serverStopped);
        } else {
            new Notice(i18n.notices.serverAlreadyStopped);
        }
    }

    async restartServer() {
        const i18n = this.getTranslations();
        this.stopServer();
        await new Promise((resolve) => setTimeout(resolve, MCP_RESTART_DELAY_MS));
        this.startServer();
        new Notice(i18n.notices.serverRestarted);
    }

    validatePort(value: string): number | null {
        const port = Number(value);
        if (!Number.isInteger(port)) return null;
        if (port < MCP_PORT_MIN || port > MCP_PORT_MAX) return null;
        return port;
    }

    getTranslations() {
        return getMcpTranslations(getLanguage() ?? "en");
    }

    private async loadSettings() {
        const mcp = this.plugin.settings.mcp ?? MCP_DEFAULT_SETTINGS;
        this.settings = {
            port: mcp.port ?? MCP_DEFAULT_SETTINGS.port,
            startOnStartup: mcp.startOnStartup ?? MCP_DEFAULT_SETTINGS.startOnStartup,
            tools: {
                ...MCP_DEFAULT_SETTINGS.tools,
                ...(mcp.tools ?? {}),
            },
        };

        this.plugin.settings.mcp = this.settings;
        await this.plugin.saveSettings();
    }

    private registerCommands() {
        const i18n = this.getTranslations();
        this.plugin.addCommand({
            id: "mcp-start-server",
            name: i18n.commands.startServer,
            callback: () => this.startServer(),
        });

        this.plugin.addCommand({
            id: "mcp-stop-server",
            name: i18n.commands.stopServer,
            callback: () => this.stopServer(),
        });

        this.plugin.addCommand({
            id: "mcp-restart-server",
            name: i18n.commands.restartServer,
            callback: () => this.restartServer(),
        });
    }
}
