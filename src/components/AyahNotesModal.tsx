'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { getNote, saveNote, deleteNote, NOTE_MAX_LENGTH } from '@/lib/notes';
import { toggleFavorite, isAyahSaved } from '@/lib/collections';

interface AyahNotesModalProps {
    verse: {
        verseKey: string;
        chapterId: number;
        surahName: string;
        ayahNumber: number;
    };
    onClose: () => void;
}

/** Save an ayah to Favorites and write a personal note on it (kept on this device). */
const AyahNotesModal: React.FC<AyahNotesModalProps> = ({ verse, onClose }) => {
    const [loaded, setLoaded] = useState(false);
    const [note, setNote] = useState('');
    const [savedNote, setSavedNote] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [favBusy, setFavBusy] = useState(false);
    const [noteState, setNoteState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [existingNote, saved] = await Promise.all([getNote(verse.verseKey), isAyahSaved(verse.verseKey)]);
            if (cancelled) return;
            setNote(existingNote?.body ?? '');
            setSavedNote(existingNote?.body ?? '');
            setIsFavorite(saved);
            setLoaded(true);
        })();
        return () => { cancelled = true; };
    }, [verse.verseKey]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleToggleFavorite = async () => {
        if (favBusy) return;
        setFavBusy(true);
        setError('');
        const { saved, error: err } = await toggleFavorite(verse.verseKey, verse.chapterId);
        setIsFavorite(saved);
        if (err) setError(err);
        setFavBusy(false);
    };

    const handleSaveNote = async (e: React.FormEvent) => {
        e.preventDefault();
        setNoteState('saving');
        setError('');
        const { error: err } = await saveNote(verse.verseKey, verse.chapterId, note);
        if (err) { setNoteState('error'); setError(err); return; }
        setSavedNote(note.trim());
        setNoteState('saved');
    };

    const handleDeleteNote = async () => {
        setNoteState('saving');
        setError('');
        const { error: err } = await deleteNote(verse.verseKey);
        if (err) { setNoteState('error'); setError(err); return; }
        setNote('');
        setSavedNote('');
        setNoteState('idle');
    };

    return createPortal(
        <div className="notes-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="notes-dialog" role="dialog" aria-modal="true" aria-labelledby="notes-title">
                <div className="notes-head">
                    <div>
                        <h2 id="notes-title">Save &amp; Note</h2>
                        <p className="notes-ref">{verse.surahName} · Ayah {verse.ayahNumber}</p>
                    </div>
                    <button type="button" className="notes-close" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </div>

                {!loaded ? (
                    <p className="notes-loading">Loading…</p>
                ) : (
                    <>
                        <button
                            type="button"
                            className={`notes-fav-btn ${isFavorite ? 'active' : ''}`}
                            onClick={handleToggleFavorite}
                            disabled={favBusy}
                            aria-pressed={isFavorite}
                        >
                            <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
                            {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                        </button>

                        <form onSubmit={handleSaveNote}>
                            <label htmlFor="ayah-note">Your note</label>
                            <textarea
                                id="ayah-note"
                                value={note}
                                onChange={e => { setNote(e.target.value); setNoteState('idle'); }}
                                maxLength={NOTE_MAX_LENGTH}
                                rows={5}
                                placeholder="Reflections, reminders, a khutbah point…"
                            />
                            <span className="notes-count">{note.length}/{NOTE_MAX_LENGTH}</span>
                            {error && <p className="notes-error" role="alert">{error}</p>}
                            <div className="notes-actions">
                                {savedNote && (
                                    <button type="button" className="notes-secondary" onClick={handleDeleteNote} disabled={noteState === 'saving'}>
                                        Delete note
                                    </button>
                                )}
                                <button type="submit" className="notes-primary" disabled={noteState === 'saving' || note.trim() === savedNote}>
                                    {noteState === 'saving' ? 'Saving…' : noteState === 'saved' ? 'Saved ✓' : 'Save note'}
                                </button>
                            </div>
                        </form>
                        <p className="notes-footnote">
                            Saved on this device. See all your notes and favorites in <Link href="/library" onClick={onClose}>My Library</Link>.
                        </p>
                    </>
                )}
            </div>

            <style jsx>{`
                .notes-overlay {
                    position: fixed; inset: 0; z-index: 1200; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center; padding: 1rem;
                }
                .notes-dialog {
                    width: 100%; max-width: 440px; background: #101a15; border: 1px solid var(--gold-primary);
                    border-radius: 14px; padding: 1.5rem; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
                    display: flex; flex-direction: column; gap: 1rem;
                }
                .notes-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
                .notes-head h2 { margin: 0; font-size: 1.05rem; color: var(--gold-primary); }
                .notes-ref { margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--emerald-light); }
                .notes-close { background: none; border: none; color: var(--emerald-light); cursor: pointer; padding: 0.25rem; flex-shrink: 0; }
                .notes-close:hover { color: var(--gold-primary); }
                .notes-close:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .notes-footnote { margin: 0; font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); }
                .notes-footnote :global(a) { color: var(--gold-primary); }
                .notes-loading { color: rgba(255, 255, 255, 0.6); margin: 0; }
                .notes-fav-btn {
                    display: flex; align-items: center; gap: 0.6rem; background: rgba(212, 175, 55, 0.08);
                    border: 1px solid rgba(212, 175, 55, 0.35); color: var(--gold-primary); border-radius: 10px;
                    padding: 0.7rem 1rem; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer;
                }
                .notes-fav-btn span { font-size: 1.2rem; }
                .notes-fav-btn.active { background: rgba(212, 175, 55, 0.22); }
                .notes-fav-btn:disabled { opacity: 0.6; cursor: default; }
                .notes-fav-btn:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                form { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); }
                textarea {
                    width: 100%; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white); border-radius: 8px; padding: 0.7rem; font-family: inherit; font-size: 0.92rem; resize: vertical;
                }
                textarea:focus { outline: none; border-color: var(--gold-primary); }
                .notes-count { align-self: flex-end; font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); }
                .notes-error { color: #e6a5a5; font-size: 0.85rem; margin: 0; }
                .notes-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
                .notes-primary, .notes-secondary {
                    border-radius: 20px; padding: 0.55rem 1.2rem; font-family: inherit; font-weight: 600; font-size: 0.85rem; cursor: pointer;
                    text-decoration: none; display: inline-flex; align-items: center;
                }
                .notes-primary { background: var(--gold-primary); color: var(--matte-black); border: none; }
                .notes-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .notes-secondary { background: transparent; color: var(--emerald-light); border: 1px solid var(--emerald-medium); }
                .notes-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
                .notes-primary:focus-visible, .notes-secondary:focus-visible { outline: 2px solid var(--gold-secondary); outline-offset: 2px; }
            `}</style>
        </div>,
        document.body
    );
};

export default AyahNotesModal;
