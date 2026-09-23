'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Announcement } from '@/lib/supabase';
import { formatDate, isoToLocalInput, localInputToIso } from './shared';

type Draft = {
    id?: string;
    title: string;
    body: string;
    link_url: string;
    level: Announcement['level'];
    is_active: boolean;
    starts_at: string; // datetime-local value
    ends_at: string;
};

const emptyDraft = (): Draft => ({
    title: '', body: '', link_url: '', level: 'info', is_active: true, starts_at: isoToLocalInput(new Date().toISOString()), ends_at: '',
});

function liveState(a: Announcement): 'live' | 'scheduled' | 'expired' | 'off' {
    if (!a.is_active) return 'off';
    const now = Date.now();
    if (new Date(a.starts_at).getTime() > now) return 'scheduled';
    if (a.ends_at && new Date(a.ends_at).getTime() <= now) return 'expired';
    return 'live';
}

const AnnouncementsTab: React.FC<{ supabase: SupabaseClient }> = ({ supabase }) => {
    const [items, setItems] = useState<Announcement[] | null>(null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [reload, setReload] = useState(0);
    const load = useCallback(() => setReload(r => r + 1), []);

    useEffect(() => {
        let cancelled = false;
        supabase.from('announcements').select('*').order('starts_at', { ascending: false }).then(({ data, error }) => {
            if (cancelled) return;
            if (error) setError(error.message);
            else setItems((data ?? []) as Announcement[]);
        });
        return () => { cancelled = true; };
    }, [supabase, reload]);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft) return;
        const link = draft.link_url.trim();
        if (link && !/^(https:\/\/|\/)/.test(link)) {
            setError('Link must start with https:// or / (a page in this app).');
            return;
        }
        const startsAt = localInputToIso(draft.starts_at) ?? new Date().toISOString();
        const endsAt = localInputToIso(draft.ends_at);
        if (endsAt && endsAt <= startsAt) {
            setError('End time must be after the start time.');
            return;
        }
        setSaving(true);
        setError('');
        const payload = {
            title: draft.title.trim(),
            body: draft.body.trim(),
            link_url: link || null,
            level: draft.level,
            is_active: draft.is_active,
            starts_at: startsAt,
            ends_at: endsAt,
        };
        const { error } = draft.id
            ? await supabase.from('announcements').update(payload).eq('id', draft.id)
            : await supabase.from('announcements').insert(payload);
        setSaving(false);
        if (error) { setError(error.message); return; }
        setDraft(null);
        load();
    };

    const toggle = async (a: Announcement) => {
        const { error } = await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
        if (error) setError(error.message); else load();
    };

    const remove = async (a: Announcement) => {
        if (!window.confirm(`Delete the announcement "${a.title}"? This cannot be undone.`)) return;
        const { error } = await supabase.from('announcements').delete().eq('id', a.id);
        if (error) setError(error.message); else load();
    };

    const edit = (a: Announcement) => setDraft({
        id: a.id, title: a.title, body: a.body, link_url: a.link_url ?? '', level: a.level, is_active: a.is_active,
        starts_at: isoToLocalInput(a.starts_at), ends_at: isoToLocalInput(a.ends_at),
    });

    return (
        <div className="adm-list">
            <div className="adm-toolbar">
                <p className="adm-meta">Live announcements appear as a banner at the top of the home page. Visitors can dismiss them.</p>
                <span className="adm-spacer" />
                {!draft && <button type="button" className="adm-btn primary" onClick={() => { setError(''); setDraft(emptyDraft()); }}>New announcement</button>}
            </div>

            {error && <p className="adm-error" role="alert">{error}</p>}

            {draft && (
                <form className="adm-panel adm-form" onSubmit={save}>
                    <h2 className="adm-h full">{draft.id ? 'Edit announcement' : 'New announcement'}</h2>
                    <label className="adm-field full">
                        Title
                        <input className="adm-input" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} maxLength={120} required />
                    </label>
                    <label className="adm-field full">
                        Message
                        <textarea className="adm-input" rows={4} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} maxLength={1000} required />
                    </label>
                    <label className="adm-field">
                        Type
                        <select className="adm-input" value={draft.level} onChange={e => setDraft({ ...draft, level: e.target.value as Announcement['level'] })}>
                            <option value="info">Notice</option>
                            <option value="important">Important</option>
                            <option value="event">Event</option>
                        </select>
                    </label>
                    <label className="adm-field">
                        Link (optional)
                        <input className="adm-input" value={draft.link_url} onChange={e => setDraft({ ...draft, link_url: e.target.value })} placeholder="https://… or /guides/ramadan" maxLength={500} />
                    </label>
                    <label className="adm-field">
                        Starts
                        <input className="adm-input" type="datetime-local" value={draft.starts_at} onChange={e => setDraft({ ...draft, starts_at: e.target.value })} />
                    </label>
                    <label className="adm-field">
                        Ends (optional)
                        <input className="adm-input" type="datetime-local" value={draft.ends_at} onChange={e => setDraft({ ...draft, ends_at: e.target.value })} />
                    </label>
                    <label className="adm-field full checkbox">
                        <input type="checkbox" checked={draft.is_active} onChange={e => setDraft({ ...draft, is_active: e.target.checked })} />
                        Active
                    </label>
                    <div className="full adm-toolbar">
                        <button type="submit" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                        <button type="button" className="adm-btn" onClick={() => { setDraft(null); setError(''); }}>Cancel</button>
                    </div>
                </form>
            )}

            {!items && !error && <p className="adm-empty">Loading…</p>}
            {items?.length === 0 && !draft && <p className="adm-empty">No announcements yet.</p>}
            {items?.map(a => {
                const state = liveState(a);
                return (
                    <div key={a.id} className="adm-item">
                        <div className="adm-item-head">
                            <span className={`adm-badge ${state === 'live' ? 'live' : state === 'off' || state === 'expired' ? 'off' : 'read'}`}>{state}</span>
                            <span className="adm-badge dismissed">{a.level}</span>
                            <strong className="ann-title">{a.title}</strong>
                        </div>
                        <p className="adm-item-body">{a.body}</p>
                        {a.link_url && <p className="adm-meta">Link: {a.link_url}</p>}
                        <p className="adm-meta">From {formatDate(a.starts_at)}{a.ends_at ? ` until ${formatDate(a.ends_at)}` : ''}</p>
                        <div className="adm-toolbar">
                            <button type="button" className="adm-btn" onClick={() => edit(a)}>Edit</button>
                            <button type="button" className="adm-btn" onClick={() => toggle(a)}>{a.is_active ? 'Turn off' : 'Turn on'}</button>
                            <button type="button" className="adm-btn danger" onClick={() => remove(a)}>Delete</button>
                        </div>
                    </div>
                );
            })}
            <style jsx>{`
                .ann-title { color: var(--white); }
                .checkbox { flex-direction: row; align-items: center; gap: 0.5rem; }
                .checkbox input { width: 18px; height: 18px; accent-color: var(--gold-primary); }
            `}</style>
        </div>
    );
};

export default AnnouncementsTab;
