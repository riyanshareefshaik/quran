'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';
import { FeedbackCategory, getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const CATEGORIES: { id: FeedbackCategory; label: string }[] = [
    { id: 'suggestion', label: 'Suggestion' },
    { id: 'bug', label: 'Something is broken' },
    { id: 'content', label: 'Content mistake' },
    { id: 'other', label: 'Other' },
];

export default function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState<FeedbackCategory>('suggestion');
    const [message, setMessage] = useState('');
    const [website, setWebsite] = useState(''); // honeypot: real people never fill this
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (website) { setState('sent'); return; }
        const supabase = getSupabase();
        if (!supabase || message.trim().length < 5) return;
        setState('sending');
        const { error } = await supabase.from('feedback').insert({
            name: name.trim().slice(0, 100) || null,
            email: email.trim().slice(0, 200) || null,
            category,
            message: message.trim().slice(0, 2000),
        });
        setState(error ? 'error' : 'sent');
    };

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Feedback</h1>
                        <p className="subtitle">Help us improve Nur Al-Quran</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 2.5rem' }} />

                {!isSupabaseConfigured ? (
                    <p className="notice">Feedback is not available yet.</p>
                ) : state === 'sent' ? (
                    <div className="notice">
                        <p>JazākAllāhu khayran — thank you for your feedback.</p>
                        <button type="button" className="secondary" onClick={() => { setMessage(''); setState('idle'); }}>Send another</button>
                    </div>
                ) : (
                    <form className="feedback-form glass-card" onSubmit={submit}>
                        <div className="row">
                            <label>
                                <span>Name <em>(optional)</em></span>
                                <input value={name} onChange={e => setName(e.target.value)} maxLength={100} autoComplete="name" />
                            </label>
                            <label>
                                <span>Email <em>(optional, only if you want a reply)</em></span>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
                            </label>
                        </div>
                        <fieldset>
                            <legend>Type</legend>
                            <div className="chips">
                                {CATEGORIES.map(c => (
                                    <button key={c.id} type="button" className={`chip ${category === c.id ? 'active' : ''}`} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                        <label>
                            <span>Message</span>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} minLength={5} maxLength={2000} required />
                            <small>{message.length}/2000</small>
                        </label>
                        <label className="hp" aria-hidden="true">
                            Website
                            <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
                        </label>
                        {state === 'error' && <p className="error" role="alert">Could not send. Please check your connection and try again.</p>}
                        <button type="submit" className="primary" disabled={state === 'sending' || message.trim().length < 5}>
                            {state === 'sending' ? 'Sending…' : 'Send feedback'}
                        </button>
                        <p className="privacy">We only store what you type here. Your email is used only to reply to you.</p>
                    </form>
                )}
            </main>

            <style jsx>{`
                .container { min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; }
                .main-content { max-width: 720px; width: 100%; }
                .page-header { margin-bottom: 2rem; }
                :global(.back-link) { color: var(--emerald-light); font-size: 0.9rem; }
                :global(.back-link:hover) { color: var(--gold-primary); }
                .title-area { text-align: center; }
                h1 { font-size: 2.5rem; margin-bottom: 0.3rem; }
                .subtitle { font-size: 1rem; color: var(--emerald-light); font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
                .feedback-form { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.75rem !important; }
                .feedback-form:hover { transform: none; }
                .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; color: rgba(255, 255, 255, 0.85); }
                em { color: rgba(255, 255, 255, 0.45); font-style: normal; font-size: 0.78rem; }
                small { align-self: flex-end; color: rgba(255, 255, 255, 0.45); font-size: 0.72rem; }
                input, textarea {
                    background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.3); color: var(--off-white);
                    border-radius: 8px; padding: 0.7rem 0.85rem; font-family: inherit; font-size: 0.95rem;
                }
                input:focus, textarea:focus { outline: none; border-color: var(--gold-primary); }
                textarea { resize: vertical; }
                fieldset { border: none; padding: 0; }
                legend { font-size: 0.88rem; color: rgba(255, 255, 255, 0.85); margin-bottom: 0.5rem; }
                .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .chip {
                    font-family: inherit; font-size: 0.82rem; color: var(--emerald-light); background: rgba(4, 57, 39, 0.25);
                    border: 1px solid rgba(22, 125, 79, 0.5); border-radius: 20px; padding: 0.45rem 1rem; cursor: pointer;
                }
                .chip.active { background: var(--gold-primary); border-color: var(--gold-primary); color: var(--matte-black); font-weight: 600; }
                .hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
                .primary, .secondary { border-radius: 30px; padding: 0.8rem 1.8rem; font-family: inherit; font-weight: 700; cursor: pointer; align-self: flex-start; }
                .primary { background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary)); color: var(--matte-black); border: none; }
                .primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .secondary { background: transparent; border: 1px solid var(--gold-primary); color: var(--gold-primary); }
                .chip:focus-visible, .primary:focus-visible, .secondary:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .error { color: #e6a5a5; font-size: 0.88rem; }
                .privacy { font-size: 0.78rem; color: rgba(255, 255, 255, 0.45); }
                .notice { text-align: center; color: var(--off-white); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                @media (max-width: 640px) {
                    .container { padding: 1.25rem; }
                    .row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
