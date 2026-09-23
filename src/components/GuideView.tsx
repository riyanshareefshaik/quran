'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import ReportIssueButton from '@/components/ReportIssueButton';
import { Guide, GuideDua, GUIDE_DISCLAIMER } from '@/lib/guides';

const DuaCard: React.FC<{ dua: GuideDua }> = ({ dua }) => (
    <div className="dua-card">
        <h4 className="dua-title">{dua.title}</h4>
        <p className="dua-arabic amiri-text" dir="rtl" lang="ar">{dua.arabic}</p>
        <p className="dua-translit">{dua.transliteration}</p>
        <p className="dua-translation">{dua.translation}</p>
        <p className="dua-source">{dua.source}</p>

        <style jsx>{`
            .dua-card {
                background: rgba(212, 175, 55, 0.04);
                border: 1px solid rgba(212, 175, 55, 0.2);
                border-radius: 10px;
                padding: 1.2rem 1.4rem;
                display: flex;
                flex-direction: column;
                gap: 0.7rem;
            }
            .dua-title {
                margin: 0;
                font-size: 0.75rem;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: var(--gold-primary);
            }
            .dua-arabic {
                font-family: var(--font-amiri), 'Amiri', serif;
                font-size: 1.7rem;
                line-height: 2;
                text-align: right;
                color: var(--white);
                margin: 0;
            }
            .dua-translit {
                font-style: italic;
                color: #A0AEC0;
                font-size: 0.92rem;
                margin: 0;
            }
            .dua-translation {
                color: var(--off-white);
                font-size: 0.98rem;
                margin: 0;
            }
            .dua-source {
                font-size: 0.75rem;
                color: var(--emerald-light);
                margin: 0;
            }
            @media (max-width: 600px) {
                .dua-arabic { font-size: 1.45rem; }
            }
        `}</style>
    </div>
);

