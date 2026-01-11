import { Plugin } from "obsidian";

export class FocusUiManager {
	private enabled = false;
	private cls: string;

	constructor(className: string = "editor-pro-focus-ui") {
		this.cls = className;
	}

	register(plugin: Plugin) {
		plugin.register(() => this.disable());
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	toggle(): boolean {
		if (this.enabled) {
			this.disable();
			return false;
		}
		this.enable();
		return true;
	}

	private enable() {
		this.enabled = true;
		document.body.classList.add(this.cls);
	}

	private disable() {
		this.enabled = false;
		document.body.classList.remove(this.cls);
	}
}

