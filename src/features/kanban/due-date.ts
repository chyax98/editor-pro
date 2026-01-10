export function setDueDate(line: string, date: string): string {
    if (!line.trim().startsWith('- [')) return line;
    
    const dueRegex = /@due\([^)]+\)/;
    const dueTag = `@due(${date})`;
    
    if (dueRegex.test(line)) {
        return line.replace(dueRegex, dueTag);
    } else {
        return `${line} ${dueTag}`;
    }
}
