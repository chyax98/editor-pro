export function generateTable(rows: number = 2, cols: number = 2): string {
    // Markdown table structure:
    // | Header | Header |
    // | --- | --- |
    // | Cell | Cell |
    
    let output = '';
    
    // Header Row
    output += '| ' + Array(cols).fill('').join(' | ') + ' |\n';
    
    // Separator Row
    output += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    
    // Data Rows
    for (let i = 0; i < rows; i++) {
        output += '| ' + Array(cols).fill('').join(' | ') + ' |\n';
    }
    
    return output;
}

export function generateMermaid(type: 'flowchart' | 'sequence' | 'class' | 'state' | 'gantt' | 'pie' = 'flowchart'): string {
    let content = '';
    switch (type) {
        case 'flowchart':
            content = `flowchart LR
    A[Start] --> B{Process}
    B -- Yes --> C[End]
    B -- No --> D[Retrying]`;
            break;
        case 'sequence':
            content = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello John, how are you?
    B-->>A: Great!`;
            break;
        case 'class':
            content = `classDiagram
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }`;
            break;
        case 'gantt':
            content = `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2023-01-01, 30d
    Another task     :after a1  , 20d`;
            break;
        case 'pie':
            content = `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`;
            break;
        default:
            content = 'flowchart LR\n    A-->B';
    }
    
    return "```mermaid\n" + content + "\n```";
}

export function generateMath(): string {
    return "$$\n\n$$";
}

export function generateDaily(): string {
    const date = generateDate('YYYY-MM-DD');
    return `# Daily Note - ${date}

## 🎯 Priorities
- [ ] 

## 📝 Notes
`;
}

export function generateWeekly(): string {
    return `# Weekly Review

## 📅 Days
- [ ] Monday
- [ ] Tuesday
- [ ] Wednesday
- [ ] Thursday
- [ ] Friday

## 🏆 Wins
- 

## 🚧 Challenges
- 
`;
}

export function generateHTML(tag: string = 'div'): string {
    return `<${tag} class="">\n\n</${tag}>`;
}

export function generateFencedCodeBlock(language: string, body: string = ''): string {
    const normalizedBody = body.replace(/\n$/, '');

    if (!normalizedBody) {
        return `\`\`\`${language}\n\n\`\`\`\n`;
    }

    return `\`\`\`${language}\n${normalizedBody}\n\`\`\`\n`;
}

export function generateInfographicListRowSimpleHorizontalArrow(): string {
    return [
        'infographic list-row-simple-horizontal-arrow',
        'data',
        '  title Getting Started',
        '  items',
        '    - label Step 1',
        '      desc Install dependencies',
        '    - label Step 2',
        '      desc Configure settings',
        '    - label Step 3',
        '      desc Run the app',
    ].join('\n');
}

export function generateDate(format: 'YYYY-MM-DD' | 'HH:mm' | 'YYYY-MM-DD HH:mm'): string {
    const now = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }
    if (format === 'HH:mm') {
        return `${hours}:${minutes}`;
    }
    if (format === 'YYYY-MM-DD HH:mm') {
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // Handle unexpected format values gracefully
    console.warn(`[Editor Pro] Unexpected date format: ${format as string}, falling back to ISO date`);
    return now.toDateString();
}

export function insertRow(lines: string[], currentRowIndex: number): string[] {
    const currentLine = lines[currentRowIndex];
    if (!currentLine || !currentLine.trim().startsWith('|')) return lines;

    const colCount = (currentLine.match(/\|/g) || []).length - 1;

    // Guard against invalid column count
    if (colCount <= 0) {
        // If we can't determine column count, use a default
        const newRow = '|  |';
        const newLines = [...lines];
        newLines.splice(currentRowIndex + 1, 0, newRow);
        return newLines;
    }

    const newRow = '| ' + Array(colCount).fill('').join(' | ') + ' |';

    const newLines = [...lines];
    newLines.splice(currentRowIndex + 1, 0, newRow);
    return newLines;
}

export function deleteRow(lines: string[], currentRowIndex: number): string[] {
    const line = lines[currentRowIndex];
    if (!line || !line.trim().startsWith('|')) return lines;

    // Don't delete if it's the header or separator (first 2 rows of a table)
    // This is naive; in a real scenario we'd check if previous lines are table lines
    if (currentRowIndex === 0) return lines;
    const prevLine = lines[currentRowIndex - 1];
    if (prevLine && !prevLine.trim().startsWith('|')) return lines; // It's first row

    // Check if it's separator row
    if (line.includes('---')) return lines;

    const newLines = [...lines];
    newLines.splice(currentRowIndex, 1);
    return newLines;
}

/**
 * Generate a cryptographically random unique identifier.
 * Falls back to Math.random() if crypto.randomUUID() is not available.
 * @returns A unique identifier string
 */
export function generateUniqueId(): string {
    // Try to use the modern crypto API
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID()
    // This is still better than Math.random() alone as we include more entropy
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const counter = (Math.random() * 0xFFFFFF).toString(36).substring(0, 6);

    return `${timestamp}-${randomPart}-${counter}`;
}
