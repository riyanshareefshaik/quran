// Small helpers for data kept only on this device (notes, collections,
// reading history). Every read validates its shape, and every call fails
// soft when storage is unavailable (private mode, storage full).

/** Fired on window whenever saved notes/collections/history change. */
export const USER_CONTENT_EVENT = 'nq-user-content-changed';

export function readJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed: unknown = JSON.parse(raw);
        return isValid(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

/** Returns false when the value could not be stored (e.g. storage is full). */
export function writeJson(key: string, value: unknown): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return false;
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event(USER_CONTENT_EVENT));
    }
    return true;
}

export function newId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** "2:255" style keys for surahs 1–114. */
export function isVerseKey(value: unknown): value is string {
    return typeof value === 'string' && /^([1-9]|[1-9][0-9]|10[0-9]|11[0-4]):[0-9]{1,3}$/.test(value);
}

export function isChapterId(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 114;
}
