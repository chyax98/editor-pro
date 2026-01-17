import { checkMagicDateInput, checkMagicSymbols } from '../src/features/editing/magic-input';

describe('Magic Input - Symbol Replacement', () => {
    test('replaces --> with →', () => {
        const result = checkMagicSymbols('Hello -->', 9);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('→');
        expect(result?.range).toEqual({ from: 6, to: 9 });
    });

    test('replaces <-- with ←', () => {
        const result = checkMagicSymbols('Hello <--', 9);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('←');
    });

    test('replaces <-> with ↔', () => {
        const result = checkMagicSymbols('Hello <->', 9);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('↔');
    });

    test('replaces ... with …', () => {
        const result = checkMagicSymbols('Wait...', 7);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('…');
    });

    // 新增：比较运算符
    test('replaces >= with ≥', () => {
        const result = checkMagicSymbols('x >= 5', 4);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('≥');
    });

    test('replaces <= with ≤', () => {
        const result = checkMagicSymbols('x <= 5', 4);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('≤');
    });

    test('replaces != with ≠', () => {
        const result = checkMagicSymbols('x != y', 4);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('≠');
    });

    // 新增：双线箭头
    test('replaces ==> with ⇒', () => {
        const result = checkMagicSymbols('A ==> B', 5);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('⇒');
    });

    test('replaces <== with ⇐', () => {
        const result = checkMagicSymbols('A <== B', 5);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('⇐');
    });

    test('replaces <==> with ⇔', () => {
        const result = checkMagicSymbols('A <==> B', 6);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('⇔');
    });

    // 新增：版权/商标符号
    test('replaces (c) with ©', () => {
        const result = checkMagicSymbols('Copyright (c)', 13);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('©');
    });

    test('replaces (r) with ®', () => {
        const result = checkMagicSymbols('Brand(r)', 8);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('®');
    });

    test('replaces (tm) with ™', () => {
        const result = checkMagicSymbols('Product(tm)', 11);
        expect(result).not.toBeNull();
        expect(result?.replacement).toBe('™');
    });

    test('does not replace inside inline code', () => {
        const result = checkMagicSymbols('`code -->`', 9);
        expect(result).toBeNull();
    });

    test('returns null for non-matching text', () => {
        const result = checkMagicSymbols('Hello world', 11);
        expect(result).toBeNull();
    });

    test('returns null when cursor is at position 0', () => {
        const result = checkMagicSymbols('-->', 0);
        expect(result).toBeNull();
    });
});

describe('Magic Input - Date Replacement', () => {
    test('replaces @today with current date', () => {
        const result = checkMagicDateInput('Task @today', 11);
        expect(result).not.toBeNull();
        expect(result?.replacement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('replaces @tomorrow with next day date', () => {
        const result = checkMagicDateInput('Due @tomorrow', 13);
        expect(result).not.toBeNull();
        expect(result?.replacement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('replaces @yesterday with previous day date', () => {
        const result = checkMagicDateInput('Done @yesterday', 15);
        expect(result).not.toBeNull();
        expect(result?.replacement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('replaces Chinese @今天', () => {
        const result = checkMagicDateInput('任务 @今天', 7);
        expect(result).not.toBeNull();
        expect(result?.replacement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('replaces Chinese @明天', () => {
        const result = checkMagicDateInput('任务 @明天', 7);
        expect(result).not.toBeNull();
    });

    test('replaces Chinese @后天', () => {
        const result = checkMagicDateInput('任务 @后天', 7);
        expect(result).not.toBeNull();
    });

    test('replaces @next mon with next Monday date', () => {
        const result = checkMagicDateInput('Meeting @next mon', 17);
        expect(result).not.toBeNull();
        expect(result?.replacement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('replaces Chinese @下周一', () => {
        const result = checkMagicDateInput('会议 @下周一', 8);
        expect(result).not.toBeNull();
    });

    test('does not replace inside inline code', () => {
        const result = checkMagicDateInput('`@today`', 7);
        expect(result).toBeNull();
    });

    test('returns null for unrecognized pattern', () => {
        const result = checkMagicDateInput('Hello world', 11);
        expect(result).toBeNull();
    });
});
