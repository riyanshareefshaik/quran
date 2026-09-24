'use client';

import React from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import LibraryPanel from '@/components/LibraryPanel';

export default function LibraryPage() {
    return (
        <div className="container">
            <main className="main-content lib">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">My Library</h1>
                        <p className="subtitle">Your notes, favorites and reading</p>
                    </div>
                </OrnateFrame>
                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2rem' }} />

                <LibraryPanel />

                <p className="muted small center note">
                    Everything here is saved only on this device — no account needed. Tap “Save” on any ayah while reading to add a favorite or a note.
                </p>
            </main>

            <style jsx global>{`
                .lib .card {
                    background: var(--card-bg); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px;
                    padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem;
                }
                .lib .muted { color: rgba(255, 255, 255, 0.65); font-size: 0.9rem; margin: 0; }
                .lib .small { font-size: 0.78rem; }
                .lib .center { text-align: center; }
                .lib .note { margin-top: 1.5rem; }
                .lib .name-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .lib .name-row input {
                    flex: 1; min-width: 140px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white); border-radius: 10px; padding: 0.65rem 0.85rem; font-family: inherit; font-size: 0.95rem;
                }
                .lib .name-row input:focus { outline: none; border-color: var(--gold-primary); }
                .lib .secondary {
                    background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary);
                    border-radius: 30px; padding: 0.6rem 1.3rem; font-family: inherit; font-weight: 700; cursor: pointer; font-size: 0.88rem;
                }
                .lib .secondary:disabled { opacity: 0.45; cursor: not-allowed; }
                .lib .link { background: none; border: none; color: var(--emerald-light); cursor: pointer; font-family: inherit; font-size: 0.85rem; padding: 0; text-align: left; }
                .lib .link strong { color: var(--white); }
                .lib .error { color: #e6a5a5; font-size: 0.88rem; margin: 0; }
                .lib button:focus-visible, .lib a:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
            <style jsx>{`
                .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
                .main-content { max-width: 640px; width: 100%; }
                .page-header { margin-bottom: 2rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                .title-area { text-align: center; }
                h1 { font-size: 2.3rem; margin-bottom: 0.3rem; }
                .subtitle { font-size: 0.95rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
                @media (max-width: 640px) { .container { padding: 1.25rem; } h1 { font-size: 1.9rem; } }
            `}</style>
        </div>
    );
}
