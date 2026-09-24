// Pure merge logic for reconciling this device's locally-saved state with
// the copy stored in the cloud (public.user_data), used by AuthContext right
// after sign-in. Kept dependency-free and side-effect-free so it can be unit
// tested without a browser or a Supabase client.

import { RECITERS } from './quran-api';
import type { Bookmark } from '@/context/BookmarkContext';
import type { ProgressState } from '@/context/ProgressContext';
import type { FontSize } from '@/context/SettingsContext';

export function asBookmarks(value: unknown): Bookmark[] {
    if (!Array.isArray(value)) return [];
    return value.filter((b): b is Bookmark =>
        !!b && typeof b === 'object' && Number.isInteger((b as Bookmark).chapterId) &&
        (b as Bookmark).chapterId >= 1 && (b as Bookmark).chapterId <= 114 && typeof (b as Bookmark).chapterName === 'string');
}

/** Union of both devices' bookmarks; on a duplicate, keeps the earlier `addedAt`. */
export function mergeBookmarks(local: Bookmark[], cloud: Bookmark[]): Bookmark[] {
    const byChapter = new Map<number, Bookmark>();
    for (const b of [...cloud, ...local]) {
        const existing = byChapter.get(b.chapterId);
        if (!existing || (b.addedAt && b.addedAt < existing.addedAt)) byChapter.set(b.chapterId, b);
    }
    return [...byChapter.values()].sort((a, b) => a.chapterId - b.chapterId);
}

/**
 * Combines reading progress from both devices: totals and streak take the
 * larger value, completed-ayah sets are unioned, and per-day activity keeps
 * the higher count seen for each date. `lastRead` prefers whichever device
 * is doing the merging (it just read something), falling back to the cloud.
 */
export function mergeProgress(local: ProgressState, cloudRaw: unknown): ProgressState {
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

/** Settings synced across devices: a subset of SettingsContext + AudioContext state. */
export interface SyncedPreferences {
    arabicFontSize?: FontSize;
    readingComfortMode?: boolean;
    focusMode?: boolean;
    lineSpacing?: 'normal' | 'relaxed';
    prayerCalculationMethod?: number;
    prayerSilentMode?: boolean;
    reciterId?: number;
    autoContinue?: boolean;
}

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

/** Drops anything malformed, so a hand-edited or corrupted row can't crash the app. */
export function sanitizePreferences(raw: unknown): SyncedPreferences {
    if (!raw || typeof raw !== 'object') return {};
    const r = raw as Record<string, unknown>;
    const out: SyncedPreferences = {};
    if (typeof r.arabicFontSize === 'string' && (FONT_SIZES as string[]).includes(r.arabicFontSize)) out.arabicFontSize = r.arabicFontSize as FontSize;
    if (typeof r.readingComfortMode === 'boolean') out.readingComfortMode = r.readingComfortMode;
    if (typeof r.focusMode === 'boolean') out.focusMode = r.focusMode;
    if (r.lineSpacing === 'normal' || r.lineSpacing === 'relaxed') out.lineSpacing = r.lineSpacing;
    if (Number.isInteger(r.prayerCalculationMethod) && (r.prayerCalculationMethod as number) >= 0 && (r.prayerCalculationMethod as number) <= 99) {
        out.prayerCalculationMethod = r.prayerCalculationMethod as number;
    }
    if (typeof r.prayerSilentMode === 'boolean') out.prayerSilentMode = r.prayerSilentMode;
    if (Number.isInteger(r.reciterId) && RECITERS.some(rc => rc.id === r.reciterId)) out.reciterId = r.reciterId as number;
    if (typeof r.autoContinue === 'boolean') out.autoContinue = r.autoContinue;
    return out;
}

/** Cloud values win for any key it has set (another device is the source of truth for settings); anything it doesn't have falls back to this device. */
export function mergePreferences(local: SyncedPreferences, cloudRaw: unknown): SyncedPreferences {
    return { ...local, ...sanitizePreferences(cloudRaw) };
}
