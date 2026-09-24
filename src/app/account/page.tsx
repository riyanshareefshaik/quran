'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AccountContentPanel from '@/components/AccountContentPanel';

// Common dial codes first; "Other" lets people type any international code.
const COUNTRIES = [
    { code: '+91', name: 'India' }, { code: '+92', name: 'Pakistan' }, { code: '+880', name: 'Bangladesh' },
    { code: '+966', name: 'Saudi Arabia' }, { code: '+971', name: 'UAE' }, { code: '+974', name: 'Qatar' },
    { code: '+965', name: 'Kuwait' }, { code: '+968', name: 'Oman' }, { code: '+973', name: 'Bahrain' },
    { code: '+20', name: 'Egypt' }, { code: '+90', name: 'Türkiye' }, { code: '+60', name: 'Malaysia' },
    { code: '+62', name: 'Indonesia' }, { code: '+234', name: 'Nigeria' }, { code: '+94', name: 'Sri Lanka' },
    { code: '+65', name: 'Singapore' }, { code: '+44', name: 'United Kingdom' }, { code: '+1', name: 'USA / Canada' },
    { code: '+61', name: 'Australia' }, { code: '+49', name: 'Germany' }, { code: '+33', name: 'France' },
    { code: 'other', name: 'Other (type full number)' },
];

const RESEND_SECONDS = 60;

function toE164(code: string, number: string): string | null {
    const digits = number.replace(/[^\d+]/g, '');
    const full = code === 'other' ? digits : `${code}${digits.replace(/^0+/, '')}`;
    return /^\+[1-9]\d{7,14}$/.test(full) ? full : null;
}

function friendlyAuthError(message: string, status?: number): string {
    if (status === 429 || /rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.';
    if (/expired|invalid/i.test(message)) return 'That code is incorrect or has expired. Check it or request a new one.';
    if (/sms|provider|phone.*(disabled|not enabled)/i.test(message)) return 'Phone sign-in is not available right now. Please try again later.';
    return 'Something went wrong. Please try again.';
}

const PhoneSignIn: React.FC = () => {
    const supabase = getSupabase()!;
    const [country, setCountry] = useState('+91');
    const [number, setNumber] = useState('');
    const [phone, setPhone] = useState<string | null>(null); // set once the code is sent
    const [code, setCode] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const sendCode = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const full = phone ?? toE164(country, number);
        if (!full) { setError('Enter a valid mobile number.'); return; }
        setBusy(true);
        setError('');
        const { error } = await supabase.auth.signInWithOtp({ phone: full, options: { channel: 'sms' } });
        setBusy(false);
        if (error) { setError(friendlyAuthError(error.message, error.status)); return; }
        setPhone(full);
        setCooldown(RESEND_SECONDS);
    };

    const verify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setBusy(true);
        setError('');
        const { error } = await supabase.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' });
        setBusy(false);
        if (error) setError(friendlyAuthError(error.message, error.status));
    };

    if (!phone) {
        return (
            <form className="card" onSubmit={sendCode}>
                <h2>Sign in with your mobile number</h2>
                <p className="muted">We’ll text you a 6-digit code. No password needed.</p>
                <div className="phone-row">
                    <select aria-label="Country code" value={country} onChange={e => setCountry(e.target.value)}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code === 'other' ? c.name : `${c.name} (${c.code})`}</option>)}
                    </select>
                    <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder={country === 'other' ? '+44 7700 900123' : 'Mobile number'}
                        aria-label="Mobile number"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        maxLength={20}
                        required
                    />
                </div>
                <label className="agree">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
                    <span>I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
                </label>
                {error && <p className="error" role="alert">{error}</p>}
                <button type="submit" className="primary" disabled={busy || !agreed}>{busy ? 'Sending…' : 'Send code'}</button>
                <p className="muted small">Standard SMS rates from your carrier may apply.</p>
            </form>
        );
    }

    return (
        <form className="card" onSubmit={verify}>
            <h2>Enter your code</h2>
            <p className="muted">We sent a 6-digit code to <strong>{phone}</strong>.</p>
            <input
                className="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                placeholder="••••••"
                aria-label="6-digit code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
            />
            {error && <p className="error" role="alert">{error}</p>}
            <button type="submit" className="primary" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify & sign in'}</button>
            <div className="row-links">
                <button type="button" className="link" disabled={cooldown > 0 || busy} onClick={() => sendCode()}>
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>
                <button type="button" className="link" onClick={() => { setPhone(null); setCode(''); setError(''); }}>Change number</button>
            </div>
        </form>
    );
};

