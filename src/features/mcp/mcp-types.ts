export interface McpToolSettings {
    get_active_file: boolean;
    open_file: boolean;
    get_selection: boolean;
    insert_text: boolean;
    get_open_files: boolean;
    get_vault_info: boolean;
    get_file_metadata: boolean;
    get_links: boolean;
    list_commands: boolean;
    execute_command: boolean;
    rename_file: boolean;
    list_files: boolean;
    read_file: boolean;
    create_file: boolean;
    edit_file: boolean;
    delete_file: boolean;
    create_folder: boolean;
    delete_folder: boolean;
    move_file: boolean;
    copy_file: boolean;
    search_vault: boolean;
    search_content: boolean;
    get_workspace_state: boolean;
    open_split: boolean;
    close_active_leaf: boolean;
    get_frontmatter: boolean;
    update_frontmatter: boolean;
    list_tasks: boolean;
    rename_tag: boolean;
    list_canvas_files: boolean;
    read_canvas: boolean;
}

export interface McpSettings {
    port: number;
    startOnStartup: boolean;
    tools: McpToolSettings;
}

export const MCP_PORT_MIN = 1;
export const MCP_PORT_MAX = 65535;
export const MCP_RESTART_DELAY_MS = 500;

export const MCP_DEFAULT_SETTINGS: McpSettings = {
    port: 27123,
    startOnStartup: true,
    tools: {
        get_active_file: true,
        open_file: true,
        get_selection: true,
        insert_text: true,
        get_open_files: true,
        get_vault_info: true,
        get_file_metadata: true,
        get_links: true,
        list_commands: true,
        execute_command: true,
        rename_file: true,
        list_files: true,
        read_file: true,
        create_file: true,
        edit_file: true,
        delete_file: true,
        create_folder: true,
        delete_folder: true,
        move_file: true,
        copy_file: true,
        search_vault: true,
        search_content: true,
        get_workspace_state: true,
        open_split: true,
        close_active_leaf: true,
        get_frontmatter: true,
        update_frontmatter: true,
        list_tasks: true,
        rename_tag: true,
        list_canvas_files: true,
        read_canvas: true
    }
};
