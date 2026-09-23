'use client';

import React from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';

export interface LegalSection {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
}

const LegalPage: React.FC<{ title: string; subtitle: string; effective: string; intro: string; sections: LegalSection[] }> = ({ title, subtitle, effective, intro, sections }) => (
    <div className="container">
        <main className="main-content">
            <header className="page-header">
                <Link href="/" className="back-link">← Retreat to Home</Link>
            </header>

            <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                <div className="title-area">
                    <h1 className="gold-text font-display">{title}</h1>
                    <p className="subtitle">{subtitle}</p>
                </div>
            </OrnateFrame>
            <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2rem' }} />

            <p className="effective">Effective {effective}</p>
            <p className="intro">{intro}</p>

            <nav className="toc" aria-label="Contents">
                <ol>
                    {sections.map((s, i) => <li key={s.title}><a href={`#s${i + 1}`}>{s.title}</a></li>)}
                </ol>
            </nav>

            {sections.map((s, i) => (
                <section key={s.title} id={`s${i + 1}`} className="legal-section">
                    <h2>{i + 1}. {s.title}</h2>
                    {s.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
                    {s.bullets && <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
                </section>
            ))}

            <p className="footer-links">
                <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms</Link> · <Link href="/feedback">Contact us</Link> · <Link href="/sources">Sources</Link>
            </p>
        </main>

        <style jsx>{`
            .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
            .main-content { max-width: 760px; width: 100%; }
            .page-header { margin-bottom: 2rem; }
            :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
            :global(.back-link:hover) { color: var(--gold-primary); }
            .title-area { text-align: center; }
            h1 { font-size: 2.3rem; margin-bottom: 0.3rem; }
            .subtitle { font-size: 0.95rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
            .effective { font-size: 0.8rem; color: var(--gold-primary); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.75rem; }
            .intro { color: rgba(255, 255, 255, 0.85); line-height: 1.75; margin-bottom: 1.5rem; }
            .toc { background: var(--card-bg); border: 1px solid rgba(212, 175, 55, 0.18); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem; }
            .toc ol { padding-left: 1.2rem; columns: 2; column-gap: 2rem; font-size: 0.88rem; }
            .toc li { margin-bottom: 0.3rem; break-inside: avoid; }
            .toc a { color: var(--emerald-light); }
            .toc a:hover { color: var(--gold-primary); }
            .legal-section { margin-bottom: 1.75rem; scroll-margin-top: 1.5rem; }
            h2 { font-size: 1.1rem; color: var(--white); margin-bottom: 0.6rem; }
            .legal-section p, .legal-section li { color: rgba(255, 255, 255, 0.8); line-height: 1.75; font-size: 0.95rem; }
            .legal-section p + p { margin-top: 0.6rem; }
            .legal-section ul { padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
            .footer-links { margin-top: 2.5rem; text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.5); }
            .footer-links :global(a) { color: var(--emerald-light); }
            @media (max-width: 640px) {
                .container { padding: 1.25rem; }
                h1 { font-size: 1.9rem; }
                .toc ol { columns: 1; }
            }
        `}</style>
    </div>
);

export default LegalPage;
