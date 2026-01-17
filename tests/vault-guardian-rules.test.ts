
import { checkCreationAllowed } from '../src/features/vault-guardian/rules';
import { FolderRule } from '../src/features/vault-guardian/types';

// Mock Obsidian
jest.mock('obsidian', () => ({
    TFolder: class {
        path: string;
        children: any[] = [];
        constructor(path: string) { this.path = path; }
    },
    TFile: class {
        path: string;
        constructor(path: string) { this.path = path; }
    },
    Notice: class { },
}));

describe('Vault Guardian Rules', () => {

    describe('checkCreationAllowed', () => {
        const allowedRoots: string[] = ['Inbox', 'Projects', 'Daily'];

        const folderRules: Record<string, FolderRule> = {
            'Projects': {
                allowSubfolders: true,
                maxDepth: 2,
                allowedSubfolderPattern: undefined
            },
            'Daily': {
                allowSubfolders: true,
                maxDepth: 1,
                allowedSubfolderPattern: '^\\d{4}-\\d{2}$' // YYYY-MM
            },
            'Inbox': {
                allowSubfolders: false,
                maxDepth: 0
            }
        };

        test('should allow creating folder in allowed root', () => {
            const result = checkCreationAllowed(allowedRoots, folderRules, 'Inbox/Note', false);
            expect(result.allowed).toBe(true);
        });

        test('should allow creating folder that IS a root folder if allowed', () => {
            const result = checkCreationAllowed(allowedRoots, folderRules, 'Inbox', true);
            expect(result.allowed).toBe(true);
        });

        test('should block creating folder in root if not allowed', () => {
            const result = checkCreationAllowed(allowedRoots, folderRules, 'RandomRoot', true);
            expect(result.allowed).toBe(false);
            expect(result.violation?.type).toBe('root');
        });

        test('should block subfolders if allowSubfolders is false', () => {
            const result = checkCreationAllowed(allowedRoots, folderRules, 'Inbox/SubFolder', true);
            expect(result.allowed).toBe(false);
            expect(result.violation?.type).toBe('subfolder');
        });

        test('should respect maxDepth', () => {
            // Projects: maxDepth 2
            // Projects/Sub1/Sub2 -> depth 2 (OK)
            // Projects/Sub1/Sub2/Sub3 -> depth 3 (Fail)

            // path split length for 'Projects/Sub1/Sub2' is 3 (root + sub1 + sub2). 
            // Logic in code: depth = parts.length - 1. 3-1 = 2.

            const resultOk = checkCreationAllowed(allowedRoots, folderRules, 'Projects/Sub1/Sub2', true);
            expect(resultOk.allowed).toBe(true);

            const resultFail = checkCreationAllowed(allowedRoots, folderRules, 'Projects/Sub1/Sub2/Sub3', true);
            expect(resultFail.allowed).toBe(false);
            expect(resultFail.violation?.type).toBe('depth');
        });

        test('should validate subfolder patterns', () => {
            // Daily: pattern ^\d{4}-\d{2}$
            const resultOk = checkCreationAllowed(allowedRoots, folderRules, 'Daily/2023-01', true);
            expect(resultOk.allowed).toBe(true);

            const resultFail = checkCreationAllowed(allowedRoots, folderRules, 'Daily/NotADate', true);
            expect(resultFail.allowed).toBe(false);
            expect(resultFail.violation?.type).toBe('pattern');
        });
    });

});
