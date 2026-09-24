import { getSupabase } from './supabase';

export interface ReadingHistoryEntry {
    id: number;
    verse_key: string;
    chapter_id: number;
    surah_name: string;
    read_at: string;
}

/**
 * Fire-and-forget: records that a verse was opened, for the signed-in user's
 * cross-device reading history. Silently does nothing when signed out —
 * local-only reading (bookmarks, progress) already works without an account.
 */
export function logReading(verseKey: string, chapterId: number, surahName: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.rpc('log_reading', { p_verse_key: verseKey, p_chapter_id: chapterId, p_surah_name: surahName.slice(0, 80) })
        .then(({ error }) => { if (error) console.error('Failed to log reading history:', error); });
}

export async function listReadingHistory(limit = 50): Promise<ReadingHistoryEntry[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('reading_history').select('*').order('read_at', { ascending: false }).limit(limit);
    if (error) {
        console.error('Failed to load reading history:', error);
        return [];
    }
    return data ?? [];
}

export async function clearReadingHistory(userId: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to manage reading history.' };
    const { error } = await supabase.from('reading_history').delete().eq('user_id', userId);
    if (error) {
        console.error('Failed to clear reading history:', error);
        return { error: 'Could not clear your reading history. Please try again.' };
    }
    return { error: null };
}
