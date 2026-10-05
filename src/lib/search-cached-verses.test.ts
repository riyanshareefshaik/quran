import { describe, it, expect, vi, beforeEach } from 'vitest';

// searchCachedVerses reads from the IndexedDB-backed offline-store, which
// doesn't exist in this test environment — mock it with fixture data
// instead, the same way notes.test.ts/collections.test.ts mock Supabase.
const { cacheKeysMock, cacheGetMock } = vi.hoisted(() => ({
    cacheKeysMock: vi.fn(),
    cacheGetMock: vi.fn(),
}));
vi.mock('./offline-store', () => ({
    cacheKeys: cacheKeysMock,
    cacheGet: cacheGetMock,
    cacheSet: vi.fn(),
    cacheDelete: vi.fn(),
    networkFirst: vi.fn(),
}));

const { searchCachedVerses } = await import('./quran-api');

// Real Al-Fatihah/Ayat al-Kursi/An-Nisa text — used only as realistic
// fixture data for these tests, not asserted anywhere as a canonical source.
const versesFixture: Record<string, unknown> = {
    'verses:1:20': [
        {
            id: 1, verse_number: 1, verse_key: '1:1', text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translations: [{ id: 1, resource_id: 20, text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' }],
        },
        {
            id: 2, verse_number: 2, verse_key: '1:2', text_uthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            translations: [{ id: 2, resource_id: 20, text: '[All] praise is [due] to Allah, Lord of the worlds -' }],
        },
    ],
    'verses:2:20': [
        {
            id: 3, verse_number: 255, verse_key: '2:255', text_uthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
            translations: [{ id: 3, resource_id: 20, text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.' }],
        },
    ],
    // Cached under a different translation id — should never surface when
    // searching the default (20).
    'verses:4:131': [
        {
            id: 4, verse_number: 1, verse_key: '4:1', text_uthmani: 'يَا أَيُّهَا النَّاسُ',
            translations: [{ id: 4, resource_id: 131, text: 'O mankind' }],
        },
    ],
};

describe('searchCachedVerses', () => {
    beforeEach(() => {
        cacheKeysMock.mockReset();
        cacheGetMock.mockReset();
        cacheKeysMock.mockImplementation((prefix: string) =>
            Promise.resolve(Object.keys(versesFixture).filter(k => k.startsWith(prefix))));
        cacheGetMock.mockImplementation((key: string) => Promise.resolve(versesFixture[key]));
    });

    it('matches Arabic text even when the query has no diacritics', async () => {
        const results = await searchCachedVerses('الحمد لله');
        expect(results.map(r => r.verse_key)).toContain('1:2');
    });

    it('matches the cached translation, case-insensitively', async () => {
        const results = await searchCachedVerses('SUSTAINER');
        expect(results.map(r => r.verse_key)).toEqual(['2:255']);
    });

    it('only searches the requested translation id', async () => {
        const results = await searchCachedVerses('mankind', 20);
        expect(results).toEqual([]); // that verse is only cached under translation 131
    });

    it('finds it when searching the matching translation id', async () => {
        const results = await searchCachedVerses('mankind', 131);
        expect(results.map(r => r.verse_key)).toEqual(['4:1']);
    });

    it('sorts results by surah:ayah', async () => {
        const results = await searchCachedVerses('allah');
        expect(results.map(r => r.verse_key)).toEqual(['1:1', '1:2', '2:255']);
    });

    it('returns nothing for a too-short query, without touching the cache', async () => {
        expect(await searchCachedVerses('a')).toEqual([]);
        expect(cacheKeysMock).not.toHaveBeenCalled();
    });

    it('returns an empty list when nothing has been saved for offline reading', async () => {
        cacheKeysMock.mockResolvedValue([]);
        expect(await searchCachedVerses('mercy')).toEqual([]);
    });
});
