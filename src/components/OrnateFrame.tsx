import React from 'react';

interface OrnateFrameProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/** Single quarter arabesque flourish — reused at all four corners via CSS transforms below. */
const CornerOrnament: React.FC = () => (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path
            d="M1 30 L1 9 Q1 1 9 1 L30 1"
            stroke="var(--gold-primary)"
            strokeWidth="1.25"
        />
        <path
            d="M1 30 Q13 30 13 18 Q13 9 6 9"
            stroke="var(--gold-primary)"
            strokeWidth="1"
            opacity="0.7"
        />
        <path
            d="M9 1 C9 8 10 12 17 13"
            stroke="var(--gold-primary)"
            strokeWidth="1"
            opacity="0.7"
        />
        <circle cx="9" cy="9" r="2.5" fill="var(--gold-primary)" opacity="0.9" />
        <path
            d="M9 4.5 L9.9 8.1 13.5 9 9.9 9.9 9 13.5 8.1 9.9 4.5 9 8.1 8.1 Z"
            fill="var(--gold-primary)"
            opacity="0.5"
        />
    </svg>
);

/**
 * A gold double-bordered panel with arabesque corner flourishes — the
 * "illuminated manuscript" signature element used for title-plate moments
 * (site header, section headers, Surah opening) across the app. Used
 * sparingly and only where content deserves a book-cover treatment.
 */
const OrnateFrame: React.FC<OrnateFrameProps> = ({ children, className = '', style }) => {
    return (
        <div className={`ornate-frame ${className}`} style={style}>
            <span className="ornate-corner ornate-corner-tl" aria-hidden="true">
                <CornerOrnament />
            </span>
            <span className="ornate-corner ornate-corner-tr" aria-hidden="true">
                <CornerOrnament />
            </span>
            <span className="ornate-corner ornate-corner-bl" aria-hidden="true">
                <CornerOrnament />
            </span>
            <span className="ornate-corner ornate-corner-br" aria-hidden="true">
                <CornerOrnament />
            </span>
            <div className="ornate-frame-content">{children}</div>

            <style jsx>{`
                .ornate-frame {
                    position: relative;
                    border: 1px solid var(--gold-primary);
                    padding: 2.5rem 2rem;
                }

                .ornate-frame::before {
                    content: '';
                    position: absolute;
                    inset: 10px;
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    pointer-events: none;
                }

                .ornate-frame-content {
                    position: relative;
                    z-index: 1;
                }

                .ornate-corner {
                    position: absolute;
                    width: 44px;
                    height: 44px;
                    display: block;
                    z-index: 2;
                    pointer-events: none;
                }

                .ornate-corner-tl { top: -1px; left: -1px; }
                .ornate-corner-tr { top: -1px; right: -1px; transform: scaleX(-1); }
                .ornate-corner-bl { bottom: -1px; left: -1px; transform: scaleY(-1); }
                .ornate-corner-br { bottom: -1px; right: -1px; transform: scale(-1, -1); }

                @media (max-width: 640px) {
                    .ornate-frame {
                        padding: 1.75rem 1.25rem;
                    }
                    .ornate-corner {
                        width: 32px;
                        height: 32px;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrnateFrame;
