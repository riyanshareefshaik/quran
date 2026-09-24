'use client';

import React, { useSyncExternalStore } from 'react';
import { useAudio } from '@/context/AudioContext';
import { getReciter } from '@/lib/quran-api';

const subscribe = () => () => {};

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/** "Continue listening" card: resumes the last surah or verse where it stopped. */
const ContinueListening: React.FC = () => {
    // The saved session lives in this browser only, so render after hydration.
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);
    const { lastSession, resumeListening, audioUrl } = useAudio();
    if (!isClient || !lastSession || audioUrl) return null;

    const where = lastSession.verseKey
        ? `Ayah ${lastSession.verseKey.split(':')[1]}`
        : lastSession.time > 5 ? `at ${formatTime(lastSession.time)}` : 'from the start';

    return (
        <button type="button" className="continue-card glass-card" onClick={resumeListening}>
            <span className="continue-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="continue-text">
                <span className="continue-label">Continue listening</span>
                <span className="continue-title">{lastSession.surahName} · {where}</span>
                <span className="continue-meta">{getReciter(lastSession.reciterId).name}</span>
            </span>
            <style jsx>{`
                .continue-card {
                    width: 100%; display: flex; align-items: center; gap: 1rem; text-align: left; cursor: pointer;
                    font-family: inherit; color: inherit; padding: 1rem 1.25rem !important; margin-bottom: 1.25rem;
                }
                .continue-card:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .continue-icon {
                    width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    background: var(--gold-primary); color: var(--matte-black);
                }
                .continue-text { display: flex; flex-direction: column; min-width: 0; }
                .continue-label { font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--emerald-light); }
                .continue-title { font-size: 1rem; color: var(--white); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .continue-meta { font-size: 0.8rem; color: rgba(255, 255, 255, 0.55); }
            `}</style>
        </button>
    );
};

export default ContinueListening;
