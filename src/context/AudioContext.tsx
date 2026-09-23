'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { fetchChapterRecitation, RECITERS } from '@/lib/quran-api';
import { useProgress } from '@/context/ProgressContext';

interface AudioState {
    isPlaying: boolean;
    currentChapterId: number | null;
    currentChapterName: string | null;
    currentReciterId: number;
    audioUrl: string | null;
    currentTime: number;
    duration: number;
    playbackSpeed: number;
    currentVerseKey: string | null;
}

interface AudioContextType extends AudioState {
    playChapter: (chapterId: number, chapterName: string) => Promise<void>;
    togglePlay: () => void;
    setReciter: (reciterId: number) => void;
    setSpeed: (speed: number) => void;
    seek: (time: number) => void;
    playAyah: (
        verseKey: string,
        chapterId: number,
        chapterName: string
    ) => Promise<void>;
    stopPlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { markAyahRead, setLastRead } = useProgress();
    const [state, setState] = useState<AudioState>({
        isPlaying: false,
        currentChapterId: null,
        currentChapterName: null,
        currentReciterId: RECITERS[0].id,
        audioUrl: null,
        currentTime: 0,
        duration: 0,
        playbackSpeed: 1,
        currentVerseKey: null,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Setup Audio references
    useEffect(() => {
        audioRef.current = new Audio();

        const audio = audioRef.current;

        const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        const handleDurationChange = () => setState(prev => ({ ...prev, duration: audio.duration }));

        const handleEnded = () => {
            setState(prev => ({ ...prev, isPlaying: false }));
        };

        const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
        const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
        };
    }, []);

    const playChapter = async (chapterId: number, chapterName: string) => {
        try {
            setState(prev => ({ ...prev, currentVerseKey: null }));

            const url = await fetchChapterRecitation(chapterId, state.currentReciterId);
            if (url && audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.playbackRate = state.playbackSpeed;
                await audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));
                setState(prev => ({
                    ...prev,
                    currentChapterId: chapterId,
                    currentChapterName: chapterName,
                    audioUrl: url,
                    isPlaying: true,
                    currentVerseKey: null
                }));
            }
        } catch (error) {
            console.error('Error playing chapter:', error);
        }
    };

    const playAyah = async (
        verseKey: string,
        chapterId: number,
        chapterName: string
    ) => {
        try {
            // Import fetchAyahRecitation dynamically to avoid circular dependency if not at top, but it's at top
            const { fetchAyahRecitation } = await import('@/lib/quran-api');
            const url = await fetchAyahRecitation(verseKey, state.currentReciterId);
            if (url && audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.playbackRate = state.playbackSpeed;
                await audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));

                // Track reading completion engagement immediately when audio is started
                markAyahRead(verseKey);
                setLastRead(chapterName, verseKey, chapterId);

                setState(prev => ({
                    ...prev,
                    currentChapterId: chapterId,
                    currentChapterName: `${chapterName} - Ayah ${verseKey.split(':')[1]}`,
                    audioUrl: url,
                    isPlaying: true,
                    currentVerseKey: verseKey
                }));
            }
        } catch (error) {
            console.error('Error playing ayah:', error);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (state.isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));
            }
        }
    };

    const stopPlayer = () => {
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
            currentVerseKey: null,
        }));
    };

    const setReciter = async (reciterId: number) => {
        setState(prev => ({ ...prev, currentReciterId: reciterId }));
        if (state.currentChapterId) {
            // Fetch with the new reciter ID immediately to avoid state delay issues
            // Note: If playing an individual Ayah, we might fetch chapter recitation instead,
            // which restarts the Surah. For this MVP, this fallback is acceptable or we should check if audioUrl is a chapter or ayah.
            const url = await fetchChapterRecitation(state.currentChapterId, reciterId);
            if (url && audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));
                setState(prev => ({
                    ...prev,
                    audioUrl: url,
                    isPlaying: true,
                    currentReciterId: reciterId
                }));
            }
        }
    };

    const setSpeed = (speed: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
        setState(prev => ({ ...prev, playbackSpeed: speed }));
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    return (
        <AudioContext.Provider value={{ ...state, playChapter, togglePlay, setReciter, setSpeed, seek, playAyah, stopPlayer }}>
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