const AccountDetails: React.FC = () => {
    const supabase = getSupabase()!;
    const { session, syncStatus, lastSyncedAt, syncNow } = useAuth();
    const user = session!.user;
    const [name, setName] = useState('');
    const [savedName, setSavedName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState('');

    useEffect(() => {
        let cancelled = false;
        supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle().then(({ data }) => {
            if (cancelled) return;
            const n = data?.display_name ?? '';
            setName(n);
            setSavedName(n);
        });
        return () => { cancelled = true; };
    }, [supabase, user.id]);

    const saveName = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const trimmed = name.trim().slice(0, 60);
        const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: trimmed || null });
        if (error) { setError('Could not save your name.'); return; }
        setSavedName(trimmed);
        setMessage('Saved.');
        setTimeout(() => setMessage(''), 2000);
    };

    const deleteAccount = async () => {
        setError('');
        const { error } = await supabase.rpc('delete_my_account');
        if (error) { setError(/Admin accounts/.test(error.message) ? error.message : 'Could not delete your account. Please try again.'); return; }
        await supabase.auth.signOut();
    };

    const syncLabel = syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'error' ? 'Sync failed — check your connection' :
        lastSyncedAt ? `Synced ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting to sync';

    return (
        <div className="stack">
            <div className="card">
                <h2>{savedName ? `Assalāmu ʿalaykum, ${savedName}` : 'Assalāmu ʿalaykum'}</h2>
                <p className="muted">Signed in as <strong>{user.phone ? `+${user.phone.replace(/^\+/, '')}` : user.email}</strong></p>
                <form className="name-row" onSubmit={saveName}>
                    <input aria-label="Display name" placeholder="Your name (optional)" value={name} maxLength={60} onChange={e => setName(e.target.value)} />
                    <button type="submit" className="secondary" disabled={name.trim() === savedName}>Save</button>
                </form>
                {message && <p className="ok">{message}</p>}
            </div>

            <div className="card">
                <h2>Sync across devices</h2>
                <p className="muted">Your bookmarks, reading progress and reading preferences (reciter, font size, prayer settings) are saved to your account and restored when you sign in on another device.</p>
                <div className="row-links">
                    <span className={`sync ${syncStatus}`}>{syncLabel}</span>
                    <button type="button" className="secondary" onClick={syncNow} disabled={syncStatus === 'syncing'}>Sync now</button>
                </div>
            </div>

            <AccountContentPanel />

            <div className="card">
                <div className="row-links">
                    <button type="button" className="secondary" onClick={() => supabase.auth.signOut()}>Sign out</button>
                    <Link href="/privacy" className="plain">Privacy Policy</Link>
                    <Link href="/terms" className="plain">Terms</Link>
                </div>
            </div>

            <div className="card danger-zone">
                <h2>Delete account</h2>
                <p className="muted">Permanently deletes your account, phone number, name and synced data from our servers. Data saved only on this device stays until you clear it. Type <strong>DELETE</strong> to confirm.</p>
                <div className="name-row">
                    <input aria-label="Type DELETE to confirm" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder="DELETE" />
                    <button type="button" className="danger" disabled={confirmDelete !== 'DELETE'} onClick={deleteAccount}>Delete my account</button>
                </div>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
        </div>
    );
};

export default function AccountPage() {
    const supabase = getSupabase();
    const { session, ready } = useAuth();

    return (
        <div className="container">
            <main className="main-content acct">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">My Account</h1>
                        <p className="subtitle">Keep your progress on every device</p>
                    </div>
                </OrnateFrame>
                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2.5rem' }} />

                {!supabase && <p className="card muted">Accounts are not available yet.</p>}
                {supabase && !ready && <p className="muted center">Loading…</p>}
                {supabase && ready && !session && <PhoneSignIn />}
                {supabase && ready && session && <AccountDetails />}

                <p className="muted small center note">
                    You don’t need an account to use Nur Al-Quran. Signing in only adds syncing between devices.
                </p>
            </main>

            <style jsx global>{`
                .acct .card {
                    background: var(--card-bg); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px;
                    padding: 1.5rem; display: flex; flex-direction: column; gap: 0.9rem;
                }
                .acct .card h2 { font-size: 1.1rem; color: var(--white); margin: 0; }
                .acct .stack { display: flex; flex-direction: column; gap: 1rem; }
                .acct .muted { color: rgba(255, 255, 255, 0.65); font-size: 0.9rem; margin: 0; }
                .acct .small { font-size: 0.78rem; }
                .acct .center { text-align: center; }
                .acct .note { margin-top: 2rem; }
                .acct .phone-row, .acct .name-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .acct .card input:not([type='checkbox']), .acct .card select {
                    background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.3); color: var(--off-white);
                    border-radius: 10px; padding: 0.75rem 0.9rem; font-family: inherit; font-size: 1rem;
                }
                .acct .card select { max-width: 45%; }
                .acct .card select option { background: #101a15; }
                .acct .phone-row input, .acct .name-row input { flex: 1; min-width: 120px; }
                .acct .card input:focus, .acct .card select:focus { outline: none; border-color: var(--gold-primary); }
                .acct .otp { font-size: 1.6rem !important; letter-spacing: 0.6em; text-align: center; max-width: 260px; }
                .acct .agree { display: flex; gap: 0.6rem; align-items: flex-start; font-size: 0.85rem; color: rgba(255,255,255,0.8); }
                .acct .agree input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--gold-primary); }
                .acct .agree a, .acct .plain { color: var(--gold-primary); }
                .acct .primary, .acct .secondary, .acct .danger {
                    border-radius: 30px; padding: 0.75rem 1.6rem; font-family: inherit; font-weight: 700; cursor: pointer; font-size: 0.9rem;
                }
                .acct .primary { background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: var(--matte-black); border: none; align-self: flex-start; }
                .acct .secondary { background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary); }
                .acct .danger { background: transparent; border: 1px solid rgba(230,120,120,0.6); color: #e6a5a5; }
                .acct .primary:disabled, .acct .secondary:disabled, .acct .danger:disabled { opacity: 0.45; cursor: not-allowed; }
                .acct .link { background: none; border: none; color: var(--emerald-light); cursor: pointer; font-family: inherit; font-size: 0.85rem; padding: 0; }
                .acct .link:disabled { opacity: 0.5; cursor: default; }
                .acct .row-links { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
                .acct .error { color: #e6a5a5; font-size: 0.88rem; margin: 0; }
                .acct .ok { color: #7fd1a3; font-size: 0.85rem; margin: 0; }
                .acct .sync { font-size: 0.85rem; color: var(--emerald-light); }
                .acct .sync.error { color: #e6a5a5; }
                .acct .danger-zone { border-color: rgba(230, 120, 120, 0.35); }
                .acct button:focus-visible, .acct a:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
            <style jsx>{`
                .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
                .main-content { max-width: 560px; width: 100%; }
                .page-header { margin-bottom: 2rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                .title-area { text-align: center; }
                h1 { font-size: 2.3rem; margin-bottom: 0.3rem; }
                .subtitle { font-size: 0.95rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
                @media (max-width: 640px) { .container { padding: 1.25rem; } h1 { font-size: 1.9rem; } }
            `}</style>
        </div>
    );
}
