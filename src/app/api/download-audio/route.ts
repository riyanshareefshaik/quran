import { NextRequest, NextResponse } from 'next/server';

// Only allow proxying audio from Quran.com's own CDN (any subdomain) —
// never an arbitrary URL, to avoid this becoming an open proxy.
function isAllowedHost(hostname: string): boolean {
    return hostname === 'quran.com' || hostname.endsWith('.quran.com') || hostname === 'qurancdn.com' || hostname.endsWith('.qurancdn.com');
}

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
    const filename = request.nextUrl.searchParams.get('filename') || 'surah.mp3';

    if (!audioUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(audioUrl);
    } catch {
        return new NextResponse('Invalid url', { status: 400 });
    }

    if (!isAllowedHost(parsed.hostname)) {
        return new NextResponse('URL host not allowed', { status: 403 });
    }

    try {
        const upstream = await fetch(parsed.toString());
        if (!upstream.ok || !upstream.body) {
            return new NextResponse('Failed to fetch audio', { status: 502 });
        }

        // Server-to-server fetch has no CORS restriction, so this always
        // succeeds where a direct browser fetch() of the CDN URL wouldn't.
        return new NextResponse(upstream.body, {
            headers: {
                'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return new NextResponse('Failed to fetch audio', { status: 502 });
    }
}
