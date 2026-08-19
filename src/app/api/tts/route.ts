import { NextRequest, NextResponse } from 'next/server';

// --- Simple in-memory rate limiter (per IP) ---
// NOTE: this resets on server restart and doesn't share state across
// multiple instances/regions. Fine for a small deployment; swap for
// Upstash/Redis-backed rate limiting if you scale to multiple instances.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;  // 20 requests per minute per IP
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = (requestLog.get(ip) || []).filter(
        (t) => now - t < RATE_LIMIT_WINDOW_MS
    );
    timestamps.push(now);
    requestLog.set(ip, timestamps);

    // periodic cleanup so the map doesn't grow forever
    if (requestLog.size > 5000) {
        for (const [key, ts] of requestLog) {
            if (ts.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) {
                requestLog.delete(key);
            }
        }
    }

    return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

const MAX_TEXT_LENGTH = 300; // Google's TTS endpoint also caps around here
const ALLOWED_LANGS = new Set([
    'en', 'ar', 'ur', 'fr', 'es', 'id', 'tr', 'ms', 'bn', 'hi', 'de', 'ru', 'zh'
]);

export async function GET(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    if (isRateLimited(ip)) {
        return new NextResponse('Too many requests', { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'en';

    if (!text) {
        return new NextResponse('Missing text parameter', { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return new NextResponse(
            `Text too long (max ${MAX_TEXT_LENGTH} characters)`,
            { status: 400 }
        );
    }

    if (!ALLOWED_LANGS.has(lang)) {
        return new NextResponse('Unsupported language', { status: 400 });
    }

    try {
        // Use the 'tw-ob' client flag which allows programmatic server requests
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://translate.google.com/',
            }
        });

        if (!response.ok) {
            throw new Error(`Google TTS failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            }
        });
    } catch (error) {
        console.error('TTS Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
