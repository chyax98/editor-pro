// Overdue Highlighter Tests
// Tests for @due(YYYY-MM-DD) parsing and date comparison logic

describe('Overdue Highlighter - Date Parsing', () => {
    const DUE_REGEX = /@due\((\d{4}-\d{2}-\d{2})\)/g;

    function extractDueDates(text: string): string[] {
        const matches = text.matchAll(DUE_REGEX);
        return Array.from(matches).map(m => m[1]).filter((d): d is string => d !== undefined);
    }

    function isOverdue(dateStr: string, today: Date = new Date()): boolean {
        const dueDate = new Date(dateStr);
        if (isNaN(dueDate.getTime())) return false;
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueStart < todayStart;
    }

    function isToday(dateStr: string, today: Date = new Date()): boolean {
        const dueDate = new Date(dateStr);
        if (isNaN(dueDate.getTime())) return false;
        return dueDate.getFullYear() === today.getFullYear() &&
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getDate() === today.getDate();
    }

    describe('Date extraction', () => {
        test('extracts single due date', () => {
            const text = 'Task @due(2024-01-15) done';
            const dates = extractDueDates(text);
            expect(dates).toEqual(['2024-01-15']);
        });

        test('extracts multiple due dates', () => {
            const text = 'Task1 @due(2024-01-15) Task2 @due(2024-02-20)';
            const dates = extractDueDates(text);
            expect(dates).toEqual(['2024-01-15', '2024-02-20']);
        });

        test('ignores malformed dates', () => {
            const text = 'Task @due(2024-1-5) @due(invalid)';
            const dates = extractDueDates(text);
            expect(dates).toEqual([]);
        });

        test('handles no due dates', () => {
            const text = 'Regular text without dates';
            const dates = extractDueDates(text);
            expect(dates).toEqual([]);
        });
    });

    describe('Overdue detection', () => {
        const mockToday = new Date('2024-06-15');

        test('past date is overdue', () => {
            expect(isOverdue('2024-06-14', mockToday)).toBe(true);
            expect(isOverdue('2024-01-01', mockToday)).toBe(true);
        });

        test('today is not overdue', () => {
            expect(isOverdue('2024-06-15', mockToday)).toBe(false);
        });

        test('future date is not overdue', () => {
            expect(isOverdue('2024-06-16', mockToday)).toBe(false);
            expect(isOverdue('2024-12-31', mockToday)).toBe(false);
        });

        test('invalid date is not overdue', () => {
            expect(isOverdue('invalid-date', mockToday)).toBe(false);
        });
    });

    describe('Today detection', () => {
        const mockToday = new Date('2024-06-15');

        test('same date is today', () => {
            expect(isToday('2024-06-15', mockToday)).toBe(true);
        });

        test('yesterday is not today', () => {
            expect(isToday('2024-06-14', mockToday)).toBe(false);
        });

        test('tomorrow is not today', () => {
            expect(isToday('2024-06-16', mockToday)).toBe(false);
        });

        test('invalid date is not today', () => {
            expect(isToday('not-a-date', mockToday)).toBe(false);
        });
    });
});
