'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Note, listNotes, deleteNote } from '@/lib/notes';
import { Collection, SavedAyah, listCollections, createCollection, deleteCollection, listSavedAyahs, removeAyahFromCollection } from '@/lib/collections';
import { ReadingHistoryEntry, listReadingHistory, clearReadingHistory } from '@/lib/reading-history';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const NotesSection: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        listNotes().then(n => { if (!cancelled) { setNotes(n); setLoading(false); } });
        return () => { cancelled = true; };
    }, []);

    const remove = async (verseKey: string) => {
        if (!window.confirm(`Delete your note on ${verseKey}?`)) return;
        const { error } = await deleteNote(verseKey);
        if (!error) setNotes(prev => prev.filter(n => n.verse_key !== verseKey));
    };

    if (loading) return <p className="muted">Loading notes…</p>;
    if (notes.length === 0) return <p className="muted">No notes yet. Tap &ldquo;Save&rdquo; on any ayah while reading to add one.</p>;

    return (
        <ul className="list">
            {notes.map(n => (
                <li key={n.verse_key} className="list-row">
                    <Link href={`/surah/${n.chapter_id}#${n.verse_key}`} className="list-ref">{n.verse_key}</Link>
                    <p className="list-body">{n.body}</p>
                    <div className="list-meta">
                        <span>{formatDate(n.updated_at)}</span>
                        <button type="button" className="link danger" onClick={() => remove(n.verse_key)}>Delete</button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const CollectionAyahs: React.FC<{ collection: Collection; onCountChange: () => void }> = ({ collection, onCountChange }) => {
    const [ayahs, setAyahs] = useState<SavedAyah[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        listSavedAyahs(collection.id).then(a => { if (!cancelled) { setAyahs(a); setLoading(false); } });
        return () => { cancelled = true; };
    }, [collection.id]);

    const remove = async (verseKey: string) => {
        const { error } = await removeAyahFromCollection(collection.id, verseKey);
        if (!error) { setAyahs(prev => prev.filter(a => a.verse_key !== verseKey)); onCountChange(); }
    };

    if (loading) return <p className="muted small">Loading…</p>;
    if (ayahs.length === 0) return <p className="muted small">No ayahs saved here yet.</p>;

    return (
        <ul className="list nested">
            {ayahs.map(a => (
                <li key={a.id} className="list-row compact">
                    <Link href={`/surah/${a.chapter_id}#${a.verse_key}`} className="list-ref">{a.verse_key}</Link>
                    <button type="button" className="link danger" onClick={() => remove(a.verse_key)}>Remove</button>
                </li>
            ))}
        </ul>
    );
};

const CollectionsSection: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        let cancelled = false;
        listCollections().then(c => { if (!cancelled) { setCollections(c); setLoading(false); } });
        return () => { cancelled = true; };
    }, [refreshTick]);

    const addCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const { collection, error: err } = await createCollection(newName);
        if (err) { setError(err); return; }
        if (collection) setCollections(prev => [...prev, collection]);
        setNewName('');
    };

    const remove = async (c: Collection) => {
        if (!window.confirm(`Delete the collection “${c.name}” and the ayahs saved in it?`)) return;
        const { error: err } = await deleteCollection(c.id);
        if (err) setError(err);
        else setCollections(prev => prev.filter(x => x.id !== c.id));
    };

    if (loading) return <p className="muted">Loading collections…</p>;

    return (
        <div className="stack">
            {collections.length === 0 ? (
                <p className="muted">No collections yet. Tap &ldquo;Save&rdquo; on any ayah to create your Favorites collection.</p>
            ) : (
                <ul className="list">
                    {collections.map(c => (
                        <li key={c.id} className="list-row">
                            <div className="list-meta">
                                <button type="button" className="link" onClick={() => setExpanded(x => x === c.id ? null : c.id)}>
                                    <strong>{c.name}</strong>{c.is_default && ' (default)'}
                                </button>
                                {!c.is_default && <button type="button" className="link danger" onClick={() => remove(c)}>Delete</button>}
                            </div>
                            {expanded === c.id && <CollectionAyahs collection={c} onCountChange={() => setRefreshTick(t => t + 1)} />}
                        </li>
                    ))}
                </ul>
            )}
            <form className="name-row" onSubmit={addCollection}>
                <input aria-label="New collection name" placeholder="New collection name" value={newName} maxLength={80} onChange={e => setNewName(e.target.value)} />
                <button type="submit" className="secondary" disabled={!newName.trim()}>Create</button>
            </form>
            {error && <p className="error" role="alert">{error}</p>}
        </div>
    );
};

