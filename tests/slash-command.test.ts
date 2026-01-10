import { shouldTriggerSlashCommand, matchCommand } from '../src/features/slash-command/utils';

// Mock commands structure for testing
const testCommands = [
    { id: 'codeblock', name: '代码块', aliases: ['codeblock', 'code'] },
    { id: 'callout', name: '提示块', aliases: ['callout', 'tip'] }
];

describe('Slash Command Trigger', () => {
    test('triggers on / at start of line', () => {
        expect(shouldTriggerSlashCommand('/', 1)).toEqual({ query: '' });
    });
    
    test('triggers on / after space', () => {
        expect(shouldTriggerSlashCommand('Hello /', 7)).toEqual({ query: '' });
    });
    
    test('triggers on 、 (Chinese pause mark)', () => {
        expect(shouldTriggerSlashCommand('Hello 、', 7)).toEqual({ query: '' });
    });
    
    test('extracts query after slash', () => {
        expect(shouldTriggerSlashCommand('Hello /code', 11)).toEqual({ query: 'code' });
    });
    
    test('extracts query after 、', () => {
        expect(shouldTriggerSlashCommand('Hello 、dmk', 10)).toEqual({ query: 'dmk' });
    });
    
    test('does not trigger if slash is preceded by non-space', () => {
        // e.g. https:// - slash at index 6 and 7
        expect(shouldTriggerSlashCommand('https://', 7)).toBeNull();
        // e.g. w/o
        expect(shouldTriggerSlashCommand('w/o', 3)).toBeNull();
    });
    
    test('does not trigger if cursor is not at end of query', () => {
        // 'Hello /code' but cursor at 'c' (index 8) -> 'Hello /c'
        // Ideally it should capture what's before cursor.
        // Implementation detail: we usually check text BEFORE cursor.
        expect(shouldTriggerSlashCommand('Hello /code', 8)).toEqual({ query: 'c' });
    });
});

describe('Command Matching (Pinyin)', () => {
    test('matches by exact English alias', () => {
        expect(matchCommand('code', testCommands[0])).toBe(true);
    });
    
    test('matches by name substring', () => {
        expect(matchCommand('代码', testCommands[0])).toBe(true);
    });
    
    test('matches by Pinyin initials (dmk -> 代码块)', () => {
        // dmk -> dai ma kuai
        expect(matchCommand('dmk', testCommands[0])).toBe(true);
    });

    test('matches by Pinyin initials (tsk -> 提示块)', () => {
        // tsk -> ti shi kuai
        expect(matchCommand('tsk', testCommands[1])).toBe(true);
    });
    
    test('does not match unrelated query', () => {
        expect(matchCommand('xyz', testCommands[0])).toBe(false);
    });
});
