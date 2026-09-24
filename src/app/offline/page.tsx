'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import { fetchChapterInfo, fetchChapters, fetchVersesByChapter, isSurahSaved, SURAH_VERSE_COUNTS } from '@/lib/quran-api';
import { cacheDelete, cacheKeys } from '@/lib/offline-store';

const TRANSLATION_ID = 20; // Saheeh International — the app's default translation
const ALL = Array.from({ length: 114 }, (_, i) => i + 1);

export default function OfflinePage() {
    const [saved, setSaved] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [failed, setFailed] = useState(0);
    const [usage, setUsage] = useState<string | null>(null);
    const [reload, setReload] = useState(0);
    const stopRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const flags = await Promise.all(ALL.map(id => isSurahSaved(id, TRANSLATION_ID)));
            if (cancelled) return;
            setSaved(flags.filter(Boolean).length);
            if (navigator.storage?.estimate) {
                const { usage: bytes } = await navigator.storage.estimate();
                if (!cancelled && bytes) setUsage(`${(bytes / (1024 * 1024)).toFixed(1)} MB used on this device`);
            }
        })();
        return () => { cancelled = true; };
    }, [reload]);

    const downloadAll = async () => {
        stopRef.current = false;
        setRunning(true);
        setFailed(0);
        setProgress(0);
        await fetchChapters(); // surah list, for the Quran index offline
        let done = 0;
        let errors = 0;
        const queue = [...ALL];
        const worker = async () => {
            while (queue.length && !stopRef.current) {
                const id = queue.shift()!;
                const [verses, info] = await Promise.all([
                    fetchVersesByChapter(id, { translationId: TRANSLATION_ID, perPage: SURAH_VERSE_COUNTS[id - 1] }),
                    fetchChapterInfo(id),
                ]);
                if (verses.length !== SURAH_VERSE_COUNTS[id - 1] || !info) errors++;
                done++;
                setProgress(done);
                setFailed(errors);
            }
        };
        await Promise.all([worker(), worker(), worker()]);
        setRunning(false);
        setReload(r => r + 1);
    };

    const removeAll = async () => {
        if (!window.confirm('Remove all saved surahs from this device? You can download them again any time.')) return;
        const keys = [...await cacheKeys('verses:'), ...await cacheKeys('chapter:'), ...await cacheKeys('tafsir:'), ...await cacheKeys('verse:')];
        await Promise.all(keys.map(cacheDelete));
        setReload(r => r + 1);
    };

    const complete = saved === 114;

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/surahs" className="back-link">← Quran</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Read Offline</h1>
                        <p className="subtitle">Keep the Quran with you without internet</p>
                    </div>
                </OrnateFrame>
                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2rem' }} />

                <section className="panel">
                    <div className="status">
                        <span className="count">{saved === null ? '…' : saved}<small>/114</small></span>
                        <span className="label">surahs saved on this device</span>
                    </div>
                    <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={114} aria-valuenow={running ? progress : saved ?? 0}>
                        <div className="fill" style={{ width: `${((running ? progress : saved ?? 0) / 114) * 100}%` }} />
                    </div>

                    {running ? (
                        <>
                            <p className="muted">Saving surah {Math.min(progress + 1, 114)} of 114… You can keep using the app.</p>
                            <button type="button" className="secondary" onClick={() => { stopRef.current = true; }}>Stop</button>
                        </>
                    ) : (
                        <>
                            <p className="muted">
                                {complete
                                    ? 'The whole Quran is saved: Arabic text (Uthmani script), the Saheeh International English translation and surah details.'
                                    : 'Save the full Arabic text with the Saheeh International English translation. It takes about a minute on Wi-Fi.'}
                            </p>
                            <div className="actions">
                                <button type="button" className="primary" onClick={downloadAll}>{complete ? 'Update saved surahs' : saved ? 'Save the remaining surahs' : 'Save all 114 surahs'}</button>
                                {!!saved && <button type="button" className="secondary" onClick={removeAll}>Remove from device</button>}
                            </div>
                            {failed > 0 && <p className="error">{failed} surah(s) could not be saved. Check your connection and try again.</p>}
                        </>
                    )}
                    {usage && <p className="muted small">{usage}</p>}
                </section>

                <section className="notes">
                    <h2>Good to know</h2>
                    <ul>
                        <li>Every surah you open is also saved automatically, in the translation you are reading.</li>
                        <li>Tafsir passages and the verse of the day you have viewed are saved too.</li>
                        <li>In the Android app, saved surahs open with no connection at all. On the website, the page itself must already be open (or loaded once) before you go offline.</li>
                        <li>Recitation audio needs an internet connection.</li>
                        <li>Saved text stays on this device only. Clearing your browser or app data removes it.</li>
                    </ul>
                </section>
            </main>

            <style jsx>{`
                .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
                .main-content { max-width: 640px; width: 100%; }
                .page-header { margin-bottom: 2rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                .title-area { text-align: center; }
                h1 { font-size: 2.3rem; margin-bottom: 0.3rem; }
                .subtitle { font-size: 0.95rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
                .panel, .notes { background: var(--card-bg); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .notes { margin-top: 1.25rem; }
                .status { display: flex; align-items: baseline; gap: 0.75rem; }
                .count { font-size: 2.4rem; font-weight: 700; color: var(--gold-primary); line-height: 1; }
                .count small { font-size: 1rem; color: rgba(255, 255, 255, 0.5); margin-left: 0.2rem; }
                .label { color: rgba(255, 255, 255, 0.75); }
                .bar { height: 8px; border-radius: 4px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
                .fill { height: 100%; background: linear-gradient(90deg, var(--gold-primary), var(--gold-secondary)); transition: width 0.3s; }
                .muted { color: rgba(255, 255, 255, 0.7); font-size: 0.92rem; margin: 0; }
                .small { font-size: 0.78rem; color: rgba(255, 255, 255, 0.45); }
                .error { color: #e6a5a5; font-size: 0.88rem; margin: 0; }
                .actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
                .primary, .secondary { border-radius: 30px; padding: 0.75rem 1.5rem; font-family: inherit; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
                .primary { background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: var(--matte-black); border: none; }
                .secondary { background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary); align-self: flex-start; }
                .primary:focus-visible, .secondary:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                h2 { font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; color: var(--gold-primary); margin: 0; }
                ul { padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; color: rgba(255, 255, 255, 0.8); font-size: 0.92rem; }
                @media (max-width: 640px) { .container { padding: 1.25rem; } h1 { font-size: 1.9rem; } }
            `}</style>
        </div>
    );
}
