'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DailyActivity {
    date: string; // YYYY-MM-DD
    ayahsRead: number;
}

interface ProgressState {
    totalAyahsRead: number;
    completedAyahKeys: string[]; // Tracks unique set of read ayahs for Khatm percentage
    currentStreak: number;
    lastRead: { surahName: string; verseKey: string; chapterId: number } | null;
    activityHistory: DailyActivity[];
}

interface ProgressContextType extends ProgressState {
    markAyahRead: (verseKey: string) => void;
    setLastRead: (surahName: string, verseKey: string, chapterId: number) => void;
}

const defaultState: ProgressState = {
    totalAyahsRead: 0,
    completedAyahKeys: [],
    currentStreak: 0,
    lastRead: null,
    activityHistory: [],
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ProgressState>(defaultState);

    useEffect(() => {
        const saved = localStorage.getItem('quran_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Calculate Streak logic upon initializing
                const today = new Date().toISOString().split('T')[0];
                let streak = parsed.currentStreak || 0;

                if (parsed.activityHistory && parsed.activityHistory.length > 0) {
                    const lastActivityDate = parsed.activityHistory[parsed.activityHistory.length - 1].date;

                    // If the last activity wasn't today or yesterday, break the streak
                    const lastDateObj = new Date(lastActivityDate);
                    const todayObj = new Date(today);
                    const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 3600 * 24));

                    if (diffDays > 1) {
                        streak = 0;
                    }
                }

                setState({ ...defaultState, ...parsed, completedAyahKeys: parsed.completedAyahKeys || [], currentStreak: streak });
            } catch (e) {
                console.error('Failed to load progress', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('quran_progress', JSON.stringify(state));
    }, [state]);

    const markAyahRead = (verseKey: string) => {
        setState(prev => {
            const today = new Date().toISOString().split('T')[0];
            const newHistory = [...prev.activityHistory];

            // Unique tracking for Khatm percentage
            const newCompletedSet = new Set(prev.completedAyahKeys || []);
            if (!newCompletedSet.has(verseKey)) {
                newCompletedSet.add(verseKey);
            }

            let newStreak = prev.currentStreak;
            let foundToday = false;

            for (let i = newHistory.length - 1; i >= 0; i--) {
                if (newHistory[i].date === today) {
                    newHistory[i].ayahsRead += 1;
                    foundToday = true;
                    break;
                }
            }

            if (!foundToday) {
                newHistory.push({ date: today, ayahsRead: 1 });
                // If it's a new day, increment streak
                // (Assumes previous load step checked for broken streaks > 1 day)
                newStreak += 1;
            }

            return {
                ...prev,
                totalAyahsRead: prev.totalAyahsRead + 1, // Generic engagement tracker
                completedAyahKeys: Array.from(newCompletedSet), // Unique progression tracker
                currentStreak: newStreak,
                activityHistory: newHistory
            };
        });
    };

    const setLastRead = (surahName: string, verseKey: string, chapterId: number) => {
        setState(prev => ({
            ...prev,
            lastRead: { surahName, verseKey, chapterId }
        }));
    };

    return (
        <ProgressContext.Provider value={{ ...state, markAyahRead, setLastRead }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) throw new Error('useProgress must be used inside ProgressProvider');
    return context;
};
