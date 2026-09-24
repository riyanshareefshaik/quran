import { describe, it, expect, beforeEach } from 'vitest';
import { installMemoryStorage } from './test-support/memory-storage';
import {
    createCollection, deleteCollection, renameCollection, listCollections, ensureDefaultCollection,
    addAyahToCollection, removeAyahFromCollection, listSavedAyahs, isAyahSaved, listAllSavedVerseKeys,
    toggleFavorite, COLLECTION_NAME_MAX, DEFAULT_COLLECTION_NAME,
} from './collections';

describe('collections (stored on this device)', () => {
    beforeEach(() => { installMemoryStorage(); });

    it('rejects an empty name and trims/caps long names', async () => {
        expect((await createCollection('   ')).error).toBeTruthy();
        const { collection } = await createCollection(`  ${'a'.repeat(COLLECTION_NAME_MAX + 50)}  `);
        expect(collection!.name).toHaveLength(COLLECTION_NAME_MAX);
    });

    it('rejects duplicate names, case-insensitively', async () => {
        await createCollection('Duas');
        expect((await createCollection(' duas ')).error).toMatch(/already have/i);
        const { collection } = await createCollection('Patience');
        expect((await renameCollection(collection!.id, 'DUAS')).error).toMatch(/already have/i);
    });

    it('creates exactly one default Favorites collection, listed first', async () => {
        await createCollection('Later');
        const a = await ensureDefaultCollection();
        const b = await ensureDefaultCollection();
        expect(a).toBe(b);
        const list = await listCollections();
        expect(list[0]).toMatchObject({ name: DEFAULT_COLLECTION_NAME, is_default: true });
        expect(list.filter(c => c.is_default)).toHaveLength(1);
    });

    it('toggleFavorite adds then removes a verse', async () => {
        expect(await toggleFavorite('2:255', 2)).toEqual({ saved: true, error: null });
        expect(await isAyahSaved('2:255')).toBe(true);
        expect(await toggleFavorite('2:255', 2)).toEqual({ saved: false, error: null });
        expect(await isAyahSaved('2:255')).toBe(false);
    });

    it('does not duplicate a verse within a collection, and validates input', async () => {
        const { collection } = await createCollection('Reflections');
        await addAyahToCollection(collection!.id, '94:5', 94);
        await addAyahToCollection(collection!.id, '94:5', 94);
        expect(await listSavedAyahs(collection!.id)).toHaveLength(1);
        expect((await addAyahToCollection(collection!.id, '200:1', 94)).error).toBeTruthy();
        expect((await addAyahToCollection('missing', '1:1', 1)).error).toMatch(/not found/i);
    });

    it('deleting a collection removes its ayahs; Favorites cannot be deleted', async () => {
        const { collection } = await createCollection('Temp');
        await addAyahToCollection(collection!.id, '1:1', 1);
        expect((await deleteCollection(collection!.id)).error).toBeNull();
        expect((await listAllSavedVerseKeys()).has('1:1')).toBe(false);
        const favId = await ensureDefaultCollection();
        expect((await deleteCollection(favId!)).error).toMatch(/can.t be deleted/i);
    });

    it('removes a single ayah from a collection', async () => {
        const { collection } = await createCollection('C');
        await addAyahToCollection(collection!.id, '1:1', 1);
        await addAyahToCollection(collection!.id, '1:2', 1);
        await removeAyahFromCollection(collection!.id, '1:1');
        expect((await listSavedAyahs(collection!.id)).map(a => a.verse_key)).toEqual(['1:2']);
    });

    it('ignores corrupted stored data', async () => {
        localStorage.setItem('nq_collections', 'oops');
        localStorage.setItem('nq_collection_ayahs', JSON.stringify([{ verse_key: '1:1' }]));
        expect(await listCollections()).toEqual([]);
        expect((await listAllSavedVerseKeys()).size).toBe(0);
    });
});
