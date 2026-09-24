'use client';

import React, { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { getReciter } from '@/lib/quran-api';
import ReciterPicker from '@/components/ReciterPicker';

const AudioPlayer: React.FC = () => {
  const {
    isPlaying,
    currentChapterName,
    currentReciterId,
    currentTime,
    duration,
    playbackSpeed,
    togglePlay,
    setSpeed,
    seek,
    stopPlayer,
    audioUrl,
    playNext,
    playPrevious,
    autoContinue,
    setAutoContinue,
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!audioUrl) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className={`audio-player-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="glass-card audio-container">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-slider"
        />

        <div className="player-main">
          {/* Chapter Info */}
          <div className="chapter-info" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="pulse-icon">{isPlaying ? '♪' : '||'}</div>
            <div className="text-info">
              <span className="chapter-name">{currentChapterName}</span>
              <span className="reciter-info">
                {getReciter(currentReciterId).name}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <button className="skip-btn" onClick={playPrevious} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
            </button>
            <button className="play-btn gold-text" onClick={togglePlay}>
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button className="skip-btn" onClick={playNext} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
            </button>
            <button className="close-btn" onClick={(e) => { e.stopPropagation(); stopPlayer(); }} aria-label="Close Player">
              ✕
            </button>
          </div>

          <div className="time-info">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Expanded Settings */}
        {isExpanded && (
          <div className="expanded-settings">
            <div className="setting-group">
              <label>Qari</label>
              <ReciterPicker compact />
            </div>

            <div className="setting-group">
              <label>Continuous play</label>
              <button
                type="button"
                role="switch"
                aria-checked={autoContinue}
                className={`continue-toggle ${autoContinue ? 'on' : ''}`}
                onClick={() => setAutoContinue(!autoContinue)}
              >
                <span className="continue-track"><span className="continue-thumb" /></span>
                {autoContinue ? 'Plays the next verse or surah automatically' : 'Stops after each verse or surah'}
              </button>
            </div>

            <div className="setting-group">
              <label>Playback Speed</label>
              <div className="speed-btns">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => setSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .audio-player-wrapper {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @media (max-width: 768px) {
          .audio-player-wrapper {
            /* Sit above the 70px mobile bottom tab bar instead of
               overlapping it. */
            bottom: calc(70px + 1rem);
            width: 94%;
          }
        }

        @media (max-width: 420px) {
          .audio-container {
            padding: 0.75rem 1rem !important;
          }
        }

        .audio-container {
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(4, 57, 39, 0.9);
          border: 1px solid var(--gold-primary);
        }

        .progress-slider {
          width: 100%;
          accent-color: var(--gold-primary);
          height: 4px;
          cursor: pointer;
        }

        .player-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .chapter-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          flex: 1;
        }

        .pulse-icon {
          width: 30px;
          height: 30px;
          background: var(--gold-primary);
          color: var(--matte-black);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          animation: ${isPlaying ? 'pulse 2s infinite' : 'none'};
        }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }

        .text-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .chapter-name {
          font-weight: 700;
          color: var(--white);
        }

        .reciter-info {
          font-size: 0.75rem;
          color: var(--gold-primary);
        }

        .play-btn {
          background: none;
          border: 1px solid var(--gold-primary);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .play-btn:hover {
          background: var(--gold-primary);
          color: var(--matte-black);
        }

        .skip-btn {
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: var(--gold-primary);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .skip-btn:hover {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.12);
        }

        .continue-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-family: inherit;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 0;
          text-align: left;
        }

        .continue-track {
          width: 40px;
          height: 22px;
          flex-shrink: 0;
          border-radius: 11px;
          border: 2px solid var(--emerald-medium);
          position: relative;
          transition: all 0.2s;
        }

        .continue-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--emerald-light);
          transition: all 0.2s;
        }

        .continue-toggle.on .continue-track {
          background: var(--gold-primary);
          border-color: var(--gold-primary);
        }

        .continue-toggle.on .continue-thumb {
          left: 20px;
          background: var(--matte-black);
        }

        .skip-btn:focus-visible, .continue-toggle:focus-visible, .play-btn:focus-visible {
          outline: 2px solid var(--gold-primary);
          outline-offset: 2px;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--emerald-light);
          font-size: 1.2rem;
          cursor: pointer;
          margin-left: 0.5rem;
          transition: color 0.3s;
        }

        .close-btn:hover {
          color: var(--gold-primary);
        }

        .time-info {
          font-size: 0.8rem;
          color: var(--emerald-light);
          min-width: 80px;
          text-align: right;
        }

        .expanded-settings {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .setting-group label {
          display: block;
          font-size: 0.7rem;
          color: var(--emerald-light);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          text-align: left;
        }

        .reciter-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .reciter-btn, .speed-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: 0.5rem;
          font-size: 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reciter-btn.active, .speed-btn.active {
          background: var(--gold-primary);
          color: var(--matte-black);
          border-color: var(--gold-primary);
        }

        .speed-btns {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .toggle-switch {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--glass-border);
          cursor: pointer;
          position: relative;
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
          background: var(--white);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-switch.on .toggle-thumb {
          transform: translateX(20px);
          background: var(--matte-black);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
