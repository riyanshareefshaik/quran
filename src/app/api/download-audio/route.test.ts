import { describe, it, expect } from 'vitest';
import { isAllowedHost } from './route';

describe('isAllowedHost', () => {
    it('allows quran.com and its subdomains', () => {
        expect(isAllowedHost('quran.com')).toBe(true);
        expect(isAllowedHost('api.quran.com')).toBe(true);
        expect(isAllowedHost('verses.quran.com')).toBe(true);
    });

    it('allows qurancdn.com and its subdomains', () => {
        expect(isAllowedHost('qurancdn.com')).toBe(true);
        expect(isAllowedHost('cdn.qurancdn.com')).toBe(true);
    });

    it('allows download.quranicaudio.com specifically', () => {
        expect(isAllowedHost('download.quranicaudio.com')).toBe(true);
    });

    it('rejects unrelated hosts', () => {
        expect(isAllowedHost('evil.com')).toBe(false);
        expect(isAllowedHost('quranicaudio.com')).toBe(false); // not the allowed subdomain
        expect(isAllowedHost('notquran.com')).toBe(false);
    });

    it('rejects lookalike hosts that merely contain the allowed domain', () => {
        expect(isAllowedHost('quran.com.evil.com')).toBe(false);
        expect(isAllowedHost('xquran.com')).toBe(false);
    });
});
