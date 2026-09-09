'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchChapters, Chapter } from '@/lib/quran-api';
import { useBookmarks } from '@/context/BookmarkContext';
import SurahList from '@/components/SurahList';
import SearchModal from '@/components/SearchModal';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';

export default function SurahsPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
    const { bookmarks } = useBookmarks();

    useEffect(() => {
        async function loadChapters() {
            const data = await fetchChapters();
            setChapters(data);
            setLoading(false);
        }
        loadChapters();
    }, []);

    const bookmarkedIds = new Set(bookmarks.map((b) => b.chapterId));

    const filteredChapters = chapters
        .filter(
            (chapter: Chapter) =>
                chapter.name_complex.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.translated_name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.id.toString().includes(searchTerm)
        )
        .filter((chapter: Chapter) => !bookmarkedOnly || bookmarkedIds.has(chapter.id));

    return (
        <div className="container">
            <main className="main-content">

                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                    <button
                        className="global-search-trigger glass-card"
                        onClick={() => setShowSearchModal(true)}
                    >
                        <span className="search-icon">🔍</span> Advanced Search
                    </button>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Sacred Chapters</h1>
                        <p className="subtitle">The complete revelation</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 3rem' }} />

                <section className="content-section">
                    <div className="filter-container">
                        <input
                            type="text"
                            placeholder="Quick filter Surahs by name or number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input glass-card"
                        />
                        <button
                            className={`bookmark-filter-btn ${bookmarkedOnly ? 'active' : ''}`}
                            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                            aria-pressed={bookmarkedOnly}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarkedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />
                            </svg>
                            {bookmarkedOnly ? 'Showing Bookmarks' : `Bookmarked${bookmarks.length ? ` (${bookmarks.length})` : ''}`}
                        </button>
                    </div>

                    {bookmarkedOnly && filteredChapters.length === 0 && (
                        <p className="empty-bookmarks-note">
                            No bookmarked Surahs yet — tap the bookmark icon on any Surah card to save it here.
                        </p>
                    )}

                    {loading ? (
                        <div className="loading-container">
                            <div className="loader"></div>
                            <p>Fetching the Sacred Script...</p>
                        </div>
                    ) : (
                        <SurahList chapters={filteredChapters} />
                    )}
                </section>

                <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

                <footer>
                    <div className="authenticity-badge">
                        <span className="badge-icon">✓</span>
                        Text verified from official Quran API
                    </div>
                </footer>
            </main>

            <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }

        .main-content {
          max-width: var(--container-max-width);
          width: 100%;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        :global(.back-link) {
            color: var(--emerald-light);
            font-size: 0.9rem;
            transition: color 0.3s;
        }

        :global(.back-link:hover) {
            color: var(--gold-primary);
        }

        .title-area {
            text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.3rem;
        }

        .subtitle {
          font-size: 1rem;
          color: var(--emerald-light);
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .global-search-trigger {
            padding: 0.8rem 1.2rem;
            font-size: 0.9rem;
            border-radius: 30px;
            background: rgba(4, 57, 39, 0.4);
            border: 1px solid var(--emerald-medium);
            color: var(--gold-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .global-search-trigger:hover {
            background: var(--gold-primary);
            color: var(--matte-black);
        }

        .content-section {
          min-height: 400px;
        }

        .filter-container {
            margin-bottom: 1.5rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .bookmark-filter-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            border: 1px solid var(--emerald-medium);
            color: var(--emerald-light);
            padding: 0.5rem 1.1rem;
            min-height: 40px;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .bookmark-filter-btn:hover {
            border-color: var(--gold-primary);
            color: var(--gold-primary);
        }

        .bookmark-filter-btn.active {
            background: rgba(212, 175, 55, 0.12);
            border-color: var(--gold-primary);
            color: var(--gold-primary);
        }

        .empty-bookmarks-note {
            text-align: center;
            color: var(--emerald-light);
            padding: 2rem;
            font-style: italic;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--white);
          outline: none;
          transition: all 0.3s ease;
          text-align: center;
        }

        .search-input:focus {
          border-color: var(--gold-primary);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
          background: rgba(255, 255, 255, 0.07);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: var(--gold-primary);
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid var(--emerald-medium);
          border-bottom-color: var(--gold-primary);
          border-radius: 50%;
          display: inline-block;
          animation: rotation 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        footer {
          margin-top: 6rem;
          padding: 3rem 0;
          text-align: center;
        }

        .authenticity-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.8rem;
          background: rgba(4, 57, 39, 0.4);
          border: 1px solid var(--emerald-medium);
          border-radius: 30px;
          font-size: 0.8rem;
          color: var(--emerald-light);
        }

        .badge-icon {
          margin-right: 0.4rem;
          color: var(--gold-primary);
        }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                gap: 1.5rem;
                padding-top: 1rem;
            }
        }
      `}</style>
        </div>
    );
}
