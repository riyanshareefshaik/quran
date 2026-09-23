'use client';

import React, { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Announcement, Feedback, PageViewRow } from '@/lib/supabase';
import { formatDate, isoDay } from './shared';

interface Stats {
    newFeedback: number;
    openReports: number;
    liveAnnouncements: number;
    accounts: number | null;
    viewsToday: number;
    views7: number;
    views30: number;
    latestFeedback: Feedback[];
}

const OverviewTab: React.FC<{ supabase: SupabaseClient; onNavigate: (tab: string) => void }> = ({ supabase, onNavigate }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [fb, rp, ann, views, latest, accounts] = await Promise.all([
                supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
                supabase.from('content_reports').select('id', { count: 'exact', head: true }).in('status', ['new', 'reviewing']),
                supabase.from('announcements').select('is_active, starts_at, ends_at'),
                supabase.from('page_views').select('day, views').gte('day', isoDay(29)).limit(10000),
                supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.rpc('account_count'), // only exists once 002_user_accounts.sql has been run
            ]);
            if (cancelled) return;
            const firstError = fb.error || rp.error || ann.error || views.error || latest.error;
            if (firstError) { setError(firstError.message); return; }

            const now = Date.now();
            const live = ((ann.data ?? []) as Pick<Announcement, 'is_active' | 'starts_at' | 'ends_at'>[]).filter(a =>
                a.is_active && new Date(a.starts_at).getTime() <= now && (!a.ends_at || new Date(a.ends_at).getTime() > now)
            ).length;
            const rows = (views.data ?? []) as Pick<PageViewRow, 'day' | 'views'>[];
            const sumSince = (day: string) => rows.filter(r => r.day >= day).reduce((n, r) => n + r.views, 0);

            setStats({
                newFeedback: fb.count ?? 0,
                openReports: rp.count ?? 0,
                liveAnnouncements: live,
                accounts: accounts.error ? null : Number(accounts.data),
                viewsToday: sumSince(isoDay(0)),
                views7: sumSince(isoDay(6)),
                views30: sumSince(isoDay(29)),
                latestFeedback: (latest.data ?? []) as Feedback[],
            });
        })();
        return () => { cancelled = true; };
    }, [supabase]);

    if (error) return <p className="adm-error">{error}</p>;
    if (!stats) return <p className="adm-empty">Loading…</p>;

    const cards: { label: string; value: number; tab?: string }[] = [
        { label: 'New feedback', value: stats.newFeedback, tab: 'feedback' },
        { label: 'Open content reports', value: stats.openReports, tab: 'reports' },
        { label: 'Live announcements', value: stats.liveAnnouncements, tab: 'announcements' },
        ...(stats.accounts !== null ? [{ label: 'User accounts', value: stats.accounts }] : []),
        { label: 'Views today', value: stats.viewsToday, tab: 'analytics' },
        { label: 'Views · 7 days', value: stats.views7, tab: 'analytics' },
        { label: 'Views · 30 days', value: stats.views30, tab: 'analytics' },
    ];

    return (
        <div className="adm-list">
            <div className="adm-grid">
                {cards.map(c => (
                    <button key={c.label} type="button" className="adm-panel adm-stat overview-card" onClick={() => c.tab && onNavigate(c.tab)}>
                        <span className="adm-stat-value">{c.value.toLocaleString()}</span>
                        <span className="adm-stat-label">{c.label}</span>
                    </button>
                ))}
            </div>

            <div className="adm-panel">
                <h2 className="adm-h">Latest feedback</h2>
                {stats.latestFeedback.length === 0 ? (
                    <p className="adm-empty">No feedback yet.</p>
                ) : (
                    <div className="adm-list">
                        {stats.latestFeedback.map(f => (
                            <div key={f.id} className="latest-row">
                                <span className={`adm-badge ${f.status}`}>{f.status}</span>
                                <span className="latest-text">{f.message}</span>
                                <span className="adm-meta">{formatDate(f.created_at)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                .overview-card { text-align: left; cursor: pointer; font-family: inherit; }
                .overview-card:hover { border-color: var(--gold-primary); }
                .overview-card:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .latest-row { display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; }
                .latest-text { color: rgba(255,255,255,0.85); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                @media (max-width: 640px) { .latest-row { grid-template-columns: auto 1fr; } .latest-row .adm-meta { display: none; } }
            `}</style>
        </div>
    );
};

export default OverviewTab;
