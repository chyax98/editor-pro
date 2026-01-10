export interface AggregationOptions {
    includeCompleted?: boolean;
    title?: string;
}

export function aggregateTasks(content: string, options: AggregationOptions = {}): string {
    const lines = content.split(/\r?\n/);
    const tasks: string[] = [];
    
    // Regex for task: "- [ ] " or "- [x] "
    const taskRegex = /^[-*]\s\[([ x])\]\s(.*)$/;
    
    for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(taskRegex);
        if (match) {
            // match[1] is status (" " or "x")
            const isCompleted = match[1] === 'x';
            
            if (options.includeCompleted || !isCompleted) {
                tasks.push(trimmed);
            }
        }
    }
    
    if (tasks.length === 0) {
        return '> [!info] No tasks found.';
    }
    
    const title = options.title || 'Tasks';
    const calloutHeader = `> [!todo] ${title}`;
    const calloutBody = tasks.map(t => `> ${t}`).join('\n');
    
    return `${calloutHeader}\n${calloutBody}`;
}
