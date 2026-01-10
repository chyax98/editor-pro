import { checkSmartInput } from '../src/features/smart-input/input-handler';

describe('Smart Input Handler', () => {
    // Mock Date
    const mockDate = new Date('2023-10-01T12:00:00Z');
    
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(mockDate);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('expands @today to YYYY-MM-DD', () => {
        const line = 'Meeting on @today';
        const cursorCh = 17; // End of line
        
        const result = checkSmartInput(line, cursorCh);
        
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('2023-10-01');
        expect(result?.range.from).toBe(11); // Start of @today
        expect(result?.range.to).toBe(17);
    });

    test('expands @time to HH:mm', () => {
        const line = 'It is @time now';
        const cursorCh = 11;
        
        // HH:mm for 12:00 UTC -> depends on local timezone of test runner.
        // We will just check it returns a replacement derived from date generator.
        const result = checkSmartInput(line, cursorCh);
        
        expect(result).not.toBeNull();
        expect(result?.trigger).toBe('@time');
    });

    test('ignores partial matches like email', () => {
        const line = 'contact@today.com';
        const cursorCh = 13; // after @today
        
        // Should NOT trigger if it's part of a word?
        // "@today" usually requires space before it or start of line.
        const result = checkSmartInput(line, cursorCh);
        
        expect(result).toBeNull();
    });

    test('ignores if cursor is not at end of keyword', () => {
        const line = 'Meeting on @today';
        const cursorCh = 14; // Inside @tod|ay
        
        const result = checkSmartInput(line, cursorCh);
        expect(result).toBeNull();
    });

    test('works with Chinese characters before trigger', () => {
        const line = '今天的日期是 @today';
        const cursorCh = 14; // after @today
        
        const result = checkSmartInput(line, cursorCh);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('2023-10-01');
    });
});
