export function findNextCell(line: string, cursorCh: number): number | null {
    // Check if line is a table row
    if (!line.trim().startsWith('|')) return null;

    // Find next pipe after cursor
    const nextPipeIndex = line.indexOf('|', cursorCh);
    if (nextPipeIndex === -1) return null;

    // Check if there is another pipe after that (defining a cell)
    const followingPipeIndex = line.indexOf('|', nextPipeIndex + 1);
    if (followingPipeIndex === -1) return null; // End of row

    // We found a cell between nextPipeIndex and followingPipeIndex.
    // Return position after nextPipeIndex + space?
    // Usually "| Content |". Pipe at P. Content at P+2.
    // Let's be smart: skip whitespace after pipe.
    
    let target = nextPipeIndex + 1;
    while (target < followingPipeIndex && line[target] === ' ') {
        target++;
    }
    
    return target;
}

export function findPreviousCell(line: string, cursorCh: number): number | null {
    if (!line.trim().startsWith('|')) return null;

    // Find pipe BEFORE cursor
    const prevPipeIndex = line.lastIndexOf('|', cursorCh - 1);
    if (prevPipeIndex === -1) return null;
    
    // Find the pipe before THAT pipe
    const startPipeIndex = line.lastIndexOf('|', prevPipeIndex - 1);
    if (startPipeIndex === -1) return null;

    // Target is after startPipeIndex
    let target = startPipeIndex + 1;
    // Find next pipe to bound search
    const endPipeIndex = prevPipeIndex;
    
    while (target < endPipeIndex && line[target] === ' ') {
        target++;
    }
    
    return target;
}
