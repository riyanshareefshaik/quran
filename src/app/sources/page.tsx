'use client';

import React from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';

interface SourceEntry {
    name: string;
    used: boolean;
    purpose: string;
    endpoint: string;
    auth: string;
    note?: string;
}

const SOURCES: SourceEntry[] = [
    {
        name: 'Quran.com Content API (Quran Foundation)',
        used: true,
        purpose: 'Surah text (Uthmani script), translations, chapter/verse metadata, and audio recitation URLs.',
        endpoint: 'api.quran.com/api/v4',
        auth: 'Public, no API key required',
        note: 'This is the legacy public endpoint. Quran Foundation has since introduced an OAuth2-secured successor API; this app still uses the legacy endpoint, which remains active.',
    },
    {
        name: 'AlAdhan Prayer Times API',
        used: true,
        purpose: 'Prayer times, Qibla direction, and the Islamic (Hijri) calendar.',
        endpoint: 'api.aladhan.com/v1',
        auth: 'Public, no API key required',
    },
    {
        name: 'Text-to-Speech Proxy',
        used: true,
        purpose: 'Spoken translation playback for verses. Requests are routed through this app\u2019s own rate-limited server endpoint before reaching a third-party TTS provider.',
        endpoint: '/api/tts (this app\u2019s own server)',
        auth: 'Rate-limited (20 requests/minute per device)',
    },
    {
        name: 'AlQuran Cloud API',
        used: false,
        purpose: 'Ayah lookup, multiple text editions, juz/ruku/hizb/manzil divisions, and full-text search.',
        endpoint: 'api.alquran.cloud/v1',
        auth: 'Public, no API key required',
        note: 'Documented here for transparency, but not currently used by any feature in this app.',
    },
];

export default function SourcesPage() {
    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Sources &amp; Security</h1>
                        <p className="subtitle">Where this app&apos;s data comes from</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 3rem' }} />

                <section className="intro">
                    <p>
                        Every piece of Quranic text, translation, and prayer data in this app comes from a
                        named, publicly documented source below. Nothing is generated, paraphrased, or
                        altered by AI. This page is kept in sync with the app&apos;s actual code.
                    </p>
                </section>

                <div className="sources-list">
                    {SOURCES.map((s) => (
                        <div key={s.name} className="source-card glass-card">
                            <div className="source-header">
                                <h3 className="font-display">{s.name}</h3>
                                <span className={`status-pill ${s.used ? 'active' : 'inactive'}`}>
                                    {s.used ? 'In Use' : 'Not Currently Used'}
                                </span>
                            </div>
                            <p className="source-purpose">{s.purpose}</p>
                            <div className="source-meta">
                                <div>
                                    <span className="meta-label">Endpoint</span>
                                    <code>{s.endpoint}</code>
                                </div>
                                <div>
                                    <span className="meta-label">Authentication</span>
                                    <span>{s.auth}</span>
                                </div>
                            </div>
                            {s.note && <p className="source-note">{s.note}</p>}
                        </div>
                    ))}
                </div>

                <section className="security-note glass-card">
                    <h3 className="gold-text font-display">On Security</h3>
                    <p>
                        This app does not require an account, does not collect personal data beyond what&apos;s
                        needed for on-device features (like your device&apos;s location, used only to calculate
                        prayer times and Qibla direction, which never leaves your device), and does not sell or
                        share data with third parties. All network requests use HTTPS.
                    </p>
                </section>
            </main>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                }

                .main-content {
                    width: 100%;
                    max-width: 900px;
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

                .intro {
                    max-width: 640px;
                    margin: 0 auto 2.5rem;
                    text-align: center;
                }

                .intro p {
                    color: var(--emerald-light);
                    line-height: 1.7;
                }

                .sources-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    margin-bottom: 2.5rem;
                }

                .source-card {
                    padding: 1.75rem;
                }

                .source-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-bottom: 0.75rem;
                }

                .source-header h3 {
                    color: var(--off-white);
                    font-size: 1.15rem;
                    font-weight: 600;
                }

                .status-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    flex-shrink: 0;
                }

                .status-pill.active {
                    background: rgba(22, 125, 79, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }

                .status-pill.inactive {
                    background: rgba(150, 150, 150, 0.1);
                    color: #999;
                    border: 1px solid rgba(150, 150, 150, 0.25);
                }

                .source-purpose {
                    color: var(--emerald-light);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .source-meta {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                    padding-top: 0.9rem;
                    border-top: 1px solid var(--glass-border);
                }

                .meta-label {
                    display: block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: rgba(212, 175, 55, 0.7);
                    margin-bottom: 0.25rem;
                }

                .source-meta code {
                    color: var(--gold-primary);
                    font-size: 0.85rem;
                }

                .source-note {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--glass-border);
                    font-size: 0.85rem;
                    color: rgba(212, 175, 55, 0.8);
                    font-style: italic;
                    line-height: 1.6;
                }

                .security-note {
                    padding: 2rem;
                    text-align: center;
                }

                .security-note h3 {
                    margin-bottom: 1rem;
                    font-size: 1.3rem;
                }

                .security-note p {
                    color: var(--emerald-light);
                    line-height: 1.7;
                    max-width: 640px;
                    margin: 0 auto;
                }

                @media (max-width: 640px) {
                    .container {
                        padding: 1.25rem;
                    }
                    h1 {
                        font-size: 1.9rem;
                    }
                    .source-meta {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
