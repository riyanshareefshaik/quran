'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageViewRow } from '@/lib/supabase';
import { downloadCsv, isoDay } from './shared';

const RANGES = [7, 30, 90] as const;

// Friendly names for the app's main sections.
function sectionName(path: string): string {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/surah/')) return `Surah ${path.split('/')[2] ?? ''}`.trim();
    const names: Record<string, string> = {
        '/surahs': 'Quran index', '/hadith': 'Hadith', '/essentials': 'Essentials', '/guides': 'Guides',
        '/feedback': 'Feedback', '/sources': 'Sources',
    };
    return names[path] ?? path;
}

const AnalyticsTab: React.FC<{ supabase: SupabaseClient }> = ({ supabase }) => {
    const [range, setRange] = useState<(typeof RANGES)[number]>(30);
    const [result, setResult] = useState<{ range: number; rows?: PageViewRow[]; error?: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        supabase
            .from('page_views')
            .select('day, path, views')
            .gte('day', isoDay(range - 1))
            .limit(20000)
            .then(({ data, error }) => {
                if (cancelled) return;
                setResult(error ? { range, error: error.message } : { range, rows: (data ?? []) as PageViewRow[] });
            });
        return () => { cancelled = true; };
    }, [supabase, range]);

    const current = result?.range === range ? result : null;
    const rows = useMemo(() => current?.rows ?? [], [current]);

    const { daily, total, topPages, sections } = useMemo(() => {
        const byDay = new Map<string, number>();
        for (let i = range - 1; i >= 0; i--) byDay.set(isoDay(i), 0);
        const byPath = new Map<string, number>();
        const bySection = new Map<string, number>();
        let sum = 0;
        for (const r of rows) {
            sum += r.views;
            if (byDay.has(r.day)) byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.views);
            byPath.set(r.path, (byPath.get(r.path) ?? 0) + r.views);
            const section = r.path.startsWith('/surah/') ? 'Surah pages' : r.path.startsWith('/guides') ? 'Guides' : sectionName(r.path);
            bySection.set(section, (bySection.get(section) ?? 0) + r.views);
        }
        const sortDesc = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
        return { daily: [...byDay.entries()], total: sum, topPages: sortDesc(byPath).slice(0, 15), sections: sortDesc(bySection).slice(0, 8) };
    }, [rows, range]);

    const max = Math.max(1, ...daily.map(([, v]) => v));

    return (
        <div className="adm-list">
            <div className="adm-toolbar">
                {RANGES.map(r => (
                    <button key={r} type="button" className={`adm-chip ${range === r ? 'active' : ''}`} aria-pressed={range === r} onClick={() => setRange(r)}>
                        Last {r} days
                    </button>
                ))}
                <span className="adm-spacer" />
                <button type="button" className="adm-btn" disabled={rows.length === 0} onClick={() => downloadCsv(`page-views-${range}d.csv`, rows.map(r => ({ ...r })))}>
                    Export CSV
                </button>
            </div>

            {current?.error && <p className="adm-error">{current.error}</p>}
            {!current && <p className="adm-empty">Loading…</p>}

            {current?.rows && (
                <>
                    <div className="adm-panel">
                        <h2 className="adm-h">{total.toLocaleString()} page views</h2>
                        <div className="adm-bars" role="img" aria-label={`Daily page views for the last ${range} days`}>
                            {daily.map(([day, v]) => (
                                <div key={day} className="adm-bar" style={{ height: `${(v / max) * 100}%` }} title={`${day}: ${v.toLocaleString()} views`} />
                            ))}
                        </div>
                        <div className="adm-bar-labels"><span>{daily[0]?.[0]}</span><span>{daily[daily.length - 1]?.[0]}</span></div>
                    </div>

                    <div className="adm-grid two">
                        <div className="adm-panel">
                            <h2 className="adm-h">By section</h2>
                            <table className="adm-table">
                                <thead><tr><th>Section</th><th className="num">Views</th></tr></thead>
                                <tbody>
                                    {sections.map(([name, v]) => <tr key={name}><td>{name}</td><td className="num">{v.toLocaleString()}</td></tr>)}
                                    {sections.length === 0 && <tr><td colSpan={2} className="adm-empty">No data yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="adm-panel">
                            <h2 className="adm-h">Top pages</h2>
                            <table className="adm-table">
                                <thead><tr><th>Page</th><th className="num">Views</th></tr></thead>
                                <tbody>
                                    {topPages.map(([path, v]) => (
                                        <tr key={path}><td title={path}>{sectionName(path)}</td><td className="num">{v.toLocaleString()}</td></tr>
                                    ))}
                                    {topPages.length === 0 && <tr><td colSpan={2} className="adm-empty">No data yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="adm-meta">Counts are anonymous: only the page path and day are stored — no IP addresses, cookies or user identifiers.</p>
                </>
            )}
            <style jsx>{`
                .two { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
            `}</style>
        </div>
    );
};

export default AnalyticsTab;
