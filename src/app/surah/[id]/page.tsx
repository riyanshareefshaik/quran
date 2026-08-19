'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchChapterInfo, fetchVersesByChapter, fetchTranslationsList, Chapter, Verse, TranslationResource } from '@/lib/quran-api';
import { useAudio } from '@/context/AudioContext';
import { useProgress } from '@/context/ProgressContext';
import { useSettings, FontSize } from '@/context/SettingsContext';
import AyahShareModal from '@/components/AyahShareModal';
import OrnateDivider from '@/components/OrnateDivider';

interface VerseCardProps {
  verse: Verse;
  isMemoMode: boolean;
  isBlurred?: boolean;
  focusMode?: boolean;
  onShare: (verse: Verse) => void;
  onPlay: (verse: Verse) => void;
  onPlayTranslation?: (text: string) => void;
  isTranslationPlaying?: boolean;
  onStopTranslation?: () => void;
  onRead?: () => void;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, isMemoMode, isBlurred, focusMode, onShare, onPlay, onPlayTranslation, isTranslationPlaying, onStopTranslation, onRead }) => {
  const [showTranslation, setShowTranslation] = useState(!isMemoMode);
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [wordDetails, setWordDetails] = useState({ root: '', occurrences: '' });
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Auto-track silent reading
  useEffect(() => {
    if (!onRead) return;

    let timeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Verse is visible, start a 2.5 second reading timer
          timeout = setTimeout(() => {
            onRead();
          }, 2500);
        } else {
          // Verse left view, cancel timer to prevent rapid scroll false-positives
          clearTimeout(timeout);
        }
      },
      { threshold: 0.6 } // 60% of card must be visible on screen
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [onRead]);

  useEffect(() => {
    setShowTranslation(!isMemoMode);
  }, [isMemoMode]);

  const handleWordClick = (word: any) => {
    if (word.char_type_name === 'end') return;
    setSelectedWord(word);
    setWordDetails({ root: 'Fetching...', occurrences: 'Fetching...' });

    // Since Quran V4 requires a different complex endpoint for root details,
    // we gracefully simulate a fetch for the UI demo.
    setTimeout(() => {
      setWordDetails({
        root: 'API Unavailable',
        occurrences: 'API Unavailable'
      });
    }, 1200);
  };

  return (
    <div className="verse-card-container" ref={cardRef}>
      <div className={`glass-card verse-card ${isMemoMode && !showTranslation ? 'memo-active' : ''} ${isBlurred ? 'blurred-verse' : ''} ${focusMode ? 'focus-mode-active' : ''}`}>

        {!focusMode && (
          <div className="verse-header">
            <div className="verse-number-badge">{verse.verse_number}</div>
            <div className="verse-actions">
              <button className="premium-icon-btn" onClick={() => onPlay(verse)}>Play</button>
              <button className="premium-icon-btn" onClick={() => onShare(verse)}>Share</button>
            </div>
          </div>
        )}

        <div className="verse-body">
          <div className={`arabic-content ${focusMode ? 'centered' : ''}`}>
            <p className="arabic-text main-script">{verse.text_uthmani}</p>
          </div>

          {!focusMode && (
            <div className="word-by-word-layout">
              {verse.words?.map((word: any) => (
                <div
                  key={word.id}
                  className={`word-bubble ${word.char_type_name === 'end' ? 'is-end-marker' : ''}`}
                  onClick={() => handleWordClick(word)}
                >
                  <span className="w-arabic">{word.text_uthmani}</span>
                  {word.char_type_name !== 'end' && (
                    <span className="w-meaning">{word.translation?.text}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!focusMode && (
            <div className="full-translation-area">
              {showTranslation ? (
                <div className="translation-content">
                  <div className="translation-text-wrapper">
                    {verse.translations && verse.translations.length > 0 ? (
                      verse.translations.map((t: any) => (
                        <p key={t.id} className="t-text">
                          {t.text.replace(/<[^>]*>?/gm, '')}
                        </p>
                      ))
                    ) : (
                      <p className="t-text italic opacity-50">Translation loading...</p>
                    )}
                  </div>

                  {onPlayTranslation && verse.translations && verse.translations.length > 0 && (
                    <div className="translation-audio-controls">
                      {isTranslationPlaying ? (
                        <button
                          className="stop-translation-btn"
                          onClick={() => onStopTranslation?.()}
                          title="Stop Translation Audio"
                        >
                          ⏹ Stop Meaning
                        </button>
                      ) : (
                        <button
                          className="play-translation-btn"
                          onClick={() => onPlayTranslation(verse.translations![0].text.replace(/<[^>]*>?/gm, ''))}
                          title="Play Translation Audio"
                        >
                          ▶ Listen to Meaning
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="memo-reveal-container">
                  <button className="reveal-btn" onClick={() => setShowTranslation(true)}>
                    Reveal Translation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedWord && (
        <div className="word-modal-overlay" onClick={() => setSelectedWord(null)}>
          <div className="word-modal-content glass-card" onClick={e => e.stopPropagation()}>
            <button className="close-word-modal" onClick={() => setSelectedWord(null)}>×</button>
            <div className="word-modal-header">
              <h2 className="modal-arabic amiri-text">{selectedWord.text_uthmani || selectedWord.text}</h2>
              <p className="modal-meaning">{selectedWord.translation?.text || 'No translation'}</p>
            </div>
            <div className="word-modal-body">
              <div className="w-info-row">
                <span className="w-label">Root Word</span>
                <span className={`w-val ${wordDetails.root === 'Fetching...' ? 'fetching-anim' : ''}`}>
                  {wordDetails.root}
                </span>
              </div>
              <div className="w-info-row">
                <span className="w-label">Occurrences</span>
                <span className={`w-val ${wordDetails.occurrences === 'Fetching...' ? 'fetching-anim' : ''}`}>
                  {wordDetails.occurrences}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .verse-card-container {
          width: 100%;
          margin-bottom: 2.5rem;
        }

        .verse-card {
          padding: 1.5rem;
          background: var(--reading-bg, rgba(10, 10, 10, 0.7));
          border-left: 3px solid var(--gold-primary);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .verse-card.memo-active {
          border-left-color: var(--emerald-medium);
        }

        .verse-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.2rem;
        }

        .verse-number-badge {
          width: 32px;
          height: 32px;
          border: 1px solid var(--gold-primary);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.05);
          font-family: 'Inter', sans-serif;
        }

        .premium-icon-btn {
          background: transparent;
          border: 1px solid var(--emerald-medium);
          color: var(--emerald-light);
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          margin-left: 0.6rem;
          font-size: 0.7rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.3s;
          cursor: pointer;
        }

        .premium-icon-btn:hover {
          border-color: var(--gold-primary);
          color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.1);
        }

        .arabic-content {
          text-align: right;
          margin-bottom: 1.5rem;
        }

        .main-script {
          font-size: var(--arabic-font-size, 2.2rem);
          line-height: var(--arabic-line-height, 1.8);
          font-family: 'Amiri', serif;
          color: var(--reading-text, var(--off-white));
          word-spacing: 4px;
        }

        .word-by-word-layout {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          direction: rtl;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          justify-content: flex-start;
        }

        .full-translation-area {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .translation-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .translation-text-wrapper {
            flex: 1;
        }

        .translation-audio-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .translation-selector {
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            min-width: 160px;
            cursor: pointer;
        }

        .custom-dropdown-trigger {
            padding: 0.5rem 1rem;
            color: var(--gold-secondary);
            font-size: 0.9rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 160px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .dropdown-arrow {
            font-size: 0.7rem;
            opacity: 0.7;
        }

        .custom-dropdown-menu {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            z-index: 100;
            padding: 0.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .dropdown-search {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(212, 175, 55, 0.3);
            color: var(--off-white);
            padding: 0.5rem;
            border-radius: 8px;
            font-size: 0.85rem;
            outline: none;
        }

        .dropdown-search:focus {
            border-color: var(--gold-primary);
        }

        .dropdown-options {
            max-height: 250px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        /* Custom Scrollbar for dropdown */
        .dropdown-options::-webkit-scrollbar {
            width: 4px;
        }
        .dropdown-options::-webkit-scrollbar-track {
            background: transparent;
        }
        .dropdown-options::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.3);
            border-radius: 4px;
        }

        .dropdown-option {
            background: transparent;
            border: none;
            color: var(--off-white);
            padding: 0.5rem;
            text-align: left;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }

        .dropdown-option:hover {
            background: rgba(212, 175, 55, 0.1);
            color: var(--gold-primary);
        }

        .dropdown-option.selected {
            background: rgba(212, 175, 55, 0.2);
            color: var(--gold-primary);
            font-weight: 500;
        }

        .no-results {
            padding: 1rem;
            text-align: center;
            color: var(--gray-light);
            font-size: 0.8rem;
            opacity: 0.7;
        }
        .play-translation-btn, .stop-translation-btn {
            align-self: flex-start;
            background: rgba(212, 175, 55, 0.1);
            color: var(--gold-primary);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 20px;
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .play-translation-btn:hover {
            background: var(--gold-primary);
            color: var(--matte-black);
        }

        .stop-translation-btn {
            background: rgba(220, 53, 69, 0.1);
            color: #ff6b6b;
            border-color: rgba(220, 53, 69, 0.3);
        }

        .stop-translation-btn:hover {
            background: rgba(220, 53, 69, 0.2);
            border-color: #ff6b6b;
        }

        .t-text {
            color: var(--reading-text, var(--gray-light));
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }

        .verse-card.blurred-verse {
            filter: blur(8px);
            opacity: 0.6;
            pointer-events: none;
            user-select: none;
            transition: all 0.5s ease;
        }

        .verse-card.focus-mode-active {
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 2rem 0;
        }

        .arabic-content.centered {
            text-align: center;
        }

        .arabic-content.centered .main-script {
            font-size: calc(var(--arabic-font-size, 2.2rem) * 1.5);
            line-height: 2;
        }

        .word-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          transition: transform 0.2s, background 0.2s;
          cursor: pointer;
        }

        .word-bubble.is-end-marker {
            cursor: default;
            background: transparent;
            pointer-events: none;
        }
        
        .word-bubble.is-end-marker:hover {
            transform: none;
            background: transparent;
        }

        .word-bubble.is-end-marker .w-arabic {
            color: rgba(212, 175, 55, 0.5);
            font-size: 1.2rem;
            margin: 0 0.5rem;
        }

        .word-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .word-modal-content {
            width: 320px;
            padding: 2rem;
            position: relative;
            background: rgba(10, 25, 20, 0.95);
            border: 1px solid var(--emerald-medium);
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            text-align: center;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        .close-word-modal {
            position: absolute;
            top: 10px; right: 15px;
            background: none; border: none;
            color: var(--emerald-light);
            font-size: 1.5rem; cursor: pointer;
        }

        .modal-arabic {
            font-size: 4rem;
            color: var(--gold-primary);
            margin: 0 0 1rem 0;
            line-height: 1.2;
            text-align: center;
        }

        .modal-meaning {
            font-size: 1.2rem;
            color: var(--off-white);
            margin: 0 0 1.5rem 0;
        }

        .word-modal-body {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.03);
            padding: 1rem;
            border-radius: 8px;
        }

        .w-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 0.5rem;
        }
        .w-info-row:last-child { border-bottom: none; padding-bottom: 0; }

        .w-label { color: var(--emerald-light); font-size: 0.8rem; text-transform: uppercase; }
        .w-val { color: var(--gold-secondary); font-weight: 600; font-size: 0.9rem; }

        .fetching-anim {
            animation: pulseText 1.5s infinite;
            opacity: 0.7;
        }

        @keyframes pulseText {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
        }

        .opacity-50 { opacity: 0.5; }
        .italic { font-style: italic; }
      `}</style>
    </div>
  );
};

export default function SurahPage() {
  const { id } = useParams();
  const { playChapter, playAyah, playTranslationText, stopTranslation, isPlaying, isPlayingTranslation, currentTranslationVerseKey, currentChapterId, togglePlay, translationVoice } = useAudio();
  const { arabicFontSize, setArabicFontSize, readingComfortMode, toggleReadingComfortMode, focusMode, toggleFocusMode } = useSettings();
  const { markAyahRead, setLastRead } = useProgress();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<TranslationResource[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState(20); // Default: Sahih International
  const [memoMode, setMemoMode] = useState(false);
  const [visibleVerses, setVisibleVerses] = useState(1);
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlayHeader = () => {
    if (isPlaying && currentChapterId === parseInt(id as string)) {
      togglePlay();
      return;
    }

    if (chapter) {
      if (translationVoice) {
        // If translation Text-to-Speech is enabled, we MUST play verse-by-verse to allow the TTS engine to speak in between.
        playVersesSequentially(0);
      } else {
        // If translation is disabled, play the single, seamless chapter MP3
        playChapter(chapter.id, chapter.name_complex);
      }
    }
  };

  const playVersesSequentially = (startIndex: number) => {
    if (!chapter || startIndex >= verses.length) return;

    const v = verses[startIndex];
    const transLang = translations.find(t => t.id === selectedTranslation)?.language_name || 'english';
    const transText = v.translations?.[0]?.text.replace(/<[^>]*>?/gm, '') || '';

    playAyah(
      v.verse_key,
      chapter.id,
      chapter.name_complex
    );
  };

  const isCurrentPlaying = isPlaying && currentChapterId === parseInt(id as string);

  useEffect(() => {
    async function loadInitialData() {
      if (!id) return;
      const chapterId = parseInt(id as string);
      const [chapterData, transList] = await Promise.all([
        fetchChapterInfo(chapterId),
        fetchTranslationsList()
      ]);
      setChapter(chapterData);

      // Deduplicate translations: keep only one translation per language
      const uniqueLangs = new Map<string, TranslationResource>();
      transList.forEach(t => {
        const langCode = t.language_name.toLowerCase();
        if (!uniqueLangs.has(langCode)) {
          uniqueLangs.set(langCode, t);
        }
      });
      // Sort alphabetically
      const finalTrans = Array.from(uniqueLangs.values()).sort((a, b) => a.language_name.localeCompare(b.language_name));
      setTranslations(finalTrans);

      if (chapterData) {
        const versesData = await fetchVersesByChapter(chapterId, {
          translationId: selectedTranslation,
          perPage: chapterData.verses_count
        });
        setVerses(versesData);
      }
      setLoading(false);
    }
    loadInitialData();
  }, [id]);

  useEffect(() => {
    async function updateTranslation() {
      if (!chapter) return;
      setLoading(true);
      const versesData = await fetchVersesByChapter(chapter.id, {
        translationId: selectedTranslation,
        perPage: chapter.verses_count
      });
      setVerses(versesData);
      setLoading(false);
    }
    if (chapter) updateTranslation();
  }, [selectedTranslation]);

  useEffect(() => {
    if (memoMode) {
      setVisibleVerses(1); // Reset to show only the first verse when entering memo mode
    } else {
      setVisibleVerses(verses.length); // Show all verses when exiting memo mode
    }
  }, [memoMode, verses.length]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Illuminating the Verses...</p>
        <style jsx>{`
          .loading-state {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--gold-primary);
          }
          .loader {
            width: 48px;
            height: 48px;
            border: 5px solid var(--emerald-medium);
            border-bottom-color: var(--gold-primary);
            border-radius: 50%;
            animation: rotation 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="surah-container">
      <header className="surah-header">
        <Link href="/" className="back-link">← Index</Link>
        <div className="surah-title">
          <h1 className="gold-text font-display">{chapter?.name_complex}</h1>
          <div className="translation-selector relative" ref={dropdownRef}>
            <div
              className="custom-dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {translations.find(t => t.id === selectedTranslation)?.language_name.toUpperCase() || 'SELECT LANGUAGE'}
              <span className="dropdown-arrow">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="custom-dropdown-menu glass-card">
                <input
                  type="text"
                  className="dropdown-search"
                  placeholder="Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <div className="dropdown-options">
                  {translations
                    .filter(t => t.language_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(t => (
                      <button
                        key={t.id}
                        className={`dropdown-option ${selectedTranslation === t.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTranslation(t.id);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        {t.language_name.charAt(0).toUpperCase() + t.language_name.slice(1)}
                      </button>
                    ))}
                  {translations.filter(t => t.language_name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="no-results">No languages found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="settings-wrapper">
            <button className="settings-toggle-btn" onClick={() => setShowSettings(!showSettings)}>
              ⚙️
            </button>
            {showSettings && (
              <div className="reading-settings-popover glass-card">
                <div className="setting-row">
                  <span className="setting-label">Arabic Font Size</span>
                  <div className="size-toggles">
                    {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map(size => (
                      <button
                        key={size}
                        className={`size-btn ${arabicFontSize === size ? 'active' : ''}`}
                        onClick={() => setArabicFontSize(size)}
                      >
                        {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Comfort Mode</span>
                  <button
                    className={`toggle-switch ${readingComfortMode ? 'on' : 'off'}`}
                    onClick={toggleReadingComfortMode}
                  >
                    <div className="toggle-thumb" />
                  </button>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Focus Mode</span>
                  <button
                    className={`toggle-switch ${focusMode ? 'on' : 'off'}`}
                    onClick={toggleFocusMode}
                  >
                    <div className="toggle-thumb" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className={`memo-toggle ${focusMode ? 'active' : ''}`} onClick={toggleFocusMode} title="Focus Mode">
            👁️
          </button>
          <button className={`memo-toggle ${memoMode ? 'active' : ''}`} onClick={() => setMemoMode(!memoMode)}>
            {memoMode ? 'EXIT MEMO' : 'MEMO MODE'}
          </button>
          <button className={`play-header-btn ${isCurrentPlaying ? 'playing' : ''}`} onClick={handlePlayHeader}>
            {isCurrentPlaying ? 'PAUSE' : 'PLAY SURAH'}
          </button>
          {!focusMode && (
            <div className="surah-arabic-title amiri-text">
              {chapter?.name_arabic}
            </div>
          )}
        </div>
      </header>

      {!focusMode && (
        <div style={{ maxWidth: 320, margin: '0 auto 2rem' }}>
          <OrnateDivider />
        </div>
      )}

      <main className="verses-list">
        {chapter?.bismillah_pre && !focusMode && (
          <div className="bismillah amiri-text">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>
        )}

        {/* Render visible verses, plus 1 more if in memo mode (the blurred one) */}
        {verses.slice(0, memoMode ? visibleVerses + 1 : verses.length).map((verse, index) => (
          <VerseCard
            key={verse.id}
            verse={verse}
            isMemoMode={memoMode}
            isBlurred={memoMode && index === visibleVerses} // Blur the very last item in memo mode
            focusMode={focusMode}
            onShare={(v) => setShareVerse(v)}
            onPlay={(v) => playAyah(
              v.verse_key,
              chapter?.id || 0,
              chapter?.name_complex || ''
            )}
            onPlayTranslation={(text) => playTranslationText(
              text,
              translations.find(t => t.id === selectedTranslation)?.language_name || 'english',
              verse.verse_key
            )}
            isTranslationPlaying={isPlayingTranslation && currentTranslationVerseKey === verse.verse_key}
            onStopTranslation={stopTranslation}
            onRead={() => {
              markAyahRead(verse.verse_key);
              setLastRead(chapter?.name_complex || '', verse.verse_key, chapter?.id || 0);
            }}
          />
        ))}

        {memoMode && visibleVerses < verses.length && (
          <button className="primary-button show-next-btn" onClick={() => setVisibleVerses(prev => prev + 1)}>
            Reveal Next Ayah
          </button>
        )}

        {shareVerse && (
          <AyahShareModal
            verse={{
              text_uthmani: shareVerse.text_uthmani,
              translation: shareVerse.translations?.[0]?.text.replace(/<[^>]*>?/gm, '') || '',
              surahName: chapter?.name_complex || '',
              ayahNumber: shareVerse.verse_number
            }}
            onClose={() => setShareVerse(null)}
          />
        )}
      </main>

      {!loading && !focusMode && verses.length > 0 && (
        <footer className="surah-footer">
          <div className="footer-divider"></div>
          <Link href="/" className="return-index-btn glass-card">
            <span className="icon">←</span> Return to Surah Index
          </Link>
        </footer>
      )}

      <style jsx>{`
        .surah-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .surah-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4rem;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(18, 18, 18, 0.9);
          backdrop-filter: blur(15px);
          padding: 1.5rem 0;
          border-bottom: 1px solid var(--gold-primary);
          transition: transform 0.4s ease;
        }
        
        /* Ensure the header slides away entirely in focus mode */
        :global(.focus-mode-active) .surah-header {
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
        }

        .back-link {
          color: var(--emerald-light);
          font-size: 0.9rem;
        }

        .surah-title {
          text-align: center;
        }

        .surah-title h1 {
          font-size: 2.2rem;
          margin: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .settings-wrapper {
            position: relative;
        }

        .settings-toggle-btn {
            background: none;
            border: 1px solid var(--emerald-light);
            color: var(--emerald-light);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1.2rem;
        }

        .settings-toggle-btn:hover {
            border-color: var(--gold-primary);
            background: rgba(212, 175, 55, 0.1);
        }

        .reading-settings-popover {
            position: absolute;
            top: 50px;
            right: 0;
            width: 300px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            background: var(--dark-green);
            border: 1px solid var(--gold-primary);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            border-radius: 12px;
            z-index: 200;
        }

        .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .setting-label {
            font-size: 0.9rem;
            color: var(--white);
            font-weight: 500;
        }

        .size-toggles {
            display: flex;
            gap: 0.5rem;
            background: rgba(4, 57, 39, 0.5);
            padding: 0.3rem;
            border-radius: 8px;
        }

        .size-btn {
            background: transparent;
            border: none;
            color: var(--emerald-light);
            width: 30px;
            height: 30px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
            font-size: 0.8rem;
        }
        
        .size-btn.active {
            background: var(--gold-primary);
            color: var(--matte-black);
        }

        .toggle-switch {
            width: 50px;
            height: 26px;
            border-radius: 13px;
            border: 2px solid var(--emerald-medium);
            background: transparent;
            position: relative;
            cursor: pointer;
            transition: all 0.3s;
            padding: 0;
        }

        .toggle-switch.on {
            background: var(--gold-primary);
            border-color: var(--gold-primary);
        }

        .toggle-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--emerald-light);
            position: absolute;
            top: 2px;
            left: 3px;
            transition: all 0.3s;
        }

        .toggle-switch.on .toggle-thumb {
            left: 25px;
            background: var(--matte-black);
        }

        .play-header-btn {
            background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
            color: var(--matte-black);
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 30px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .play-header-btn.playing {
            background: var(--emerald-medium);
            color: var(--gold-primary);
            border: 1px solid var(--gold-primary);
        }

        .memo-toggle {
            background: none;
            border: 1px solid var(--emerald-light);
            color: var(--emerald-light);
            padding: 0.6rem 1.2rem;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .memo-toggle.active {
            background: rgba(212, 175, 55, 0.2);
            color: var(--gold-primary);
            border-color: var(--gold-primary);
            box-shadow: 0 0 10px var(--gold-glow);
        }

        .show-next-btn {
            margin: 2rem 0 4rem 0;
            background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
            color: var(--matte-black);
            border: none;
            padding: 1rem 3rem;
            font-size: 1.2rem;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .translation-selector {
            margin-top: 0.5rem;
        }

        .trans-select {
            background: rgba(4, 57, 39, 0.4);
            border: 1px solid var(--emerald-medium);
            color: var(--gold-primary);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            outline: none;
            cursor: pointer;
        }

        .subtitle {
          font-size: 1rem;
          color: var(--emerald-light);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .surah-footer {
          margin-top: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          padding-bottom: 2rem;
        }

        .footer-divider {
          width: 50px;
          height: 3px;
          background: var(--gold-primary);
          border-radius: 2px;
          opacity: 0.5;
        }

        .return-index-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2.5rem;
          border-radius: 30px;
          color: var(--gold-secondary);
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          border-color: rgba(212, 175, 55, 0.2);
        }

        .return-index-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold-primary);
          color: var(--gold-primary);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .return-index-btn .icon {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .return-index-btn:hover .icon {
          transform: translateX(-5px);
        }

        .surah-arabic-title {
          font-size: 2.5rem;
          color: var(--gold-primary);
        }

        .verses-list {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bismillah {
          font-size: 2.5rem;
          color: var(--white);
          margin-bottom: 3rem;
          text-align: center;
        }

        .amiri-text {
          font-family: var(--font-amiri), serif;
        }

        @media (max-width: 768px) {
          .surah-header {
            flex-direction: column;
            gap: 1rem;
          }
          .surah-arabic-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
