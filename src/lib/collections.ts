import { isChapterId, isVerseKey, newId, readJson, writeJson } from './local-store';

// Named collections of saved ayahs (including the default "Favorites"),
// stored only on this device.

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface SavedAyah {
    id: string;
    collection_id: string;
    verse_key: string;
    chapter_id: number;
    added_at: string;
}

export const COLLECTION_NAME_MAX = 80;
export const MAX_COLLECTIONS = 50;
export const MAX_AYAHS_PER_COLLECTION = 1000;
export const DEFAULT_COLLECTION_NAME = 'Favorites';

const COLLECTIONS_KEY = 'nq_collections';
const AYAHS_KEY = 'nq_collection_ayahs';

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

function isCollection(value: unknown): value is Collection {
    const c = value as Collection;
    return !!c && typeof c === 'object' && typeof c.id === 'string' && typeof c.name === 'string' &&
        typeof c.is_default === 'boolean' && typeof c.created_at === 'string' && typeof c.updated_at === 'string';
}

function isSavedAyah(value: unknown): value is SavedAyah {
    const a = value as SavedAyah;
    return !!a && typeof a === 'object' && typeof a.id === 'string' && typeof a.collection_id === 'string' &&
        isVerseKey(a.verse_key) && isChapterId(a.chapter_id) && typeof a.added_at === 'string';
}

function readCollections(): Collection[] {
    return (readJson<unknown[]>(COLLECTIONS_KEY, [], isArray)).filter(isCollection);
}

function readAyahs(): SavedAyah[] {
    return (readJson<unknown[]>(AYAHS_KEY, [], isArray)).filter(isSavedAyah);
}

function sameName(a: string, b: string) {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function listCollections(): Promise<Collection[]> {
    return readCollections().sort((a, b) => (a.is_default === b.is_default ? a.created_at.localeCompare(b.created_at) : a.is_default ? -1 : 1));
}

export async function createCollection(name: string, description?: string): Promise<{ collection: Collection | null; error: string | null }> {
    const trimmed = name.trim().slice(0, COLLECTION_NAME_MAX);
    if (!trimmed) return { collection: null, error: 'Give the collection a name.' };
    const collections = readCollections();
    if (collections.some(c => sameName(c.name, trimmed))) return { collection: null, error: 'You already have a collection with that name.' };
    if (collections.length >= MAX_COLLECTIONS) return { collection: null, error: `You can have up to ${MAX_COLLECTIONS} collections.` };
    const now = new Date().toISOString();
    const collection: Collection = { id: newId(), name: trimmed, description: description?.trim().slice(0, 300) || null, is_default: false, created_at: now, updated_at: now };
    if (!writeJson(COLLECTIONS_KEY, [...collections, collection])) return { collection: null, error: 'Could not create the collection — your device storage may be full.' };
    return { collection, error: null };
}

/** Deletes a collection and the ayahs saved in it. The default Favorites collection can't be deleted. */
export async function deleteCollection(collectionId: string): Promise<{ error: string | null }> {
    const collections = readCollections();
    const target = collections.find(c => c.id === collectionId);
    if (!target) return { error: null };
    if (target.is_default) return { error: 'Your Favorites collection can’t be deleted.' };
    const ok = writeJson(AYAHS_KEY, readAyahs().filter(a => a.collection_id !== collectionId)) &&
        writeJson(COLLECTIONS_KEY, collections.filter(c => c.id !== collectionId));
    return ok ? { error: null } : { error: 'Could not delete the collection. Please try again.' };
}

export async function renameCollection(collectionId: string, name: string): Promise<{ error: string | null }> {
    const trimmed = name.trim().slice(0, COLLECTION_NAME_MAX);
    if (!trimmed) return { error: 'Give the collection a name.' };
    const collections = readCollections();
    const target = collections.find(c => c.id === collectionId);
    if (!target) return { error: 'Collection not found.' };
    if (collections.some(c => c.id !== collectionId && sameName(c.name, trimmed))) return { error: 'You already have a collection with that name.' };
    target.name = trimmed;
    target.updated_at = new Date().toISOString();
    return writeJson(COLLECTIONS_KEY, collections) ? { error: null } : { error: 'Could not rename the collection. Please try again.' };
}

/** Returns (creating if needed) the id of the default "Favorites" collection. */
export async function ensureDefaultCollection(): Promise<string | null> {
    const collections = readCollections();
    const existing = collections.find(c => c.is_default);
    if (existing) return existing.id;
    const now = new Date().toISOString();
    const favorites: Collection = { id: newId(), name: DEFAULT_COLLECTION_NAME, description: null, is_default: true, created_at: now, updated_at: now };
    return writeJson(COLLECTIONS_KEY, [favorites, ...collections]) ? favorites.id : null;
}

export async function listSavedAyahs(collectionId: string): Promise<SavedAyah[]> {
    return readAyahs().filter(a => a.collection_id === collectionId).sort((a, b) => b.added_at.localeCompare(a.added_at));
}

/** Every verse saved into any collection (for a quick "is this saved?" check). */
export async function listAllSavedVerseKeys(): Promise<Set<string>> {
    return new Set(readAyahs().map(a => a.verse_key));
}

/** Whether this verse has been saved into any collection. */
export async function isAyahSaved(verseKey: string): Promise<boolean> {
    return readAyahs().some(a => a.verse_key === verseKey);
}

export async function addAyahToCollection(collectionId: string, verseKey: string, chapterId: number): Promise<{ error: string | null }> {
    if (!isVerseKey(verseKey) || !isChapterId(chapterId)) return { error: 'Invalid verse.' };
    if (!readCollections().some(c => c.id === collectionId)) return { error: 'Collection not found.' };
    const ayahs = readAyahs();
    if (ayahs.some(a => a.collection_id === collectionId && a.verse_key === verseKey)) return { error: null };
    if (ayahs.filter(a => a.collection_id === collectionId).length >= MAX_AYAHS_PER_COLLECTION) {
        return { error: `A collection can hold up to ${MAX_AYAHS_PER_COLLECTION} ayahs.` };
    }
    const next = [...ayahs, { id: newId(), collection_id: collectionId, verse_key: verseKey, chapter_id: chapterId, added_at: new Date().toISOString() }];
    return writeJson(AYAHS_KEY, next) ? { error: null } : { error: 'Could not save this ayah — your device storage may be full.' };
}

export async function removeAyahFromCollection(collectionId: string, verseKey: string): Promise<{ error: string | null }> {
    const ayahs = readAyahs();
    const next = ayahs.filter(a => !(a.collection_id === collectionId && a.verse_key === verseKey));
    if (next.length === ayahs.length) return { error: null };
    return writeJson(AYAHS_KEY, next) ? { error: null } : { error: 'Could not remove this ayah. Please try again.' };
}

/** Toggles a verse in/out of the default Favorites collection; returns the new saved state. */
export async function toggleFavorite(verseKey: string, chapterId: number): Promise<{ saved: boolean; error: string | null }> {
    const favoritesId = await ensureDefaultCollection();
    if (!favoritesId) return { saved: false, error: 'Could not open your Favorites. Your device storage may be full.' };
    const inFavorites = readAyahs().some(a => a.collection_id === favoritesId && a.verse_key === verseKey);
    if (inFavorites) {
        const { error } = await removeAyahFromCollection(favoritesId, verseKey);
        return { saved: !!error, error };
    }
    const { error } = await addAyahToCollection(favoritesId, verseKey, chapterId);
    return { saved: !error, error };
}
