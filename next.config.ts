import type { NextConfig } from "next";

// The app is built in two modes:
// 1. Normal server mode (default) — deployed to Vercel/Node, powers the
//    web version AND hosts the /api/tts route the mobile app calls remotely.
// 2. Static export mode (CAPACITOR_BUILD=true) — produces the `out/`
//    folder that gets wrapped into the iOS/Android native shell via
//    Capacitor. Static exports can't run API routes or middleware/proxy,
//    so headers() and the TTS route are skipped/inapplicable in this mode.
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isCapacitorBuild
    ? {
        output: "export",
        images: { unoptimized: true }, // static export can't use the Image Optimization API
        trailingSlash: true,           // avoids routing issues inside the native WebView
      }
    : {}),

  // headers() only applies in server mode; Next.js ignores it during
  // `output: 'export'` builds, so this is safe to leave unconditional.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(), camera=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "media-src 'self' https:",
              "connect-src 'self' https://api.quran.com https://verses.quran.com https://api.aladhan.com https://translate.google.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
