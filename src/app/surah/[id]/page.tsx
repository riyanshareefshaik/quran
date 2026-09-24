import SurahView from './SurahView';

// Pre-render all 114 surah pages so the static Android/iOS build
// (output: "export") can include them. Content still loads in the browser.
export function generateStaticParams() {
    return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

export default function SurahPage() {
    return <SurahView />;
}
