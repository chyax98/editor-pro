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
        default:
            content = 'flowchart LR\n    A-->B';
    }
    
    return "```mermaid\n" + content + "\n```";
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
    
    return now.toDateString();
}
