'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import ReportIssueButton from '@/components/ReportIssueButton';
import {
    HADITH_COLLECTIONS,
    LANGUAGE_NAMES,
    Hadith,
    HadithCollection,
    HadithLanguage,
    fetchHadithBook,
    findBookForHadith,
    getCollection,
} from '@/lib/hadith';

const PAGE_SIZE = 20;
const LANG_KEY = 'hadith_language';

function readSavedLanguage(): HadithLanguage {
    if (typeof window === 'undefined') return 'eng';
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved && saved in LANGUAGE_NAMES) return saved as HadithLanguage;
    } catch { /* storage unavailable */ }
    return 'eng';
}

function hadithHref(collection: string, book?: number, number?: number) {
    const params = new URLSearchParams({ c: collection });
    if (book !== undefined) params.set('b', String(book));
    if (number !== undefined) params.set('n', String(number));
    return `/hadith?${params.toString()}`;
}

/** "Go to hadith #" box, shared by the collection and book views. */
const JumpToHadith: React.FC<{ collection: HadithCollection }> = ({ collection }) => {
    const router = useRouter();
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const n = parseInt(value, 10);
        const book = Number.isFinite(n) ? findBookForHadith(collection, n) : undefined;
        if (!book) {
            setError(`Enter a number between 1 and ${collection.total}`);
            return;
        }
        setError('');
        router.push(hadithHref(collection.id, book.id, n));
    };

    return (
        <form className="jump-form" onSubmit={submit}>
            <input
                type="number"
                inputMode="numeric"
                min={1}
                max={collection.total}
                placeholder={`Hadith number (1–${collection.total})`}
                aria-label="Hadith number"
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            <button type="submit">Go</button>
            {error && <span className="jump-error" role="alert">{error}</span>}
            <style jsx>{`
                .jump-form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    align-items: center;
                }
                input {
                    flex: 1;
                    min-width: 180px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white);
                    padding: 0.65rem 0.9rem;
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 0.9rem;
                    outline: none;
                }
                input:focus { border-color: var(--gold-primary); }
                button {
                    background: var(--gold-primary);
                    color: var(--matte-black);
                    border: none;
                    border-radius: 10px;
                    padding: 0.65rem 1.3rem;
                    font-weight: 700;
                    font-family: inherit;
                    cursor: pointer;
                }
                button:focus-visible { outline: 2px solid var(--gold-secondary); outline-offset: 2px; }
                .jump-error { width: 100%; color: #e6a5a5; font-size: 0.8rem; }
            `}</style>
        </form>
    );
};

const CollectionsView: React.FC = () => (
    <>
        <div className="collection-grid">
            {HADITH_COLLECTIONS.map(c => (
                <Link key={c.id} href={hadithHref(c.id)} className="collection-card glass-card">
                    <span className="collection-arabic amiri-text" lang="ar">{c.arabicName}</span>
                    <span className="collection-name font-display">{c.name}</span>
                    <span className="collection-meta">{c.compiler}</span>
                    <span className="collection-count">{c.total.toLocaleString()} hadith · {c.books.length} {c.books.length === 1 ? 'book' : 'books'}</span>
                </Link>
            ))}
        </div>
        <p className="attribution">
            Arabic text, translations and gradings from the open-source{' '}
            <a href="https://github.com/fawazahmed0/hadith-api" target="_blank" rel="noopener noreferrer">hadith-api</a> dataset.
            Gradings shown are those of the named scholars.
        </p>
        <style jsx>{`
            .collection-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 1.25rem;
            }
            :global(.collection-card) {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 0.3rem;
                padding: 1.6rem 1.2rem !important;
            }
            :global(.collection-card:focus-visible) { outline: 2px solid var(--gold-primary); outline-offset: 3px; }
            .collection-arabic {
                font-family: var(--font-amiri), 'Amiri', serif;
                font-size: 1.7rem;
                color: var(--gold-primary);
                line-height: 1.7;
            }
            .collection-name { font-size: 1.1rem; color: var(--white); font-weight: 600; }
            .collection-meta { font-size: 0.82rem; color: rgba(255, 255, 255, 0.6); }
            .collection-count { margin-top: 0.5rem; font-size: 0.75rem; color: var(--emerald-light); letter-spacing: 0.5px; }
            .attribution { margin-top: 2rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); text-align: center; }
            .attribution a { color: var(--emerald-light); text-decoration: underline; }
        `}</style>
    </>
);

