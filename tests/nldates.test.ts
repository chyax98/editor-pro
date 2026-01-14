import { NLDateParser } from '../src/features/nldates/parser';
import { moment } from 'obsidian';

// Mock moment
const MOCK_TODAY = '2023-01-04'; // Wednesday
// Wed Jan 04 2023

jest.mock('obsidian', () => {
    const originalMoment = jest.requireActual('moment'); // Use actual moment if available in test env?
    // Jest environment usually doesn't have moment installed unless we add it.
    // Better to provide a simple mock implementation or use a real dependency if installed.
    // Assuming user environment has moment or we can simulate it.

    // Creating a minimal moment-like object
    class MockMoment {
        private d: Date;

        constructor(inp?: any) {
            if (inp) this.d = new Date(inp);
            else this.d = new Date(MOCK_TODAY);
        }

        clone() { return new MockMoment(this.d); }

        add(n: number, unit: string) {
            if (unit === 'd') this.d.setDate(this.d.getDate() + n);
            if (unit === 'w') this.d.setDate(this.d.getDate() + n * 7);
            return this;
        }

        subtract(n: number, unit: string) {
            if (unit === 'd') this.d.setDate(this.d.getDate() - n);
            return this;
        }

        isoWeekday(day?: number) {
            if (day === undefined) {
                const wd = this.d.getDay();
                return wd === 0 ? 7 : wd;
            }
            // Set weekday
            const current = this.isoWeekday(); // 1-7
            const diff = day - (current as number);
            this.d.setDate(this.d.getDate() + diff);
            return this;
        }

        format(fmt: string) {
            // Simple formatter for YYYY-MM-DD
            const y = this.d.getFullYear();
            const m = String(this.d.getMonth() + 1).padStart(2, '0');
            const d = String(this.d.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
    }

    const momentFn = (inp?: any) => new MockMoment(inp);
    return { moment: momentFn };
});

describe('NLDateParser (Base: 2023-01-04 Wed)', () => {

    test('Basic relative days', () => {
        expect(NLDateParser.parse('今天')?.formatted).toBe('2023-01-04');
        expect(NLDateParser.parse('明天')?.formatted).toBe('2023-01-05');
        expect(NLDateParser.parse('后天')?.formatted).toBe('2023-01-06');
        expect(NLDateParser.parse('昨天')?.formatted).toBe('2023-01-03');
    });

    test('Numeric relative days', () => {
        expect(NLDateParser.parse('3天后')?.formatted).toBe('2023-01-07');
        expect(NLDateParser.parse('1周后')?.formatted).toBe(undefined); // Not supported yet
        expect(NLDateParser.parse('5天前')?.formatted).toBe('2022-12-30');
    });

    test('Weekdays (Base: Wed)', () => {
        // Upcoming in this week
        expect(NLDateParser.parse('周五')?.formatted).toBe('2023-01-06'); // This Friday
        expect(NLDateParser.parse('周六')?.formatted).toBe('2023-01-07');

        // Passed in this week -> Next week
        expect(NLDateParser.parse('周一')?.formatted).toBe('2023-01-09'); // Next Mon
        expect(NLDateParser.parse('周二')?.formatted).toBe('2023-01-10'); // Next Tue
        expect(NLDateParser.parse('周三')?.formatted).toBe('2023-01-11'); // Next Wed (since today is Wed)
    });

    test('Next Week', () => {
        // Next week Wed is 2023-01-11
        // Wait, "下周三" usually means next week's wednesday.
        // If today is Wed (Jan 4), Next Week Wed is Jan 11.
        expect(NLDateParser.parse('下周三')?.formatted).toBe('2023-01-11');

        // Next week Mon
        // Current week Mon is Jan 2. Next week Mon is Jan 9.
        expect(NLDateParser.parse('下周一')?.formatted).toBe('2023-01-09');
    });

    test('Aliases', () => {
        expect(NLDateParser.parse('tmr')?.formatted).toBe('2023-01-05');
        expect(NLDateParser.parse('星期五')?.formatted).toBe('2023-01-06');
    });
});
