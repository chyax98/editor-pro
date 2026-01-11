import { App, SuggestModal } from "obsidian";

export class CalloutTypePicker extends SuggestModal<string> {
    onChoose: (result: string) => void;

    constructor(app: App, onChoose: (result: string) => void) {
        super(app);
        this.onChoose = onChoose;
    }

    getSuggestions(query: string): string[] {
        const types = [
            "✏️ note", "📄 abstract", "ℹ️ info", "✅ todo", "💡 tip", "✔️ success", 
            "❓ question", "⚠️ warning", "❌ failure", "⚡ danger", "🐞 bug", 
            "📝 example", "💬 quote"
        ];
        return types.filter(t => t.toLowerCase().includes(query.toLowerCase()));
    }

    renderSuggestion(value: string, el: HTMLElement) {
        el.setText(value);
    }

    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        // Strip icon for the actual type
        // Format: "emoji type" -> extract "type", fallback to full item
        const parts = item.split(' ');
        const type = parts.length > 1 ? parts.slice(1).join(' ') : item;
        this.onChoose(type);
    }
}
