import { App, SuggestModal } from "obsidian";
import { INFOGRAPHIC_TEMPLATES, InfographicTemplate } from "./templates";

export class InfographicTemplatePicker extends SuggestModal<InfographicTemplate> {
	private onChoose: (template: InfographicTemplate) => void;

	constructor(app: App, onChoose: (template: InfographicTemplate) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder("搜索模板：流程 / 时间线 / 柱状图 / 层级…");
	}

	getSuggestions(query: string): InfographicTemplate[] {
		const q = query.trim().toLowerCase();
		if (!q) return INFOGRAPHIC_TEMPLATES;

		return INFOGRAPHIC_TEMPLATES.filter((t) => {
			return (
				t.name.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				(t.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false)
			);
		});
	}

	renderSuggestion(value: InfographicTemplate, el: HTMLElement): void {
		el.createEl("div", { text: value.name });
		el.createEl("div", { text: value.id, cls: "editor-pro-infographic-template-id" });
	}

	onChooseSuggestion(item: InfographicTemplate): void {
		this.onChoose(item);
	}
}

