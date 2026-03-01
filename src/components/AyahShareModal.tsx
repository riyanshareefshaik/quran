'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AyahShareModalProps {
    verse: {
        text_uthmani: string;
        translation: string;
        surahName: string;
        ayahNumber: number;
    };
    onClose: () => void;
}

const AyahShareModal: React.FC<AyahShareModalProps> = ({ verse, onClose }) => {
    const [theme, setTheme] = useState<'emerald' | 'gold' | 'black'>('emerald');

    const themes = {
        emerald: {
            bg: 'linear-gradient(135deg, #043927, #0A5C36)',
            text: '#D4AF37',
            trans: '#FFFFFF'
        },
        gold: {
            bg: 'linear-gradient(135deg, #FFD700, #D4AF37)',
            text: '#121212',
            trans: '#043927'
        },
        black: {
            bg: 'linear-gradient(135deg, #121212, #1E1E1E)',
            text: '#D4AF37',
            trans: '#FFFFFF'
        }
    };

    return (
        <div className="share-modal-overlay">
            <div className="share-modal-content glass-card">
                <div className="modal-header">
                    <h3 className="gold-text">Ayah Share Card</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="preview-container">
                    <div
                        className="share-card-preview"
                        id="share-card"
                        style={{ background: themes[theme].bg }}
                    >
                        <div className="card-pattern islamic-pattern"></div>
                        <div className="card-content">
                            <div className="card-logo">
                                <Image src="/logo.png" alt="Logo" width={40} height={40} />
                                <span style={{ color: themes[theme].text }}>Nur Al-Quran</span>
                            </div>

                            <p className="arabic-text amiri-text" style={{ color: themes[theme].text }}>
                                {verse.text_uthmani}
                            </p>

                            <p className="translation-text" style={{ color: themes[theme].trans }}>
                                {verse.translation}
                            </p>

                            <div className="card-footer" style={{ borderTop: `1px solid ${themes[theme].text}33` }}>
                                <span className="source" style={{ color: themes[theme].text }}>
                                    Surah {verse.surahName} • Ayah {verse.ayahNumber}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <div className="theme-selector">
                        {Object.keys(themes).map((t) => (
                            <button
                                key={t}
                                className={`theme-btn ${theme === t ? 'active' : ''}`}
                                onClick={() => setTheme(t as any)}
                                style={{ background: themes[t as keyof typeof themes].bg }}
                            ></button>
                        ))}
                    </div>

                    <button className="primary-button download-btn" onClick={() => alert('Download feature would use html2canvas in production.')}>
                        Download Image
                    </button>
                </div>
            </div>

            <style jsx>{`
        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .share-modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          background: var(--matte-black);
          border: 1px solid var(--gold-primary);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--white);
          font-size: 2rem;
          cursor: pointer;
        }

        .preview-container {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .share-card-preview {
          width: 350px;
          aspect-ratio: 4/5;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .card-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          pointer-events: none;
        }

        .card-content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
        }

        .card-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .arabic-text {
          font-size: 1.8rem;
          line-height: 2;
          direction: rtl;
        }

        .translation-text {
          font-size: 0.9rem;
          font-weight: 300;
          margin-top: 1rem;
        }

        .card-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }

        .theme-selector {
          display: flex;
          gap: 1rem;
        }

        .theme-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .theme-btn.active {
          border-color: var(--white);
          transform: scale(1.2);
        }

        .download-btn {
          width: 100%;
        }

        .amiri-text {
          font-family: var(--font-amiri), serif;
        }
      `}</style>
        </div>
    );
};

export default AyahShareModal;
