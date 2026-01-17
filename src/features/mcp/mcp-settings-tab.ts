import { Notice, Setting } from "obsidian";
import { McpFeature } from "./mcp-feature";
import { MCP_PORT_MAX, MCP_PORT_MIN } from "./mcp-types";

export class McpSettingsRenderer {
	private pendingPort: number | null = null;

	constructor(private mcp: McpFeature) {}

	render(containerEl: HTMLElement): void {
		containerEl.empty();

		const i18n = this.mcp.getTranslations();
		const settings = this.mcp.getSettings();
		this.pendingPort = settings.port;

		new Setting(containerEl)
			.setName(i18n.labels.serverSettings)
			.setHeading();

		new Setting(containerEl)
			.setName(i18n.labels.port)
			.setDesc(`HTTP: http://localhost:${settings.port}/mcp`)
			.addText((text) =>
				text
					.setPlaceholder("27123")
					.setValue(settings.port.toString())
					.onChange((value) => {
						const port = Number(value);
						if (
							Number.isInteger(port) &&
							port >= MCP_PORT_MIN &&
							port <= MCP_PORT_MAX
						) {
							this.pendingPort = port;
						} else {
							this.pendingPort = null;
						}
					}),
			)
			.addButton((button) => {
				button.setButtonText(i18n.labels.copy).onClick(() => {
					void navigator.clipboard.writeText(
						`http://localhost:${settings.port}/mcp`,
					);
					new Notice(i18n.notices.endpointCopied);
				});
			});

		new Setting(containerEl)
			.setName(i18n.labels.autoStart)
			.setDesc(
				settings.startOnStartup
					? "MCP 将随 Obsidian 启动"
					: "MCP 仅手动启动",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(settings.startOnStartup)
					.onChange(async (value) => {
						const next = { ...settings, startOnStartup: value };
						await this.mcp.saveSettings(next);
					}),
			);

		new Setting(containerEl)
			.setDesc(i18n.labels.restartHint)
			.addButton((button) => {
				button
					.setButtonText(i18n.labels.restartServer)
					.setCta()
					.onClick(async () => {
						if (
							this.pendingPort !== null &&
							this.pendingPort !== settings.port
						) {
							const next = {
								...settings,
								port: this.pendingPort,
							};
							await this.mcp.saveSettings(next);
						} else if (this.pendingPort === null) {
							new Notice(i18n.notices.invalidPort);
							return;
						}
						await this.mcp.restartServer();
					});
			});

		new Setting(containerEl).setName(i18n.labels.tools).setHeading();
		containerEl.createEl("p", {
			text: i18n.labels.toolsHint,
			cls: "setting-item-description editor-pro-mcp-hint",
		});

		this.addToolToggle(
			containerEl,
			"get_active_file",
			"获取当前活动文件（可选内容）",
		);
		this.addToolToggle(containerEl, "get_selection", "获取当前选中的文本");
		this.addToolToggle(
			containerEl,
			"insert_text",
			"在光标处插入或替换文本",
		);
		this.addToolToggle(containerEl, "open_file", "打开文件并可跳转到行");
		this.addToolToggle(containerEl, "get_open_files", "列出当前打开的文件");
		this.addToolToggle(
			containerEl,
			"get_workspace_state",
			"获取工作区状态与布局信息",
		);
		this.addToolToggle(containerEl, "open_split", "在分栏中打开文件");
		this.addToolToggle(
			containerEl,
			"close_active_leaf",
			"关闭当前活动标签页",
		);

		this.addToolToggle(
			containerEl,
			"get_vault_info",
			"获取 Vault 基础信息",
		);
		this.addToolToggle(
			containerEl,
			"get_file_metadata",
			"获取文件元数据（tags/headings/links）",
		);
		this.addToolToggle(
			containerEl,
			"get_links",
			"获取链接关系（incoming/outgoing/both）",
		);

		this.addToolToggle(
			containerEl,
			"list_files",
			"列出目录下的文件/文件夹",
		);
		this.addToolToggle(containerEl, "read_file", "读取文件内容");
		this.addToolToggle(containerEl, "create_file", "高风险：创建文件");
		this.addToolToggle(containerEl, "edit_file", "高风险：覆盖写入文件");
		this.addToolToggle(containerEl, "delete_file", "高风险：删除文件");
		this.addToolToggle(containerEl, "create_folder", "高风险：创建文件夹");
		this.addToolToggle(containerEl, "delete_folder", "高风险：删除文件夹");
		this.addToolToggle(containerEl, "move_file", "高风险：移动文件");
		this.addToolToggle(containerEl, "copy_file", "高风险：复制文件");

		this.addToolToggle(containerEl, "search_vault", "按文件名搜索");
		this.addToolToggle(
			containerEl,
			"search_content",
			"全文搜索（Markdown）",
		);

		this.addToolToggle(containerEl, "list_commands", "列出 Obsidian 命令");
		this.addToolToggle(
			containerEl,
			"execute_command",
			"高风险：执行 Obsidian 命令",
		);

		this.addToolToggle(
			containerEl,
			"rename_file",
			"高风险：重命名文件并更新链接",
		);

		this.addToolToggle(containerEl, "get_frontmatter", "读取 Frontmatter");
		this.addToolToggle(
			containerEl,
			"update_frontmatter",
			"高风险：更新 Frontmatter",
		);

		this.addToolToggle(containerEl, "list_tasks", "扫描任务清单");

		this.addToolToggle(containerEl, "rename_tag", "高风险：批量重命名标签");

		this.addToolToggle(
			containerEl,
			"list_canvas_files",
			"列出 Canvas 文件",
		);
		this.addToolToggle(containerEl, "read_canvas", "读取 Canvas 内容");
	}

	private addToolToggle(
		containerEl: HTMLElement,
		key: keyof ReturnType<McpFeature["getSettings"]>["tools"],
		desc: string,
	) {
		const settings = this.mcp.getSettings();
		new Setting(containerEl)
			.setName(key)
			.setDesc(desc)
			.addToggle((toggle) =>
				toggle.setValue(settings.tools[key]).onChange(async (value) => {
					const next = {
						...settings,
						tools: {
							...settings.tools,
							[key]: value,
						},
					};
					await this.mcp.saveSettings(next);
				}),
			);
	}
}
