import { isChapterId, isVerseKey, newId, readJson, writeJson } from './local-store';

// Recently read verses, stored only on this device.

export interface ReadingHistoryEntry {
    id: string;
    verse_key: string;
    chapter_id: number;
    surah_name: string;
    read_at: string;
}

export const MAX_HISTORY = 200;

const KEY = 'nq_reading_history';

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

function isEntry(value: unknown): value is ReadingHistoryEntry {
    const e = value as ReadingHistoryEntry;
    return !!e && typeof e === 'object' && typeof e.id === 'string' && isVerseKey(e.verse_key) &&
        isChapterId(e.chapter_id) && typeof e.surah_name === 'string' && typeof e.read_at === 'string';
}

function readAll(): ReadingHistoryEntry[] {
    return readJson<unknown[]>(KEY, [], isArray).filter(isEntry);
}

/**
 * Records that a verse was read. Re-reading a verse moves it to the top
 * instead of adding a duplicate; the list keeps the latest MAX_HISTORY.
 */
export function logReading(verseKey: string, chapterId: number, surahName: string) {
    if (!isVerseKey(verseKey) || !isChapterId(chapterId)) return;
    const entry: ReadingHistoryEntry = {
        id: newId(), verse_key: verseKey, chapter_id: chapterId,
        surah_name: surahName.slice(0, 80), read_at: new Date().toISOString(),
    };
    const next = [entry, ...readAll().filter(e => e.verse_key !== verseKey)].slice(0, MAX_HISTORY);
    writeJson(KEY, next);
}

export async function listReadingHistory(limit = 50): Promise<ReadingHistoryEntry[]> {
    return readAll().sort((a, b) => b.read_at.localeCompare(a.read_at)).slice(0, limit);
}

export async function clearReadingHistory(): Promise<{ error: string | null }> {
    return writeJson(KEY, []) ? { error: null } : { error: 'Could not clear your reading history. Please try again.' };
}
