'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { ADMIN_CSS } from '@/components/admin/shared';

const MIN_LENGTH = 10;

/**
 * Landing page for the "reset password" email link. The Supabase client
 * reads the one-time token from the URL and signs the user in for a
 * password-recovery session, which is then used to set a new password.
 */
export default function AdminResetPage() {
    const supabase = getSupabase();
    const [state, setState] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!supabase) return;
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) setState('ready');
        });
        // If the link was already processed (or is invalid), decide after a moment.
        const timer = setTimeout(async () => {
            const { data: s } = await supabase.auth.getSession();
            setState(current => (current === 'checking' ? (s.session ? 'ready' : 'invalid') : current));
        }, 1500);
        return () => { data.subscription.unsubscribe(); clearTimeout(timer); };
    }, [supabase]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        if (password.length < MIN_LENGTH) { setError(`Use at least ${MIN_LENGTH} characters.`); return; }
        if (password !== confirm) { setError('The two passwords do not match.'); return; }
        setBusy(true);
        setError('');
        const { error } = await supabase.auth.updateUser({ password });
        setBusy(false);
        if (error) { setError(/weak|pwned|leaked/i.test(error.message) ? 'That password is too weak or has appeared in a data breach. Choose another.' : 'Could not update your password. Request a new reset link.'); return; }
        setState('done');
    };

    return (
        <div className="adm-root reset-page">
            <Link href="/admin" className="back-link">← Admin sign in</Link>
            <div className="adm-panel reset-card">
                <h1 className="adm-h">Choose a new password</h1>
                {!supabase && <p className="adm-meta">The admin dashboard is not configured.</p>}
                {supabase && state === 'checking' && <p className="adm-meta">Checking your reset link…</p>}
                {state === 'invalid' && (
                    <p className="adm-item-body">This reset link is invalid or has expired. Go back to <Link href="/admin">admin sign in</Link> and choose “Forgot password?” again.</p>
                )}
                {state === 'done' && (
                    <>
                        <p className="adm-item-body">Your password has been updated.</p>
                        <Link href="/admin" className="adm-btn primary">Go to dashboard</Link>
                    </>
                )}
                {state === 'ready' && (
                    <form className="reset-form" onSubmit={submit}>
                        <label className="adm-field">
                            New password
                            <input className="adm-input" type="password" autoComplete="new-password" minLength={MIN_LENGTH} value={password} onChange={e => setPassword(e.target.value)} required />
                        </label>
                        <label className="adm-field">
                            Confirm new password
                            <input className="adm-input" type="password" autoComplete="new-password" minLength={MIN_LENGTH} value={confirm} onChange={e => setConfirm(e.target.value)} required />
                        </label>
                        <p className="adm-meta">At least {MIN_LENGTH} characters. A passphrase of several words is easiest to remember.</p>
                        {error && <p className="adm-error" role="alert">{error}</p>}
                        <button type="submit" className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
                    </form>
                )}
            </div>
            <style jsx global>{ADMIN_CSS}</style>
            <style jsx>{`
                .reset-page { max-width: 460px; margin: 0 auto; padding: 3rem 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
                :global(.reset-card) { display: flex; flex-direction: column; gap: 1rem; }
                .reset-form { display: flex; flex-direction: column; gap: 1rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                :global(.reset-card a) { color: var(--gold-primary); }
                :global(.reset-card .adm-btn.primary) { color: var(--matte-black); align-self: flex-start; text-decoration: none; }
            `}</style>
        </div>
    );
}
