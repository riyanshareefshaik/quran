import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryBuilder } from './test-support/supabase-mock';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));
vi.mock('./supabase', () => ({ getSupabase: getSupabaseMock }));

const { saveNote, deleteNote, NOTE_MAX_LENGTH } = await import('./notes');

describe('saveNote', () => {
    beforeEach(() => getSupabaseMock.mockReset());

    it('rejects an empty/whitespace-only note without touching the database', async () => {
        const from = vi.fn();
        getSupabaseMock.mockReturnValue({ from });
        const { error } = await saveNote('user-1', '2:255', 2, '   ');
        expect(error).toBeTruthy();
        expect(from).not.toHaveBeenCalled();
    });

    it('trims and caps the body length, and upserts on (user_id, verse_key)', async () => {
        const builder = createQueryBuilder({ data: null, error: null });
        const from = vi.fn(() => builder);
        getSupabaseMock.mockReturnValue({ from });
        const { error } = await saveNote('user-1', '2:255', 2, `  ${'a'.repeat(NOTE_MAX_LENGTH + 500)}  `);
        expect(error).toBeNull();
        expect(from).toHaveBeenCalledWith('notes');
        const [payload, options] = builder._calls.upsert[0] as [{ body: string; user_id: string; verse_key: string }, { onConflict: string }];
        expect(payload.body).toHaveLength(NOTE_MAX_LENGTH);
        expect(payload.user_id).toBe('user-1');
        expect(payload.verse_key).toBe('2:255');
        expect(options).toEqual({ onConflict: 'user_id,verse_key' });
    });

    it('turns a database error into a friendly message', async () => {
        const builder = createQueryBuilder({ data: null, error: { message: 'constraint violation' } });
        getSupabaseMock.mockReturnValue({ from: () => builder });
        const { error } = await saveNote('user-1', '2:255', 2, 'Reflection on mercy');
        expect(error).toMatch(/could not save/i);
    });

    it('fails gracefully when Supabase is not configured', async () => {
        getSupabaseMock.mockReturnValue(null);
        const { error } = await saveNote('user-1', '2:255', 2, 'hello');
        expect(error).toBeTruthy();
    });
});

describe('deleteNote', () => {
    beforeEach(() => getSupabaseMock.mockReset());

    it('deletes by verse_key (RLS scopes it to the signed-in user)', async () => {
        const builder = createQueryBuilder({ data: null, error: null });
        getSupabaseMock.mockReturnValue({ from: () => builder });
        const { error } = await deleteNote('2:255');
        expect(error).toBeNull();
        expect(builder._calls.eq[0]).toEqual(['verse_key', '2:255']);
    });

    it('reports an error when signed out', async () => {
        getSupabaseMock.mockReturnValue(null);
        const { error } = await deleteNote('2:255');
        expect(error).toBeTruthy();
    });
});
