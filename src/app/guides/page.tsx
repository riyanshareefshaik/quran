'use client';

import React from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import { GUIDES, GUIDE_ORDER, GUIDE_DISCLAIMER } from '@/lib/guides';

export default function GuidesPage() {
    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Guidance</h1>
                        <p className="subtitle">Shahada · Ramadan · Umrah · Hajj</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 3rem' }} />

                <div className="guide-grid">
                    {GUIDE_ORDER.map(slug => {
                        const guide = GUIDES[slug];
                        return (
                            <Link key={slug} href={`/guides/${slug}`} className="guide-card glass-card">
                                <span className="guide-arabic amiri-text" lang="ar">{guide.arabicTitle}</span>
                                <span className="guide-title font-display">{guide.title}</span>
                                <span className="guide-subtitle">{guide.subtitle}</span>
                                <span className="guide-meta">{guide.sections.length} sections · with Quran &amp; hadith references →</span>
                            </Link>
                        );
                    })}
                </div>

                <aside className="disclaimer" role="note">{GUIDE_DISCLAIMER}</aside>
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
                .guide-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }
                :global(.guide-card) {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 0.4rem;
                    padding: 2rem 1.5rem !important;
                }
                :global(.guide-card:focus-visible) {
                    outline: 2px solid var(--gold-primary);
                    outline-offset: 3px;
                }
                .guide-arabic {
                    font-family: var(--font-amiri), 'Amiri', serif;
                    font-size: 2.2rem;
                    color: var(--gold-primary);
                    line-height: 1.6;
                }
                .guide-title {
                    font-size: 1.5rem;
                    color: var(--white);
                    font-weight: 600;
                }
                .guide-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.92rem;
                }
                .guide-meta {
                    margin-top: 0.8rem;
                    font-size: 0.75rem;
                    color: var(--emerald-light);
                    letter-spacing: 0.5px;
                }
                .disclaimer {
                    margin: 2.5rem 0 1rem;
                    padding: 1.2rem 1.4rem;
                    border: 1px solid rgba(22, 125, 79, 0.5);
                    border-radius: 10px;
                    background: rgba(4, 57, 39, 0.2);
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 0.88rem;
                    line-height: 1.6;
                }
                @media (max-width: 768px) {
                    .container { padding: 1.25rem; }
                    h1 { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
}
