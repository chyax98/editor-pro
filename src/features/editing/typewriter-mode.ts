import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

export function createTypewriterScrollExtension(isEnabled: () => boolean) {
	return ViewPlugin.fromClass(
		class {
			update(update: ViewUpdate) {
				if (!isEnabled()) return;
				if (!update.selectionSet && !update.docChanged) return;

				const head = update.state.selection.main.head;
				update.view.dispatch({
					effects: EditorView.scrollIntoView(head, { y: "center" }),
				});
			}
		},
	);
}

