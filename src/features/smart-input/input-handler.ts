import { generateDate } from "../../utils/markdown-generators";

export interface SmartInputResult {
    trigger: string;
    replacement: string;
    range: { from: number; to: number };
}

export function checkSmartInput(line: string, cursorCh: number): SmartInputResult | null {
    // We look for text ending exactly at cursorCh
    const textBeforeCursor = line.slice(0, cursorCh);
    
    // Regex: 
    // (?:^|\s) : Start of line OR whitespace (to avoid matching inside words)
    // (@\w+)   : The trigger (e.g. @today)
    // $        : End of string (cursor position)
    const regex = /(?:^|\s)(@\w+)$/;
    
    const match = textBeforeCursor.match(regex);
    if (!match) return null;
    
    const trigger = match[1];
    let replacement = '';
    
    switch (trigger) {
        case '@today':
            replacement = generateDate('YYYY-MM-DD');
            break;
        case '@time':
            replacement = generateDate('HH:mm');
            break;
        case '@now':
            replacement = generateDate('YYYY-MM-DD HH:mm');
            break;
        default:
            return null;
    }
    
    // Calculate range
    // match[0] contains the whitespace prefix if any. 
    // match.index is start of match.
    // trigger start index = cursorCh - trigger.length
    
    const from = cursorCh - trigger.length;
    const to = cursorCh;
    
    return {
        trigger,
        replacement,
        range: { from, to }
    };
}
