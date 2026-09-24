'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { fetchAyahRecitation, fetchChapterInfo, fetchChapterRecitation, getReciter, nextVerseKey, RECITERS, SURAH_VERSE_COUNTS } from '@/lib/quran-api';
import { useProgress } from '@/context/ProgressContext';

interface AudioState {
    isPlaying: boolean;
    currentChapterId: number | null;
    /** Display title, e.g. "Al-Baqarah" or "Al-Baqarah - Ayah 255". */
    currentChapterName: string | null;
    /** Plain surah name, used when continuing to the next verse/surah. */
    currentSurahName: string | null;
    currentReciterId: number;
    audioUrl: string | null;
    currentTime: number;
    duration: number;
    playbackSpeed: number;
    currentVerseKey: string | null;
    /** Continue to the next verse / next surah when one finishes. */
    autoContinue: boolean;
}

/** Where the listener stopped, saved so they can resume later. */
export interface ListeningSession {
    chapterId: number;
    surahName: string;
    verseKey: string | null;
    time: number;
    reciterId: number;
    savedAt: string;
}

interface AudioContextType extends AudioState {
    playChapter: (chapterId: number, chapterName: string, startAt?: number) => Promise<void>;
    togglePlay: () => void;
    setReciter: (reciterId: number) => void;
    setSpeed: (speed: number) => void;
    seek: (time: number) => void;
    playAyah: (verseKey: string, chapterId: number, chapterName: string) => Promise<void>;
    stopPlayer: () => void;
    playNext: () => void;
    playPrevious: () => void;
    setAutoContinue: (on: boolean) => void;
    lastSession: ListeningSession | null;
    resumeListening: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const RECITER_KEY = 'quran_reciter';
const CONTINUE_KEY = 'audio_auto_continue';
const SESSION_KEY = 'last_listening';

function readSavedReciter(): number {
    if (typeof window === 'undefined') return RECITERS[0].id;
    try {
        const saved = Number(localStorage.getItem(RECITER_KEY));
        if (RECITERS.some(r => r.id === saved)) return saved;
    } catch { /* storage unavailable */ }
    return RECITERS[0].id;
}

function readAutoContinue(): boolean {
    if (typeof window === 'undefined') return true;
    try { return localStorage.getItem(CONTINUE_KEY) !== 'false'; } catch { return true; }
}

function readSession(): ListeningSession | null {
    if (typeof window === 'undefined') return null;
    try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (s && Number.isInteger(s.chapterId) && s.chapterId >= 1 && s.chapterId <= 114 && typeof s.surahName === 'string') {
            return { ...s, time: Number(s.time) || 0, verseKey: typeof s.verseKey === 'string' ? s.verseKey : null };
        }
    } catch { /* ignore */ }
    return null;
}

