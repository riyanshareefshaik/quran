import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ProgressProvider } from "@/context/ProgressContext";
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
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${amiri.variable}`}>
      <body className="islamic-pattern" suppressHydrationWarning>
        <SettingsProvider>
          <ProgressProvider>
            <AudioProvider>
              <Sidebar />
              <div className="main-layout-content">
                {children}
              </div>
              <AudioPlayer />
            </AudioProvider>
          </ProgressProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
