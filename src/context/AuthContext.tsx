'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { useBookmarks } from './BookmarkContext';
import { ProgressState, useProgress } from './ProgressContext';
import { useSettings } from './SettingsContext';
import { useAudio } from './AudioContext';
import { asBookmarks, mergeBookmarks, mergeProgress, mergePreferences, SyncedPreferences } from '@/lib/sync-merge';

type SyncStatus = 'off' | 'syncing' | 'synced' | 'error';

interface AuthContextType {
    session: Session | null;
    ready: boolean;
    syncStatus: SyncStatus;
    lastSyncedAt: Date | null;
    syncNow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const settings = useSettings();
    const audio = useAudio();
    const progressState: ProgressState = {
        totalAyahsRead: progress.totalAyahsRead,
        completedAyahKeys: progress.completedAyahKeys,
        currentStreak: progress.currentStreak,
        lastRead: progress.lastRead,
        activityHistory: progress.activityHistory,
    };
    const localPreferences: SyncedPreferences = {
        arabicFontSize: settings.arabicFontSize,
        readingComfortMode: settings.readingComfortMode,
        focusMode: settings.focusMode,
        lineSpacing: settings.lineSpacing,
        prayerCalculationMethod: settings.prayerCalculationMethod,
        prayerSilentMode: settings.prayerSilentMode,
        reciterId: audio.currentReciterId,
        autoContinue: audio.autoContinue,
    };

    // Latest local values, read when the (async) cloud response arrives.
    const serialized = JSON.stringify({ bookmarks, progress: progressState, preferences: localPreferences });
    const latest = useRef({ bookmarks, progress: progressState, preferences: localPreferences });
    useEffect(() => {
        latest.current = JSON.parse(serialized);
    }, [serialized]);
    const replaceProgress = progress.replaceProgress;
    const applySettingsPreferences = settings.applyPreferences;
    const applyAudioPreferences = audio.applyStoredPreferences;

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
            const { data, error } = await supabase.from('user_data').select('bookmarks, progress, preferences').eq('user_id', userId).maybeSingle();
            if (cancelled) return;
            if (error) { setSyncStatus('error'); return; }
            const mergedBookmarks = mergeBookmarks(latest.current.bookmarks, asBookmarks(data?.bookmarks));
            const mergedProgress = mergeProgress(latest.current.progress, data?.progress);
            const mergedPreferences = mergePreferences(latest.current.preferences, data?.preferences);
            replaceBookmarks(mergedBookmarks);
            replaceProgress(mergedProgress);
            applySettingsPreferences(mergedPreferences);
            applyAudioPreferences(mergedPreferences);
            const { error: saveError } = await supabase.from('user_data').upsert({
                user_id: userId, bookmarks: mergedBookmarks, progress: mergedProgress, preferences: mergedPreferences,
            });
            if (cancelled) return;
            setSyncStatus(saveError ? 'error' : 'synced');
            if (!saveError) setLastSyncedAt(new Date());
            setSyncedUser(userId);
        })();
        return () => { cancelled = true; };
    }, [supabase, userId, bookmarksLoaded, syncRequest, replaceBookmarks, replaceProgress, applySettingsPreferences, applyAudioPreferences]);

    // After the first sync, save local changes (debounced).
    useEffect(() => {
        if (!supabase || !userId || syncedUser !== userId) return;
        const timer = setTimeout(async () => {
            const { bookmarks: b, progress: p, preferences: prefs } = latest.current;
            const { error } = await supabase.from('user_data').upsert({ user_id: userId, bookmarks: b, progress: p, preferences: prefs });
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
