import { getSupabase } from './supabase';

export interface Collection {
    id: string;
    user_id: string;
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

export async function listCollections(): Promise<Collection[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('collections').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error('Failed to load collections:', error);
        return [];
    }
    return data ?? [];
}

export async function createCollection(userId: string, name: string, description?: string): Promise<{ collection: Collection | null; error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { collection: null, error: 'Sign in to create collections.' };
    const trimmed = name.trim().slice(0, COLLECTION_NAME_MAX);
    if (!trimmed) return { collection: null, error: 'Give the collection a name.' };
    const { data, error } = await supabase
        .from('collections')
        .insert({ user_id: userId, name: trimmed, description: description?.trim().slice(0, 300) || null })
        .select('*')
        .single();
    if (error) {
        console.error('Failed to create collection:', error);
        const message = /duplicate key|unique/i.test(error.message) ? 'You already have a collection with that name.' : 'Could not create the collection. Please try again.';
        return { collection: null, error: message };
    }
    return { collection: data, error: null };
}

export async function deleteCollection(collectionId: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to manage collections.' };
    const { error } = await supabase.from('collections').delete().eq('id', collectionId);
    if (error) {
        console.error('Failed to delete collection:', error);
        return { error: 'Could not delete the collection. Please try again.' };
    }
    return { error: null };
}

export async function renameCollection(collectionId: string, name: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to manage collections.' };
    const trimmed = name.trim().slice(0, COLLECTION_NAME_MAX);
    if (!trimmed) return { error: 'Give the collection a name.' };
    const { error } = await supabase.from('collections').update({ name: trimmed }).eq('id', collectionId);
    if (error) {
        console.error('Failed to rename collection:', error);
        return { error: 'Could not rename the collection. Please try again.' };
    }
    return { error: null };
}

/** Returns (creating if needed) the id of this user's default "Favorites" collection. */
export async function ensureDefaultCollection(): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('ensure_default_collection');
    if (error) {
        console.error('Failed to ensure default collection:', error);
        return null;
    }
    return data as string;
}

export async function listSavedAyahs(collectionId: string): Promise<SavedAyah[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('collection_ayahs').select('*').eq('collection_id', collectionId).order('added_at', { ascending: false });
    if (error) {
        console.error('Failed to load saved ayahs:', error);
        return [];
    }
    return data ?? [];
}

/** Every verse_key this user has saved into any collection (for a quick "is this saved?" check). */
export async function listAllSavedVerseKeys(): Promise<Set<string>> {
    const supabase = getSupabase();
    if (!supabase) return new Set();
    const { data, error } = await supabase.from('collection_ayahs').select('verse_key');
    if (error) {
        console.error('Failed to load saved verses:', error);
        return new Set();
    }
    return new Set((data ?? []).map(row => row.verse_key as string));
}

/** Whether this verse has been saved into any of the user's collections. */
export async function isAyahSaved(verseKey: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { data, error } = await supabase.from('collection_ayahs').select('id').eq('verse_key', verseKey).limit(1).maybeSingle();
    if (error) {
        console.error('Failed to check saved ayah:', error);
        return false;
    }
    return !!data;
}

export async function addAyahToCollection(userId: string, collectionId: string, verseKey: string, chapterId: number): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to save ayahs.' };
    const { error } = await supabase
        .from('collection_ayahs')
        .upsert({ user_id: userId, collection_id: collectionId, verse_key: verseKey, chapter_id: chapterId }, { onConflict: 'collection_id,verse_key' });
    if (error) {
        console.error('Failed to save ayah:', error);
        return { error: 'Could not save this ayah. Please try again.' };
    }
    return { error: null };
}

export async function removeAyahFromCollection(collectionId: string, verseKey: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to manage saved ayahs.' };
    const { error } = await supabase.from('collection_ayahs').delete().eq('collection_id', collectionId).eq('verse_key', verseKey);
    if (error) {
        console.error('Failed to remove saved ayah:', error);
        return { error: 'Could not remove this ayah. Please try again.' };
    }
    return { error: null };
}

/** Toggles a verse in/out of the default Favorites collection; returns the new saved state. */
export async function toggleFavorite(userId: string, verseKey: string, chapterId: number): Promise<{ saved: boolean; error: string | null }> {
    const defaultId = await ensureDefaultCollection();
    if (!defaultId) return { saved: false, error: 'Sign in to save favorites.' };
    const supabase = getSupabase()!;
    const { data } = await supabase.from('collection_ayahs').select('id').eq('collection_id', defaultId).eq('verse_key', verseKey).maybeSingle();
    if (data) {
        const { error } = await removeAyahFromCollection(defaultId, verseKey);
        return { saved: error ? true : false, error };
    }
    const { error } = await addAyahToCollection(userId, defaultId, verseKey, chapterId);
    return { saved: !error, error };
}
