import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// Match @due(YYYY-MM-DD)
const DUE_DATE_REGEX = /@due\((\d{4}-\d{2}-\d{2})\)/g;

function buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const now = new Date();
    // Simple YYYY-MM-DD
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (const { from, to } of view.visibleRanges) {
        const text = view.state.doc.sliceString(from, to);
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

export function createOverdueHighlighter(isEnabled: () => boolean) {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet = Decoration.none;
        private enabled: boolean;

        constructor(view: EditorView) {
            this.enabled = isEnabled();
            this.decorations = this.enabled ? buildDecorations(view) : Decoration.none;
        }

        update(update: ViewUpdate) {
            const nextEnabled = isEnabled();
            if (nextEnabled !== this.enabled) {
                this.enabled = nextEnabled;
                this.decorations = this.enabled ? buildDecorations(update.view) : Decoration.none;
                return;
            }

            if (!this.enabled) return;

            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildDecorations(update.view);
            }
        }
    }, {
        decorations: v => v.decorations
    });
}

export const overdueHighlighter = createOverdueHighlighter(() => true);
