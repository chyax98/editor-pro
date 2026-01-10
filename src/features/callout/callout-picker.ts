import { App, SuggestModal } from "obsidian";

export class CalloutTypePicker extends SuggestModal<string> {
    onChoose: (result: string) => void;

    constructor(app: App, onChoose: (result: string) => void) {
        super(app);
        this.onChoose = onChoose;
    }

    getSuggestions(query: string): string[] {
        const types = [
            "note", "abstract", "info", "todo", "tip", "success", 
            "question", "warning", "failure", "danger", "bug", 
            "example", "quote"
        ];
        return types.filter(t => t.toLowerCase().includes(query.toLowerCase()));
    }

    renderSuggestion(value: string, el: HTMLElement) {
        el.setText(value);
    }

    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        this.onChoose(item);
    }
}
