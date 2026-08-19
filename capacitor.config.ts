import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nuralquran.app',
  appName: 'Nur Al-Quran',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Locks the WebView to only ever load/navigate to these origins.
    // Prevents malicious redirects or injected links from hijacking
    // the app shell to load arbitrary external content.
    allowNavigation: [
      'api.quran.com',
      'verses.quran.com',
      'api.aladhan.com',
    ],
  },
};

export default config;
