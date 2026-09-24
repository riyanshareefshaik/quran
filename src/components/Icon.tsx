import React from 'react';

// Small inline icons. Unicode symbols like ▶ ⬇ ✨ render as colourful emoji
// on Android, so buttons use these SVGs instead for a consistent look.
type Name = 'play' | 'stop' | 'download' | 'search' | 'sparkle';

const PATHS: Record<Name, React.ReactNode> = {
    play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
    stop: <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none" />,
    download: <><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
    sparkle: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" fill="currentColor" stroke="none" />,
};

const Icon: React.FC<{ name: Name; size?: number; className?: string }> = ({ name, size = 16, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }}
    >
        {PATHS[name]}
    </svg>
);

export default Icon;
