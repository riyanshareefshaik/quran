import { describe, it, expect } from 'vitest';
import { SURAH_THEMES, getSurahTheme } from './surah-themes';

describe('SURAH_THEMES', () => {
    it('has exactly one entry for every surah, 1 through 114', () => {
        const keys = Object.keys(SURAH_THEMES).map(Number).sort((a, b) => a - b);
        expect(keys).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
    });

    it('every entry is a single non-empty word (no whitespace)', () => {
        for (const [id, theme] of Object.entries(SURAH_THEMES)) {
            expect(theme.length, `surah ${id}`).toBeGreaterThan(0);
            expect(theme, `surah ${id}`).not.toMatch(/\s/);
        }
    });
});

describe('getSurahTheme', () => {
    it('returns the theme for a valid surah id', () => {
        expect(getSurahTheme(1)).toBe('Guidance');
        expect(getSurahTheme(114)).toBe('Protection');
    });

    it('returns an empty string for an out-of-range id', () => {
        expect(getSurahTheme(0)).toBe('');
        expect(getSurahTheme(115)).toBe('');
    });
});
