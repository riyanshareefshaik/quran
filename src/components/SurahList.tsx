import React from 'react';
import SurahCard from './SurahCard';
import { Chapter } from '@/lib/quran-api';
import { getSurahTheme } from '@/lib/surah-themes';

interface SurahListProps {
    chapters: Chapter[];
}

const SurahList: React.FC<SurahListProps> = ({ chapters }) => {
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
                        theme={getSurahTheme(chapter.id)}
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