const HistorySection: React.FC = () => {
    const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        listReadingHistory(50).then(h => { if (!cancelled) { setHistory(h); setLoading(false); } });
        return () => { cancelled = true; };
    }, []);

    const clear = async () => {
        if (!window.confirm('Clear your reading history on this device?')) return;
        const { error } = await clearReadingHistory();
        if (!error) setHistory([]);
    };

    if (loading) return <p className="muted">Loading history…</p>;

    return (
        <div className="stack">
            {history.length === 0 ? (
                <p className="muted">Nothing read yet. Verses you read or listen to will appear here.</p>
            ) : (
                <>
                    <ul className="list">
                        {history.map(h => (
                            <li key={h.id} className="list-row compact">
                                <Link href={`/surah/${h.chapter_id}#${h.verse_key}`} className="list-ref">{h.surah_name} · {h.verse_key}</Link>
                                <span className="list-meta">{formatDate(h.read_at)}</span>
                            </li>
                        ))}
                    </ul>
                    <button type="button" className="secondary" onClick={clear} style={{ alignSelf: 'flex-start' }}>Clear history</button>
                </>
            )}
        </div>
    );
};

const TABS = [
    { id: 'notes', label: 'My Notes' },
    { id: 'collections', label: 'Favorites & Collections' },
    { id: 'history', label: 'Reading History' },
] as const;

/** Notes, collections and reading history saved on this device. */
const LibraryPanel: React.FC = () => {
    const [tab, setTab] = useState<(typeof TABS)[number]['id']>('notes');

    return (
        <div className="card content-panel">
            <div className="tabs" role="tablist">
                {TABS.map(t => (
                    <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>
            {tab === 'notes' && <NotesSection />}
            {tab === 'collections' && <CollectionsSection />}
            {tab === 'history' && <HistorySection />}

            <style jsx>{`
                .content-panel { gap: 1rem; }
                .tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .tab {
                    background: transparent; border: 1px solid var(--emerald-medium); color: var(--emerald-light);
                    border-radius: 20px; padding: 0.5rem 1rem; font-family: inherit; font-size: 0.82rem; cursor: pointer;
                }
                .tab.active { background: var(--gold-primary); color: var(--matte-black); border-color: var(--gold-primary); font-weight: 600; }
                .tab:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                :global(.content-panel .stack) { display: flex; flex-direction: column; gap: 0.9rem; }
                :global(.content-panel .list) { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
                :global(.content-panel .list.nested) { margin-top: 0.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(212, 175, 55, 0.2); }
                :global(.content-panel .list-row) {
                    background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 10px; padding: 0.7rem 0.9rem;
                    display: flex; flex-direction: column; gap: 0.4rem;
                }
                :global(.content-panel .list-row.compact) { flex-direction: row; align-items: center; justify-content: space-between; }
                :global(.content-panel .list-ref) { color: var(--gold-primary); font-weight: 600; font-size: 0.88rem; text-decoration: none; }
                :global(.content-panel .list-ref:hover) { text-decoration: underline; }
                :global(.content-panel .list-body) { margin: 0; color: var(--off-white); font-size: 0.9rem; white-space: pre-wrap; }
                :global(.content-panel .list-meta) { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; font-size: 0.78rem; color: rgba(255, 255, 255, 0.5); }
                :global(.content-panel .link.danger) { color: #e6a5a5; }
            `}</style>
        </div>
    );
};

export default LibraryPanel;
