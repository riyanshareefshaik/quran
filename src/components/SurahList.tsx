import React from 'react';
import SurahCard from './SurahCard';
import { Chapter } from '@/lib/quran-api';

interface SurahListProps {
    chapters: Chapter[];
}

const SurahList: React.FC<SurahListProps> = ({ chapters }) => {
    return (
        <div className="surah-list-container">
            <div className="surah-grid">
                {chapters.map((chapter) => (
                    <SurahCard
                        key={chapter.id}
                        id={chapter.id}
                        name={chapter.name_complex}
                        nameArabic={chapter.name_arabic}
                        revelationPlace={chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}
                        versesCount={chapter.verses_count}
                        translatedName={chapter.translated_name.name}
                    />
                ))}
            </div>

            <style jsx>{`
        .surah-list-container {
          padding-top: 2rem;
        }

        .surah-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        @media (max-width: 640px) {
          .surah-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default SurahList;
