import React from 'react';

/** Small horizontal divider: tapered gold lines flanking an 8-point rosette. */
const OrnateDivider: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => {
    return (
        <div className={`ornate-divider ${className}`} style={style} aria-hidden="true">
            <span className="ornate-divider-line" />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                    d="M9 0 L10.8 6.5 17 9 10.8 11.5 9 18 7.2 11.5 1 9 7.2 6.5 Z"
                    fill="var(--gold-primary)"
                />
            </svg>
            <span className="ornate-divider-line" />

            <style jsx>{`
                .ornate-divider {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                }

                .ornate-divider-line {
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(212, 175, 55, 0.6)
                    );
                }

                .ornate-divider-line:last-child {
                    background: linear-gradient(
                        90deg,
                        rgba(212, 175, 55, 0.6),
                        transparent
                    );
                }
            `}</style>
        </div>
    );
};

export default OrnateDivider;
