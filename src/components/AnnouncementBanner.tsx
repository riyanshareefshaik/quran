'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Announcement, getSupabase } from '@/lib/supabase';

const DISMISSED_KEY = 'dismissed_announcements';

function readDismissed(): string[] {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

/** Live announcements managed from the admin dashboard. Renders nothing if there are none. */
const AnnouncementBanner: React.FC = () => {
    const [items, setItems] = useState<Announcement[]>([]);

    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) return;
        let cancelled = false;
        supabase
            .from('announcements')
            .select('*')
            .order('starts_at', { ascending: false })
            .limit(3)
            .then(({ data }) => {
                if (cancelled || !data) return;
                const dismissed = readDismissed();
                setItems((data as Announcement[]).filter(a => !dismissed.includes(a.id)));
            });
        return () => { cancelled = true; };
    }, []);

    const dismiss = (id: string) => {
        setItems(list => list.filter(a => a.id !== id));
        try {
            localStorage.setItem(DISMISSED_KEY, JSON.stringify([...readDismissed(), id].slice(-50)));
        } catch { /* storage unavailable */ }
    };

    if (items.length === 0) return null;

    return (
        <div className="announcements" role="region" aria-label="Announcements">
            {items.map(a => (
                <div key={a.id} className={`announcement level-${a.level}`}>
                    <div className="announcement-body">
                        <span className="announcement-tag">{a.level === 'important' ? 'Important' : a.level === 'event' ? 'Event' : 'Notice'}</span>
                        <h2 className="announcement-title">{a.title}</h2>
                        <p className="announcement-text">{a.body}</p>
                        {a.link_url && (
                            a.link_url.startsWith('/')
                                ? <Link href={a.link_url} className="announcement-link">Learn more →</Link>
                                : <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="announcement-link">Learn more →</a>
                        )}
                    </div>
                    <button type="button" className="dismiss" onClick={() => dismiss(a.id)} aria-label={`Dismiss announcement: ${a.title}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
            ))}
            <style jsx>{`
                .announcements { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
                .announcement {
                    display: flex; gap: 1rem; align-items: flex-start;
                    padding: 1rem 1.25rem; border-radius: 12px;
                    background: rgba(4, 57, 39, 0.35); border: 1px solid rgba(22, 125, 79, 0.6);
                }
                .announcement.level-important { background: rgba(212, 175, 55, 0.08); border-color: var(--gold-primary); }
                .announcement.level-event { background: rgba(212, 175, 55, 0.04); border-color: rgba(212, 175, 55, 0.4); }
                .announcement-body { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
                .announcement-tag { font-size: 0.68rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold-primary); font-weight: 700; }
                .announcement-title { font-size: 1.02rem; color: var(--white); margin: 0; }
                .announcement-text { font-size: 0.92rem; color: rgba(255, 255, 255, 0.8); white-space: pre-line; }
                .announcement-body :global(.announcement-link) { font-size: 0.85rem; color: var(--gold-primary); margin-top: 0.2rem; }
                .dismiss {
                    flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
                    background: none; border: none; color: var(--emerald-light); cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .dismiss:hover { color: var(--gold-primary); background: rgba(212, 175, 55, 0.1); }
                .dismiss:focus-visible { outline: 2px solid var(--gold-primary); }
            `}</style>
        </div>
    );
};

export default AnnouncementBanner;