async function surahName(chapterId: number): Promise<string> {
    return (await fetchChapterInfo(chapterId))?.name_complex ?? `Surah ${chapterId}`;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { markAyahRead, setLastRead } = useProgress();
    const [state, setState] = useState<AudioState>(() => ({
        isPlaying: false,
        currentChapterId: null,
        currentChapterName: null,
        currentSurahName: null,
        currentReciterId: readSavedReciter(),
        audioUrl: null,
        currentTime: 0,
        duration: 0,
        playbackSpeed: 1,
        currentVerseKey: null,
        autoContinue: readAutoContinue(),
    }));
    const [lastSession, setLastSession] = useState<ListeningSession | null>(readSession);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stateRef = useRef(state);
    const lastSavedRef = useRef(0);
    // Latest handlers, so the one-time audio event listeners never go stale.
    const handlersRef = useRef<{ ended: () => void; next: () => void; previous: () => void }>({ ended: () => {}, next: () => {}, previous: () => {} });

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const saveSession = (force = false) => {
        const s = stateRef.current;
        const audio = audioRef.current;
        if (!s.currentChapterId || !s.currentSurahName || !audio) return;
        const now = Date.now();
        if (!force && now - lastSavedRef.current < 5000) return;
        lastSavedRef.current = now;
        const session: ListeningSession = {
            chapterId: s.currentChapterId,
            surahName: s.currentSurahName,
            verseKey: s.currentVerseKey,
            time: s.currentVerseKey ? 0 : Math.floor(audio.currentTime),
            reciterId: s.currentReciterId,
            savedAt: new Date().toISOString(),
        };
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* storage unavailable */ }
        setLastSession(session);
    };

    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setState(prev => ({ ...prev, currentTime: audio.currentTime }));
            saveSession();
        };
        const handleDurationChange = () => setState(prev => ({ ...prev, duration: audio.duration }));
        const handleEnded = () => handlersRef.current.ended();
        const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
        const handlePause = () => {
            setState(prev => ({ ...prev, isPlaying: false }));
            saveSession(true);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        // Lock-screen / headphone controls where the browser supports them.
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => audio.play().catch(() => {}));
            navigator.mediaSession.setActionHandler('pause', () => audio.pause());
            navigator.mediaSession.setActionHandler('nexttrack', () => handlersRef.current.next());
            navigator.mediaSession.setActionHandler('previoustrack', () => handlersRef.current.previous());
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
        };
    }, []);

    // Show what is playing on the lock screen.
    useEffect(() => {
        if (!('mediaSession' in navigator) || !state.currentChapterName) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: state.currentChapterName,
            artist: getReciter(state.currentReciterId).name,
            album: 'Nur Al-Quran',
            artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
        });
    }, [state.currentChapterName, state.currentReciterId]);

    const startAudio = async (url: string, startAt = 0) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = url;
        audio.playbackRate = stateRef.current.playbackSpeed;
        if (startAt > 0) {
            audio.addEventListener('loadedmetadata', () => { audio.currentTime = Math.min(startAt, Math.max(0, audio.duration - 1)); }, { once: true });
        }
        await audio.play().catch(e => console.warn('Playback interrupted:', e));
    };

    const playChapter = async (chapterId: number, chapterName: string, startAt = 0) => {
        try {
            const url = await fetchChapterRecitation(chapterId, stateRef.current.currentReciterId);
            if (!url) return;
            await startAudio(url, startAt);
            setState(prev => ({
                ...prev,
                currentChapterId: chapterId,
                currentChapterName: chapterName,
                currentSurahName: chapterName,
                audioUrl: url,
                isPlaying: true,
                currentVerseKey: null,
            }));
        } catch (error) {
            console.error('Error playing chapter:', error);
        }
    };

    const playAyah = async (verseKey: string, chapterId: number, chapterName: string) => {
        try {
            const url = await fetchAyahRecitation(verseKey, stateRef.current.currentReciterId);
            if (!url) return;
            await startAudio(url);
            markAyahRead(verseKey);
            setLastRead(chapterName, verseKey, chapterId);
            setState(prev => ({
                ...prev,
                currentChapterId: chapterId,
                currentChapterName: `${chapterName} - Ayah ${verseKey.split(':')[1]}`,
                currentSurahName: chapterName,
                audioUrl: url,
                isPlaying: true,
                currentVerseKey: verseKey,
            }));
        } catch (error) {
            console.error('Error playing ayah:', error);
        }
    };

    const playNext = async () => {
        const { currentVerseKey, currentChapterId, currentSurahName } = stateRef.current;
        if (currentVerseKey) {
            const next = nextVerseKey(currentVerseKey);
            if (!next) return;
            const nextChapter = Number(next.split(':')[0]);
            const name = nextChapter === currentChapterId && currentSurahName ? currentSurahName : await surahName(nextChapter);
            await playAyah(next, nextChapter, name);
        } else if (currentChapterId && currentChapterId < 114) {
            await playChapter(currentChapterId + 1, await surahName(currentChapterId + 1));
        }
    };

    const playPrevious = async () => {
        const { currentVerseKey, currentChapterId, currentSurahName } = stateRef.current;
        const audio = audioRef.current;
        // Like most players: first press restarts the track if we're a few seconds in.
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        if (currentVerseKey) {
            const [s, a] = currentVerseKey.split(':').map(Number);
            if (a > 1) await playAyah(`${s}:${a - 1}`, s, currentSurahName ?? await surahName(s));
            else if (s > 1) await playAyah(`${s - 1}:${SURAH_VERSE_COUNTS[s - 2]}`, s - 1, await surahName(s - 1));
        } else if (currentChapterId && currentChapterId > 1) {
            await playChapter(currentChapterId - 1, await surahName(currentChapterId - 1));
        }
    };

    const handleEnded = () => {
        const { autoContinue, currentVerseKey, currentChapterId } = stateRef.current;
        const hasNext = currentVerseKey ? nextVerseKey(currentVerseKey) !== null : !!currentChapterId && currentChapterId < 114;
        if (autoContinue && hasNext) {
            playNext();
        } else {
            setState(prev => ({ ...prev, isPlaying: false }));
        }
    };

    useEffect(() => {
        handlersRef.current = { ended: handleEnded, next: playNext, previous: playPrevious };
    });

    const togglePlay = () => {
        if (audioRef.current) {
            if (stateRef.current.isPlaying) audioRef.current.pause();
            else audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));
        }
    };

    const stopPlayer = () => {
        saveSession(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
        }
        setState(prev => ({
            ...prev,
            isPlaying: false,
            audioUrl: null,
            currentChapterId: null,
            currentChapterName: null,
            currentSurahName: null,
            currentVerseKey: null,
        }));
    };

    const setReciter = async (reciterId: number) => {
        try { localStorage.setItem(RECITER_KEY, String(reciterId)); } catch { /* storage unavailable */ }
        const { currentChapterId, currentVerseKey } = stateRef.current;
        setState(prev => ({ ...prev, currentReciterId: reciterId }));
        stateRef.current = { ...stateRef.current, currentReciterId: reciterId };
        if (!currentChapterId || !audioRef.current) return;

        // Replay what was playing — the same verse, or the whole surah — in the new voice.
        const url = currentVerseKey
            ? await fetchAyahRecitation(currentVerseKey, reciterId)
            : await fetchChapterRecitation(currentChapterId, reciterId);
        if (url) {
            await startAudio(url);
            setState(prev => ({ ...prev, audioUrl: url, isPlaying: true, currentReciterId: reciterId }));
        }
    };

    const setAutoContinue = (on: boolean) => {
        try { localStorage.setItem(CONTINUE_KEY, String(on)); } catch { /* storage unavailable */ }
        setState(prev => ({ ...prev, autoContinue: on }));
    };

    const resumeListening = () => {
        const s = lastSession;
        if (!s) return;
        if (s.reciterId !== stateRef.current.currentReciterId && RECITERS.some(r => r.id === s.reciterId)) {
            stateRef.current = { ...stateRef.current, currentReciterId: s.reciterId };
            setState(prev => ({ ...prev, currentReciterId: s.reciterId }));
        }
        if (s.verseKey) playAyah(s.verseKey, s.chapterId, s.surahName);
        else playChapter(s.chapterId, s.surahName, s.time);
    };

    const setSpeed = (speed: number) => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
        setState(prev => ({ ...prev, playbackSpeed: speed }));
    };

    const seek = (time: number) => {
        if (audioRef.current) audioRef.current.currentTime = time;
    };

    return (
        <AudioContext.Provider value={{
            ...state, playChapter, togglePlay, setReciter, setSpeed, seek, playAyah, stopPlayer,
            playNext, playPrevious, setAutoContinue, lastSession, resumeListening,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
