import { generateDate } from "../../utils/markdown-generators";

export interface KanbanResult {
    newLines: string[];
    newCursorLine: number;
}

export function moveTaskToColumn(lines: string[], taskLineIndex: number, targetColumn: string): KanbanResult {
    const taskContent = lines[taskLineIndex];
    if (!taskContent || !taskContent.trim().startsWith('- [')) return { newLines: lines, newCursorLine: taskLineIndex };

    // 1. Remove task from current position
    const filteredLines = [...lines];
    filteredLines.splice(taskLineIndex, 1);

    // 2. Find target column index
    let targetIndex = -1;
    // Normalized check: ignore Emoji or extra spaces in headings
    // e.g. "## 🚧 Doing" matches target "Doing" if we check containment or strict format?
    // Let's assume standard headings for now, or match simply.
    // Enhanced: Check if heading contains the target keyword.
    for (let i = 0; i < filteredLines.length; i++) {
        const line = filteredLines[i];
        if (typeof line === 'string' && line.trim().startsWith('##') && line.includes(targetColumn)) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex === -1) {
        // Column not found, append to end
        let header = `## ${targetColumn}`;
        // Clean headers without emojis
        filteredLines.push(`
${header}`);
        targetIndex = filteredLines.length - 1;
    }

    // 3. Find end of target column
    let insertIndex = targetIndex + 1;
    while (insertIndex < filteredLines.length) {
        const line = filteredLines[insertIndex];
        if (line && line.startsWith('#')) break;
        insertIndex++;
    }

    // 4. Transform task status and timestamps
    let processedTask = taskContent;
    const now = generateDate('YYYY-MM-DD HH:mm');

    if (targetColumn === 'Todo') {
        // Reset to [ ]
        processedTask = processedTask.replace(/- \[[x/ ]\]/, '- [ ]');
        // Optional: remove timestamps? For now keep history.
    } else if (targetColumn === 'Doing' || targetColumn === 'In Progress') {
        // Set to [/]
        processedTask = processedTask.replace(/- \[[x/ ]\]/, '- [/]');
        // Add @started if not present
        if (!processedTask.includes('@started')) {
            processedTask = `${processedTask} @started(${now})`;
        }
    } else if (targetColumn === 'Done') {
        // Set to [x]
        processedTask = processedTask.replace(/- \[[x/ ]\]/, '- [x]');
        // Add @completed if not present
        if (!processedTask.includes('@completed')) {
            processedTask = `${processedTask} @completed(${now})`;
        }
    }

    // 5. Insert task
    filteredLines.splice(insertIndex, 0, processedTask);

    return {
        newLines: filteredLines,
        newCursorLine: insertIndex
    };
}

export function getTaskColumn(lines: string[], taskLineIndex: number): string | null {
    for (let i = taskLineIndex; i >= 0; i--) {
        const line = lines[i];
        if (line && line.startsWith('## ')) {
            return line.replace('## ', '').trim();
        }
    }
    return null;
}
