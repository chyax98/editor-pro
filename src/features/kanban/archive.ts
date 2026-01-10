export function archiveCompletedTasks(content: string): string {
    const lines = content.split(/\r?\n/);
    const activeLines: string[] = [];
    const completedTasks: string[] = [];
    let archiveSectionIndex = -1;
    
    // 1. Separate active lines and completed tasks
    // Also detect existing Archive section
    
    // We need to be careful not to extract [x] from inside the Archive section itself.
    // So we iterate. If we hit "## 🗄️ Archived" or similar, we stop extracting.
    
    const archiveHeaderRegex = /^## .*Archived/i;
    let insideArchive = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        if (archiveHeaderRegex.test(line)) {
            insideArchive = true;
            archiveSectionIndex = activeLines.length; // Mark where archive starts in new list
            activeLines.push(line);
            continue;
        }
        
        if (insideArchive) {
            activeLines.push(line);
            continue;
        }
        
        // Check for completed task
        if (line.trim().startsWith('- [x]')) {
            completedTasks.push(line);
        } else {
            activeLines.push(line);
        }
    }
    
    if (completedTasks.length === 0) return content;
    
    // 2. Append completed tasks to Archive
    if (archiveSectionIndex !== -1) {
        // Append after the header (archiveSectionIndex)
        // We need to find end of archive section? No, just append to end of file is safer for "Archive".
        // Or append right after header.
        // Let's append to the end of the activeLines (which includes the existing archive content).
        activeLines.push(...completedTasks);
    } else {
        // Create new Archive section
        activeLines.push('');
        activeLines.push('## 🗄️ Archived');
        activeLines.push(...completedTasks);
    }
    
    return activeLines.join('\n');
}
