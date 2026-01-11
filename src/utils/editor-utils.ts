export interface SelectionRange {
    from: number;
    to: number;
}

export function isWrapped(text: string, marker: string): boolean {
    return text.length >= marker.length * 2 && text.startsWith(marker) && text.endsWith(marker);
}

export function wrap(text: string, marker: string): string {
    return `${marker}${text}${marker}`;
}

export function unwrap(text: string, marker: string): string {
    if (isWrapped(text, marker)) {
        return text.substring(marker.length, text.length - marker.length);
    }
    return text;
}

export function getWordBoundaries(line: string, pos: number): SelectionRange {
    // Validate position bounds
    if (pos < 0) pos = 0;
    if (pos > line.length) pos = line.length;

    // Simple word boundary detection (alphanumeric + some symbols)

    // Let's use a simpler regex expand approach
    let start = pos;
    while (start > 0) {
        const char = line[start - 1];
        if (char && isWordChar(char)) {
            start--;
        } else {
            break;
        }
    }

    let end = pos;
    while (end < line.length) {
        const char = line[end];
        if (char && isWordChar(char)) {
            end++;
        } else {
            break;
        }
    }

    return { from: start, to: end };
}

function isWordChar(char: string): boolean {
    return /[\w\u4e00-\u9fa5]/.test(char);
}

export function findEnclosingMarker(line: string, cursorIndex: number, marker: string): SelectionRange | null {
    // Validate marker is not empty to avoid invalid regex
    if (!marker || marker.length === 0) {
        return null;
    }

    // Better approach: regex match all occurrences and check range
    const escapedMarker = marker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`${escapedMarker}(.*?)${escapedMarker}`, 'g');

    let match;
    let iterations = 0;
    const MAX_ITERATIONS = 1000; // 防止 ReDoS

    while ((match = regex.exec(line)) !== null) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
            console.warn('[Editor Pro] findEnclosingMarker: too many matches, possible ReDoS');
            break;
        }

        const start = match.index;
        const end = start + match[0].length;
        if (cursorIndex >= start && cursorIndex <= end) {
            return { from: start, to: end };
        }
    }

    return null;
}
