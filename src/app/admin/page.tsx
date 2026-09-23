'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { ADMIN_CSS } from '@/components/admin/shared';
import OverviewTab from '@/components/admin/OverviewTab';
import AnnouncementsTab from '@/components/admin/AnnouncementsTab';
import InboxTab from '@/components/admin/InboxTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import AdminsTab from '@/components/admin/AdminsTab';

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'reports', label: 'Content Reports' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'admins', label: 'Admins' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const IDLE_LIMIT_MS = 30 * 60 * 1000; // sign out after 30 minutes without activity

const SetupNotice: React.FC = () => (
    <div className="adm-panel setup">
        <h2 className="adm-h">Admin dashboard is not connected yet</h2>
        <ol>
            <li>Create a free project at supabase.com.</li>
            <li>In the SQL Editor, run the file <code>supabase/schema.sql</code> from this repository.</li>
            <li>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (and to your Vercel project’s environment variables), then rebuild.</li>
        </ol>
    </div>
);

const SignIn: React.FC<{ supabase: SupabaseClient }> = ({ supabase }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        setBusy(false);
        // Deliberately vague so the form doesn't reveal which emails exist.
        if (error) setError(error.status === 429 ? 'Too many attempts. Please wait and try again.' : 'Incorrect email or password.');
    };

    return (
        <form className="adm-panel signin" onSubmit={submit}>
            <h2 className="adm-h">Admin sign in</h2>
            <label className="adm-field">
                Email
                <input className="adm-input" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label className="adm-field">
                Password
                <input className="adm-input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            {error && <p className="adm-error" role="alert">{error}</p>}
            <button type="submit" className="adm-btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            <p className="adm-meta">Forgot your password? Ask another admin to reset it in Supabase → Authentication.</p>
        </form>
    );
};

const Dashboard: React.FC<{ supabase: SupabaseClient; session: Session }> = ({ supabase, session }) => {
    const [tab, setTab] = useState<TabId>('overview');

    // Automatic sign-out after a period of inactivity.
    useEffect(() => {
        let timer = setTimeout(() => supabase.auth.signOut(), IDLE_LIMIT_MS);
        const reset = () => {
            clearTimeout(timer);
            timer = setTimeout(() => supabase.auth.signOut(), IDLE_LIMIT_MS);
        };
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;
        events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
        return () => {
            clearTimeout(timer);
            events.forEach(ev => window.removeEventListener(ev, reset));
        };
    }, [supabase]);

    return (
        <>
            <div className="adm-topbar">
                <nav className="adm-tabs" aria-label="Admin sections">
                    {TABS.map(t => (
                        <button key={t.id} type="button" className={`adm-tab ${tab === t.id ? 'active' : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </nav>
                <div className="adm-user">
                    <span className="adm-meta">{session.user.email}</span>
                    <button type="button" className="adm-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
                </div>
            </div>

            <section className="adm-content">
                {tab === 'overview' && <OverviewTab supabase={supabase} onNavigate={t => setTab(t as TabId)} />}
                {tab === 'announcements' && <AnnouncementsTab supabase={supabase} />}
                {tab === 'feedback' && <InboxTab key="feedback" supabase={supabase} kind="feedback" />}
                {tab === 'reports' && <InboxTab key="reports" supabase={supabase} kind="reports" />}
                {tab === 'analytics' && <AnalyticsTab supabase={supabase} />}
                {tab === 'admins' && <AdminsTab supabase={supabase} currentUserId={session.user.id} />}
            </section>
        </>
    );
};

export default function AdminPage() {
    const supabase = getSupabase();
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [adminCheck, setAdminCheck] = useState<{ userId: string; isAdmin: boolean } | null>(null);

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, [supabase]);

    // The dashboard UI is only a convenience: the database itself refuses
    // every admin query from a non-admin, whatever this check says.
    useEffect(() => {
        if (!supabase || !session) return;
        let cancelled = false;
        supabase.rpc('is_admin').then(({ data }) => {
            if (!cancelled) setAdminCheck({ userId: session.user.id, isAdmin: data === true });
        });
        return () => { cancelled = true; };
    }, [supabase, session]);

    const isAdmin = session && adminCheck?.userId === session.user.id ? adminCheck.isAdmin : undefined;

    return (
        <div className="adm-root adm-page">
            <header className="adm-header">
                <Link href="/" className="back-link">← Back to app</Link>
                <h1 className="gold-text font-display">Admin Dashboard</h1>
            </header>

            {!supabase && <SetupNotice />}
            {supabase && session === undefined && <p className="adm-empty">Loading…</p>}
            {supabase && session === null && <SignIn supabase={supabase} />}
            {supabase && session && isAdmin === undefined && <p className="adm-empty">Checking access…</p>}
            {supabase && session && isAdmin === false && (
                <div className="adm-panel signin">
                    <h2 className="adm-h">No admin access</h2>
                    <p className="adm-item-body">{session.user.email} is signed in but is not an admin. Ask an existing admin to add you.</p>
                    <button type="button" className="adm-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
                </div>
            )}
            {supabase && session && isAdmin && <Dashboard supabase={supabase} session={session} />}

            <style jsx global>{ADMIN_CSS}</style>
            <style jsx>{`
                .adm-page { max-width: 1100px; margin: 0 auto; padding: 2rem; min-height: 100vh; }
                .adm-header { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
                .adm-header h1 { font-size: 2rem; margin: 0; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                :global(.back-link:hover) { color: var(--gold-primary); }
                :global(.signin) { max-width: 420px; display: flex; flex-direction: column; gap: 1rem; }
                :global(.setup ol) { padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; color: rgba(255,255,255,0.85); font-size: 0.92rem; }
                :global(.setup code) { color: var(--gold-primary); }
                :global(.adm-topbar) {
                    position: sticky; top: 0; z-index: 50; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
                    justify-content: space-between; padding: 0.75rem 0; margin-bottom: 1.25rem;
                    background: rgba(18, 18, 18, 0.92); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(212,175,55,0.25);
                }
                :global(.adm-tabs) { display: flex; gap: 0.25rem; overflow-x: auto; max-width: 100%; }
                :global(.adm-tab) {
                    font-family: inherit; font-size: 0.85rem; white-space: nowrap; cursor: pointer; padding: 0.55rem 0.9rem;
                    border-radius: 8px; border: 1px solid transparent; background: transparent; color: rgba(255,255,255,0.7);
                }
                :global(.adm-tab:hover) { color: var(--gold-primary); }
                :global(.adm-tab.active) { color: var(--gold-primary); border-color: rgba(212,175,55,0.5); background: rgba(212,175,55,0.08); }
                :global(.adm-tab:focus-visible) { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                :global(.adm-user) { display: flex; align-items: center; gap: 0.75rem; }
                @media (max-width: 768px) {
                    .adm-page { padding: 1.25rem; }
                    :global(.adm-user .adm-meta) { display: none; }
                }
            `}</style>
        </div>
    );
}
