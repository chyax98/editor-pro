import { App, Editor, MarkdownView, Plugin, TFile, debounce } from "obsidian";

export interface CursorMemoryState {
	cursor: { line: number; ch: number };
	scroll: { top: number; left: number };
	updatedAt: number;
}

export class CursorMemoryManager {
	private app: App;
	private enabled: () => boolean;
	private stateByPath: Record<string, CursorMemoryState>;
	private saveDebounced: (() => void) | null = null;
	private onSave: (state: Record<string, CursorMemoryState>) => Promise<void>;
	private pendingTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();

	constructor(options: {
		app: App;
		enabled: () => boolean;
		initialState?: Record<string, CursorMemoryState>;
		onSave: (state: Record<string, CursorMemoryState>) => Promise<void>;
	}) {
		this.app = options.app;
		this.enabled = options.enabled;
		this.stateByPath = options.initialState ?? {};
		this.onSave = options.onSave;
		this.saveDebounced = debounce(() => {
			void this.onSave(this.stateByPath);
		}, 1000, true);
	}

	exportState(): Record<string, CursorMemoryState> {
		return this.stateByPath;
	}

	private getActiveMarkdownView(): MarkdownView | null {
		return this.app.workspace.getActiveViewOfType(MarkdownView);
	}

	rememberFromEditor(editor: Editor, file: TFile) {
		const cursor = editor.getCursor();
		const scroll = editor.getScrollInfo();
		this.stateByPath[file.path] = {
			cursor: { line: cursor.line, ch: cursor.ch },
			scroll: { top: scroll.top, left: scroll.left },
			updatedAt: Date.now(),
		};
		this.saveDebounced?.();
	}

	restoreToEditor(editor: Editor, file: TFile) {
		const s = this.stateByPath[file.path];
		if (!s) return;
		editor.setCursor({ line: s.cursor.line, ch: s.cursor.ch });
		editor.scrollTo(s.scroll.left, s.scroll.top);
	}

	register(plugin: Plugin) {
		plugin.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (!this.enabled()) return;
				if (!(file instanceof TFile)) return;

				// Defer to allow editor/view to mount.
				const timeoutId = setTimeout(() => {
					this.pendingTimeouts.delete(timeoutId);
					const view = this.getActiveMarkdownView();
					if (!view || view.file?.path !== file.path) return;
					this.restoreToEditor(view.editor, file);
				}, 0);
				this.pendingTimeouts.add(timeoutId);
			}),
		);

		plugin.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor, info) => {
				if (!this.enabled()) return;
				const file = info.file;
				if (!(file instanceof TFile)) return;
				this.rememberFromEditor(editor, file);
			}),
		);

		plugin.registerDomEvent(document, "mouseup", () => {
			if (!this.enabled()) return;
			const view = this.getActiveMarkdownView();
			const file = view?.file;
			if (!view || !(file instanceof TFile)) return;
			this.rememberFromEditor(view.editor, file);
		});

		plugin.registerDomEvent(document, "keyup", () => {
			if (!this.enabled()) return;
			const view = this.getActiveMarkdownView();
			const file = view?.file;
			if (!view || !(file instanceof TFile)) return;
			this.rememberFromEditor(view.editor, file);
		});

		// Register cleanup function
		plugin.register(() => this.cleanup());
	}

	cleanup() {
		for (const timeoutId of this.pendingTimeouts) {
			clearTimeout(timeoutId);
		}
		this.pendingTimeouts.clear();
	}
}
