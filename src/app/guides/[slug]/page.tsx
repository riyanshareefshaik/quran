import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GuideView from '@/components/GuideView';
import { GUIDES, GUIDE_ORDER, GuideSlug } from '@/lib/guides';

// Pre-render all three guides so they also work in the static Capacitor build.
export const dynamicParams = false;

export function generateStaticParams() {
    return GUIDE_ORDER.map(slug => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const guide = GUIDES[slug as GuideSlug];
    if (!guide) return {};
    return {
        title: `${guide.title} Guide | Nur Al-Quran`,
        description: guide.subtitle,
    };
}

export default async function GuidePage({ params }: Props) {
    const { slug } = await params;
    const guide = GUIDES[slug as GuideSlug];
    if (!guide) notFound();
    return <GuideView guide={guide} />;
}
