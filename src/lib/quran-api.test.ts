import { describe, it, expect } from 'vitest';
import { cleanTranslation, nextVerseKey, getReciter, RECITERS, SURAH_VERSE_COUNTS } from './quran-api';

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
