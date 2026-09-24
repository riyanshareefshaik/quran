import { getSupabase } from './supabase';

export interface Note {
    id: string;
    user_id: string;
    verse_key: string;
    chapter_id: number;
    body: string;
    created_at: string;
    updated_at: string;
}

export const NOTE_MAX_LENGTH = 4000;

/** All of the signed-in user's notes, most recently updated first. */
export async function listNotes(): Promise<Note[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
    if (error) {
        console.error('Failed to load notes:', error);
        return [];
    }
    return data ?? [];
}

/** The note on one verse, or null if there isn't one. */
export async function getNote(verseKey: string): Promise<Note | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('notes').select('*').eq('verse_key', verseKey).maybeSingle();
    if (error) {
        console.error('Failed to load note:', error);
        return null;
    }
    return data;
}

/** Creates or replaces the note on a verse (one note per verse per user). */
export async function saveNote(userId: string, verseKey: string, chapterId: number, body: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to save notes.' };
    const trimmed = body.trim().slice(0, NOTE_MAX_LENGTH);
    if (!trimmed) return { error: 'Note cannot be empty.' };
    const { error } = await supabase
        .from('notes')
        .upsert({ user_id: userId, verse_key: verseKey, chapter_id: chapterId, body: trimmed }, { onConflict: 'user_id,verse_key' });
    if (error) {
        console.error('Failed to save note:', error);
        return { error: 'Could not save your note. Please try again.' };
    }
    return { error: null };
}

export async function deleteNote(verseKey: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to manage notes.' };
    const { error } = await supabase.from('notes').delete().eq('verse_key', verseKey);
    if (error) {
        console.error('Failed to delete note:', error);
        return { error: 'Could not delete your note. Please try again.' };
    }
    return { error: null };
}
