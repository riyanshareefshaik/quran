import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'en';

    if (!text) {
        return new NextResponse('Missing text parameter', { status: 400 });
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
