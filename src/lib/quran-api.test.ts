import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanTranslation, nextVerseKey, getReciter, fetchChapterDescription, RECITERS, SURAH_VERSE_COUNTS } from './quran-api';

describe('SURAH_VERSE_COUNTS', () => {
    it('has exactly 114 surahs', () => {
        expect(SURAH_VERSE_COUNTS).toHaveLength(114);
    });

    it('sums to the Quran\'s total ayah count (6236, Hafs/Uthmani)', () => {
        const total = SURAH_VERSE_COUNTS.reduce((a, b) => a + b, 0);
        expect(total).toBe(6236);
    });

    it('starts with Al-Fatihah (7 ayat) and ends with An-Nas (6 ayat)', () => {
        expect(SURAH_VERSE_COUNTS[0]).toBe(7);
        expect(SURAH_VERSE_COUNTS[113]).toBe(6);
    });
});

describe('nextVerseKey', () => {
    it('advances within a surah', () => {
        expect(nextVerseKey('2:1')).toBe('2:2');
    });

    it('rolls over into the next surah at the last ayah', () => {
        expect(nextVerseKey('1:7')).toBe('2:1');
    });

    it('returns null after the very last ayah (114:6)', () => {
        expect(nextVerseKey('114:6')).toBeNull();
    });

    it('returns null for malformed input', () => {
        expect(nextVerseKey('not-a-key')).toBeNull();
        expect(nextVerseKey('0:1')).toBeNull();
        expect(nextVerseKey('200:1')).toBeNull();
    });
});

describe('cleanTranslation', () => {
    it('strips footnote markers', () => {
        expect(cleanTranslation('In the name of Allah<sup foot_note=1>1</sup>.')).toBe('In the name of Allah.');
    });

    it('strips arbitrary HTML tags', () => {
        expect(cleanTranslation('<b>Bold</b> and <i>italic</i>')).toBe('Bold and italic');
    });

    it('removes stray whitespace before punctuation', () => {
        expect(cleanTranslation('Mercy , and Grace .')).toBe('Mercy, and Grace.');
    });
});

describe('fetchChapterDescription', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    function mockResponse(body: unknown, ok = true) {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok,
            status: ok ? 200 : 404,
            json: () => Promise.resolve(body),
        });
    }

    it('prefers short_text, strips HTML, and collapses whitespace', async () => {
        mockResponse({ chapter_info: { short_text: '<p>The  Opening</p>\nof the Quran.' } });
        expect(await fetchChapterDescription(1)).toBe('The Opening of the Quran.');
    });

    it('falls back to text when short_text is missing', async () => {
        mockResponse({ chapter_info: { text: 'A longer passage about the surah.' } });
        expect(await fetchChapterDescription(2)).toBe('A longer passage about the surah.');
    });

    it('truncates long descriptions with an ellipsis', async () => {
        mockResponse({ chapter_info: { short_text: 'a'.repeat(300) } });
        const result = await fetchChapterDescription(3);
        expect(result!.length).toBeLessThanOrEqual(49);
        expect(result!.endsWith('…')).toBe(true);
    });

    it('breaks at a word boundary instead of chopping a word in half', async () => {
        // 10 four-letter words (49 chars total) so the 48-char cutoff lands
        // 3 characters into the last word — the exact case this guards against.
        const words = ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', 'ffff', 'gggg', 'hhhh', 'iiii', 'jjjj'];
        mockResponse({ chapter_info: { short_text: words.join(' ') } });
        const result = await fetchChapterDescription(6);
        expect(result).toBe('aaaa bbbb cccc dddd eeee ffff gggg hhhh iiii…');
    });

    it('returns null when Quran.com has nothing on file', async () => {
        mockResponse({ chapter_info: {} });
        expect(await fetchChapterDescription(4)).toBeNull();
    });

    it('returns null (not a throw) when the request fails', async () => {
        mockResponse(null, false);
        expect(await fetchChapterDescription(5)).toBeNull();
    });
});

describe('getReciter', () => {
    it('returns the matching reciter by id', () => {
        const first = RECITERS[0];
        expect(getReciter(first.id)).toEqual(first);
    });

    it('falls back to the first reciter for an unknown id', () => {
        expect(getReciter(-1)).toEqual(RECITERS[0]);
    });

    it('every reciter has a unique id', () => {
        const ids = RECITERS.map(r => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
