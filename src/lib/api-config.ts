import { Capacitor } from '@capacitor/core';

// When running as a bundled native app (Capacitor), the app has no local
// server. Any future server-only routes should be called via your hosted
// web deployment's copy of that route, using getApiBaseUrl() below.
//
// Set this to your production domain once you deploy the web version
// (e.g. to Vercel). You can override it at build time with:
//   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com npm run build:capacitor
const HOSTED_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://quran-eight-tau.vercel.app';

export function isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
}

export function getApiBaseUrl(): string {
    return isNativeApp() ? HOSTED_API_BASE_URL : '';
}
