import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { CalendarComponent } from "./calendar-component";

export const CALENDAR_VIEW_TYPE = "editor-pro-calendar";

export class CalendarView extends ItemView {
    root: ReactDOM.Root | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return CALENDAR_VIEW_TYPE;
    }

    getDisplayText() {
        return "日历 (Calendar)";
    }

    getIcon() {
        return "calendar-days";
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();

        this.root = ReactDOM.createRoot(container);
        this.root.render(
            <React.StrictMode>
                <CalendarComponent app={this.app} />
            </React.StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
