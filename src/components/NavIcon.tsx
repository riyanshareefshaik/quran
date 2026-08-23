import React from 'react';

type IconName = 'dashboard' | 'quran' | 'essentials';

/**
 * Uniform, hand-drawn line icons for primary navigation — replaces raw
 * emoji glyphs, which render inconsistently across platforms (a plain
 * monochrome "⌂" next to full-color "📖"/"🤲" looks mismatched, and
 * emoji rendering varies further between iOS/Android in the native app).
 */
const NavIcon: React.FC<{ name: IconName; size?: number }> = ({ name, size = 20 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
    };

    switch (name) {
        // Pointed arch, echoing mihrab/mosque architecture rather than a generic house.
        case 'dashboard':
            return (
                <svg {...common}>
                    <path d="M4 21V11.5C4 7 7.5 3 12 3C16.5 3 20 7 20 11.5V21" />
                    <path d="M4 21H20" />
                    <path d="M9.5 21V15C9.5 13.6 10.6 12.5 12 12.5C13.4 12.5 14.5 13.6 14.5 15V21" />
                </svg>
            );
        // Open book, for the Quran section.
        case 'quran':
            return (
                <svg {...common}>
                    <path d="M12 6.5C10.6 5.3 8.6 4.5 6 4.5C5 4.5 4.3 4.6 3.5 4.8V17.8C4.3 17.6 5 17.5 6 17.5C8.6 17.5 10.6 18.3 12 19.5" />
                    <path d="M12 6.5C13.4 5.3 15.4 4.5 18 4.5C19 4.5 19.7 4.6 20.5 4.8V17.8C19.7 17.6 19 17.5 18 17.5C15.4 17.5 13.4 18.3 12 19.5" />
                    <path d="M12 6.5V19.5" />
                </svg>
            );
        // Lantern, tying into the "Nur" (light) theme for daily adhkar/essentials.
        case 'essentials':
            return (
                <svg {...common}>
                    <path d="M9 3H15" />
                    <path d="M12 3V5.5" />
                    <path d="M7.5 8.5C7.5 6.6 9.6 5 12 5C14.4 5 16.5 6.6 16.5 8.5V15.5C16.5 17.4 14.4 19 12 19C9.6 19 7.5 17.4 7.5 15.5V8.5Z" />
                    <path d="M9 12H15" />
                    <path d="M12 19V21.5" />
                    <path d="M9.5 21.5H14.5" />
                </svg>
            );
        default:
            return null;
    }
};

export default NavIcon;
