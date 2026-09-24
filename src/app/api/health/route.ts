import { NextResponse } from 'next/server';

// Liveness/readiness probe for the hosted web deployment. Not available in
// the Capacitor static-export build (API routes aren't part of that bundle,
// same as /api/download-audio) - the native app has no server of its own.
//
// Deliberately does not call out to Supabase or Quran.com: a health check
// that depends on third parties turns their outages into false alarms about
// this deployment. It reports whether those integrations are *configured*,
// which is what a deploy actually controls.
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return NextResponse.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            checks: {
                supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
            },
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
