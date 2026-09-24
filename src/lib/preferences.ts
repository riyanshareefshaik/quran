import { getSupabase } from './supabase';
import { sanitizePreferences, SyncedPreferences } from './sync-merge';

export type { SyncedPreferences };

/** Loads this user's synced preferences, or {} if there are none yet / not signed in. */
export async function loadPreferences(userId: string): Promise<SyncedPreferences> {
    const supabase = getSupabase();
    if (!supabase) return {};
    const { data, error } = await supabase.from('user_data').select('preferences').eq('user_id', userId).maybeSingle();
    if (error) {
        console.error('Failed to load preferences:', error);
        return {};
    }
    return sanitizePreferences(data?.preferences);
}

/**
 * Saves preferences for this user. Only touches the `preferences` column —
 * this device's bookmarks/progress rows (synced separately by AuthContext)
 * are left exactly as they are.
 */
export async function savePreferences(userId: string, preferences: SyncedPreferences): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Sign in to sync preferences.' };
    const { error } = await supabase.from('user_data').upsert({ user_id: userId, preferences });
    if (error) {
        console.error('Failed to save preferences:', error);
        return { error: 'Could not sync your preferences. Please try again.' };
    }
    return { error: null };
}
