// Random Generator Tests
// Tests for UUID generation, dice parsing, and random number generation logic

describe('Random Generator', () => {
    describe('UUID Generation', () => {
        // Inline UUID v4 implementation for testing
        function uuidV4(): string {
            let out = '';
            for (let i = 0; i < 32; i++) out += Math.floor(Math.random() * 16).toString(16);
            return `${out.slice(0, 8)}-${out.slice(8, 12)}-4${out.slice(13, 16)}-a${out.slice(17, 20)}-${out.slice(20)}`;
        }

        test('generates valid UUID format', () => {
            const uuid = uuidV4();
            // UUID v4 format: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[a][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        test('generates unique UUIDs', () => {
            const uuid1 = uuidV4();
            const uuid2 = uuidV4();
            expect(uuid1).not.toBe(uuid2);
        });

        test('UUID has correct length (36 characters)', () => {
            const uuid = uuidV4();
            expect(uuid.length).toBe(36);
        });
    });

    describe('Dice Parsing', () => {
        function parseDice(text: string): { count: number; sides: number } | null {
            const m = text.trim().match(/^(\d*)d(\d+)$/i);
            if (!m) return null;
            const count = m[1] ? Number(m[1]) : 1;
            const sides = Number(m[2]);
            if (!Number.isFinite(count) || !Number.isFinite(sides)) return null;
            if (count <= 0 || sides <= 0) return null;
            if (count > 1000) return null;
            return { count, sides };
        }

        test('parses simple d6', () => {
            const result = parseDice('d6');
            expect(result).toEqual({ count: 1, sides: 6 });
        });

        test('parses 2d20', () => {
            const result = parseDice('2d20');
            expect(result).toEqual({ count: 2, sides: 20 });
        });

        test('parses 100d100', () => {
            const result = parseDice('100d100');
            expect(result).toEqual({ count: 100, sides: 100 });
        });

        test('handles whitespace', () => {
            const result = parseDice('  3d8  ');
            expect(result).toEqual({ count: 3, sides: 8 });
        });

        test('case insensitive', () => {
            const result = parseDice('D6');
            expect(result).toEqual({ count: 1, sides: 6 });
        });

        test('rejects invalid format', () => {
            expect(parseDice('abc')).toBeNull();
            expect(parseDice('6d')).toBeNull();
            expect(parseDice('d')).toBeNull();
            expect(parseDice('')).toBeNull();
        });

        test('rejects too many dice', () => {
            expect(parseDice('1001d6')).toBeNull();
        });

        test('rejects zero dice or sides', () => {
            expect(parseDice('0d6')).toBeNull();
            expect(parseDice('1d0')).toBeNull();
        });
    });

    describe('Random Range Parsing', () => {
        function parseRange(value: string): { min: number; max: number } | null {
            const m = value.trim().match(/^(-?\d+)\s*-\s*(-?\d+)$/);
            if (!m) return null;
            const a = Number(m[1]);
            const b = Number(m[2]);
            if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
            return { min: Math.min(a, b), max: Math.max(a, b) };
        }

        test('parses 1-100', () => {
            const result = parseRange('1-100');
            expect(result).toEqual({ min: 1, max: 100 });
        });

        test('parses negative numbers', () => {
            const result = parseRange('-10-10');
            expect(result).toEqual({ min: -10, max: 10 });
        });

        test('handles reversed range', () => {
            const result = parseRange('100-1');
            expect(result).toEqual({ min: 1, max: 100 });
        });

        test('handles spaces around dash', () => {
            const result = parseRange('1 - 100');
            expect(result).toEqual({ min: 1, max: 100 });
        });

        test('rejects invalid format', () => {
            expect(parseRange('abc')).toBeNull();
            expect(parseRange('1-')).toBeNull();
            expect(parseRange('-100')).toBeNull();
            expect(parseRange('')).toBeNull();
        });
    });

    describe('Dice Rolling', () => {
        function rollDice(count: number, sides: number): number[] {
            const out: number[] = [];
            for (let i = 0; i < count; i++) {
                out.push(1 + Math.floor(Math.random() * sides));
            }
            return out;
        }

        test('rolls correct number of dice', () => {
            const rolls = rollDice(5, 6);
            expect(rolls.length).toBe(5);
        });

        test('all rolls are within valid range', () => {
            const rolls = rollDice(100, 20);
            for (const roll of rolls) {
                expect(roll).toBeGreaterThanOrEqual(1);
                expect(roll).toBeLessThanOrEqual(20);
            }
        });

        test('single die roll', () => {
            const rolls = rollDice(1, 6);
            expect(rolls.length).toBe(1);
            expect(rolls[0]).toBeGreaterThanOrEqual(1);
            expect(rolls[0]).toBeLessThanOrEqual(6);
        });
    });
});
