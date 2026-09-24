'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '@/context/SettingsContext';
import { getCurrentPosition } from '@/lib/geolocation';
import { isNativeApp } from '@/lib/api-config';
import Icon from '@/components/Icon';
import {
    ADHAN_AUDIO, ALERT_PRAYERS, AlertSettings, exactAlarmsAllowed, loadAlertSettings, openExactAlarmSettings,
    requestAlertPermission, saveAlertSettings, scheduleAlerts,
} from '@/lib/prayer-alerts';

const CHANGED_EVENT = 'prayer-alerts-changed';

/** Keeps scheduled alerts in step with settings, location and calculation method. Renders nothing. */
export const PrayerAlertsManager: React.FC = () => {
    const { prayerCalculationMethod } = useSettings();

    useEffect(() => {
        let cancelled = false;
        const refresh = async () => {
            const settings = loadAlertSettings();
            try {
                if (!settings.enabled) { await scheduleAlerts(settings, 0, 0, prayerCalculationMethod); return; }
                const { latitude, longitude } = await getCurrentPosition();
                if (!cancelled) await scheduleAlerts(settings, latitude, longitude, prayerCalculationMethod);
            } catch (e) {
                console.warn('Prayer alerts not scheduled:', e);
            }
        };
        refresh();
        window.addEventListener(CHANGED_EVENT, refresh);
        // Top the schedule up when the app comes back to the foreground.
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            cancelled = true;
            window.removeEventListener(CHANGED_EVENT, refresh);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [prayerCalculationMethod]);

    return null;
};

const PrayerAlertsDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [settings, setSettings] = useState<AlertSettings>(loadAlertSettings);
    const [message, setMessage] = useState('');
    const [exactOk, setExactOk] = useState(true);
    const [preview, setPreview] = useState<'regular' | 'fajr' | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const native = isNativeApp();

    const togglePreview = (which: 'regular' | 'fajr') => {
        audioRef.current?.pause();
        if (preview === which) { setPreview(null); return; }
        const audio = new Audio(ADHAN_AUDIO[which]);
        audio.onended = () => setPreview(null);
        audio.play().catch(() => setPreview(null));
        audioRef.current = audio;
        setPreview(which);
    };

    useEffect(() => () => audioRef.current?.pause(), []);

    useEffect(() => {
        exactAlarmsAllowed().then(setExactOk);
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const update = async (next: AlertSettings) => {
        setMessage('');
        if (next.enabled && !settings.enabled) {
            const granted = await requestAlertPermission();
            if (!granted) {
                setMessage('Notifications are blocked. Allow them for this app in your device or browser settings, then try again.');
                return;
            }
        }
        setSettings(next);
        saveAlertSettings(next);
        window.dispatchEvent(new Event(CHANGED_EVENT));
    };

    return createPortal(
        <div className="alerts-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="alerts-dialog" role="dialog" aria-modal="true" aria-labelledby="alerts-title">
                <div className="alerts-head">
                    <h2 id="alerts-title">Prayer time alerts</h2>
                    <button type="button" className="alerts-close" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </div>

                <button type="button" role="switch" aria-checked={settings.enabled} className={`alerts-row main ${settings.enabled ? 'on' : ''}`} onClick={() => update({ ...settings, enabled: !settings.enabled })}>
                    <span>Notify me at prayer times</span>
                    <span className="alerts-switch"><span /></span>
                </button>

                <fieldset className="alerts-prayers" disabled={!settings.enabled}>
                    <legend>Prayers</legend>
                    {ALERT_PRAYERS.map(p => (
                        <label key={p} className="alerts-check">
                            <input type="checkbox" checked={settings.prayers[p]} onChange={e => update({ ...settings, prayers: { ...settings.prayers, [p]: e.target.checked } })} />
                            {p}
                        </label>
                    ))}
                </fieldset>

                <label className="alerts-field">
                    When
                    <select value={settings.minutesBefore} disabled={!settings.enabled} onChange={e => update({ ...settings, minutesBefore: Number(e.target.value) as AlertSettings['minutesBefore'] })}>
                        <option value={0}>At the prayer time</option>
                        <option value={5}>5 minutes before</option>
                        <option value={10}>10 minutes before</option>
                        <option value={15}>15 minutes before</option>
                        <option value={30}>30 minutes before</option>
                    </select>
                </label>

                <label className="alerts-field">
                    Sound
                    <select value={settings.sound} disabled={!settings.enabled} onChange={e => update({ ...settings, sound: e.target.value as AlertSettings['sound'] })}>
                        <option value="adhan">Adhan (full call to prayer)</option>
                        <option value="default">Normal notification sound</option>
                    </select>
                </label>
                {settings.sound === 'adhan' && (
                    <div className="alerts-preview">
                        <button type="button" onClick={() => togglePreview('regular')}>{preview === 'regular' ? <><Icon name="stop" size={12} /> Stop</> : <><Icon name="play" size={12} /> Preview adhan</>}</button>
                        <button type="button" onClick={() => togglePreview('fajr')}>{preview === 'fajr' ? <><Icon name="stop" size={12} /> Stop</> : <><Icon name="play" size={12} /> Preview Fajr adhan</>}</button>
                    </div>
                )}
                {settings.sound === 'adhan' && settings.minutesBefore > 0 && (
                    <p className="alerts-hint">Reminders before the prayer use the normal sound; the adhan is for the prayer time itself. Choose “At the prayer time” to hear the adhan.</p>
                )}

                {message && <p className="alerts-error" role="alert">{message}</p>}

                {native && settings.enabled && !exactOk && (
                    <div className="alerts-tip">
                        <p>Android may deliver alerts a few minutes late. For on-time alerts, allow “Alarms &amp; reminders” for this app.</p>
                        <button type="button" onClick={() => openExactAlarmSettings().then(() => exactAlarmsAllowed().then(setExactOk))}>Open settings</button>
                    </div>
                )}

                <p className="alerts-note">
                    {native
                        ? 'Alerts are scheduled a week ahead on this phone using your location and chosen calculation method, and refresh each time you open the app.'
                        : 'On the website, alerts appear only while this site is open in a browser tab. Install the Android app for alerts when the app is closed.'}
                    {' '}Times can differ slightly from your local mosque.
                </p>
                <p className="alerts-credit">
                    Adhan: Aaqib Azeez (CC BY-SA 4.0). Fajr adhan: Islamic Center Malmö (CC BY 3.0). Both via Wikimedia Commons.
                </p>
            </div>

            <style jsx global>{`
                .alerts-overlay { position: fixed; inset: 0; z-index: 1300; background: rgba(0,0,0,0.72); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
                .alerts-dialog { width: 100%; max-width: 420px; background: #101a15; border: 1px solid var(--gold-primary); border-radius: 16px; padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 16px 48px rgba(0,0,0,0.8); }
                .alerts-head { display: flex; justify-content: space-between; align-items: center; }
                .alerts-dialog h2 { margin: 0; font-size: 1.05rem; color: var(--gold-primary); }
                .alerts-close { width: 36px; height: 36px; border-radius: 50%; border: none; background: none; color: var(--emerald-light); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .alerts-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 0.85rem 1rem; color: var(--white); font-family: inherit; font-size: 0.95rem; font-weight: 600; cursor: pointer; text-align: left; }
                .alerts-switch { width: 44px; height: 24px; flex-shrink: 0; border-radius: 12px; border: 2px solid var(--emerald-medium); position: relative; transition: all 0.2s; }
                .alerts-switch span { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--emerald-light); transition: all 0.2s; }
                .alerts-row.on .alerts-switch { background: var(--gold-primary); border-color: var(--gold-primary); }
                .alerts-row.on .alerts-switch span { left: 22px; background: var(--matte-black); }
                .alerts-prayers { border: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .alerts-prayers:disabled { opacity: 0.45; }
                .alerts-prayers legend { width: 100%; font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--emerald-light); margin-bottom: 0.5rem; }
                .alerts-check { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border: 1px solid rgba(212,175,55,0.3); border-radius: 20px; font-size: 0.88rem; color: var(--off-white); cursor: pointer; }
                .alerts-check input { accent-color: var(--gold-primary); }
                .alerts-field { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--emerald-light); }
                .alerts-field select { text-transform: none; letter-spacing: 0; background: rgba(0,0,0,0.35); border: 1px solid rgba(212,175,55,0.35); color: var(--off-white); border-radius: 10px; padding: 0.6rem 0.8rem; font-family: inherit; font-size: 0.92rem; }
                .alerts-field select option { background: #101a15; }
                .alerts-error { margin: 0; color: #e6a5a5; font-size: 0.85rem; }
                .alerts-preview { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: -0.4rem; }
                .alerts-preview button { background: transparent; border: 1px solid rgba(212,175,55,0.4); color: var(--gold-primary); border-radius: 20px; padding: 0.4rem 0.9rem; font-family: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
                .alerts-preview button:hover { background: rgba(212,175,55,0.12); }
                .alerts-preview button:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
                .alerts-hint { margin: -0.4rem 0 0; font-size: 0.78rem; color: rgba(255,255,255,0.6); }
                .alerts-credit { margin: 0; font-size: 0.68rem; color: rgba(255,255,255,0.4); }
                .alerts-tip { border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .alerts-tip p { margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.8); }
                .alerts-tip button { align-self: flex-start; background: var(--gold-primary); color: var(--matte-black); border: none; border-radius: 20px; padding: 0.45rem 1rem; font-weight: 700; font-family: inherit; cursor: pointer; }
                .alerts-note { margin: 0; font-size: 0.75rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
                .alerts-row:focus-visible, .alerts-close:focus-visible, .alerts-field select:focus-visible, .alerts-tip button:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
        </div>,
        document.body
    );
};

/** Bell button that opens the alert settings. */
export const PrayerAlertsButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const close = React.useCallback(() => setOpen(false), []);
    return (
        <>
            <button type="button" className="alerts-bell" onClick={() => setOpen(true)} aria-label="Prayer time alerts" title="Prayer time alerts">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            </button>
            {open && <PrayerAlertsDialog onClose={close} />}
            <style jsx>{`
                .alerts-bell { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(212,175,55,0.4); background: transparent; color: var(--gold-primary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
                .alerts-bell:hover { background: rgba(212,175,55,0.12); border-color: var(--gold-primary); }
                .alerts-bell:focus-visible { outline: 2px solid var(--gold-primary); outline-offset: 2px; }
            `}</style>
        </>
    );
};
