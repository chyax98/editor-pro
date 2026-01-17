// Smart Image Paste Tests
// Tests for image paste handling and filename generation

describe('Smart Image Paste - Filename Generation', () => {
    function buildBaseName(fileName: string | null): string {
        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const stem = fileName?.trim() || 'note';
        return `${stem}-${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
    }

    function guessExtension(mimeType: string, fileName: string = ''): string {
        const ext = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
        if (ext) return ext.toLowerCase();
        if (mimeType === 'image/png') return 'png';
        if (mimeType === 'image/jpeg') return 'jpg';
        if (mimeType === 'image/gif') return 'gif';
        if (mimeType === 'image/webp') return 'webp';
        return 'png';
    }

    describe('Base name generation', () => {
        test('uses file basename when available', () => {
            const result = buildBaseName('MyNote');
            expect(result).toMatch(/^MyNote-\d{8}-\d{6}$/);
        });

        test('uses "note" for null input', () => {
            const result = buildBaseName(null);
            expect(result).toMatch(/^note-\d{8}-\d{6}$/);
        });

        test('uses "note" for empty string', () => {
            const result = buildBaseName('');
            expect(result).toMatch(/^note-\d{8}-\d{6}$/);
        });

        test('trims whitespace from filename', () => {
            const result = buildBaseName('  MyNote  ');
            expect(result).toMatch(/^MyNote-\d{8}-\d{6}$/);
        });
    });

    describe('Extension guessing', () => {
        test('uses file extension when available', () => {
            expect(guessExtension('image/png', 'photo.jpg')).toBe('jpg');
        });

        test('falls back to MIME type for PNG', () => {
            expect(guessExtension('image/png', '')).toBe('png');
        });

        test('falls back to MIME type for JPEG', () => {
            expect(guessExtension('image/jpeg', '')).toBe('jpg');
        });

        test('falls back to MIME type for GIF', () => {
            expect(guessExtension('image/gif', '')).toBe('gif');
        });

        test('falls back to MIME type for WebP', () => {
            expect(guessExtension('image/webp', '')).toBe('webp');
        });

        test('defaults to PNG for unknown type', () => {
            expect(guessExtension('image/unknown', '')).toBe('png');
        });

        test('normalizes extension to lowercase', () => {
            expect(guessExtension('image/png', 'photo.PNG')).toBe('png');
        });
    });
});

describe('Smart Image Paste - Image Detection', () => {
    function isImageFile(mimeType: string): boolean {
        return mimeType.startsWith('image/');
    }

    test('detects PNG images', () => {
        expect(isImageFile('image/png')).toBe(true);
    });

    test('detects JPEG images', () => {
        expect(isImageFile('image/jpeg')).toBe(true);
    });

    test('detects GIF images', () => {
        expect(isImageFile('image/gif')).toBe(true);
    });

    test('rejects text files', () => {
        expect(isImageFile('text/plain')).toBe(false);
    });

    test('rejects application files', () => {
        expect(isImageFile('application/pdf')).toBe(false);
    });
});
