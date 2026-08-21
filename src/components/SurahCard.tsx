import React from 'react';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';
import { useBookmarks } from '@/context/BookmarkContext';

interface SurahCardProps {
  id: number;
  name: string;
  nameArabic: string;
  revelationPlace: string;
  versesCount: number;
  translatedName: string;
}

const SurahCard: React.FC<SurahCardProps> = ({
  id,
  name,
  nameArabic,
  revelationPlace,
  versesCount,
  translatedName,
}) => {
  const { playChapter, isPlaying, currentChapterId } = useAudio();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playChapter(id, name);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(id, name);
  };

  const isCurrentPlaying = isPlaying && currentChapterId === id;
  const bookmarked = isBookmarked(id);

  return (
    <Link href={`/surah/${id}`} className="surah-card-link">
      <div className={`glass-card surah-card ${isCurrentPlaying ? 'playing' : ''}`}>
        <div className="surah-number-badge">
          <span>{isCurrentPlaying ? '||' : id}</span>
        </div>
        <div className="surah-info">
          <h4 className="surah-name font-display">{name}</h4>
          <p className="surah-translation">{translatedName}</p>
        </div>
        <div className="surah-arabic-info">
          <h4 className="surah-arabic-name amiri-text">{nameArabic}</h4>
          <p className="surah-meta">
            {revelationPlace} • {versesCount} Ayahs
          </p>
        </div>

        {/* Hover Actions Overlay */}
        <div className="surah-actions-overlay">
          <div className="action-item">
            <button className="action-btn play-action" onClick={handlePlay} title="Play Surah">
              {isCurrentPlaying ? '||' : '▶'}
            </button>
            <span className="action-label">{isCurrentPlaying ? 'Pause' : 'Play'}</span>
          </div>
          <div className="action-item">
            <button
              className={`action-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
              aria-pressed={bookmarked}
            >
              {bookmarked ? '★' : '🔖'}
            </button>
            <span className="action-label">{bookmarked ? 'Saved' : 'Bookmark'}</span>
          </div>
          <div className="action-item">
            <button className="action-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} title="Download">
              📥
            </button>
            <span className="action-label">Download</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .surah-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .surah-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .surah-card.playing {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.05);
        }

        .surah-number-badge {
          width: 40px;
          height: 40px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid var(--gold-primary);
          color: var(--gold-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border-radius: 8px;
          transform: rotate(45deg);
          flex-shrink: 0;
          transition: all 0.3s;
        }

        .surah-number-badge:hover {
          background: var(--gold-primary);
          color: var(--matte-black);
        }

        .surah-number-badge :global(*) {
          transform: rotate(-45deg);
        }

        .surah-info {
          flex: 1;
          text-align: left;
        }

        .surah-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: var(--foreground);
        }

        .surah-translation {
          font-size: 0.85rem;
          color: var(--emerald-light);
          margin: 0.2rem 0 0 0;
        }

        .surah-arabic-info {
          text-align: right;
        }

        .surah-arabic-name {
          font-size: 1.4rem;
          margin: 0;
          color: var(--gold-primary);
        }

        .surah-meta {
          font-size: 0.75rem;
          color: var(--emerald-light);
          margin: 0.2rem 0 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .amiri-text {
          font-family: var(--font-amiri), serif;
        }

        .surah-actions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 57, 39, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(10px);
          border-radius: 12px;
        }

        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .action-label {
          font-size: 0.7rem;
          color: var(--emerald-light);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s ease 0.1s;
        }

        .surah-card:hover .action-label,
        .surah-card:active .action-label {
          opacity: 1;
          transform: translateY(0);
        }

        .surah-card:hover .surah-actions-overlay,
        .surah-card:active .surah-actions-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        /* Touchscreens have no :hover state, so the overlay would otherwise
           never appear. Show it permanently (as a compact bottom bar) on
           devices that can't hover, instead of relying on a hover reveal. */
        @media (hover: none) {
          .surah-actions-overlay {
            opacity: 1;
            transform: none;
            position: static;
            background: transparent;
            backdrop-filter: none;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 0.75rem;
            margin-top: 0.75rem;
            border-top: 1px solid var(--glass-border);
          }

          .action-label {
            opacity: 1;
            transform: none;
          }

          .surah-card {
            flex-wrap: wrap;
          }

          .surah-info,
          .surah-arabic-info {
            flex-basis: auto;
          }
        }

        .action-btn {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--emerald-medium);
          color: var(--gold-primary);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
          transform: scale(0.9);
        }

        .action-btn.bookmarked {
          background: rgba(212, 175, 55, 0.2);
          border-color: var(--gold-primary);
        }

        @media (hover: none) {
          .action-btn {
            transform: none;
            width: 44px;
            height: 44px;
          }
        }

        .surah-card:hover .action-btn {
            transform: scale(1);
        }

        .action-btn:hover {
          background: var(--gold-primary);
          color: var(--matte-black);
          border-color: var(--gold-primary);
          transform: scale(1.1) !important;
        }

        .play-action {
          width: 55px;
          height: 55px;
          font-size: 1.5rem;
          background: rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </Link>
  );
};

export default SurahCard;