const BooksView: React.FC<{ collection: HadithCollection }> = ({ collection }) => (
    <>
        <div className="collection-heading">
            <p className="amiri-text arabic" lang="ar">{collection.arabicName}</p>
            <h2 className="font-display">{collection.name}</h2>
            <p className="meta">{collection.compiler} · {collection.total.toLocaleString()} hadith</p>
        </div>
        <JumpToHadith collection={collection} />
        <ol className="book-list">
            {collection.books.map(book => (
                <li key={book.id}>
                    <Link href={hadithHref(collection.id, book.id)} className="book-row">
                        <span className="book-number">{book.id}</span>
                        <span className="book-title">{book.title}</span>
                        <span className="book-range">{book.first === book.last ? book.first : `${book.first}–${book.last}`}</span>
                    </Link>
                </li>
            ))}
        </ol>
        <style jsx>{`
            .collection-heading { text-align: center; margin-bottom: 1.5rem; }
            .arabic { font-family: var(--font-amiri), 'Amiri', serif; font-size: 2rem; color: var(--gold-primary); line-height: 1.6; }
            h2 { font-size: 1.6rem; color: var(--white); }
            .meta { color: var(--emerald-light); font-size: 0.85rem; }
            .book-list { list-style: none; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
            :global(.book-row) {
                display: grid;
                grid-template-columns: 44px 1fr auto;
                align-items: center;
                gap: 1rem;
                padding: 0.85rem 1.1rem;
                border: 1px solid rgba(212, 175, 55, 0.15);
                border-radius: 10px;
                background: var(--card-bg);
                transition: border-color 0.2s, background 0.2s;
            }
            :global(.book-row:hover) { border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.05); }
            :global(.book-row:focus-visible) { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            .book-number {
                width: 36px; height: 36px; border: 1px solid var(--gold-primary); border-radius: 6px;
                display: flex; align-items: center; justify-content: center;
                color: var(--gold-primary); font-weight: 700; font-size: 0.8rem;
            }
            .book-title { color: var(--off-white); font-size: 0.95rem; }
            .book-range { color: var(--emerald-light); font-size: 0.78rem; white-space: nowrap; }
        `}</style>
    </>
);

