import { describe, it, expect, beforeEach } from 'vitest';
import { installMemoryStorage } from './test-support/memory-storage';
import { saveNote, getNote, listNotes, deleteNote, NOTE_MAX_LENGTH } from './notes';

describe('notes (stored on this device)', () => {
    beforeEach(() => { installMemoryStorage(); });

    it('rejects an empty/whitespace-only note', async () => {
        const { error } = await saveNote('2:255', 2, '   ');
        expect(error).toBeTruthy();
        expect(await listNotes()).toHaveLength(0);
    });

    it('rejects invalid verse keys and chapter ids', async () => {
        expect((await saveNote('115:1', 2, 'x')).error).toBeTruthy();
        expect((await saveNote('2:255', 0, 'x')).error).toBeTruthy();
        expect((await saveNote('abc', 2, 'x')).error).toBeTruthy();
    });

    it('trims and caps the body, one note per verse', async () => {
        expect((await saveNote('2:255', 2, `  ${'a'.repeat(NOTE_MAX_LENGTH + 500)}  `)).error).toBeNull();
        expect((await getNote('2:255'))!.body).toHaveLength(NOTE_MAX_LENGTH);
        await saveNote('2:255', 2, 'Updated reflection');
        const all = await listNotes();
        expect(all).toHaveLength(1);
        expect(all[0].body).toBe('Updated reflection');
    });

    it('lists most recently updated first and deletes by verse', async () => {
        await saveNote('1:1', 1, 'first');
        await new Promise(r => setTimeout(r, 5));
        await saveNote('112:1', 112, 'second');
        expect((await listNotes()).map(n => n.verse_key)).toEqual(['112:1', '1:1']);
        await deleteNote('1:1');
        expect((await listNotes()).map(n => n.verse_key)).toEqual(['112:1']);
        expect(await getNote('1:1')).toBeNull();
    });

    it('ignores corrupted stored data instead of crashing', async () => {
        localStorage.setItem('nq_notes', '{not json');
        expect(await listNotes()).toEqual([]);
        localStorage.setItem('nq_notes', JSON.stringify([{ verse_key: 'bad' }, null, 5]));
        expect(await listNotes()).toEqual([]);
        expect((await saveNote('2:1', 2, 'ok')).error).toBeNull();
    });

    it('reports a friendly error when device storage is full', async () => {
        installMemoryStorage(50);
        const { error } = await saveNote('2:255', 2, 'a'.repeat(200));
        expect(error).toMatch(/storage may be full/i);
    });
});
