'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAudio } from '@/context/AudioContext';
import { RECITERS, getReciter } from '@/lib/quran-api';

/** Button showing the current Qari; opens a searchable list of all reciters. */
const ReciterPicker: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const { currentReciterId, setReciter } = useAudio();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const current = getReciter(currentReciterId);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const list = useMemo(() => {
        const q = query.trim().toLowerCase();
        return RECITERS.filter(r => !q || r.name.toLowerCase().includes(q) || r.arabicName.includes(query.trim()) || (r.note ?? '').toLowerCase().includes(q));
    }, [query]);

    const choose = (id: number) => {
        setReciter(id);
        setOpen(false);
        setQuery('');
    };

    return (
        <>
            <button
                type="button"
                className={`reciter-trigger ${compact ? 'compact' : ''}`}
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-label={`Reciter: ${current.name}. Change reciter`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
                </svg>
                <span className="trigger-text">
                    {!compact && <span className="trigger-label">Qari</span>}
                    <span className="trigger-name">{current.name}{current.note === 'Mujawwad' || current.note === 'Murattal' ? ` (${current.note})` : ''}</span>
                </span>
                <span className="trigger-caret" aria-hidden="true">▾</span>
            </button>

            {open && createPortal(
                <div className="reciter-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
                    <div className="reciter-dialog" role="dialog" aria-modal="true" aria-labelledby="reciter-dialog-title">
                        <div className="reciter-dialog-head">
                            <h2 id="reciter-dialog-title">Choose a reciter</h2>
                            <button type="button" className="reciter-close" onClick={() => setOpen(false)} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                            </button>
                        </div>
                        <input
                            type="search"
                            className="reciter-search"
                            placeholder="Search reciters…"
                            aria-label="Search reciters"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                        <ul className="reciter-list" role="listbox" aria-label="Reciters">
                            {list.map(r => (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={r.id === currentReciterId}
                                        className={`reciter-option ${r.id === currentReciterId ? 'selected' : ''}`}
                                        onClick={() => choose(r.id)}
                                    >
                                        <span className="option-main">
                                            <span className="option-name">{r.name}</span>
                                            {r.note && <span className="option-note">{r.note}</span>}
                                        </span>
                                        <span className="option-arabic" lang="ar" dir="rtl">{r.arabicName}</span>
                                        {r.id === currentReciterId && <span className="option-check" aria-hidden="true">✓</span>}
                                    </button>
                                </li>
                            ))}
                            {list.length === 0 && <li className="reciter-empty">No reciters match “{query}”.</li>}
                        </ul>
                        <p className="reciter-footnote">Audio from Quran.com and the everyayah.com verse-by-verse collection.</p>
                    </div>
                </div>,
                document.body
            )}

            <style jsx>{`
                .reciter-trigger {
                    display: inline-flex; align-items: center; gap: 0.55rem;
                    background: rgba(4, 57, 39, 0.35); border: 1px solid rgba(212, 175, 55, 0.35);
                    color: var(--gold-primary); border-radius: 30px; padding: 0.45rem 0.9rem 0.45rem 0.8rem;
                    min-height: 44px; cursor: pointer; font-family: inherit; max-width: 100%;
                    transition: border-color 0.2s, background 0.2s;
                }
                .reciter-trigger:hover { border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.1); }
                .reciter-trigger:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .reciter-trigger.compact { min-height: 32px; padding: 0.3rem 0.75rem; }
                .trigger-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; min-width: 0; }
                .trigger-label { font-size: 0.62rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--emerald-light); }
                .trigger-name { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
                .compact .trigger-name { font-size: 0.78rem; max-width: 180px; }
                .trigger-caret { font-size: 0.65rem; opacity: 0.8; }
            `}</style>
            <style jsx global>{`
                .reciter-overlay {
                    position: fixed; inset: 0; z-index: 1300; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center; padding: 1rem;
                }
                .reciter-dialog {
                    width: 100%; max-width: 480px; max-height: min(640px, calc(100vh - 2rem)); display: flex; flex-direction: column; gap: 0.75rem;
                    background: #101a15; border: 1px solid var(--gold-primary); border-radius: 16px; padding: 1.25rem;
                    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
                }
                .reciter-dialog-head { display: flex; justify-content: space-between; align-items: center; }
                .reciter-dialog h2 { margin: 0; font-size: 1.05rem; color: var(--gold-primary); }
                .reciter-close { width: 36px; height: 36px; border-radius: 50%; border: none; background: none; color: var(--emerald-light); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .reciter-close:hover { color: var(--gold-primary); background: rgba(212, 175, 55, 0.1); }
                .reciter-search {
                    width: 100%; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.3); color: var(--off-white);
                    border-radius: 10px; padding: 0.65rem 0.85rem; font-family: inherit; font-size: 0.92rem;
                }
                .reciter-search:focus { outline: none; border-color: var(--gold-primary); }
                .reciter-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem; }
                .reciter-option {
                    width: 100%; display: grid; grid-template-columns: minmax(0, 1fr) auto 18px; align-items: center; gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 10px;
                    padding: 0.65rem 0.85rem; color: var(--off-white); cursor: pointer; font-family: inherit; text-align: left;
                }
                .reciter-option:hover { border-color: rgba(212, 175, 55, 0.5); background: rgba(212, 175, 55, 0.06); }
                .reciter-option.selected { border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.12); }
                .reciter-option:focus-visible, .reciter-close:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .option-main { display: flex; flex-direction: column; min-width: 0; }
                .option-name { font-size: 0.92rem; font-weight: 600; }
                .option-note { font-size: 0.72rem; color: var(--emerald-light); }
                .option-arabic { font-family: var(--font-amiri), 'Amiri', serif; font-size: 1.05rem; color: var(--gold-primary); white-space: nowrap; }
                .option-check { color: var(--gold-primary); font-weight: 700; }
                .reciter-empty { text-align: center; color: rgba(255, 255, 255, 0.5); padding: 1rem; font-size: 0.9rem; }
                .reciter-footnote { margin: 0; font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); text-align: center; }
            `}</style>
        </>
    );
};

export default ReciterPicker;