const GuideView: React.FC<{ guide: Guide }> = ({ guide }) => {
    // First section open by default; the rest expand on tap.
    const [open, setOpen] = useState<Set<string>>(() => new Set([guide.sections[0]?.id]));

    const toggle = (id: string) => {
        setOpen(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const jumpTo = (id: string) => {
        setOpen(prev => new Set(prev).add(id));
        requestAnimationFrame(() => {
            document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/guides" className="back-link">← All Guides</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <p className="arabic-title amiri-text" lang="ar">{guide.arabicTitle}</p>
                        <h1 className="gold-text font-display">{guide.title}</h1>
                        <p className="subtitle">{guide.subtitle}</p>
                    </div>
                </OrnateFrame>

                <blockquote className="key-verse">
                    <p className="key-verse-arabic amiri-text" dir="rtl" lang="ar">{guide.keyVerse.arabic}</p>
                    <p className="key-verse-translation">&ldquo;{guide.keyVerse.translation}&rdquo;</p>
                    <cite>{guide.keyVerse.reference}</cite>
                </blockquote>

                <p className="intro">{guide.intro}</p>

                <nav className="jump-nav" aria-label={`${guide.title} sections`}>
                    {guide.sections.map(section => (
                        <button key={section.id} type="button" className="jump-chip" onClick={() => jumpTo(section.id)}>
                            {section.label ? `${section.label} · ` : ''}{section.title}
                        </button>
                    ))}
                </nav>

                <OrnateDivider style={{ maxWidth: 320, margin: '1rem auto 2.5rem' }} />

                <div className="sections">
                    {guide.sections.map(section => {
                        const isOpen = open.has(section.id);
                        return (
                            <section key={section.id} id={`section-${section.id}`} className={`guide-section ${isOpen ? 'expanded' : ''}`}>
                                <button
                                    type="button"
                                    className="section-header"
                                    onClick={() => toggle(section.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`section-body-${section.id}`}
                                >
                                    <span className="section-heading">
                                        {section.label && <span className="section-label">{section.label}</span>}
                                        <span className="section-title font-display">{section.title}</span>
                                    </span>
                                    <span className="expand-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                                </button>

                                {isOpen && (
                                    <div className="section-body" id={`section-body-${section.id}`}>
                                        {section.summary && <p className="section-summary">{section.summary}</p>}

                                        {section.steps && (
                                            <ol className="steps">
                                                {section.steps.map((step, i) => (
                                                    <li key={i} className="step">
                                                        <span className="step-number" aria-hidden="true">{i + 1}</span>
                                                        <div>
                                                            <h3 className="step-title">{step.title}</h3>
                                                            <p className="step-detail">{step.detail}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}

                                        {section.duas && (
                                            <div className="duas">
                                                {section.duas.map((dua, i) => <DuaCard key={i} dua={dua} />)}
                                            </div>
                                        )}

                                        {section.notes && (
                                            <div className="notes">
                                                <h4 className="block-heading">Good to know</h4>
                                                <ul>
                                                    {section.notes.map((note, i) => <li key={i}>{note}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="section-report">
                                            <ReportIssueButton contentType="guide" contentRef={`${guide.title} — ${section.title}`} label="Report a mistake" />
                                        </div>

                                        {section.sources && (
                                            <div className="sources">
                                                <h4 className="block-heading">Evidence</h4>
                                                <ul>
                                                    {section.sources.map((src, i) => <li key={i}>{src}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>

                <aside className="disclaimer" role="note">
                    <strong>Please note:</strong> {GUIDE_DISCLAIMER}
                </aside>
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
                .arabic-title {
                    font-family: var(--font-amiri), 'Amiri', serif;
                    font-size: 2rem;
                    color: var(--gold-primary);
                    margin: 0;
                    line-height: 1.6;
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.3rem;
                }
                .subtitle {
                    font-size: 0.95rem;
                    color: var(--emerald-light);
                    font-weight: 300;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .key-verse {
                    margin: 0 0 1.75rem;
                    padding: 1.5rem;
                    border-left: 3px solid var(--gold-primary);
                    background: rgba(4, 57, 39, 0.2);
                    border-radius: 0 10px 10px 0;
                }
                .key-verse-arabic {
                    font-family: var(--font-amiri), 'Amiri', serif;
                    font-size: 1.8rem;
                    line-height: 2;
                    text-align: right;
                    color: var(--white);
                    margin: 0 0 0.75rem;
                }
                .key-verse-translation {
                    color: var(--off-white);
                    font-size: 1.02rem;
                    margin: 0 0 0.5rem;
                }
                cite {
                    font-style: normal;
                    font-size: 0.8rem;
                    color: var(--gold-primary);
                    letter-spacing: 1px;
                }
                .intro {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 1.02rem;
                    line-height: 1.75;
                    margin-bottom: 1.5rem;
                }
                .jump-nav {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .jump-chip {
                    font-family: inherit;
                    font-size: 0.78rem;
                    color: var(--emerald-light);
                    background: rgba(4, 57, 39, 0.25);
                    border: 1px solid rgba(22, 125, 79, 0.5);
                    border-radius: 20px;
                    padding: 0.4rem 0.9rem;
                    min-height: 32px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .jump-chip:hover {
                    color: var(--gold-primary);
                    border-color: var(--gold-primary);
                }
                .jump-chip:focus-visible,
                .section-header:focus-visible {
                    outline: 2px solid var(--gold-primary);
                    outline-offset: 2px;
                }
                .sections {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .guide-section {
                    background: var(--card-bg);
                    border: 1px solid rgba(212, 175, 55, 0.18);
                    border-radius: 12px;
                    overflow: hidden;
                    scroll-margin-top: 1.5rem;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .guide-section.expanded {
                    border-color: var(--gold-primary);
                    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.12);
                }
                .section-header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem 1.75rem;
                    background: transparent;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    font-family: inherit;
                    color: inherit;
                }
                .section-header:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .section-heading {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .section-label {
                    font-size: 0.72rem;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--emerald-light);
                    font-weight: 600;
                }
                .section-title {
                    font-size: 1.2rem;
                    color: var(--white);
                    font-weight: 600;
                }
                .expand-icon {
                    font-size: 1.5rem;
                    color: var(--gold-primary);
                    width: 24px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .section-body {
                    padding: 0 1.75rem 1.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    animation: slideDown 0.3s ease-out;
                }
                .section-summary {
                    margin: 1.25rem 0 0;
                    color: var(--emerald-light);
                    font-size: 0.98rem;
                }
                .steps {
                    list-style: none;
                    margin: 1.25rem 0 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1.1rem;
                }
                .step {
                    display: grid;
                    grid-template-columns: 32px 1fr;
                    gap: 1rem;
                    align-items: start;
                }
                .step-number {
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--gold-primary);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gold-primary);
                    font-weight: 700;
                    font-size: 0.85rem;
                    background: rgba(212, 175, 55, 0.05);
                }
                .step-title {
                    font-size: 1rem;
                    color: var(--white);
                    margin: 0.2rem 0 0.25rem;
                }
                .step-detail {
                    color: rgba(255, 255, 255, 0.78);
                    font-size: 0.95rem;
                    line-height: 1.65;
                    margin: 0;
                }
                .duas {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .block-heading {
                    font-size: 0.72rem;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin: 0 0 0.6rem;
                }
                .notes .block-heading {
                    color: var(--gold-primary);
                }
                .sources .block-heading {
                    color: var(--emerald-light);
                }
                .notes ul,
                .sources ul {
                    padding-left: 1.2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .notes li {
                    color: rgba(255, 255, 255, 0.82);
                    font-size: 0.93rem;
                }
                .sources {
                    padding-top: 1rem;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }
                .sources li {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.85rem;
                }
                .section-report {
                    order: 99;
                    display: flex;
                    justify-content: flex-end;
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
                .disclaimer strong {
                    color: var(--gold-primary);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    .container { padding: 1.25rem; }
                    h1 { font-size: 2rem; }
                    .section-header { padding: 1.1rem 1.2rem; }
                    .section-body { padding: 0 1.2rem 1.4rem; }
                    .key-verse-arabic { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default GuideView;
