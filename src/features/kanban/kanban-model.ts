import { TFile, App } from "obsidian";

export interface KanbanCard {
    id: string; // Unique ID for drag handling (can be index based or content hash)
    content: string; // The text content without checkbox
    status: 'todo' | 'doing' | 'done'; // Derived from - [ ] or - [/] or - [x]
    originalText: string; // Full line content
    metadata: {
        due?: string;
        tags: string[];
        created?: string;
    };
}

export interface KanbanColumn {
    id: string;
    name: string;
    cards: KanbanCard[];
}

export interface KanbanBoard {
    columns: KanbanColumn[];
}

export class KanbanModel {
    // Parser: Markdown -> Board Object
    static parse(content: string): KanbanBoard {
        const lines = content.split(/\r?\n/);
        const columns: KanbanColumn[] = [];
        let currentColumn: KanbanColumn | null = null;

        for (const line of lines) {
            const trimmed = line.trim();
            
            // Detect Headers (Columns)
            if (trimmed.startsWith('#')) {
                // Determine level (support #, ##, ###)
                const name = trimmed.replace(/^#+\s*/, '');
                
                if (currentColumn) {
                    columns.push(currentColumn);
                }
                
                currentColumn = {
                    id: `col-${name}-${Date.now()}-${Math.random()}`,
                    name: name,
                    cards: []
                };
            } 
            // Detect Tasks (Cards)
            else if (trimmed.startsWith('- [')) {
                if (!currentColumn) {
                    // Orphaned tasks go to a default "Backlog" column if no header found yet
                    currentColumn = { id: 'col-backlog', name: 'Backlog', cards: [] };
                }
                
                const isCompleted = trimmed.startsWith('- [x]');
                const isDoing = trimmed.startsWith('- [/]');
                const status = isCompleted ? 'done' : (isDoing ? 'doing' : 'todo');
                
                // Extract content
                const textContent = trimmed.replace(/^- \[[x/ ]\]\s*/, '');
                
                // Extract Metadata
                const dueMatch = textContent.match(/@due\(([^)]+)\)/);
                const tagsMatch = textContent.match(/#[一-龥a-zA-Z0-9_]+/g);
                
                currentColumn.cards.push({
                    id: `card-${Math.random().toString(36).substr(2, 9)}`,
                    content: textContent,
                    status: status,
                    originalText: trimmed,
                    metadata: {
                        due: dueMatch ? dueMatch[1] : undefined,
                        tags: tagsMatch ? tagsMatch : []
                    }
                });
            }
        }
        
        if (currentColumn) {
            columns.push(currentColumn);
        }
        
        // If empty, return default structure
        if (columns.length === 0) {
            return {
                columns: [
                    { id: 'col-1', name: 'Todo', cards: [] },
                    { id: 'col-2', name: 'Doing', cards: [] },
                    { id: 'col-3', name: 'Done', cards: [] }
                ]
            };
        }

        return { columns };
    }

    // Serializer: Board Object -> Markdown
    static stringify(board: KanbanBoard): string {
        let output = '';
        
        for (const col of board.columns) {
            output += `## ${col.name}\n`;
            for (const card of col.cards) {
                // Reconstruct task line based on status
                let prefix = '- [ ]';
                if (card.status === 'done') prefix = '- [x]';
                if (card.status === 'doing') prefix = '- [/]';
                
                output += `${prefix} ${card.content}\n`;
            }
            output += '\n'; // Spacer between columns
        }
        
        return output;
    }
}
