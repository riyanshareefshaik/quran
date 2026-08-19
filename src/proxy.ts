import { NextRequest, NextResponse } from "next/server";

// Lightweight, defense-in-depth request gate for all /api/* routes.
// Route-specific limits (e.g. TTS) still apply on top of this.
//
// NOTE: like the per-route limiter, this is in-memory and per-instance.
// It resets on redeploy/restart and won't be shared across multiple
// server instances. That's an acceptable trade-off for a small app;
// if you scale horizontally, move this to Upstash Redis or similar.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60; // generous global ceiling across all API routes
const log = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = (log.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    timestamps.push(now);
    log.set(ip, timestamps);

    if (log.size > 5000) {
        for (const [key, ts] of log) {
            if (ts.every((t) => now - t > WINDOW_MS)) log.delete(key);
        }
    }

    return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

export function proxy(request: NextRequest) {
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

    if (isRateLimited(ip)) {
        return new NextResponse("Too many requests", { status: 429 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
