// Tiny IndexedDB key-value store used to keep Quran text, surah info and
// tafsir available offline. Every call fails soft: if IndexedDB is missing
// (private browsing, old WebView) the app simply behaves as before.

const DB_NAME = 'nur-al-quran';
const STORE = 'cache';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    if (!dbPromise) {
        dbPromise = new Promise(resolve => {
            try {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = () => req.result.createObjectStore(STORE);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
                req.onblocked = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }
    return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
    return openDb().then(db => new Promise<T | undefined>(resolve => {
        if (!db) return resolve(undefined);
        try {
            const req = fn(db.transaction(STORE, mode).objectStore(STORE));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(undefined);
        } catch {
            resolve(undefined);
        }
    }));
}

export function cacheGet<T>(key: string): Promise<T | undefined> {
    return run<T>('readonly', s => s.get(key) as IDBRequest<T>);
}

export function cacheSet(key: string, value: unknown): Promise<void> {
    return run('readwrite', s => s.put(value, key)).then(() => undefined);
}

export function cacheDelete(key: string): Promise<void> {
    return run('readwrite', s => s.delete(key)).then(() => undefined);
}

export async function cacheKeys(prefix: string): Promise<string[]> {
    const keys = (await run<IDBValidKey[]>('readonly', s => s.getAllKeys())) ?? [];
    return keys.map(String).filter(k => k.startsWith(prefix));
}

/**
 * Network first, cache fallback: always tries for fresh data, stores it,
 * and serves the saved copy when offline or the request fails.
 */
export async function networkFirst<T>(key: string, load: () => Promise<T>): Promise<T> {
    try {
        const fresh = await load();
        cacheSet(key, fresh);
        return fresh;
    } catch (error) {
        const saved = await cacheGet<T>(key);
        if (saved !== undefined) return saved;
        throw error;
    }
}
