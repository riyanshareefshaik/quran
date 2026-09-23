import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Only the public "anon" key belongs here. Every permission is enforced by
// row-level security in the database (see supabase/schema.sql), so this key
// is safe to ship to browsers. NEVER put the service_role key in this app.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Returns the shared Supabase client, or null when the app isn't configured. */
export function getSupabase(): SupabaseClient | null {
    if (!url || !anonKey) return null;
    if (!client) {
        client = createClient(url, anonKey, {
            // detectSessionInUrl lets the admin password-reset link sign the user in.
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        });
    }
    return client;
}

export const isSupabaseConfigured = Boolean(url && anonKey);

export interface Announcement {
    id: string;
    title: string;
    body: string;
    link_url: string | null;
    level: 'info' | 'important' | 'event';
    is_active: boolean;
    starts_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
}

export type FeedbackCategory = 'suggestion' | 'bug' | 'content' | 'other';
export type FeedbackStatus = 'new' | 'read' | 'resolved';

export interface Feedback {
    id: string;
    name: string | null;
    email: string | null;
    category: FeedbackCategory;
    message: string;
    status: FeedbackStatus;
    admin_note: string | null;
    created_at: string;
}

export type ReportContentType = 'quran' | 'hadith' | 'essential' | 'guide' | 'other';
export type ReportStatus = 'new' | 'reviewing' | 'fixed' | 'dismissed';

export interface ContentReport {
    id: string;
    content_type: ReportContentType;
    content_ref: string;
    page_path: string | null;
    issue: string;
    status: ReportStatus;
    admin_note: string | null;
    created_at: string;
}

export interface PageViewRow {
    day: string;
    path: string;
    views: number;
}

export interface AdminRow {
    user_id: string;
    email: string;
    created_at: string;
}

/** Fire-and-forget anonymous page counter; silently does nothing if offline or unconfigured. */
export function trackPageView(path: string) {
    const supabase = getSupabase();
    if (!supabase || path.startsWith('/admin')) return;
    supabase.rpc('track_page_view', { p_path: path.slice(0, 120) }).then(() => undefined, () => undefined);
}
