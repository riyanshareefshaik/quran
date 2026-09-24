import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Privacy Policy | Nur Al-Quran',
    description: 'What Nur Al-Quran stores, why, and how to delete it.',
};

// Keep this in sync with what the app actually does. If you add a feature
// that collects or shares data, update this page in the same change.
const SECTIONS: LegalSection[] = [
    {
        title: 'The short version',
        bullets: [
            'Nur Al-Quran has no user accounts or sign-in. Your notes, favorites, bookmarks and reading progress stay on your device.',
            'We do not show ads, sell data, or use advertising or tracking cookies.',
            'We count page visits anonymously (page and date only) to understand which features are used.',
        ],
    },
    {
        title: 'Data stored only on your device',
        paragraphs: ['These are saved in your browser or app storage and are never sent to us:'],
        bullets: [
            'Bookmarked surahs and your reading progress (verses read, streak, last read position).',
            'Your notes on ayahs, favorites and collections, and your reading history (My Library).',
            'Reading settings such as Arabic font size, comfort mode and focus mode.',
            'Your preferred hadith translation language, and announcements you have dismissed.',
            'Quran text, surah details and tafsir you have opened or saved for offline reading.',
            'Your chosen reciter and tafsir, where you stopped listening, and your prayer-alert settings.',
        ],
    },
    {
        title: 'Your location (prayer times and Qibla)',
        paragraphs: [
            'If you allow location access, your device’s coordinates are sent directly from your device to the AlAdhan prayer-times service to calculate prayer times, the Islamic calendar and the Qibla direction. We do not receive or store your location.',
            'You can refuse or withdraw location permission at any time in your browser or phone settings; the rest of the app keeps working.',
            'Prayer-time alerts are scheduled on your own device. No alert data is sent to us.',
        ],
    },
    {
        title: 'Feedback and content reports',
        paragraphs: [
            'When you send feedback we store your message and category, plus your name and email only if you enter them (we use your email solely to reply to you).',
            'When you report a mistake in Quran, hadith, dua or guide content we store your description, which item it concerns and the page it was on. Reports are used only to review and correct content.',
        ],
    },
    {
        title: 'Anonymous usage statistics',
        paragraphs: [
            'Each time a page is opened, we add one to a counter for that page and day (for example “/hadith, 23 September: 42 views”). No IP address, device identifier or cookie is linked to these counts.',
            'Like almost every website, our hosting and database providers automatically process technical data such as IP addresses in server logs to deliver the service and protect it from abuse. We do not use these logs to identify or profile you.',
        ],
    },
    {
        title: 'Services we rely on',
        bullets: [
            'Supabase — database for feedback, content reports, announcements and anonymous page counts, and the administrators’ sign-in. Data is hosted in Supabase’s Tokyo (Japan) region.',
            'Vercel — hosts the website.',
            'Quran.com (Quran Foundation) — Quran text, translations and recitation audio.',
            'EveryAyah — verse-by-verse recitation audio for some reciters.',
            'AlAdhan — prayer times, Islamic calendar and Qibla direction.',
            'jsDelivr CDN — delivers the open-source hadith collection files.',
        ],
        paragraphs: ['These services receive only what they need to perform their function and process it under their own privacy policies.'],
    },
    {
        title: 'Who can see your data',
        paragraphs: [
            'Administrators can read feedback and content reports in order to respond to them. The service operator can technically access the database through the hosting provider for maintenance and security, and does so only when necessary.',
        ],
    },
    {
        title: 'How long we keep data',
        bullets: [
            'Feedback and reports: until they are resolved and deleted by an administrator.',
            'Page-view counts: kept as anonymous daily totals.',
            'Data on your device: until you clear it or uninstall the app.',
        ],
    },
    {
        title: 'Your choices and rights',
        bullets: [
            'Delete notes, favorites, collections and reading history at any time in My Library, or remove all app data in your browser or phone settings.',
            'Ask us to delete feedback you sent, or ask any question about your data, through the Feedback page.',
            'Depending on where you live, you may also have rights to access, correct or export your data, or to complain to a data-protection authority.',
        ],
    },
    {
        title: 'Security',
        paragraphs: ['All connections use HTTPS. Database access is restricted by row-level security, and administrator sessions sign out automatically after inactivity. No system is perfectly secure, but we work to protect your information.'],
    },
    {
        title: 'Children',
        paragraphs: ['The app can be used by all ages. It has no accounts and does not knowingly collect personal information from children; if a child sends feedback with personal details, a parent can ask us to delete it through the Feedback page.'],
    },
    {
        title: 'Changes to this policy',
        paragraphs: ['If we change how we handle data, we will update this page and its effective date, and highlight significant changes in the app.'],
    },
    {
        title: 'Contact',
        paragraphs: ['Questions or requests about your privacy: please contact us through the Feedback page and choose “Other”.'],
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            subtitle="Your data, explained simply"
            effective="24 September 2026"
            intro="Nur Al-Quran is a free app for reading the Quran, hadith, duas and guidance. This policy explains what information the app uses, why, and the choices you have."
            sections={SECTIONS}
        />
    );
}
