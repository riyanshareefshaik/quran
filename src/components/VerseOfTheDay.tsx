'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { cleanTranslation, fetchChapterInfo, fetchVerseByKey, Verse } from '@/lib/quran-api';
import { useAudio } from '@/context/AudioContext';
import Icon from '@/components/Icon';

// A hand-picked cycle of well-known verses that read clearly on their own.
// Each key was checked against Quran.com.
const VERSES = [
    '2:152', '2:153', '2:186', '2:201', '2:255', '2:286', '3:8', '3:139', '3:159', '3:173',
    '3:190', '7:23', '7:156', '9:51', '10:62', '11:88', '12:87', '13:28', '14:7', '16:97',
    '16:128', '17:23', '17:80', '18:10', '20:25', '20:114', '21:87', '24:35', '25:63', '25:74',
    '29:69', '33:41', '33:56', '39:10', '39:53', '40:60', '49:10', '49:13', '50:16', '55:13',
    '57:4', '59:22', '64:11', '65:3', '67:2', '93:5', '94:5', '94:6', '112:1',
];

/** Same verse for everyone on a given local date; changes at midnight. */
function todaysKey(): string {
    const now = new Date();
    const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
    return VERSES[dayNumber % VERSES.length];
}

const subscribe = () => () => {};

const VerseOfTheDay: React.FC = () => {
    // The date is only known in the browser, so render after hydration.
    const isClient = useSyncExternalStore(subscribe, () => true, () => false);
    const key = isClient ? todaysKey() : null;
    const [data, setData] = useState<{ key: string; verse: Verse | null; surah: string } | null>(null);
    const { playAyah } = useAudio();

    useEffect(() => {
        if (!key) return;
        let cancelled = false;
        const chapterId = Number(key.split(':')[0]);
        Promise.all([fetchVerseByKey(key), fetchChapterInfo(chapterId)]).then(([verse, chapter]) => {
            if (!cancelled) setData({ key, verse, surah: chapter?.name_complex ?? `Surah ${chapterId}` });
        });
        return () => { cancelled = true; };
    }, [key]);

    if (!key || !data || data.key !== key || !data.verse) return null;
    const { verse, surah } = data;
    const [chapterId, ayah] = key.split(':');
    const translation = cleanTranslation(verse.translations?.[0]?.text ?? '');

    const share = async () => {
        const text = `${verse.text_uthmani}\n\n“${translation}”\n— Quran ${key} (${surah})`;
        try {
            if (navigator.share) await navigator.share({ text });
            else await navigator.clipboard.writeText(text);
        } catch { /* cancelled */ }
    };

    return (
        <section className="votd glass-card" aria-labelledby="votd-title">
            <div className="votd-head">
                <h2 id="votd-title">Verse of the Day</h2>
                <span className="votd-ref">{surah} · {key}</span>
            </div>
            <p className="votd-arabic amiri-text" dir="rtl" lang="ar">{verse.text_uthmani}</p>
            <p className="votd-translation">“{translation}”</p>
            <div className="votd-actions">
                <button type="button" className="votd-btn primary" onClick={() => playAyah(key, Number(chapterId), surah)}><Icon name="play" size={14} /> Listen</button>
                <Link href={`/surah/${chapterId}`} className="votd-btn">Read in context</Link>
                <button type="button" className="votd-btn" onClick={share}>Share</button>
            </div>
            <p className="votd-note">Ayah {ayah} · Saheeh International translation</p>

            <style jsx>{`
                .votd { display: flex; flex-direction: column; gap: 0.9rem; padding: 1.5rem !important; margin-bottom: 2rem; border-color: rgba(212, 175, 55, 0.35); }
                .votd:hover { transform: none; }
                .votd-head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
                h2 { margin: 0; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; color: var(--gold-primary); }
                .votd-ref { font-size: 0.8rem; color: var(--emerald-light); }
                .votd-arabic { font-family: var(--font-amiri), 'Amiri', serif; font-size: 1.9rem; line-height: 2; text-align: right; color: var(--white); margin: 0; }
                .votd-translation { font-size: 1.02rem; line-height: 1.7; color: rgba(255, 255, 255, 0.88); margin: 0; }
                .votd-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .votd-btn, .votd-actions :global(.votd-btn) {
                    font-family: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; border-radius: 20px;
                    padding: 0.5rem 1rem; border: 1px solid rgba(212, 175, 55, 0.4); background: transparent; color: var(--gold-primary);
                }
                .votd-btn.primary { background: var(--gold-primary); color: var(--matte-black); border-color: var(--gold-primary); }
                .votd-btn:hover, .votd-actions :global(.votd-btn:hover) { border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.12); }
                .votd-btn.primary:hover { background: var(--gold-secondary); }
                .votd-btn:focus-visible, .votd-actions :global(.votd-btn:focus-visible) { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .votd-note { margin: 0; font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); }
                @media (max-width: 600px) { .votd-arabic { font-size: 1.5rem; } }
            `}</style>
        </section>
    );
};

export default VerseOfTheDay;
