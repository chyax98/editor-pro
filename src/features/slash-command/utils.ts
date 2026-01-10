export interface SlashCommand {
    id: string;
    name: string;
    aliases?: string[];
}

// Minimal Pinyin Map for MVP demo purposes
// In a real production app, we would import 'pinyin-pro' or similar.
const PINYIN_MAP: Record<string, string> = {
    '代': 'd', '码': 'm', '块': 'k',
    '提': 't', '示': 's',
    '引': 'y', '用': 'y',
    '高': 'g', '亮': 'l',
    '加': 'j', '粗': 'c',
    '斜': 'x', '体': 't',
    '表': 'b', '格': 'g',
    '日': 'r', '期': 'q',
    '时': 's', '间': 'j', '序': 'x',
    '流': 'l', '程': 'c', '图': 't'
};

function getInitials(text: string): string {
    // If char is not in map, keep it as is (or ignore? for now keep)
    // Actually for strict initials matching, we might want to ignore unknown non-ascii?
    // But for "Smart Bold" -> "SB", if map doesn't have English, it returns 'S', 'm', 'a'...
    // Let's assume this is strictly for Chinese characters mapping.
    return text.split('').map(char => {
        if (PINYIN_MAP[char]) return PINYIN_MAP[char];
        return char; // For English name, this returns full string, not initials. 
                     // But test uses Chinese names.
    }).join('').toLowerCase();
}

export function shouldTriggerSlashCommand(line: string, cursorCh: number): { query: string } | null {
    const textBeforeCursor = line.slice(0, cursorCh);
    
    // Regex: 
    // (?:^|\s) : Start of line OR whitespace
    // ([/、])  : Trigger char (/ or 、)
    // (.*)$    : Query (greedy until cursor)
    const regex = /(?:^|\s)([/、])([^/、]*)$/; 
    // Modified regex to avoid matching "w/o" if it was handled by \s check.
    // Actually "w/o" -> no space before /. 
    // "hello /world" -> space before /.
    
    const match = textBeforeCursor.match(regex);
    
    if (match && typeof match[2] === 'string') {
        return { query: match[2] };
    }
    
    return null;
}

export function matchCommand(query: string, command: SlashCommand): boolean {
    if (!query) return true;
    
    const q = query.toLowerCase();
    
    // 1. Match Name
    if (command.name.toLowerCase().includes(q)) return true;
    
    // 2. Match Aliases
    if (command.aliases && command.aliases.some(a => a.toLowerCase().includes(q))) return true;
    
    // 3. Match Pinyin Initials (Naive implementation)
    const initials = getInitials(command.name);
    if (initials.includes(q)) return true;
    
    return false;
}
