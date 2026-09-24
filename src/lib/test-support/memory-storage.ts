/**
 * Installs an in-memory localStorage (tests run in Node, which has none).
 * Pass a quota to simulate a full device.
 */
export function installMemoryStorage(quotaChars = Infinity) {
    const data = new Map<string, string>();
    const storage = {
        getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
        setItem: (k: string, v: string) => {
            const used = [...data.entries()].reduce((n, [key, val]) => n + (key === k ? 0 : key.length + val.length), 0);
            if (used + k.length + v.length > quotaChars) throw new Error('QuotaExceededError');
            data.set(k, String(v));
        },
        removeItem: (k: string) => { data.delete(k); },
        clear: () => data.clear(),
        key: (i: number) => [...data.keys()][i] ?? null,
        get length() { return data.size; },
    };
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });
    return storage;
}
