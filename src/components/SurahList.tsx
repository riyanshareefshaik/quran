import React, { useEffect, useRef, useState } from 'react';
import SurahCard from './SurahCard';
import { Chapter, fetchChapterDescription } from '@/lib/quran-api';

interface SurahListProps {
    chapters: Chapter[];
}

// Keeps this gentle on both the API and the connection: fetching all 114 at
// once would queue up a pile of simultaneous requests for no real benefit,
// same reasoning as the worker pool in the Read Offline page.
const CONCURRENCY = 4;

const SurahList: React.FC<SurahListProps> = ({ chapters }) => {
    const [descriptions, setDescriptions] = useState<Record<number, string | null>>({});
    const requestedRef = useRef(new Set<number>());

    useEffect(() => {
        const pending = chapters.filter(c => !requestedRef.current.has(c.id));
        if (pending.length === 0) return;
        pending.forEach(c => requestedRef.current.add(c.id));

        let cancelled = false;
        const queue = [...pending];
        const worker = async () => {
            while (queue.length && !cancelled) {
                const chapter = queue.shift()!;
                const description = await fetchChapterDescription(chapter.id);
                if (!cancelled) setDescriptions(prev => ({ ...prev, [chapter.id]: description }));
            }
        };
        Promise.all(Array.from({ length: CONCURRENCY }, worker));

        return () => { cancelled = true; };
    }, [chapters]);

    return (
        <div className="surah-list-container">
            <div className="surah-list">
                {chapters.map((chapter) => (
                    <SurahCard
                        key={chapter.id}
                        id={chapter.id}
                        name={chapter.name_complex}
                        nameArabic={chapter.name_arabic}
                        revelationPlace={chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                        versesCount={chapter.verses_count}
                        translatedName={chapter.translated_name.name}
                        description={descriptions[chapter.id]}
                    />
                ))}
            </div>

            <style jsx>{`
        .surah-list-container {
          padding-top: 2rem;
        }

        .surah-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
      `}</style>
        </div>
    );
};

export default SurahList;
