import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Terms of Use | Nur Al-Quran',
    description: 'The terms for using Nur Al-Quran.',
};

const SECTIONS: LegalSection[] = [
    {
        title: 'Agreement',
        paragraphs: ['By using Nur Al-Quran you agree to these terms and to our Privacy Policy. If you do not agree, please do not use the app.'],
    },
    {
        title: 'About the app',
        paragraphs: ['Nur Al-Quran is provided free of charge for personal, educational and devotional use. We may improve, change or pause features at any time.'],
    },
    {
        title: 'Religious content',
        bullets: [
            'The Arabic text of the Quran is shown from Quran.com. Translations convey the meaning of the Quran in other languages; they are human works and are not the Quran itself.',
            'Hadith are shown from established collections with the gradings given by the named scholars.',
            'Guides, duas and explanations summarise the position held by the majority of scholars, with references. They are for learning and are not a religious ruling (fatwa). Where your situation needs a ruling, please consult a qualified scholar.',
            'We take great care over accuracy. If you notice a mistake, please use the “Report” button next to the content so it can be reviewed and corrected.',
        ],
    },
    {
        title: 'Prayer times and Qibla',
        paragraphs: ['Prayer times, the Islamic calendar and the Qibla direction are calculated automatically from your location and a calculation method. They can differ from your local mosque’s timetable or official moon-sighting announcements. When in doubt, follow your local mosque or Islamic authority.'],
    },
    {
        title: 'Your account',
        bullets: [
            'Accounts are optional. Sign in only with a mobile number that belongs to you.',
            'Keep your phone secure — anyone who can receive your sign-in codes can access your account.',
            'You can delete your account at any time from the Account page.',
        ],
    },
    {
        title: 'Acceptable use',
        paragraphs: ['Please do not:'],
        bullets: [
            'send spam, abusive, hateful or misleading content through feedback or reports;',
            'try to access data or admin features you are not authorised to use, or interfere with the app’s security;',
            'overload the service, for example by automated scraping at high volume;',
            'present the app’s content in a way that misrepresents its sources.',
        ],
    },
    {
        title: 'Third-party content and services',
        paragraphs: ['Quran text, translations and audio come from Quran.com; hadith text from the open-source hadith-api dataset; prayer times from AlAdhan. These remain subject to their providers’ own terms and licences. Links to external websites are provided for convenience; we are not responsible for their content.'],
    },
    {
        title: 'No warranty',
        paragraphs: ['The app is provided “as is”. While we strive for accuracy and availability, we cannot guarantee that it will always be error-free or uninterrupted.'],
    },
    {
        title: 'Limitation of liability',
        paragraphs: ['To the extent permitted by law, we are not liable for any indirect or consequential loss arising from use of the app. Nothing in these terms limits rights you have under consumer-protection laws that cannot be excluded.'],
    },
    {
        title: 'Suspension',
        paragraphs: ['We may suspend accounts or block access that breaks these terms or threatens the safety of the service or its users.'],
    },
    {
        title: 'Changes to these terms',
        paragraphs: ['We may update these terms. The effective date above shows when they last changed; continuing to use the app after a change means you accept the updated terms.'],
    },
    {
        title: 'Contact',
        paragraphs: ['Questions about these terms: please contact us through the Feedback page.'],
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Use"
            subtitle="Using Nur Al-Quran"
            effective="23 September 2026"
            intro="These terms explain how you may use Nur Al-Quran and the limits of the information it provides."
            sections={SECTIONS}
        />
    );
}
