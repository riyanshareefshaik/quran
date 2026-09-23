'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { Bookmark, useBookmarks } from './BookmarkContext';
import { ProgressState, useProgress } from './ProgressContext';

type SyncStatus = 'off' | 'syncing' | 'synced' | 'error';

interface AuthContextType {
    session: Session | null;
    ready: boolean;
    syncStatus: SyncStatus;
    lastSyncedAt: Date | null;
    syncNow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Merging this device's data with the cloud copy ───────────────────────
function asBookmarks(value: unknown): Bookmark[] {
    if (!Array.isArray(value)) return [];
    return value.filter((b): b is Bookmark =>
        !!b && typeof b === 'object' && Number.isInteger((b as Bookmark).chapterId) &&
        (b as Bookmark).chapterId >= 1 && (b as Bookmark).chapterId <= 114 && typeof (b as Bookmark).chapterName === 'string');
}

function mergeBookmarks(local: Bookmark[], cloud: Bookmark[]): Bookmark[] {
    const byChapter = new Map<number, Bookmark>();
    for (const b of [...cloud, ...local]) {
        const existing = byChapter.get(b.chapterId);
        if (!existing || (b.addedAt && b.addedAt < existing.addedAt)) byChapter.set(b.chapterId, b);
    }
    return [...byChapter.values()].sort((a, b) => a.chapterId - b.chapterId);
}

function mergeProgress(local: ProgressState, cloudRaw: unknown): ProgressState {
    const cloud = (cloudRaw && typeof cloudRaw === 'object' ? cloudRaw : {}) as Partial<ProgressState>;
    const keys = new Set<string>([
        ...(Array.isArray(local.completedAyahKeys) ? local.completedAyahKeys : []),
        ...(Array.isArray(cloud.completedAyahKeys) ? cloud.completedAyahKeys.filter(k => typeof k === 'string' && /^\d{1,3}:\d{1,3}$/.test(k)) : []),
    ]);
    const days = new Map<string, number>();
    for (const d of [...(Array.isArray(cloud.activityHistory) ? cloud.activityHistory : []), ...local.activityHistory]) {
        if (d && typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number.isFinite(d.ayahsRead)) {
            days.set(d.date, Math.max(days.get(d.date) ?? 0, d.ayahsRead));
        }
    }
    const cloudLast = cloud.lastRead && typeof cloud.lastRead === 'object' && typeof cloud.lastRead.verseKey === 'string' ? cloud.lastRead : null;
    return {
        totalAyahsRead: Math.max(local.totalAyahsRead || 0, Number(cloud.totalAyahsRead) || 0),
        completedAyahKeys: [...keys],
        currentStreak: Math.max(local.currentStreak || 0, Number(cloud.currentStreak) || 0),
        lastRead: local.lastRead ?? cloudLast,
        activityHistory: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-400).map(([date, ayahsRead]) => ({ date, ayahsRead })),
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const supabase = getSupabase();
    const [session, setSession] = useState<Session | null>(null);
    const [ready, setReady] = useState(!supabase);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('off');
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [syncedUser, setSyncedUser] = useState<string | null>(null);
    const [syncRequest, setSyncRequest] = useState(0);

    const { bookmarks, replaceBookmarks, loaded: bookmarksLoaded } = useBookmarks();
    const progress = useProgress();
    const progressState: ProgressState = {
        totalAyahsRead: progress.totalAyahsRead,
        completedAyahKeys: progress.completedAyahKeys,
        currentStreak: progress.currentStreak,
        lastRead: progress.lastRead,
        activityHistory: progress.activityHistory,
    };

    // Latest local values, read when the (async) cloud response arrives.
    const serialized = JSON.stringify({ bookmarks, progress: progressState });
    const latest = useRef({ bookmarks, progress: progressState });
    useEffect(() => {
        latest.current = JSON.parse(serialized);
    }, [serialized]);
    const replaceProgress = progress.replaceProgress;

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setReady(true);
        });
        const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, [supabase]);

    const userId = session?.user.id ?? null;

    // On sign-in (or "Sync now"): merge cloud + device, then save the result.
    useEffect(() => {
        if (!supabase || !userId || !bookmarksLoaded) return;
        let cancelled = false;
        (async () => {
            setSyncStatus('syncing');
            const { data, error } = await supabase.from('user_data').select('bookmarks, progress').eq('user_id', userId).maybeSingle();
            if (cancelled) return;
            if (error) { setSyncStatus('error'); return; }
            const mergedBookmarks = mergeBookmarks(latest.current.bookmarks, asBookmarks(data?.bookmarks));
            const mergedProgress = mergeProgress(latest.current.progress, data?.progress);
            replaceBookmarks(mergedBookmarks);
            replaceProgress(mergedProgress);
            const { error: saveError } = await supabase.from('user_data').upsert({ user_id: userId, bookmarks: mergedBookmarks, progress: mergedProgress });
            if (cancelled) return;
            setSyncStatus(saveError ? 'error' : 'synced');
            if (!saveError) setLastSyncedAt(new Date());
            setSyncedUser(userId);
        })();
        return () => { cancelled = true; };
    }, [supabase, userId, bookmarksLoaded, syncRequest, replaceBookmarks, replaceProgress]);

    // After the first sync, save local changes (debounced).
    useEffect(() => {
        if (!supabase || !userId || syncedUser !== userId) return;
        const timer = setTimeout(async () => {
            const { bookmarks: b, progress: p } = latest.current;
            const { error } = await supabase.from('user_data').upsert({ user_id: userId, bookmarks: b, progress: p });
            setSyncStatus(error ? 'error' : 'synced');
            if (!error) setLastSyncedAt(new Date());
        }, 2000);
        return () => clearTimeout(timer);
    }, [supabase, userId, syncedUser, serialized]);

    const value: AuthContextType = {
        session,
        ready,
        syncStatus: userId ? syncStatus : 'off',
        lastSyncedAt: userId ? lastSyncedAt : null,
        syncNow: () => setSyncRequest(n => n + 1),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};
