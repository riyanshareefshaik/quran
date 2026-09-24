import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createQueryBuilder } from './test-support/supabase-mock';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));
vi.mock('./supabase', () => ({ getSupabase: getSupabaseMock }));

const { createCollection, toggleFavorite, COLLECTION_NAME_MAX } = await import('./collections');

describe('createCollection', () => {
    beforeEach(() => getSupabaseMock.mockReset());

    it('rejects an empty name without touching the database', async () => {
        const from = vi.fn();
        getSupabaseMock.mockReturnValue({ from });
        const { error } = await createCollection('user-1', '   ');
        expect(error).toBeTruthy();
        expect(from).not.toHaveBeenCalled();
    });

    it('trims the name and caps its length', async () => {
        const builder = createQueryBuilder({ data: { id: 'c1', name: 'a'.repeat(COLLECTION_NAME_MAX) }, error: null });
        getSupabaseMock.mockReturnValue({ from: () => builder });
        await createCollection('user-1', `  ${'a'.repeat(COLLECTION_NAME_MAX + 50)}  `);
        const [payload] = builder._calls.insert[0] as [{ name: string }];
        expect(payload.name).toHaveLength(COLLECTION_NAME_MAX);
    });

    it('maps a unique-constraint violation to a friendly duplicate-name message', async () => {
        const builder = createQueryBuilder({ data: null, error: { message: 'duplicate key value violates unique constraint' } });
        getSupabaseMock.mockReturnValue({ from: () => builder });
        const { error } = await createCollection('user-1', 'Favorites');
        expect(error).toMatch(/already have a collection/i);
    });
});

describe('toggleFavorite', () => {
    beforeEach(() => getSupabaseMock.mockReset());

    it('adds the ayah when it is not already saved', async () => {
        const rpc = vi.fn(() => Promise.resolve({ data: 'default-collection-id', error: null }));
        // One builder serves both the "is it already saved?" check (data: null
        // -> not saved) and the upsert that follows, exactly like the real
        // client reuses one query builder per `.from()` call.
        const builder = createQueryBuilder({ data: null, error: null });
        getSupabaseMock.mockReturnValue({ rpc, from: () => builder });

        const result = await toggleFavorite('user-1', '2:255', 2);
        expect(rpc).toHaveBeenCalledWith('ensure_default_collection');
        expect(result.saved).toBe(true);
        expect(result.error).toBeNull();
        expect(builder._calls.upsert[0][0]).toMatchObject({ user_id: 'user-1', collection_id: 'default-collection-id', verse_key: '2:255' });
    });

    it('removes the ayah when it is already saved', async () => {
        const rpc = vi.fn(() => Promise.resolve({ data: 'default-collection-id', error: null }));
        const builder = createQueryBuilder({ data: { id: 'row-1' }, error: null }); // "found" -> already saved
        getSupabaseMock.mockReturnValue({ rpc, from: () => builder });

        const result = await toggleFavorite('user-1', '2:255', 2);
        expect(result.saved).toBe(false);
        expect(builder._calls.delete).toBeTruthy();
    });

    it('reports an error when there is no default collection to use (signed out)', async () => {
        getSupabaseMock.mockReturnValue(null);
        const result = await toggleFavorite('user-1', '2:255', 2);
        expect(result.saved).toBe(false);
        expect(result.error).toBeTruthy();
    });
});