const HadithCard: React.FC<{ hadith: Hadith; collection: HadithCollection; highlighted: boolean; showArabic: boolean; rtl: boolean }> = ({ hadith, collection, highlighted, showArabic, rtl }) => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        const text = `${hadith.arabic ? hadith.arabic + '\n\n' : ''}${hadith.text}\n\n— ${collection.name} ${hadith.number}`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard unavailable */ }
    };

    return (
        <article id={`hadith-${hadith.number}`} className={`hadith-card ${highlighted ? 'highlighted' : ''}`}>
            <header className="hadith-header">
                <span className="hadith-number">{collection.name} · {hadith.number}</span>
                <span className="hadith-actions">
                    <ReportIssueButton contentType="hadith" contentRef={`${collection.name} ${hadith.number}`} />
                    <button type="button" className="copy-btn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
                </span>
            </header>
            {showArabic && hadith.arabic && <p className="hadith-arabic amiri-text" dir="rtl" lang="ar">{hadith.arabic}</p>}
            {hadith.text && <p className="hadith-text" dir={rtl ? 'rtl' : 'ltr'}>{hadith.text}</p>}
            {hadith.grades.length > 0 && (
                <ul className="grades" aria-label="Gradings">
                    {hadith.grades.map((g, i) => (
                        <li key={i}><strong>{g.grade}</strong> — {g.name}</li>
                    ))}
                </ul>
            )}
            {hadith.reference && (
                <p className="reference">Book {hadith.reference.book}, Hadith {hadith.reference.hadith}</p>
            )}
            <style jsx>{`
                .hadith-card {
                    background: var(--card-bg);
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    border-left: 3px solid var(--gold-primary);
                    border-radius: 12px;
                    padding: 1.4rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    scroll-margin-top: 1.5rem;
                }
                .hadith-card.highlighted {
                    border-color: var(--gold-primary);
                    box-shadow: 0 0 0 1px var(--gold-primary), 0 6px 24px rgba(212, 175, 55, 0.18);
                }
                .hadith-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
                .hadith-actions { display: flex; gap: 0.5rem; align-items: center; }
                .hadith-number { font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; color: var(--gold-primary); font-weight: 600; }
                .copy-btn {
                    background: transparent; border: 1px solid var(--emerald-medium); color: var(--emerald-light);
                    border-radius: 4px; padding: 0.35rem 0.8rem; font-size: 0.7rem; text-transform: uppercase;
                    letter-spacing: 0.5px; cursor: pointer; font-family: inherit;
                }
                .copy-btn:hover { border-color: var(--gold-primary); color: var(--gold-primary); }
                .copy-btn:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .hadith-arabic {
                    font-family: var(--font-amiri), 'Amiri', serif;
                    font-size: 1.45rem;
                    line-height: 2;
                    text-align: right;
                    color: var(--white);
                }
                .hadith-text { color: rgba(255, 255, 255, 0.88); font-size: 1rem; line-height: 1.75; white-space: pre-line; }
                .hadith-text[dir='rtl'] { font-family: var(--font-amiri), 'Noto Nastaliq Urdu', serif; font-size: 1.15rem; line-height: 2.1; }
                .grades { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; }
                .grades li {
                    font-size: 0.75rem; color: rgba(255, 255, 255, 0.7);
                    background: rgba(4, 57, 39, 0.35); border: 1px solid rgba(22, 125, 79, 0.5);
                    border-radius: 20px; padding: 0.2rem 0.7rem;
                }
                .grades strong { color: var(--gold-primary); font-weight: 600; }
                .reference { font-size: 0.75rem; color: rgba(255, 255, 255, 0.45); }
                @media (max-width: 600px) {
                    .hadith-card { padding: 1.1rem 1.1rem; }
                    .hadith-arabic { font-size: 1.3rem; }
                }
            `}</style>
        </article>
    );
};

