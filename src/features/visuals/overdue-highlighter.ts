import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// Match @due(YYYY-MM-DD)
const DUE_DATE_REGEX = /@due\((\d{4}-\d{2}-\d{2})\)/g;

export const overdueHighlighter = ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const now = new Date();
        // Simple YYYY-MM-DD
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        for (const { from, to } of view.visibleRanges) {
            const text = view.state.doc.sliceString(from, to);
            // Regex exec needs to run on the text, but the index is relative to 'from'.
            // Also need to be careful with regex state if using global flag.
            DUE_DATE_REGEX.lastIndex = 0;
            
            let match;
            while ((match = DUE_DATE_REGEX.exec(text)) !== null) {
                const dateStr = match[1];
                if (!dateStr) continue;
                
                const start = from + match.index;
                const end = start + match[0].length;
                
                let styleClass = '';
                if (dateStr < todayStr) {
                    styleClass = 'editor-pro-overdue';
                } else if (dateStr === todayStr) {
                    styleClass = 'editor-pro-today';
                }
                
                if (styleClass) {
                    builder.add(start, end, Decoration.mark({ class: styleClass }));
                }
            }
        }
        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});
