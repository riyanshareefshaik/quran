import type { Metadata, Viewport } from "next";
import { Inter, Amiri, Cinzel } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { BookmarkProvider } from "@/context/BookmarkContext";
import Sidebar from "@/components/Sidebar";
import AudioPlayer from "@/components/AudioPlayer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

// Classical engraved serif — carries the "gold lettering on a book cover"
// feel for major titles (site name, section titles, Surah names), while
// Inter stays the workhorse for body/UI text and Amiri for Arabic script.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nur Al-Quran | Light of the Quran",
  description: "A luxury, spiritually immersive Quran application. Authentic Uthmani script, beautiful recitations, and elegant design.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nur Al-Quran",
  },
  applicationName: "Nur Al-Quran",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#043927",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${amiri.variable} ${cinzel.variable}`}>
      <body className="islamic-pattern" suppressHydrationWarning>
        <SettingsProvider>
          <ProgressProvider>
            <BookmarkProvider>
              <AudioProvider>
                <Sidebar />
                <div className="main-layout-content">
                  {children}
                </div>
                <AudioPlayer />
              </AudioProvider>
            </BookmarkProvider>
          </ProgressProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
