
import {
    parseTrackedFolders,
    parseReminderFolders,
    getGreeting,
    formatRelativeTime,
    getReminders,
    countFilesInFolder
} from '../src/features/homepage/utils';
import { App, TFile, TFolder } from 'obsidian';

// Mock Date for consistent testing
const MOCK_NOW = new Date('2023-01-15T14:30:00Z').getTime(); // 14:30 UTC -> 22:30 CN (depending on TZ)
// Actually, let's just stick to logic that doesn't depend too heavily on exact timezone if possible,
// or use jest fake timers.

describe('Homepage Utils', () => {

    describe('Config Parsers', () => {

        test('parseTrackedFolders', () => {
            const input = `
            Inbox:收集箱:📥:true:1
            Projects:项目:🚀
            # Comment
            `;
            const result = parseTrackedFolders(input);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                path: 'Inbox',
                name: '收集箱',
                icon: '📥',
                showInFlow: true,
                order: 1
            });
            expect(result[1]).toEqual(expect.objectContaining({
                path: 'Projects',
                name: '项目',
                icon: '🚀',
                showInFlow: true
            }));
        });

        test('parseReminderFolders', () => {
            const input = `Inbox:Name:7:10`;
            const result = parseReminderFolders(input);
            expect(result[0]).toEqual({
                path: 'Inbox',
                name: 'Name',
                maxDays: 7,
                maxItems: 10
            });
        });
    });

    describe('Time & Greeting', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });
        afterAll(() => {
            jest.useRealTimers();
        });

        test('getGreeting morning', () => {
            jest.setSystemTime(new Date('2023-01-01T08:00:00')); // 8 AM
            expect(getGreeting()).toBe('早上好');
        });

        test('getGreeting evening', () => {
            jest.setSystemTime(new Date('2023-01-01T20:00:00')); // 8 PM
            expect(getGreeting()).toBe('晚上好');
        });

        test('formatRelativeTime', () => {
            const now = Date.now();
            expect(formatRelativeTime(now - 1000 * 30)).toBe('刚刚'); // 30s ago
            expect(formatRelativeTime(now - 1000 * 60 * 5)).toBe('5 分钟前'); // 5m ago
            expect(formatRelativeTime(now - 1000 * 60 * 60 * 2)).toBe('2 小时前'); // 2h ago
        });
    });

    describe('File & Folder Stats', () => {
        // Mock App and Vault Structure
        const mockApp = {
            vault: {
                getAbstractFileByPath: jest.fn()
            }
        } as unknown as App;

        // @ts-ignore
        const mockFile = new TFile("dummypath/test.md");
        // @ts-ignore
        const mockFolder = new TFolder("dummypath/folder");
        // @ts-ignore
        const mockSubFolder = new TFolder("dummypath/subfolder");

        // Setup structure:
        // Folder
        //  - File1
        //  - File2
        //  - SubFolder
        //     - File3

        mockFolder.children = [mockFile, mockFile, mockSubFolder]; // 2 files, 1 folder
        mockSubFolder.children = [mockFile]; // 1 file

        beforeEach(() => {
            (mockApp.vault.getAbstractFileByPath as jest.Mock).mockReset();
        });

        test('countFilesInFolder recursive', () => {
            (mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(mockFolder);

            const count = countFilesInFolder(mockApp, 'AnyPath');
            // Total files = 2 (in root) + 1 (in sub) = 3
            expect(count).toBe(3);
        });

        test('countFilesInFolder invalid path', () => {
            (mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(null);
            expect(countFilesInFolder(mockApp, 'Invalid')).toBe(0);
        });
    });
});
