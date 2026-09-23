'use client';

import React, { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminRow } from '@/lib/supabase';
import { formatDate } from './shared';

const AdminsTab: React.FC<{ supabase: SupabaseClient; currentUserId: string }> = ({ supabase, currentUserId }) => {
    const [admins, setAdmins] = useState<AdminRow[] | null>(null);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let cancelled = false;
        supabase.from('admins').select('*').order('created_at').then(({ data, error }) => {
            if (cancelled) return;
            if (error) setError(error.message);
            else setAdmins((data ?? []) as AdminRow[]);
        });
        return () => { cancelled = true; };
    }, [supabase, reload]);

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error } = await supabase.rpc('add_admin', { p_email: email.trim() });
        setBusy(false);
        if (error) { setError(error.message); return; }
        setEmail('');
        setReload(r => r + 1);
    };

    const remove = async (a: AdminRow) => {
        if (!window.confirm(`Remove admin access for ${a.email}? Their account is kept; they just lose dashboard access.`)) return;
        const { error } = await supabase.rpc('remove_admin', { p_user_id: a.user_id });
        if (error) setError(error.message); else setReload(r => r + 1);
    };

    return (
        <div className="adm-list">
            <form className="adm-panel" onSubmit={add}>
                <h2 className="adm-h">Add an admin</h2>
                <p className="adm-meta hint">
                    First create their login in Supabase → Authentication → Users → “Add user”, then enter the same email here.
                </p>
                <div className="adm-toolbar">
                    <input className="adm-input email" type="email" placeholder="email@example.com" aria-label="Admin email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <button type="submit" className="adm-btn primary" disabled={busy}>{busy ? 'Adding…' : 'Add admin'}</button>
                </div>
            </form>

            {error && <p className="adm-error" role="alert">{error}</p>}

            <div className="adm-panel">
                <h2 className="adm-h">Admins</h2>
                {!admins ? <p className="adm-empty">Loading…</p> : (
                    <table className="adm-table">
                        <thead><tr><th>Email</th><th>Added</th><th /></tr></thead>
                        <tbody>
                            {admins.map(a => (
                                <tr key={a.user_id}>
                                    <td>{a.email}{a.user_id === currentUserId && <span className="adm-meta"> (you)</span>}</td>
                                    <td>{formatDate(a.created_at)}</td>
                                    <td className="num">
                                        {a.user_id !== currentUserId && <button type="button" className="adm-btn danger" onClick={() => remove(a)}>Remove</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <style jsx>{`
                .hint { margin-bottom: 0.75rem; }
                .email { flex: 1; min-width: 220px; }
            `}</style>
        </div>
    );
};

export default AdminsTab;
