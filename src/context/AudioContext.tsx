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
    translationVoice: boolean;
    isPlayingTranslation: boolean;
    currentVerseKey: string | null;
    currentTranslationVerseKey: string | null;
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
    playTranslationText: (text: string, langName: string, verseKey?: string) => void;
    stopTranslation: () => void;
    stopPlayer: () => void;
    setTranslationVoice: (enabled: boolean) => void;
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
        translationVoice: false,
        isPlayingTranslation: false,
        currentVerseKey: null,
        currentTranslationVerseKey: null
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const translationAudioRef = useRef<HTMLAudioElement | null>(null);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Setup Audio references
    useEffect(() => {
        audioRef.current = new Audio();
        translationAudioRef.current = new Audio();

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
            if (translationAudioRef.current) {
                translationAudioRef.current.pause();
                translationAudioRef.current.src = '';
            }
        };
    }, []);

    const playChapter = async (chapterId: number, chapterName: string) => {
        try {
            if (translationAudioRef.current) translationAudioRef.current.pause();
            setState(prev => ({ ...prev, isPlayingTranslation: false, currentVerseKey: null }));

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
            if (translationAudioRef.current) {
                translationAudioRef.current.pause();
            }
            setState(prev => ({ ...prev, isPlayingTranslation: false }));

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
        if (state.isPlayingTranslation && translationAudioRef.current) {
            // Cancel TTS entirely on pause
            translationAudioRef.current.pause();
            setState(prev => ({ ...prev, isPlayingTranslation: false }));
            return;
        }

        if (audioRef.current) {
            if (state.isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.warn('Playback interrupted:', e));
            }
        }
    };

    const stopPlayer = () => {
        if (translationAudioRef.current) translationAudioRef.current.pause();

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
        }
        setState(prev => ({
            ...prev,
            isPlaying: false,
            isPlayingTranslation: false,
            audioUrl: null,
            currentChapterId: null,
            currentChapterName: null,
            currentVerseKey: null,
            currentTranslationVerseKey: null,
        }));
    };

    const stopTranslation = () => {
        if (translationAudioRef.current) {
            translationAudioRef.current.pause();
            translationAudioRef.current.removeAttribute('src');
            translationAudioRef.current.load();
        }
        setState(prev => ({ ...prev, isPlayingTranslation: false, currentTranslationVerseKey: null }));
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

    const setTranslationVoice = (enabled: boolean) => {
        setState(prev => ({ ...prev, translationVoice: enabled }));
        if (!enabled && translationAudioRef.current) {
            translationAudioRef.current.pause();
            setState(prev => ({ ...prev, isPlayingTranslation: false }));
        }
    };

    const playTranslationText = async (text: string, langName: string, verseKey?: string) => {
        if (translationAudioRef.current) {
            translationAudioRef.current.pause();
        }

        setState(prev => ({ ...prev, isPlayingTranslation: true, currentTranslationVerseKey: verseKey || null }));

        const standardLang = langName.toLowerCase();

        const alQuranCloudMap: { [key: string]: string } = {
            'english': 'en.walk',
            'urdu': 'ur.khan',
            'french': 'fr.leclerc',
            'russian': 'ru.kuliev-audio',
            'chinese': 'zh.chinese',
            'persian': 'fa.hedayatfarfooladvand'
        };

        // Fallback generator using standard Google Cloud Text-to-Speech proxy
        const fallbackToGoogleTTS = () => {
            const langMap: { [key: string]: string } = {
                'english': 'en', 'urdu': 'ur', 'hindi': 'hi', 'french': 'fr',
                'spanish': 'es', 'german': 'de', 'indonesian': 'id', 'turkish': 'tr',
                'bengali': 'bn', 'russian': 'ru', 'chinese': 'zh'
            };

            const langCode = langMap[standardLang] || 'en';

            // Google Translate TTS is limited to 200 character strings per query
            const strictMatch = text.match(/.{1,199}(?:\s|$)/g) || [text];
            const chunks = strictMatch.map(s => s.trim()).filter(Boolean);

            let currentChunkIndex = 0;

            const playNextChunk = () => {
                if (currentChunkIndex >= chunks.length || !translationAudioRef.current) {
                    setState(prev => ({ ...prev, isPlayingTranslation: false }));
                    return;
                }

                const chunk = chunks[currentChunkIndex];
                const url = `/api/tts?lang=${langCode}&text=${encodeURIComponent(chunk)}`;

                translationAudioRef.current.src = url;
                translationAudioRef.current.onended = () => {
                    currentChunkIndex++;
                    playNextChunk();
                };
                translationAudioRef.current.onerror = () => {
                    console.error('Translation TTS chunk failed to play.');
                    setState(prev => ({ ...prev, isPlayingTranslation: false }));
                };

                translationAudioRef.current.play().catch(e => {
                    console.warn('TTS Playback interrupted or blocked by browser', e);
                    setState(prev => ({ ...prev, isPlayingTranslation: false }));
                });
            };

            playNextChunk();
        };

        // 1. If language is supported by official AlQuran.cloud API, fetch studio audio
        if (verseKey && alQuranCloudMap[standardLang]) {
            const edition = alQuranCloudMap[standardLang];
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/${edition}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.data?.audio) {
                        if (!translationAudioRef.current) return;
                        translationAudioRef.current.src = data.data.audio;
                        translationAudioRef.current.onended = () => setState(prev => ({ ...prev, isPlayingTranslation: false }));
                        translationAudioRef.current.onerror = () => {
                            console.error('AlQuran Cloud Audio failed. Falling back to TTS proxy...');
                            fallbackToGoogleTTS();
                        };

                        await translationAudioRef.current.play().catch(e => {
                            console.warn('AlQuran Playback blocked by browser', e);
                            setState(prev => ({ ...prev, isPlayingTranslation: false }));
                        });
                        return; // Successfully played human recording
                    }
                }
            } catch (err) {
                console.error('AlQuran Cloud API fetch failed:', err);
                // Proceed to fallback
            }
        }

        // 2. Fallback to automated chunks
        fallbackToGoogleTTS();
    };

    return (
        <AudioContext.Provider value={{ ...state, playChapter, togglePlay, setReciter, setSpeed, seek, playAyah, playTranslationText, stopTranslation, stopPlayer, setTranslationVoice }}>
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
