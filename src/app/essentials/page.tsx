'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import ReportIssueButton from '@/components/ReportIssueButton';
import { ESSENTIALS, ESSENTIAL_CATEGORIES, EssentialCategory } from '@/lib/essentials';

export default function EssentialsPage() {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [category, setCategory] = useState<EssentialCategory | 'all'>('all');
    const [query, setQuery] = useState('');

    const toggleItem = (id: string) => {
        setSelectedItem(current => (current === id ? null : id));
    };

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return ESSENTIALS.filter(item =>
            (category === 'all' || item.category === category) &&
            (!q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.arabicTitle.includes(query.trim()))
        );
    }, [category, query]);

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Islamic Essentials</h1>
                        <p className="subtitle">Durood, Adhkar &amp; Daily Duas</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2rem' }} />

                <div className="filters">
                    <input
                        type="search"
                        className="essentials-search"
                        placeholder="Search duas, e.g. durood, sleep, travel…"
                        aria-label="Search essentials"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="category-chips" role="group" aria-label="Filter by category">
                        {[{ id: 'all' as const, label: 'All', short: 'All' }, ...ESSENTIAL_CATEGORIES].map(c => (
                            <button
                                key={c.id}
                                type="button"
                                className={`category-chip ${category === c.id ? 'active' : ''}`}
                                aria-pressed={category === c.id}
                                title={c.label}
                                onClick={() => setCategory(c.id)}
                            >
                                {c.short}
                                <span className="chip-count">{c.id === 'all' ? ESSENTIALS.length : ESSENTIALS.filter(i => i.category === c.id).length}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="essentials-list">
                    {visible.length === 0 && <p className="empty">Nothing matches your search.</p>}
                    {ESSENTIAL_CATEGORIES.filter(c => visible.some(i => i.category === c.id)).map(cat => (
                        <section key={cat.id} className="category-group" aria-label={cat.label}>
                            <h2 className="group-heading">{cat.label}</h2>
                            {visible.filter(i => i.category === cat.id).map((item) => {
                                const isOpen = selectedItem === item.id;
                                return (
                                <div
                                    key={item.id}
                                    className={`glass-card essential-card ${isOpen ? 'expanded' : ''}`}
                                >
                                    <button
                                        type="button"
                                        className="essential-header"
                                        onClick={() => toggleItem(item.id)}
                                        aria-expanded={isOpen}
                                    >
                                        <span className="essential-title-group">
                                            <span className="essential-title font-display">{item.title}</span>
                                            <span className="essential-meta">{item.content.length > 1 ? `${item.content.length} parts · ` : ''}{item.source.split(/[·(]/)[0].trim()}</span>
                                        </span>
                                        <span className="essential-arabic amiri-text" lang="ar" dir="rtl">{item.arabicTitle}</span>
                                        <span className="expand-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                                    </button>
                                    {isOpen && (
                                        <div className="essential-body">
                                            <div className="essential-description">
                                                <p>{item.description}</p>
                                                <p className="essential-source">Source: {item.source}</p>
                                                <div className="essential-links">
                                                    {item.verseKey && (
                                                        <Link href={`/surah/${item.verseKey.split(':')[0]}`} className="context-link">
                                                            View in Quran →
                                                        </Link>
                                                    )}
                                                    <ReportIssueButton contentType="essential" contentRef={item.title} label="Report a mistake" />
                                                </div>
                                            </div>

                                            <div className="essential-segments">
                                                {item.content.map((segment, index) => (
                                                    <div key={index} className="essential-segment">
                                                        {segment.note && <span className="segment-note">{segment.note}</span>}
                                                        <p className="arabic-segment amiri-text" dir="rtl" lang="ar">{segment.arabic}</p>

                                                        {segment.transliteration && (
                                                            <div className="transliteration-box">
                                                                <span className="label">Pronunciation:</span>
                                                                <p className="transliteration-text">{segment.transliteration}</p>
                                                            </div>
                                                        )}

                                                        <div className="translation-box">
                                                            <span className="label">Meaning:</span>
                                                            <p className="translation-text">{segment.translation}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </section>
                    ))}
                </div>
            </main>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .main-content {
                    max-width: 900px;
                    width: 100%;
                }

                .page-header {
                    margin-bottom: 2rem;
                    text-align: left;
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

                .essentials-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .essential-card {
                    padding: 0;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .essential-card.expanded {
                    border-color: var(--gold-primary);
                    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
                }

                .filters {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .essentials-search {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white);
                    padding: 0.8rem 1rem;
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    outline: none;
                }

                .essentials-search:focus {
                    border-color: var(--gold-primary);
                }

                .category-chips {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                    padding-bottom: 2px;
                    -webkit-mask-image: linear-gradient(90deg, #000 92%, transparent);
                    mask-image: linear-gradient(90deg, #000 92%, transparent);
                }

                .category-chips::-webkit-scrollbar {
                    display: none;
                }

                .chip-count {
                    margin-left: 0.45rem;
                    font-size: 0.7rem;
                    opacity: 0.7;
                    font-variant-numeric: tabular-nums;
                }

                .category-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .category-group + .category-group {
                    margin-top: 1.25rem;
                }

                .group-heading {
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--gold-primary);
                    margin: 0 0 0.1rem 0.25rem;
                }

                .category-chip {
                    font-family: inherit;
                    font-size: 0.8rem;
                    color: var(--emerald-light);
                    background: rgba(4, 57, 39, 0.25);
                    border: 1px solid rgba(22, 125, 79, 0.5);
                    border-radius: 20px;
                    padding: 0.45rem 1rem;
                    min-height: 34px;
                    white-space: nowrap;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .category-chip:hover {
                    color: var(--gold-primary);
                    border-color: var(--gold-primary);
                }

                .category-chip.active {
                    background: var(--gold-primary);
                    border-color: var(--gold-primary);
                    color: var(--matte-black);
                    font-weight: 600;
                }

                .category-chip:focus-visible,
                .essential-header:focus-visible {
                    outline: 2px solid var(--gold-primary);
                    outline-offset: 2px;
                }

                .empty {
                    text-align: center;
                    color: var(--emerald-light);
                    padding: 2rem 0;
                }

                .essential-source {
                    margin-top: 0.6rem;
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.55);
                }

                .essential-links {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 0.8rem;
                }

                .segment-note {
                    align-self: flex-start;
                    font-size: 0.72rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--gold-primary);
                    border: 1px solid rgba(212, 175, 55, 0.4);
                    border-radius: 20px;
                    padding: 0.2rem 0.7rem;
                }

                .essential-header {
                    width: 100%;
                    border: none;
                    color: inherit;
                    font-family: inherit;
                    text-align: left;
                    padding: 1.1rem 1.5rem;
                    cursor: pointer;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto 32px;
                    align-items: center;
                    gap: 1.25rem;
                    background: transparent;
                }

                .essential-card:not(.expanded) .essential-header:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .essential-title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    min-width: 0;
                }

                .essential-title {
                    font-size: 1.15rem;
                    color: var(--white);
                    font-weight: 600;
                    line-height: 1.3;
                }

                .essential-meta {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .essential-arabic {
                    font-family: var(--font-amiri), 'Amiri', serif;
                    font-size: 1.6rem;
                    line-height: 1.6;
                    color: var(--gold-primary);
                    text-align: right;
                    white-space: nowrap;
                }

                .essential-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                :global(.context-link) {
                    font-size: 0.85rem;
                    color: var(--emerald-light);
                    padding: 0.4rem 0.8rem;
                    border: 1px solid var(--emerald-medium);
                    border-radius: 20px;
                    transition: all 0.3s;
                }

                :global(.context-link:hover) {
                    background: var(--gold-primary);
                    color: var(--matte-black);
                    border-color: var(--gold-primary);
                }

                .expand-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    color: var(--gold-primary);
                    transition: background 0.2s, border-color 0.2s;
                }

                .essential-card.expanded .expand-icon,
                .essential-header:hover .expand-icon {
                    background: rgba(212, 175, 55, 0.12);
                    border-color: var(--gold-primary);
                }

                .essential-body {
                    padding: 0 2rem 2rem 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    animation: slideDown 0.4s ease-out;
                }

                .essential-description {
                    padding: 1.5rem 0;
                    color: var(--emerald-light);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .essential-segments {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    margin-top: 2rem;
                }

                .essential-segment {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .arabic-segment {
                    font-size: 2.2rem;
                    line-height: 2;
                    text-align: right;
                    color: var(--white);
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }

                .transliteration-box, .translation-box {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 1.2rem;
                    border-radius: 8px;
                    border-left: 2px solid var(--emerald-medium);
                }

                .translation-box {
                    border-left-color: var(--gold-primary);
                    background: rgba(212, 175, 55, 0.03);
                }

                .label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                    opacity: 0.6;
                }

                .transliteration-text {
                    font-size: 0.95rem;
                    font-style: italic;
                    color: #A0AEC0;
                    line-height: 1.5;
                }

                .translation-text {
                    font-size: 1.05rem;
                    color: var(--off-white);
                    line-height: 1.6;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .essential-header {
                        padding: 1rem 1.1rem;
                        grid-template-columns: minmax(0, 1fr) 32px;
                        grid-template-areas: 'title icon' 'arabic arabic';
                        row-gap: 0.4rem;
                    }
                    .essential-title-group { grid-area: title; }
                    .essential-title { font-size: 1rem; }
                    .expand-icon { grid-area: icon; }
                    .essential-body {
                        padding: 0 1.25rem 1.5rem;
                    }
                    .arabic-segment {
                        font-size: 1.7rem;
                    }
                    .essential-arabic {
                        grid-area: arabic;
                        font-size: 1.4rem;
                        white-space: normal;
                    }
                }
            `}</style>
        </div>
    );
}
