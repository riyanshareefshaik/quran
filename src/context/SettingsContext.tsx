'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface SettingsState {
    arabicFontSize: FontSize;
    readingComfortMode: boolean;
    focusMode: boolean;
    lineSpacing: 'normal' | 'relaxed';
    prayerCalculationMethod: number; // e.g., 2 (ISNA), 3 (MWL)
    prayerSilentMode: boolean;
}

interface SettingsContextType extends SettingsState {
    setArabicFontSize: (size: FontSize) => void;
    toggleReadingComfortMode: () => void;
    toggleFocusMode: () => void;
    setLineSpacing: (spacing: 'normal' | 'relaxed') => void;
    setPrayerCalculationMethod: (method: number) => void;
    togglePrayerSilentMode: () => void;
}

const defaultState: SettingsState = {
    arabicFontSize: 'large',
    readingComfortMode: false,
    focusMode: false,
    lineSpacing: 'normal',
    prayerCalculationMethod: 2, // ISNA Default
    prayerSilentMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SettingsState>(defaultState);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('quran_settings');
        if (saved) {
            try {
                setState({ ...defaultState, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('quran_settings', JSON.stringify(state));

        // Apply global CSS variables based on settings
        const root = document.documentElement;

        // Font Size Mapping
        const sizeMap = {
            small: '1.5rem',
            medium: '2rem',
            large: '2.5rem',
            xlarge: '3rem'
        };
        root.style.setProperty('--arabic-font-size', sizeMap[state.arabicFontSize]);

        // Comfort Mode
        if (state.readingComfortMode) {
            root.style.setProperty('--reading-bg', 'rgba(10, 10, 10, 0.4)');
            root.style.setProperty('--reading-text', 'rgba(255, 255, 255, 0.85)');
        } else {
            root.style.setProperty('--reading-bg', 'transparent');
            root.style.setProperty('--reading-text', 'var(--off-white)');
        }

    }, [state]);

    const setArabicFontSize = (size: FontSize) => setState(prev => ({ ...prev, arabicFontSize: size }));
    const toggleReadingComfortMode = () => setState(prev => ({ ...prev, readingComfortMode: !prev.readingComfortMode }));
    const toggleFocusMode = () => setState(prev => ({ ...prev, focusMode: !prev.focusMode }));
    const setLineSpacing = (spacing: 'normal' | 'relaxed') => setState(prev => ({ ...prev, lineSpacing: spacing }));
    const setPrayerCalculationMethod = (method: number) => setState(prev => ({ ...prev, prayerCalculationMethod: method }));
    const togglePrayerSilentMode = () => setState(prev => ({ ...prev, prayerSilentMode: !prev.prayerSilentMode }));

    return (
        <SettingsContext.Provider value={{
            ...state,
            setArabicFontSize,
            toggleReadingComfortMode,
            toggleFocusMode,
            setLineSpacing,
            setPrayerCalculationMethod,
            togglePrayerSilentMode
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used inside SettingsProvider');
    return context;
};
