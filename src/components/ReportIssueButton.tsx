'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { getSupabase, isSupabaseConfigured, ReportContentType } from '@/lib/supabase';

interface Props {
    contentType: ReportContentType;
    contentRef: string; // e.g. "2:255", "bukhari 1", "durood-ibrahim"
    label?: string;
    className?: string;
}

/**
 * Lets readers flag a mistake in religious content. Reports go to the admin
 * dashboard for review. Hidden entirely when Supabase isn't configured.
 */
const ReportIssueButton: React.FC<Props> = ({ contentType, contentRef, label = 'Report', className }) => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [issue, setIssue] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    if (!isSupabaseConfigured) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = getSupabase();
        if (!supabase || issue.trim().length < 5) return;
        setState('sending');
        const { error } = await supabase.from('content_reports').insert({
            content_type: contentType,
            content_ref: contentRef.slice(0, 200),
            page_path: pathname?.slice(0, 300) ?? null,
            issue: issue.trim().slice(0, 1000),
        });
        setState(error ? 'error' : 'sent');
        if (!error) setIssue('');
    };

    const close = () => {
        setOpen(false);
        if (state === 'sent') setState('idle');
    };

    return (
        <>
            <button type="button" className={className ?? 'report-btn'} onClick={() => setOpen(true)} aria-haspopup="dialog">
                {label}
            </button>
            {open && createPortal(
                <div className="report-overlay" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
                    <div className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
                        <h2 id="report-title">Report an issue</h2>
                        <p className="report-ref">{contentRef}</p>
                        {state === 'sent' ? (
                            <>
                                <p className="report-thanks">JazākAllāhu khayran — thank you. Your report will be reviewed.</p>
                                <button type="button" className="report-primary" onClick={close}>Close</button>
                            </>
                        ) : (
                            <form onSubmit={submit}>
                                <label htmlFor="report-issue">What is wrong? (e.g. a typo in the Arabic, a wrong translation or reference)</label>
                                <textarea
                                    id="report-issue"
                                    value={issue}
                                    onChange={e => setIssue(e.target.value)}
                                    minLength={5}
                                    maxLength={1000}
                                    rows={5}
                                    required
                                    autoFocus
                                />
                                <span className="report-count">{issue.length}/1000</span>
                                {state === 'error' && <p className="report-error" role="alert">Could not send. Please try again.</p>}
                                <div className="report-actions">
                                    <button type="button" className="report-secondary" onClick={close}>Cancel</button>
                                    <button type="submit" className="report-primary" disabled={state === 'sending' || issue.trim().length < 5}>
                                        {state === 'sending' ? 'Sending…' : 'Send report'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>,
                document.body
            )}
            <style jsx>{`
                .report-btn {
                    background: transparent; border: 1px solid var(--emerald-medium); color: var(--emerald-light);
                    border-radius: 4px; padding: 0.35rem 0.8rem; font-size: 0.7rem; text-transform: uppercase;
                    letter-spacing: 0.5px; cursor: pointer; font-family: inherit;
                }
                .report-btn:hover { border-color: var(--gold-primary); color: var(--gold-primary); }
                .report-btn:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
            <style jsx global>{`
                .report-overlay {
                    position: fixed; inset: 0; z-index: 1200; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center; padding: 1rem;
                }
                .report-dialog {
                    width: 100%; max-width: 440px; background: #101a15; border: 1px solid var(--gold-primary);
                    border-radius: 14px; padding: 1.5rem; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
                    display: flex; flex-direction: column; gap: 0.75rem;
                }
                .report-dialog h2 { margin: 0; font-size: 1.05rem; color: var(--gold-primary); }
                .report-dialog form { display: flex; flex-direction: column; gap: 0.5rem; }
                .report-dialog label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); }
                .report-ref { font-size: 0.8rem; color: var(--emerald-light); margin: 0; }
                .report-dialog textarea {
                    width: 100%; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--off-white); border-radius: 8px; padding: 0.7rem; font-family: inherit; font-size: 0.92rem; resize: vertical;
                }
                .report-dialog textarea:focus { outline: none; border-color: var(--gold-primary); }
                .report-count { align-self: flex-end; font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); }
                .report-error { color: #e6a5a5; font-size: 0.85rem; margin: 0; }
                .report-thanks { color: var(--off-white); margin: 0; }
                .report-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
                .report-primary, .report-secondary {
                    border-radius: 20px; padding: 0.55rem 1.2rem; font-family: inherit; font-weight: 600; font-size: 0.85rem; cursor: pointer;
                }
                .report-primary { background: var(--gold-primary); color: var(--matte-black); border: none; align-self: flex-end; }
                .report-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .report-secondary { background: transparent; color: var(--emerald-light); border: 1px solid var(--emerald-medium); }
                .report-primary:focus-visible, .report-secondary:focus-visible { outline: 2px solid var(--gold-secondary); outline-offset: 2px; }
            `}</style>
        </>
    );
};

export default ReportIssueButton;
