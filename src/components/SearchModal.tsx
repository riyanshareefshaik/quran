import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced Search using Quran.com V4 basic Search API
    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 3) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Simplified mock logic. In a real scenario, use api.quran.com/v4/search
                // Fetching from Quran.com search API requires specific language params.
                const res = await fetch(`https://api.quran.com/v4/search?q=${encodeURIComponent(query)}&size=20`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.search?.results || []);
                }
            } catch (error) {
                console.error("Search failed", error);
            }
            setIsSearching(false);
        };

        const timeoutId = setTimeout(fetchResults, 500);
        return () => clearTimeout(timeoutId);
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
                        placeholder="Search verses, translations, or Surahs..."
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
                    {isSearching ? (
                        <div className="search-status">Searching divine texts...</div>
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
                    padding: 0 0.5rem;
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
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
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

                .result-item {
                    display: block;
                    padding: 1.2rem 1.5rem;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    transition: background 0.2s;
                }

                .result-item:hover {
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
