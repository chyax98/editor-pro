export interface BoardData {
    schemaVersion: 1;
    title: string;
    columns: BoardColumn[];
    cards: BoardCard[];
}

export interface BoardColumn {
    id: string;
    name: string;
}

export interface BoardCard {
    id: string;
    columnId: string;
    title: string;
    description: string;
    
    // Properties
    priority: 'low' | 'medium' | 'high';
    dueDate: string | null;
    tags: string[];

    // Sorting within a column (required; no backward compatibility)
    order: number;
}

export const DEFAULT_BOARD: BoardData = {
    schemaVersion: 1,
    title: 'New Project',
    columns: [
        { id: 'col-todo', name: '待办 (Todo)' },
        { id: 'col-doing', name: '进行中 (Doing)' },
        { id: 'col-done', name: '已完成 (Done)' }
    ],
    cards: []
};
