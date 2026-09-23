'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SupabaseClient } from '@supabase/supabase-js';
import { ContentReport, Feedback } from '@/lib/supabase';
import { downloadCsv, formatDate } from './shared';

type Kind = 'feedback' | 'reports';
type Row = (Feedback | ContentReport) & { admin_note: string | null; status: string };

const CONFIG: Record<Kind, { table: string; statuses: string[]; open: string[]; noun: string }> = {
    feedback: { table: 'feedback', statuses: ['new', 'read', 'resolved'], open: ['new', 'read'], noun: 'feedback' },
    reports: { table: 'content_reports', statuses: ['new', 'reviewing', 'fixed', 'dismissed'], open: ['new', 'reviewing'], noun: 'reports' },
};

const PAGE = 50;

const InboxItem: React.FC<{ kind: Kind; row: Row; onChange: () => void; supabase: SupabaseClient }> = ({ kind, row, onChange, supabase }) => {
    const cfg = CONFIG[kind];
    const [note, setNote] = useState(row.admin_note ?? '');
    const [error, setError] = useState('');
    const noteChanged = note !== (row.admin_note ?? '');

    const update = async (fields: Record<string, unknown>) => {
        const { error } = await supabase.from(cfg.table).update(fields).eq('id', row.id);
        if (error) setError(error.message); else onChange();
    };

    const remove = async () => {
        if (!window.confirm('Delete this item permanently? This cannot be undone.')) return;
        const { error } = await supabase.from(cfg.table).delete().eq('id', row.id);
        if (error) setError(error.message); else onChange();
    };

    const fb = kind === 'feedback' ? (row as Feedback) : null;
    const rp = kind === 'reports' ? (row as ContentReport) : null;
    const safePath = rp?.page_path && /^\/[A-Za-z0-9/_\-?=&.%:]*$/.test(rp.page_path) ? rp.page_path : null;

    return (
        <div className="adm-item">
            <div className="adm-item-head">
                <span className={`adm-badge ${row.status}`}>{row.status}</span>
                {fb && <span className="adm-badge dismissed">{fb.category}</span>}
                {rp && <span className="adm-badge dismissed">{rp.content_type}</span>}
                {rp && <strong className="ref">{rp.content_ref}</strong>}
                {fb && (fb.name || fb.email) && <strong className="ref">{fb.name ?? ''}{fb.name && fb.email ? ' · ' : ''}{fb.email ?? ''}</strong>}
                <span className="adm-spacer" />
                <span className="adm-meta">{formatDate(row.created_at)}</span>
            </div>
            <p className="adm-item-body">{fb ? fb.message : rp?.issue}</p>
            {safePath && <Link href={safePath} target="_blank" className="adm-meta open-link">Open page: {safePath} ↗</Link>}
            <label className="adm-field">
                Admin note (private)
                <textarea className="adm-input" rows={2} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} />
            </label>
            {error && <p className="adm-error" role="alert">{error}</p>}
            <div className="adm-toolbar">
                <select className="adm-input status-select" aria-label="Status" value={row.status} onChange={e => update({ status: e.target.value })}>
                    {cfg.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {noteChanged && <button type="button" className="adm-btn primary" onClick={() => update({ admin_note: note.trim() || null })}>Save note</button>}
                {fb?.email && (
                    <a className="adm-btn" href={`mailto:${encodeURIComponent(fb.email)}?subject=${encodeURIComponent('Re: your feedback on Nur Al-Quran')}`}>Reply by email</a>
                )}
                <span className="adm-spacer" />
                <button type="button" className="adm-btn danger" onClick={remove}>Delete</button>
            </div>
            <style jsx>{`
                .ref { color: var(--white); font-size: 0.9rem; overflow-wrap: anywhere; }
                .status-select { width: auto; }
                :global(.open-link) { color: var(--emerald-light) !important; }
                :global(.open-link:hover) { color: var(--gold-primary) !important; }
            `}</style>
        </div>
    );
};

const InboxTab: React.FC<{ supabase: SupabaseClient; kind: Kind }> = ({ supabase, kind }) => {
    const cfg = CONFIG[kind];
    const [filter, setFilter] = useState<string>('open');
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(PAGE);
    const [reload, setReload] = useState(0);
    const [result, setResult] = useState<{ key: string; rows?: Row[]; hasMore?: boolean; error?: string } | null>(null);

    const requestKey = `${kind}:${filter}:${limit}:${reload}`;
    const current = result?.key === requestKey ? result : null;

    useEffect(() => {
        let cancelled = false;
        let q = supabase.from(cfg.table).select('*').order('created_at', { ascending: false }).range(0, limit);
        if (filter === 'open') q = q.in('status', cfg.open);
        else if (filter !== 'all') q = q.eq('status', filter);
        q.then(({ data, error }) => {
            if (cancelled) return;
            if (error) setResult({ key: requestKey, error: error.message });
            else setResult({ key: requestKey, rows: ((data ?? []) as Row[]).slice(0, limit), hasMore: (data ?? []).length > limit });
        });
        return () => { cancelled = true; };
    }, [supabase, cfg, filter, limit, requestKey]);

    const refresh = useCallback(() => setReload(r => r + 1), []);

    const needle = query.trim().toLowerCase();
    const rows = (current?.rows ?? []).filter(r => !needle || JSON.stringify(r).toLowerCase().includes(needle));

    const exportCsv = () => downloadCsv(`${cfg.table}-${filter}.csv`, rows.map(r => ({ ...r })));

    return (
        <div className="adm-list">
            <div className="adm-toolbar">
                {['open', ...cfg.statuses, 'all'].map(s => (
                    <button key={s} type="button" className={`adm-chip ${filter === s ? 'active' : ''}`} aria-pressed={filter === s} onClick={() => { setFilter(s); setLimit(PAGE); }}>
                        {s === 'open' ? 'Open' : s[0].toUpperCase() + s.slice(1)}
                    </button>
                ))}
                <span className="adm-spacer" />
                <button type="button" className="adm-btn" onClick={refresh}>Refresh</button>
                <button type="button" className="adm-btn" disabled={rows.length === 0} onClick={exportCsv}>Export CSV</button>
            </div>
            <input className="adm-input" type="search" placeholder={`Search ${cfg.noun}…`} aria-label={`Search ${cfg.noun}`} value={query} onChange={e => setQuery(e.target.value)} />

            {current?.error && <p className="adm-error">{current.error}</p>}
            {!current && <p className="adm-empty">Loading…</p>}
            {current?.rows && rows.length === 0 && <p className="adm-empty">Nothing here.</p>}
            {rows.map(r => <InboxItem key={`${r.id}-${r.status}-${r.admin_note ?? ''}`} kind={kind} row={r} supabase={supabase} onChange={refresh} />)}
            {current?.hasMore && <button type="button" className="adm-btn load-more" onClick={() => setLimit(l => l + PAGE)}>Load more</button>}
            <style jsx>{`
                .load-more { align-self: center; }
            `}</style>
        </div>
    );
};

export default InboxTab;
