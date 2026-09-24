import { isChapterId, isVerseKey, readJson, writeJson } from './local-store';

// Personal notes on ayahs, stored only on this device.

export interface Note {
    verse_key: string;
    chapter_id: number;
    body: string;
    created_at: string;
    updated_at: string;
}

export const NOTE_MAX_LENGTH = 4000;
export const MAX_NOTES = 2000;

const KEY = 'nq_notes';

function isNote(value: unknown): value is Note {
    const n = value as Note;
    return !!n && typeof n === 'object' && isVerseKey(n.verse_key) && isChapterId(n.chapter_id) &&
        typeof n.body === 'string' && typeof n.created_at === 'string' && typeof n.updated_at === 'string';
}

function isNoteList(value: unknown): value is Note[] {
    return Array.isArray(value);
}

function readAll(): Note[] {
    return readJson<Note[]>(KEY, [], isNoteList).filter(isNote);
}

/** All notes, most recently updated first. */
export async function listNotes(): Promise<Note[]> {
    return readAll().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** The note on one verse, or null if there isn't one. */
export async function getNote(verseKey: string): Promise<Note | null> {
    return readAll().find(n => n.verse_key === verseKey) ?? null;
}

/** Creates or replaces the note on a verse (one note per verse). */
export async function saveNote(verseKey: string, chapterId: number, body: string): Promise<{ error: string | null }> {
    if (!isVerseKey(verseKey) || !isChapterId(chapterId)) return { error: 'Invalid verse.' };
    const trimmed = body.trim().slice(0, NOTE_MAX_LENGTH);
    if (!trimmed) return { error: 'Note cannot be empty.' };

    const notes = readAll();
    const now = new Date().toISOString();
    const existing = notes.find(n => n.verse_key === verseKey);
    if (existing) {
        existing.body = trimmed;
        existing.updated_at = now;
    } else {
        if (notes.length >= MAX_NOTES) return { error: `You can keep up to ${MAX_NOTES} notes. Delete some to add more.` };
        notes.push({ verse_key: verseKey, chapter_id: chapterId, body: trimmed, created_at: now, updated_at: now });
    }
    return writeJson(KEY, notes) ? { error: null } : { error: 'Could not save your note — your device storage may be full.' };
}

export async function deleteNote(verseKey: string): Promise<{ error: string | null }> {
    const notes = readAll();
    const next = notes.filter(n => n.verse_key !== verseKey);
    if (next.length === notes.length) return { error: null };
    return writeJson(KEY, next) ? { error: null } : { error: 'Could not delete your note. Please try again.' };
}
