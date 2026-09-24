import { NextRequest, NextResponse } from 'next/server';

// Only allow proxying audio from Quran.com's own CDNs — never an arbitrary
// URL, to avoid this becoming an open proxy. Chapter recitations returned by
// api.quran.com are served from download.quranicaudio.com.
export function isAllowedHost(hostname: string): boolean {
    return hostname === 'quran.com' || hostname.endsWith('.quran.com') ||
        hostname === 'qurancdn.com' || hostname.endsWith('.qurancdn.com') ||
        hostname === 'download.quranicaudio.com';
}

// Longest full-surah recitations are well under this.
const MAX_AUDIO_BYTES = 200 * 1024 * 1024;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    timestamps.push(now);
    requestLog.set(ip, timestamps);
    if (requestLog.size > 5000) {
        for (const [key, ts] of requestLog) {
            if (ts.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) requestLog.delete(key);
        }
    }
    return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function GET(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    if (isRateLimited(ip)) {
        return new NextResponse('Too many requests', { status: 429 });
    }

    const audioUrl = request.nextUrl.searchParams.get('url');
    const filename = (request.nextUrl.searchParams.get('filename') || 'surah.mp3').slice(0, 100);

    if (!audioUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(audioUrl);
    } catch {
        return new NextResponse('Invalid url', { status: 400 });
    }

    // HTTPS only, no embedded credentials, no non-default ports.
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) {
        return new NextResponse('URL not allowed', { status: 403 });
    }

    if (!isAllowedHost(parsed.hostname)) {
        return new NextResponse('URL host not allowed', { status: 403 });
    }

    try {
        // Don't follow redirects: an allowed host redirecting elsewhere would
        // otherwise turn this route into a proxy for arbitrary URLs.
        const upstream = await fetch(parsed.toString(), {
            redirect: 'error',
            signal: AbortSignal.timeout(30_000),
        });
        if (!upstream.ok || !upstream.body) {
            return new NextResponse('Failed to fetch audio', { status: 502 });
        }

        const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
        if (!contentType.startsWith('audio/')) {
            return new NextResponse('Upstream did not return audio', { status: 502 });
        }

        const contentLength = Number(upstream.headers.get('content-length') || 0);
        if (contentLength > MAX_AUDIO_BYTES) {
            return new NextResponse('Audio file too large', { status: 413 });
        }

        // Server-to-server fetch has no CORS restriction, so this always
        // succeeds where a direct browser fetch() of the CDN URL wouldn't.
        return new NextResponse(upstream.body, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Failed to fetch audio', { status: 502 });
    }
}
