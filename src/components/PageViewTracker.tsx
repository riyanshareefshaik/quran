'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/supabase';

/** Counts page views anonymously (path + day only) for the admin analytics. */
export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname) trackPageView(pathname);
    }, [pathname]);

    return null;
}