const BookView: React.FC<{ collection: HadithCollection; bookId: number; target?: number }> = ({ collection, bookId, target }) => {
    const book = collection.books.find(b => b.id === bookId)!;
    const bookIndex = collection.books.indexOf(book);
    const prev = collection.books[bookIndex - 1];
    const next = collection.books[bookIndex + 1];

    // This view only renders on the client (it sits under useSearchParams),
    // so reading localStorage in the initialiser is safe.
    const [language, setLanguage] = useState<HadithLanguage>(readSavedLanguage);
    const [result, setResult] = useState<{ key: string; hadiths?: Hadith[]; error?: string } | null>(null);
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(PAGE_SIZE);
    const [showArabic, setShowArabic] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const listRef = React.useRef<HTMLDivElement>(null);

    const requestKey = `${language}:${reloadKey}`;
    const current = result?.key === requestKey ? result : null;
    const hadiths = current?.hadiths ?? null;
    const error = current?.error ?? '';

    const changeLanguage = (lang: HadithLanguage) => {
        setLanguage(lang);
        try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage unavailable */ }
    };

    useEffect(() => {
        let cancelled = false;
        fetchHadithBook(collection, bookId, language)
            .then(list => { if (!cancelled) setResult({ key: requestKey, hadiths: list }); })
            .catch(() => { if (!cancelled) setResult({ key: requestKey, error: 'Could not load these hadith. Check your connection and try again.' }); });
        return () => { cancelled = true; };
    }, [collection, bookId, language, requestKey]);

    const filtered = useMemo(() => {
        if (!hadiths) return [];
        const q = query.trim().toLowerCase();
        if (!q) return hadiths;
        return hadiths.filter(h => h.text.toLowerCase().includes(q) || h.arabic.includes(query.trim()) || String(h.number) === q);
    }, [hadiths, query]);

    // A hadith opened by number is always rendered, even past the first page.
    const targetIndex = !query && hadiths && target !== undefined ? hadiths.findIndex(h => h.number === target) : -1;
    const shown = Math.max(limit, targetIndex + 1);

    useEffect(() => {
        if (targetIndex < 0) return;
        requestAnimationFrame(() => {
            // Scoped to this list: Next keeps previous pages mounted (hidden),
            // so a document-wide id lookup could find a stale copy.
            listRef.current?.querySelector(`#hadith-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }, [targetIndex, target]);

    const rtl = language === 'urd';

    return (
        <>
            <div className="book-heading">
                <Link href={hadithHref(collection.id)} className="collection-link">{collection.name}</Link>
                <h2 className="font-display">{book.title}</h2>
                <p className="meta">Book {book.id} · Hadith {book.first}–{book.last}</p>
            </div>

            <div className="toolbar">
                <input
                    type="search"
                    className="book-search"
                    placeholder="Search in this book…"
                    aria-label="Search in this book"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
                />
                <select
                    className="lang-select"
                    aria-label="Translation language"
                    value={collection.languages.includes(language) ? language : 'eng'}
                    onChange={e => changeLanguage(e.target.value as HadithLanguage)}
                >
                    {collection.languages.map(l => <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>)}
                </select>
                <button type="button" className="toggle-arabic" aria-pressed={showArabic} onClick={() => setShowArabic(v => !v)}>
                    {showArabic ? 'Hide Arabic' : 'Show Arabic'}
                </button>
            </div>

            {error && (
                <div className="state">
                    <p>{error}</p>
                    <button type="button" className="retry" onClick={() => setReloadKey(k => k + 1)}>Try again</button>
                </div>
            )}
            {!error && !hadiths && (
                <div className="state"><div className="loader" /><p>Loading hadith…</p></div>
            )}

            {hadiths && (
                <>
                    {query && <p className="result-count">{filtered.length} matching hadith</p>}
                    <div className="hadith-list" ref={listRef}>
                        {filtered.slice(0, shown).map(h => (
                            <HadithCard key={h.number} hadith={h} collection={collection} highlighted={h.number === target} showArabic={showArabic} rtl={rtl} />
                        ))}
                    </div>
                    {filtered.length > shown && (
                        <button type="button" className="show-more" onClick={() => setLimit(shown + PAGE_SIZE)}>
                            Show more ({filtered.length - shown} remaining)
                        </button>
                    )}
                </>
            )}

            <nav className="book-nav" aria-label="Book navigation">
                {prev ? <Link href={hadithHref(collection.id, prev.id)} className="nav-btn">← {prev.title}</Link> : <span />}
                {next ? <Link href={hadithHref(collection.id, next.id)} className="nav-btn next">{next.title} →</Link> : <span />}
            </nav>

            <style jsx>{`
                .book-heading { text-align: center; margin-bottom: 1.5rem; }
                :global(.collection-link) { color: var(--emerald-light); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; }
                :global(.collection-link:hover) { color: var(--gold-primary); }
                h2 { font-size: 1.5rem; color: var(--white); margin: 0.3rem 0; }
                .meta { color: rgba(255, 255, 255, 0.55); font-size: 0.85rem; }
                .toolbar { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.5rem; }
                .book-search {
                    flex: 1; min-width: 200px;
                    background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white); padding: 0.65rem 0.9rem; border-radius: 10px;
                    font-family: inherit; font-size: 0.9rem; outline: none;
                }
                .book-search:focus { border-color: var(--gold-primary); }
                .lang-select, .toggle-arabic {
                    background: rgba(4, 57, 39, 0.35); border: 1px solid rgba(212, 175, 55, 0.35);
                    color: var(--gold-primary); padding: 0.6rem 0.9rem; border-radius: 10px;
                    font-family: inherit; font-size: 0.85rem; cursor: pointer;
                }
                .lang-select option { background: #101a15; color: var(--off-white); }
                .lang-select:focus-visible, .toggle-arabic:focus-visible, .show-more:focus-visible, .retry:focus-visible {
                    outline: 2px solid var(--gold-primary); outline-offset: 2px;
                }
                .state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 0; color: var(--gold-primary); text-align: center; }
                .loader {
                    width: 40px; height: 40px; border: 4px solid var(--emerald-medium); border-bottom-color: var(--gold-primary);
                    border-radius: 50%; animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .retry, .show-more {
                    background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary);
                    border-radius: 30px; padding: 0.7rem 1.6rem; font-family: inherit; font-weight: 600; cursor: pointer;
                }
                .show-more { display: block; margin: 1.5rem auto 0; }
                .retry:hover, .show-more:hover { background: rgba(212, 175, 55, 0.1); }
                .result-count { color: var(--emerald-light); font-size: 0.85rem; margin-bottom: 1rem; }
                .hadith-list { display: flex; flex-direction: column; gap: 1.25rem; }
                .book-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2.5rem; }
                :global(.nav-btn) {
                    max-width: 48%; color: var(--emerald-light); font-size: 0.85rem;
                    border: 1px solid rgba(22, 125, 79, 0.5); border-radius: 20px; padding: 0.55rem 1rem;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                :global(.nav-btn:hover) { color: var(--gold-primary); border-color: var(--gold-primary); }
                :global(.nav-btn.next) { margin-left: auto; }
            `}</style>
        </>
    );
};

function HadithBrowser() {
    const params = useSearchParams();
    const collection = getCollection(params.get('c'));
    const bookParam = params.get('b');
    const numberParam = params.get('n');
    const bookId = bookParam !== null && /^\d{1,4}$/.test(bookParam) ? parseInt(bookParam, 10) : undefined;
    const target = numberParam !== null && /^\d{1,5}$/.test(numberParam) ? parseInt(numberParam, 10) : undefined;
    const validBook = collection && bookId !== undefined && collection.books.some(b => b.id === bookId);

    // Single-book collections (the Forty Hadith) open straight to their hadith.
    const effectiveBook = validBook ? bookId : collection && collection.books.length === 1 ? collection.books[0].id : undefined;

    const backHref = collection && effectiveBook !== undefined && collection.books.length > 1 ? hadithHref(collection.id) : collection ? '/hadith' : '/';
    const backLabel = collection && effectiveBook !== undefined && collection.books.length > 1 ? `← ${collection.name}` : collection ? '← All Collections' : '← Retreat to Home';

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href={backHref} className="back-link">{backLabel}</Link>
                </header>

                {!collection && (
                    <>
                        <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                            <div className="title-area">
                                <h1 className="gold-text font-display">Hadith</h1>
                                <p className="subtitle">Sayings of the Prophet ﷺ</p>
                            </div>
                        </OrnateFrame>
                        <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2.5rem' }} />
                    </>
                )}

                {!collection && <CollectionsView />}
                {collection && effectiveBook === undefined && <BooksView collection={collection} />}
                {collection && effectiveBook !== undefined && (
                    <BookView key={`${collection.id}-${effectiveBook}`} collection={collection} bookId={effectiveBook} target={target} />
                )}
            </main>

            <style jsx>{`
                .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
                .main-content { max-width: 900px; width: 100%; }
                .page-header { margin-bottom: 2rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; transition: color 0.3s; }
                :global(.back-link:hover) { color: var(--gold-primary); }
                .title-area { text-align: center; }
                h1 { font-size: 2.5rem; margin-bottom: 0.3rem; }
                .subtitle { font-size: 1rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
                @media (max-width: 768px) {
                    .container { padding: 1.25rem; }
                    h1 { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
}

export default function HadithPage() {
    return (
        <Suspense fallback={null}>
            <HadithBrowser />
        </Suspense>
    );
}
