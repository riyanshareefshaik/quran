import React, { useState } from 'react';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';
import { useBookmarks } from '@/context/BookmarkContext';
import { fetchChapterRecitation } from '@/lib/quran-api';

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
  const { playChapter, isPlaying, currentChapterId, currentReciterId } = useAudio();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadState === 'downloading') return;

    setDownloadState('downloading');
    try {
      const audioUrl = await fetchChapterRecitation(id, currentReciterId);
      if (!audioUrl) throw new Error('No audio URL returned');

      // Fetch as a blob so the browser downloads the file directly instead
      // of navigating to/streaming the audio CDN URL in-page.
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error('Failed to fetch audio file');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${String(id).padStart(3, '0')}-${name.replace(/\s+/g, '-')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      setDownloadState('done');
      setTimeout(() => setDownloadState('idle'), 2500);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 2500);
    }
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
              {isCurrentPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>
              )}
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
              <svg width="17" height="17" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />
              </svg>
            </button>
            <span className="action-label">{bookmarked ? 'Saved' : 'Bookmark'}</span>
          </div>
          <div className="action-item">
            <button
              className={`action-btn ${downloadState === 'error' ? 'download-error' : ''}`}
              onClick={handleDownload}
              title="Download audio"
              disabled={downloadState === 'downloading'}
            >
              {downloadState === 'downloading' ? (
                <svg className="spin-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
              ) : downloadState === 'done' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              ) : downloadState === 'error' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" /></svg>
              )}
            </button>
            <span className="action-label">
              {downloadState === 'downloading' ? 'Downloading…' : downloadState === 'done' ? 'Saved!' : downloadState === 'error' ? 'Failed' : 'Download'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.surah-card-link) {
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

        .action-btn:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .action-btn.download-error {
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .spin-icon {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
