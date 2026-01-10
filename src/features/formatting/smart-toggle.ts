import { Editor } from "obsidian";
import { isWrapped, unwrap, wrap, getWordBoundaries, findEnclosingMarker } from "../../utils/editor-utils";

export interface ToggleConfig {
    marker: string;
    // Command name for logging or internal use
    name?: string; 
}

export function smartToggle(editor: Editor, config: ToggleConfig) {
    const selection = editor.getSelection();
    
    if (selection.length > 0) {
        // Case 1: Text is selected
        if (isWrapped(selection, config.marker)) {
            const unwrapped = unwrap(selection, config.marker);
            editor.replaceSelection(unwrapped);
        } else {
            editor.replaceSelection(wrap(selection, config.marker));
        }
    } else {
        // Case 2: No selection, check cursor context
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        
        // Check if we are inside a marker pair
        const markedRange = findEnclosingMarker(line, cursor.ch, config.marker);
        
        if (markedRange) {
            // Un-toggle: Remove markers
            const text = line.substring(markedRange.from, markedRange.to);
            const unwrapped = unwrap(text, config.marker);
            editor.replaceRange(
                unwrapped, 
                { line: cursor.line, ch: markedRange.from }, 
                { line: cursor.line, ch: markedRange.to }
            );
            // Adjust cursor? Ideally keep relative position, but for now simple replacement is okay.
        } else {
            // Toggle On: 
            // Sub-case: Word under cursor?
            const wordRange = getWordBoundaries(line, cursor.ch);
            const word = line.substring(wordRange.from, wordRange.to);
            
            if (word.length > 0) {
                // Wrap the word
                 editor.replaceRange(
                    wrap(word, config.marker),
                    { line: cursor.line, ch: wordRange.from },
                    { line: cursor.line, ch: wordRange.to }
                );
            } else {
                 // Insert empty marker and place cursor inside
                editor.replaceRange(config.marker + config.marker, cursor);
                editor.setCursor({ line: cursor.line, ch: cursor.ch + config.marker.length });
            }
        }
    }
}
