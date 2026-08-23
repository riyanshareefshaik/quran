import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchChapters, Chapter } from '@/lib/quran-api';

interface SearchResult {
    verse_key: string;
    text: string;
    translations?: { text: string }[];
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
    const [searchError, setSearchError] = useState<string | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        // Load chapter names once, lazily, only when the modal is first
        // opened — used to resolve "2" -> "Al-Baqarah" for the number-jump
        // shortcut below, without an extra request on every keystroke.
        if (isOpen && chapters.length === 0) {
            fetchChapters().then(setChapters).catch(() => {});
        }
    }, [isOpen, chapters.length]);

    // A query that's purely a number 1-114 means the person wants to jump
    // straight to that surah, not search verse text for the digit itself.
    const trimmedQuery = query.trim();
    const surahNumberMatch = /^\d{1,3}$/.test(trimmedQuery) ? parseInt(trimmedQuery, 10) : null;
    const jumpTarget =
        surahNumberMatch && surahNumberMatch >= 1 && surahNumberMatch <= 114
            ? { id: surahNumberMatch, chapter: chapters.find((c) => c.id === surahNumberMatch) }
            : null;

    // Debounced Search using Quran.com V4 basic Search API
    useEffect(() => {
        const fetchResults = async () => {
            // Pure-number queries are handled by the jump shortcut above,
            // not sent to the verse-text search API.
            if (query.trim().length < 3 || jumpTarget) {
                setResults([]);
                setSearchError(null);
                return;
            }

            setIsSearching(true);
            setSearchError(null);
            try {
                const res = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=20`);
                if (!res.ok) {
                    throw new Error(`Search API returned ${res.status}`);
                }
                const data = await res.json();
                setResults(data.search?.results || []);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
                setSearchError('Search is temporarily unavailable. Please try again shortly.');
            }
            setIsSearching(false);
        };

        const timeoutId = setTimeout(fetchResults, 500);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="search-modal-overlay" onClick={onClose}>
            <div className="search-modal glass-card" onClick={e => e.stopPropagation()}>
                <div className="search-header">
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search verses, translations, or type a Surah number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="search-filters">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`filter-btn ${filter === 'meccan' ? 'active' : ''}`} onClick={() => setFilter('meccan')}>Meccan</button>
                    <button className={`filter-btn ${filter === 'medinan' ? 'active' : ''}`} onClick={() => setFilter('medinan')}>Medinan</button>
                </div>

                <div className="search-results custom-scrollbar">
                    {jumpTarget ? (
                        <Link href={`/surah/${jumpTarget.id}`} className="jump-item" onClick={onClose}>
                            <div className="jump-number">{jumpTarget.id}</div>
                            <div className="jump-info">
                                <div className="jump-title">
                                    {jumpTarget.chapter ? jumpTarget.chapter.name_complex : `Surah ${jumpTarget.id}`}
                                </div>
                                <div className="jump-sub">
                                    {jumpTarget.chapter
                                        ? `${jumpTarget.chapter.translated_name.name} · ${jumpTarget.chapter.verses_count} Ayahs`
                                        : 'Jump to this Surah'}
                                </div>
                            </div>
                            {jumpTarget.chapter && (
                                <div className="jump-arabic amiri-text">{jumpTarget.chapter.name_arabic}</div>
                            )}
                        </Link>
                    ) : isSearching ? (
                        <div className="search-status">Searching divine texts...</div>
                    ) : searchError ? (
                        <div className="search-status error">{searchError}</div>
                    ) : results.length > 0 ? (
                        results.map((res, i) => (
                            <Link href={`/surah/${res.verse_key.split(':')[0]}#${res.verse_key}`} key={i} className="result-item" onClick={onClose}>
                                <div className="res-meta gold-text">{res.verse_key}</div>
                                <div className="res-text amiri-text">{res.text}</div>
                                {res.translations && res.translations[0] && (
                                    <div className="res-trans">{res.translations[0].text.replace(/<[^>]*>?/gm, '')}</div>
                                )}
                            </Link>
                        ))
                    ) : query.trim().length >= 3 ? (
                        <div className="search-status">No verses found.</div>
                    ) : (
                        <div className="search-suggestions">
                            <span className="suggestion-label">Suggested:</span>
                            <div className="suggestion-tags">
                                <button onClick={() => setQuery('Mercy')}>Mercy</button>
                                <button onClick={() => setQuery('Patience')}>Patience</button>
                                <button onClick={() => setQuery('Ayat Al-Kursi')}>Ayat Al-Kursi</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .search-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 10vh;
                }

                .search-modal {
                    width: 90%;
                    max-width: 600px;
                    background: rgba(10, 20, 15, 0.95);
                    border: 1px solid var(--emerald-medium);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .search-header {
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--off-white);
                    font-size: 1.2rem;
                    outline: none;
                }
                
                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--emerald-light);
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0.5rem;
                    min-width: 44px;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .search-filters {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    background: rgba(4, 57, 39, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .filter-btn {
                    background: transparent;
                    border: 1px solid var(--emerald-medium);
                    color: var(--emerald-light);
                    padding: 0.6rem 1.1rem;
                    min-height: 44px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: var(--gold-primary);
                    color: var(--matte-black);
                    border-color: var(--gold-primary);
                }

                .search-results {
                    max-height: 50vh;
                    overflow-y: auto;
                    padding: 1rem 0;
                }

                .search-status {
                    text-align: center;
                    padding: 3rem;
                    color: var(--emerald-light);
                    font-style: italic;
                }

                .search-status.error {
                    color: #e0a04a;
                    font-style: normal;
                }

                :global(.jump-item) {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    margin: 0.5rem 1rem;
                    text-decoration: none;
                    background: rgba(212, 175, 55, 0.08);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 10px;
                    transition: background 0.2s;
                }

                :global(.jump-item:hover) {
                    background: rgba(212, 175, 55, 0.15);
                }

                .jump-number {
                    width: 40px;
                    height: 40px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: var(--gold-primary);
                    color: var(--matte-black);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .jump-info {
                    flex: 1;
                }

                .jump-title {
                    color: var(--off-white);
                    font-weight: 600;
                }

                .jump-sub {
                    font-size: 0.8rem;
                    color: var(--emerald-light);
                }

                .jump-arabic {
                    font-size: 1.4rem;
                    color: var(--gold-primary);
                }

                :global(.result-item) {
                    display: block;
                    padding: 1.2rem 1.5rem;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    transition: background 0.2s;
                }

                :global(.result-item:hover) {
                    background: rgba(212, 175, 55, 0.05);
                }

                .res-meta {
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .res-text {
                    font-size: 1.6rem;
                    color: var(--off-white);
                    text-align: right;
                    margin-bottom: 0.5rem;
                }

                .res-trans {
                    font-size: 0.9rem;
                    color: var(--emerald-light);
                    line-height: 1.5;
                }

                .search-suggestions {
                    padding: 2rem 1.5rem;
                }

                .suggestion-label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--emerald-light);
                    margin-bottom: 1rem;
                }

                .suggestion-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.8rem;
                }

                .suggestion-tags button {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--off-white);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .suggestion-tags button:hover {
                    background: rgba(212, 175, 55, 0.15);
                    border-color: var(--gold-primary);
                    color: var(--gold-primary);
                }
            `}</style>
        </div>
    );
};

export default SearchModal;
