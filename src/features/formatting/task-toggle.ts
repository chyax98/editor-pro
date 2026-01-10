import { Editor } from "obsidian";

export function toggleTask(editor: Editor) {
    const cursor = editor.getCursor();
    const lineNum = cursor.line;
    const line = editor.getLine(lineNum);
    
    // Regex breakdown:
    // ^(\s*)       -> Group 1: Indentation
    // (- \[.\] )   -> Group 2: Task marker (optional)
    // (- )         -> Group 3: List marker (optional)
    // (.*)$        -> Group 4: Content
    
    // Check for Task: "- [ ] " or "- [x] "
    const taskRegex = /^(\s*)-\s\[(.)\]\s(.*)$/;
    const listRegex = /^(\s*)-\s(.*)$/;
    
    const taskMatch = line.match(taskRegex);
    
    if (taskMatch) {
        const indent = taskMatch[1];
        const status = taskMatch[2];
        const content = taskMatch[3];
        
        if (status === ' ') {
            // Incomplete -> Complete
            editor.setLine(lineNum, `${indent}- [x] ${content}`);
        } else {
            // Complete (or other) -> Plain Text (Remove task)
            // Cycle: Plain -> Todo -> Done -> Plain
            editor.setLine(lineNum, `${indent}${content}`);
        }
        return;
    }
    
    const listMatch = line.match(listRegex);
    if (listMatch) {
        // List item "- text" -> Task "- [ ] text"
        const indent = listMatch[1];
        const content = listMatch[2];
        editor.setLine(lineNum, `${indent}- [ ] ${content}`);
        return;
    }
    
    // Plain text -> Task
    // Preserve indentation if exists
    const indentMatch = line.match(/^(\s*)(.*)$/);
    const indent = indentMatch ? indentMatch[1] : '';
    const content = indentMatch ? indentMatch[2] : line;
    
    editor.setLine(lineNum, `${indent}- [ ] ${content}`);
}
