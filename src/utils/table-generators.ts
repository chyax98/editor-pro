// Robust table parsing utils using placeholders for escaped pipes

const ESCAPED_PIPE_PLACEHOLDER = '%%ESCAPED_PIPE%%';
// Cache regex for performance
const RESTORE_PIPE_REGEX = new RegExp(ESCAPED_PIPE_PLACEHOLDER, 'g');

export function splitTableRow(row: string): string[] {
    let cleanRow = row.trim();

    // Protect escaped pipes
    cleanRow = cleanRow.replace(/\\\|/g, ESCAPED_PIPE_PLACEHOLDER);

    // Remove starting/ending pipes if they exist
    if (cleanRow.startsWith('|')) cleanRow = cleanRow.substring(1);
    if (cleanRow.endsWith('|')) cleanRow = cleanRow.substring(0, cleanRow.length - 1);

    // Split by pipe
    const cells = cleanRow.split('|');

    // Restore escaped pipes
    return cells.map(c => c.replace(RESTORE_PIPE_REGEX, '\\|'));
}

export function joinTableRow(cells: string[]): string {
    return '| ' + cells.map(c => c.trim()).join(' | ') + ' |';
}

export function insertColumn(rows: string[], colIndex: number, side: 'left' | 'right'): string[] {
    return rows.map((row) => {
        if (!row.trim().startsWith('|')) return row;

        const cells = splitTableRow(row);
        let insertAt = side === 'left' ? colIndex : colIndex + 1;

        // Validate insertAt bounds
        if (insertAt < 0) insertAt = 0;

        let newCell = '';
        if (isSeparatorRow(row)) {
            newCell = '---';
        }

        // Handle insertion
        if (insertAt > cells.length) {
             cells.push(newCell);
        } else {
             cells.splice(insertAt, 0, newCell);
        }

        return joinTableRow(cells);
    });
}

export function deleteColumn(rows: string[], colIndex: number): string[] {
    return rows.map(row => {
        if (!row.trim().startsWith('|')) return row;
        
        const cells = splitTableRow(row);
        if (colIndex >= 0 && colIndex < cells.length) {
            cells.splice(colIndex, 1);
        }
        return joinTableRow(cells);
    });
}

export function setColumnAlign(rows: string[], colIndex: number, align: 'left' | 'center' | 'right'): string[] {
    return rows.map((row) => {
        if (!isSeparatorRow(row)) return row;
        
        const cells = splitTableRow(row);
        if (colIndex < 0 || colIndex >= cells.length) return row;
        
        let cell = cells[colIndex];
        if (cell === undefined) return row; // Should not happen due to check above
        cell = cell.trim();
        // Remove existing colons
        cell = cell.replace(/^:+|:+$/g, '');
        // Ensure at least 3 dashes
        if (cell.length < 3) cell = '---';
        
        if (align === 'left') cell = ':' + cell;
        if (align === 'right') cell = cell + ':';
        if (align === 'center') cell = ':' + cell + ':';
        
        cells[colIndex] = cell;
        return joinTableRow(cells);
    });
}

function isSeparatorRow(row: string): boolean {
    const trimmed = row.trim();
    return /^\|?[\s\-:|]+\|?$/.test(trimmed) && trimmed.includes('-');
}
