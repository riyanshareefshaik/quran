'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Bookmark {
    chapterId: number;
    chapterName: string;
    addedAt: string; // ISO timestamp
}

interface BookmarkContextType {
    bookmarks: Bookmark[];
    isBookmarked: (chapterId: number) => boolean;
    toggleBookmark: (chapterId: number, chapterName: string) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = 'quran_bookmarks';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setBookmarks(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load bookmarks', e);
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        // Avoid overwriting saved bookmarks with the initial empty state
        // before the load effect above has run.
        if (!loaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }, [bookmarks, loaded]);

    const isBookmarked = (chapterId: number) =>
        bookmarks.some((b) => b.chapterId === chapterId);

    const toggleBookmark = (chapterId: number, chapterName: string) => {
        setBookmarks((prev) => {
            if (prev.some((b) => b.chapterId === chapterId)) {
                return prev.filter((b) => b.chapterId !== chapterId);
            }
            return [...prev, { chapterId, chapterName, addedAt: new Date().toISOString() }];
        });
    };

    return (
        <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark }}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (!context) throw new Error('useBookmarks must be used inside BookmarkProvider');
    return context;
};
