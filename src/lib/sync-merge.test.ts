import { describe, it, expect } from 'vitest';
import { asBookmarks, mergeBookmarks, mergeProgress, mergePreferences, sanitizePreferences } from './sync-merge';
import type { ProgressState } from '@/context/ProgressContext';
import { RECITERS } from './quran-api';

describe('asBookmarks', () => {
    it('keeps only well-formed bookmark objects', () => {
        const input = [
            { chapterId: 2, chapterName: 'Al-Baqarah', addedAt: '2024-01-01T00:00:00Z' },
            { chapterId: 200, chapterName: 'Invalid', addedAt: '2024-01-01T00:00:00Z' }, // out of range
            { chapterId: 'x', chapterName: 'Bad type' },
            null,
            'not an object',
        ];
        expect(asBookmarks(input)).toEqual([{ chapterId: 2, chapterName: 'Al-Baqarah', addedAt: '2024-01-01T00:00:00Z' }]);
    });

    it('returns an empty array for non-array input', () => {
        expect(asBookmarks(null)).toEqual([]);
        expect(asBookmarks({})).toEqual([]);
    });
});

describe('mergeBookmarks', () => {
    it('unions bookmarks from both devices, sorted by chapter', () => {
        const local = [{ chapterId: 5, chapterName: 'Al-Maidah', addedAt: '2024-02-01T00:00:00Z' }];
        const cloud = [{ chapterId: 2, chapterName: 'Al-Baqarah', addedAt: '2024-01-01T00:00:00Z' }];
        expect(mergeBookmarks(local, cloud).map(b => b.chapterId)).toEqual([2, 5]);
    });

    it('keeps the earlier addedAt when both devices bookmarked the same surah', () => {
        const local = [{ chapterId: 2, chapterName: 'Al-Baqarah', addedAt: '2024-03-01T00:00:00Z' }];
        const cloud = [{ chapterId: 2, chapterName: 'Al-Baqarah', addedAt: '2024-01-01T00:00:00Z' }];
        expect(mergeBookmarks(local, cloud)[0].addedAt).toBe('2024-01-01T00:00:00Z');
    });
});

describe('mergeProgress', () => {
    const base: ProgressState = {
        totalAyahsRead: 10,
        completedAyahKeys: ['1:1', '1:2'],
        currentStreak: 3,
        lastRead: { surahName: 'Al-Fatihah', verseKey: '1:2', chapterId: 1 },
        activityHistory: [{ date: '2024-01-01', ayahsRead: 5 }],
    };

    it('takes the larger total and streak across devices', () => {
        const cloud = { totalAyahsRead: 25, currentStreak: 1, completedAyahKeys: [], activityHistory: [] };
        const merged = mergeProgress(base, cloud);
        expect(merged.totalAyahsRead).toBe(25);
        expect(merged.currentStreak).toBe(3);
    });

    it('unions completed ayah keys and filters malformed ones', () => {
        const cloud = { completedAyahKeys: ['1:3', 'garbage', '1:1'] };
        const merged = mergeProgress(base, cloud);
        expect(new Set(merged.completedAyahKeys)).toEqual(new Set(['1:1', '1:2', '1:3']));
    });

    it('takes the max ayahsRead per day across devices', () => {
        const cloud = { activityHistory: [{ date: '2024-01-01', ayahsRead: 12 }, { date: '2024-01-02', ayahsRead: 2 }] };
        const merged = mergeProgress(base, cloud);
        expect(merged.activityHistory).toEqual([
            { date: '2024-01-01', ayahsRead: 12 },
            { date: '2024-01-02', ayahsRead: 2 },
        ]);
    });

    it('prefers this device\'s lastRead, falling back to the cloud\'s', () => {
        const noLocalLast = { ...base, lastRead: null };
        const cloud = { lastRead: { surahName: 'Al-Baqarah', verseKey: '2:5', chapterId: 2 } };
        expect(mergeProgress(noLocalLast, cloud).lastRead).toEqual(cloud.lastRead);
        expect(mergeProgress(base, cloud).lastRead).toEqual(base.lastRead);
    });

    it('tolerates a missing/malformed cloud value', () => {
        expect(() => mergeProgress(base, null)).not.toThrow();
        expect(() => mergeProgress(base, 'garbage')).not.toThrow();
    });
});

describe('sanitizePreferences', () => {
    it('accepts a fully valid object', () => {
        const validReciterId = RECITERS[0].id;
        const input = {
            arabicFontSize: 'large',
            readingComfortMode: true,
            focusMode: false,
            lineSpacing: 'relaxed',
            prayerCalculationMethod: 2,
            prayerSilentMode: false,
            reciterId: validReciterId,
            autoContinue: true,
        };
        expect(sanitizePreferences(input)).toEqual(input);
    });

    it('drops fields with the wrong type or an out-of-range value', () => {
        const input = {
            arabicFontSize: 'huge', // not a valid FontSize
            readingComfortMode: 'yes', // wrong type
            lineSpacing: 'tight', // not a valid option
            prayerCalculationMethod: -5, // out of range
            reciterId: 999999, // not a real reciter
        };
        expect(sanitizePreferences(input)).toEqual({});
    });

    it('returns {} for non-object input', () => {
        expect(sanitizePreferences(null)).toEqual({});
        expect(sanitizePreferences('nope')).toEqual({});
        expect(sanitizePreferences(42)).toEqual({});
    });
});

describe('mergePreferences', () => {
    it('lets cloud values win over local for keys the cloud has set', () => {
        const local = { arabicFontSize: 'small' as const, autoContinue: false };
        const cloud = { arabicFontSize: 'large' };
        expect(mergePreferences(local, cloud).arabicFontSize).toBe('large');
    });

    it('keeps local values for keys the cloud does not have', () => {
        const local = { arabicFontSize: 'small' as const, autoContinue: true };
        const cloud = { arabicFontSize: 'large' };
        expect(mergePreferences(local, cloud).autoContinue).toBe(true);
    });
});
