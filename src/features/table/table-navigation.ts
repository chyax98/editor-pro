import { Editor } from "obsidian";
import { findNextCell, findPreviousCell } from "./navigation-utils";

export function handleTableNavigation(evt: KeyboardEvent, editor: Editor) {
    if (evt.key !== 'Tab') return;
    
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    
    // Check if in table
    if (!line.trim().startsWith('|')) return;
    
    let targetCh: number | null = null;
    
    if (evt.shiftKey) {
        targetCh = findPreviousCell(line, cursor.ch);
    } else {
        targetCh = findNextCell(line, cursor.ch);
    }
    
    if (targetCh !== null) {
        evt.preventDefault();
        // Since it's a DOM event, we need to ensure the editor has focus or just set cursor.
        // Set cursor is synchronous.
        editor.setCursor({ line: cursor.line, ch: targetCh });
    }
}
