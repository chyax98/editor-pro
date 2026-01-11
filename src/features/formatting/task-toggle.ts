import { Editor } from "obsidian";

// Pre-compile regex for performance
const TASK_REGEX = /^(\s*)-\s\[(.)\]\s(.*)$/;
const LIST_REGEX = /^(\s*)-\s(.*)$/;
const INDENT_REGEX = /^(\s*)(.*)$/;

export function toggleTask(editor: Editor) {
    const cursor = editor.getCursor();
    const lineNum = cursor.line;
    const line = editor.getLine(lineNum);

    // Regex breakdown:
    // ^(\s*)       -> Group 1: Indentation
    // (- \[.\] )   -> Group 2: Task marker (optional)
    // (- )         -> Group 3: List marker (optional)
    // (.*)$        -> Group 4: Content

    // Task states:
    // - [ ] Todo
    // - [/] Doing
    // - [x] Done
    const taskMatch = line.match(TASK_REGEX);

    if (taskMatch) {
        const indent = taskMatch[1];
        const status = taskMatch[2];
        const content = taskMatch[3];

        if (status === ' ') {
            // Todo -> Doing
            editor.setLine(lineNum, `${indent}- [/] ${content}`);
        } else if (status === '/' ) {
            // Doing -> Done
            editor.setLine(lineNum, `${indent}- [x] ${content}`);
        } else {
            // Done (or other) -> Plain text
            editor.setLine(lineNum, `${indent}${content}`);
        }
        return;
    }

    const listMatch = line.match(LIST_REGEX);
    if (listMatch) {
        // List item "- text" -> Task "- [ ] text"
        const indent = listMatch[1];
        const content = listMatch[2];
        editor.setLine(lineNum, `${indent}- [ ] ${content}`);
        return;
    }

    // Plain text -> Task
    // Preserve indentation if exists
    const indentMatch = line.match(INDENT_REGEX);
    const indent = indentMatch ? indentMatch[1] : '';
    const content = indentMatch ? indentMatch[2] : line;

    editor.setLine(lineNum, `${indent}- [ ] ${content}`);
}
