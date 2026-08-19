import { Capacitor } from '@capacitor/core';

// When running as a bundled native app (Capacitor), the app has no local
// server — /api/tts doesn't exist inside the shipped bundle. Instead we
// call your hosted web deployment's copy of that same route.
//
// Set this to your production domain once you deploy the web version
// (e.g. to Vercel). You can override it at build time with:
//   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com npm run build:capacitor
const HOSTED_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://REPLACE-WITH-YOUR-DOMAIN.com';

export function isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
}

export function getApiBaseUrl(): string {
    return isNativeApp() ? HOSTED_API_BASE_URL : '';
}

export function buildTtsUrl(lang: string, text: string): string {
    const base = getApiBaseUrl();
    return `${base}/api/tts?lang=${lang}&text=${encodeURIComponent(text)}`;
}
