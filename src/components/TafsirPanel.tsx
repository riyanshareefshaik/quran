'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SafeHtml from '@/components/SafeHtml';
import { fetchTafsir, TafsirResult, TAFSIRS } from '@/lib/quran-api';

const TAFSIR_KEY = 'tafsir_id';
const RTL_LANGUAGES = new Set(['Arabic', 'Urdu']);

function readSavedTafsir(): number {
    try {
        const saved = Number(localStorage.getItem(TAFSIR_KEY));
        if (TAFSIRS.some(t => t.id === saved)) return saved;
    } catch { /* storage unavailable */ }
    return TAFSIRS[0].id;
}

const LANGUAGES = [...new Set(TAFSIRS.map(t => t.language))];

/** Commentary (tafsir) for one verse, in a dialog. */
const TafsirPanel: React.FC<{ verseKey: string; surahName: string; onClose: () => void }> = ({ verseKey, surahName, onClose }) => {
    const [tafsirId, setTafsirId] = useState<number>(readSavedTafsir);
    const [result, setResult] = useState<{ key: string; data: TafsirResult | null } | null>(null);
    const requestKey = `${tafsirId}:${verseKey}`;
    const current = result?.key === requestKey ? result : null;
    const tafsir = TAFSIRS.find(t => t.id === tafsirId) ?? TAFSIRS[0];

    useEffect(() => {
        let cancelled = false;
        fetchTafsir(tafsirId, verseKey).then(data => { if (!cancelled) setResult({ key: `${tafsirId}:${verseKey}`, data }); });
        return () => { cancelled = true; };
    }, [tafsirId, verseKey]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
    }, [onClose]);

    const choose = (id: number) => {
        setTafsirId(id);
        try { localStorage.setItem(TAFSIR_KEY, String(id)); } catch { /* storage unavailable */ }
    };

    const covered = current?.data?.verses ?? [];
    const coversOthers = covered.length > 1;

    return createPortal(
        <div className="tafsir-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="tafsir-dialog" role="dialog" aria-modal="true" aria-labelledby="tafsir-title">
                <header className="tafsir-head">
                    <div>
                        <p className="tafsir-kicker">Tafsir</p>
                        <h2 id="tafsir-title">{surahName} · {verseKey}</h2>
                    </div>
                    <button type="button" className="tafsir-close" onClick={onClose} aria-label="Close tafsir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </header>

                <select className="tafsir-select" aria-label="Choose a tafsir" value={tafsirId} onChange={e => choose(Number(e.target.value))}>
                    {LANGUAGES.map(lang => (
                        <optgroup key={lang} label={lang}>
                            {TAFSIRS.filter(t => t.language === lang).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </optgroup>
                    ))}
                </select>

                <div className="tafsir-body" dir={RTL_LANGUAGES.has(tafsir.language) ? 'rtl' : 'ltr'} lang={tafsir.language === 'Arabic' ? 'ar' : undefined}>
                    {!current && <p className="tafsir-state">Loading commentary…</p>}
                    {current && !current.data && <p className="tafsir-state">Could not load this tafsir. Check your connection, or choose another tafsir.</p>}
                    {current?.data && !current.data.html.trim() && (
                        <p className="tafsir-state">This tafsir has no separate commentary for {verseKey}; it is usually explained together with a nearby verse. Try the previous verse, or another tafsir.</p>
                    )}
                    {current?.data && current.data.html.trim() && (
                        <>
                            {coversOthers && <p className="tafsir-note" dir="ltr">This commentary covers verses {covered[0]}–{covered[covered.length - 1]}.</p>}
                            <SafeHtml html={current.data.html} className="tafsir-text" />
                        </>
                    )}
                </div>
                <p className="tafsir-source">{tafsir.name} ({tafsir.language}) · via Quran.com</p>
            </div>

            <style jsx global>{`
                .tafsir-overlay {
                    position: fixed; inset: 0; z-index: 1300; background: rgba(0, 0, 0, 0.72); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center; padding: 1rem;
                }
                .tafsir-dialog {
                    width: 100%; max-width: 720px; max-height: calc(100vh - 2rem); display: flex; flex-direction: column; gap: 0.85rem;
                    background: #101a15; border: 1px solid var(--gold-primary); border-radius: 16px; padding: 1.25rem 1.4rem;
                    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
                }
                .tafsir-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
                .tafsir-kicker { margin: 0; font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--emerald-light); }
                .tafsir-dialog h2 { margin: 0.15rem 0 0; font-size: 1.1rem; color: var(--gold-primary); }
                .tafsir-close { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; border: none; background: none; color: var(--emerald-light); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .tafsir-close:hover { color: var(--gold-primary); background: rgba(212, 175, 55, 0.1); }
                .tafsir-select {
                    background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.35); color: var(--off-white);
                    border-radius: 10px; padding: 0.6rem 0.8rem; font-family: inherit; font-size: 0.9rem;
                }
                .tafsir-select option, .tafsir-select optgroup { background: #101a15; }
                .tafsir-body { overflow-y: auto; padding-right: 0.25rem; }
                .tafsir-state { color: rgba(255, 255, 255, 0.65); font-size: 0.92rem; }
                .tafsir-note { font-size: 0.8rem; color: var(--emerald-light); margin: 0 0 0.75rem; }
                .tafsir-text { color: rgba(255, 255, 255, 0.88); font-size: 1rem; line-height: 1.8; }
                .tafsir-text p { margin: 0 0 0.9rem; }
                .tafsir-text h3, .tafsir-text h4 { color: var(--gold-primary); font-size: 1.02rem; margin: 1.25rem 0 0.5rem; }
                .tafsir-text h3:first-child, .tafsir-text h4:first-child { margin-top: 0; }
                .tafsir-text ul, .tafsir-text ol { padding-inline-start: 1.25rem; margin: 0 0 0.9rem; }
                .tafsir-text blockquote { border-inline-start: 2px solid var(--gold-primary); padding-inline-start: 0.9rem; margin: 0 0 0.9rem; }
                .tafsir-body[dir='rtl'] .tafsir-text { font-family: var(--font-amiri), 'Amiri', serif; font-size: 1.2rem; line-height: 2.1; }
                .tafsir-source { margin: 0; font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); }
                .tafsir-close:focus-visible, .tafsir-select:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
        </div>,
        document.body
    );
};

export default TafsirPanel;
