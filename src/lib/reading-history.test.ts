import { describe, it, expect, beforeEach } from 'vitest';
import { installMemoryStorage } from './test-support/memory-storage';
import { logReading, listReadingHistory, clearReadingHistory, MAX_HISTORY } from './reading-history';

describe('reading history (stored on this device)', () => {
    beforeEach(() => { installMemoryStorage(); });

    it('records verses newest first and moves re-read verses to the top without duplicates', async () => {
        logReading('1:1', 1, 'Al-Fatihah');
        logReading('1:2', 1, 'Al-Fatihah');
        logReading('1:1', 1, 'Al-Fatihah');
        expect((await listReadingHistory()).map(e => e.verse_key)).toEqual(['1:1', '1:2']);
    });

    it('ignores invalid verses', async () => {
        logReading('999:1', 1, 'x');
        logReading('1:1', 0, 'x');
        expect(await listReadingHistory()).toEqual([]);
    });

    it(`keeps only the latest ${MAX_HISTORY} entries`, async () => {
        for (let i = 1; i <= MAX_HISTORY + 20; i++) logReading(`2:${i}`, 2, 'Al-Baqarah');
        const all = await listReadingHistory(1000);
        expect(all).toHaveLength(MAX_HISTORY);
        expect(all[0].verse_key).toBe(`2:${MAX_HISTORY + 20}`);
    });

    it('clears history', async () => {
        logReading('1:1', 1, 'Al-Fatihah');
        await clearReadingHistory();
        expect(await listReadingHistory()).toEqual([]);
    });
});
