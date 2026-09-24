import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativeApp } from './api-config';

export const ALERT_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type AlertPrayer = (typeof ALERT_PRAYERS)[number];

export interface AlertSettings {
    enabled: boolean;
    prayers: Record<AlertPrayer, boolean>;
    /** 0 = at prayer time; otherwise remind this many minutes before. */
    minutesBefore: 0 | 5 | 10 | 15 | 30;
    /** Full adhan at prayer time, or the phone's normal notification sound. */
    sound: 'adhan' | 'default';
}

export const DEFAULT_ALERTS: AlertSettings = {
    enabled: false,
    prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    minutesBefore: 0,
    sound: 'adhan',
};

const KEY = 'prayer_alerts';
const DAYS_AHEAD = 7;          // Android keeps a limited number of pending alarms; a week is plenty.
const ID_BASE = 7000;           // Notification ids 7000–7999 belong to prayer alerts.
// Android notification channels (their sound can't change after creation, so
// each sound gets its own channel). Files live in android/app/src/main/res/raw.
const CHANNEL_DEFAULT = 'prayer-times';
const CHANNEL_ADHAN = 'prayer-adhan';
const CHANNEL_ADHAN_FAJR = 'prayer-adhan-fajr';

/** Web copies of the adhan recordings (credits in public/audio/CREDITS.txt). */
export const ADHAN_AUDIO = { regular: '/audio/adhan.mp3', fajr: '/audio/adhan-fajr.mp3' };

/** The adhan plays only at the actual prayer time, never for "minutes before" reminders. */
function usesAdhan(settings: AlertSettings) {
    return settings.sound === 'adhan' && settings.minutesBefore === 0;
}

export function loadAlertSettings(): AlertSettings {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (raw && typeof raw === 'object') {
            return {
                enabled: raw.enabled === true,
                prayers: { ...DEFAULT_ALERTS.prayers, ...(raw.prayers ?? {}) },
                minutesBefore: [0, 5, 10, 15, 30].includes(raw.minutesBefore) ? raw.minutesBefore : 0,
                sound: raw.sound === 'default' ? 'default' : 'adhan',
            };
        }
    } catch { /* ignore */ }
    return DEFAULT_ALERTS;
}

export function saveAlertSettings(settings: AlertSettings) {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* storage unavailable */ }
}

export interface UpcomingPrayer {
    prayer: AlertPrayer;
    time: Date;      // actual prayer time
    label: string;   // "05:02"
}

/** "05:02 (IST)" + "23-09-2026" → Date in the device's time zone. */
function parseTime(value: string, ddmmyyyy: string): Date | null {
    const t = /^(\d{1,2}):(\d{2})/.exec(value);
    const d = /^(\d{2})-(\d{2})-(\d{4})$/.exec(ddmmyyyy);
    if (!t || !d) return null;
    return new Date(Number(d[3]), Number(d[2]) - 1, Number(d[1]), Number(t[1]), Number(t[2]), 0, 0);
}

interface CalendarDay {
    timings: Record<string, string>;
    date: { gregorian: { date: string } };
}

async function fetchMonth(lat: number, lon: number, method: number, year: number, month: number): Promise<CalendarDay[]> {
    const res = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lon}&method=${method}`);
    if (!res.ok) throw new Error('Could not load prayer times');
    return (await res.json()).data;
}

/** Prayer times for the next `DAYS_AHEAD` days, from now. */
export async function upcomingPrayers(lat: number, lon: number, method: number): Promise<UpcomingPrayer[]> {
    const now = new Date();
    const end = new Date(now.getTime() + DAYS_AHEAD * 86_400_000);
    const months = [[now.getFullYear(), now.getMonth() + 1]];
    if (end.getMonth() !== now.getMonth()) months.push([end.getFullYear(), end.getMonth() + 1]);
    const days = (await Promise.all(months.map(([y, m]) => fetchMonth(lat, lon, method, y, m)))).flat();

    const result: UpcomingPrayer[] = [];
    for (const day of days) {
        for (const prayer of ALERT_PRAYERS) {
            const time = parseTime(day.timings[prayer] ?? '', day.date.gregorian.date);
            if (time && time > now && time <= end) {
                result.push({ prayer, time, label: day.timings[prayer].slice(0, 5) });
            }
        }
    }
    return result.sort((a, b) => a.time.getTime() - b.time.getTime());
}

function alertText(p: UpcomingPrayer, minutesBefore: number) {
    return minutesBefore
        ? { title: `${p.prayer} in ${minutesBefore} minutes`, body: `${p.prayer} prayer is at ${p.label}.` }
        : { title: `It’s time for ${p.prayer}`, body: `${p.prayer} prayer time has begun (${p.label}). Allāhu akbar.` };
}

// ── Native app (Android / iOS): real scheduled notifications ─────────────
async function cancelNative() {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(n => n.id >= ID_BASE && n.id < ID_BASE + 1000);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map(n => ({ id: n.id })) });
}

export async function requestAlertPermission(): Promise<boolean> {
    if (isNativeApp()) {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
    }
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
}

/** Android 12+: whether alerts can fire exactly on time (the "Alarms & reminders" permission). */
export async function exactAlarmsAllowed(): Promise<boolean> {
    if (!isNativeApp()) return true;
    try { return (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted'; } catch { return true; }
}

export async function openExactAlarmSettings() {
    try { await LocalNotifications.changeExactNotificationSetting(); } catch { /* not Android */ }
}

let webTimers: ReturnType<typeof setTimeout>[] = [];

/** Replaces all scheduled prayer alerts to match the settings. Returns how many were scheduled. */
export async function scheduleAlerts(settings: AlertSettings, lat: number, lon: number, method: number): Promise<number> {
    webTimers.forEach(clearTimeout);
    webTimers = [];
    if (isNativeApp()) await cancelNative();
    if (!settings.enabled) return 0;

    const soon = Date.now() + 5_000;
    const items = (await upcomingPrayers(lat, lon, method))
        .filter(p => settings.prayers[p.prayer])
        .map(p => ({ p, at: new Date(p.time.getTime() - settings.minutesBefore * 60_000) }))
        .filter(({ at }) => at.getTime() > soon);

    if (isNativeApp()) {
        const channels = [
            { id: CHANNEL_DEFAULT, name: 'Prayer reminders', description: 'Prayer time alerts with the normal notification sound' },
            { id: CHANNEL_ADHAN, name: 'Adhan', description: 'Plays the adhan at Dhuhr, Asr, Maghrib and Isha', sound: 'adhan.mp3' },
            { id: CHANNEL_ADHAN_FAJR, name: 'Fajr adhan', description: 'Plays the Fajr adhan at Fajr', sound: 'adhan_fajr.mp3' },
        ];
        for (const c of channels) {
            await LocalNotifications.createChannel({ ...c, importance: 5, visibility: 1, vibration: true }).catch(() => undefined);
        }
        const adhan = usesAdhan(settings);
        await LocalNotifications.schedule({
            notifications: items.map(({ p, at }, i) => ({
                id: ID_BASE + i,
                ...alertText(p, settings.minutesBefore),
                channelId: adhan ? (p.prayer === 'Fajr' ? CHANNEL_ADHAN_FAJR : CHANNEL_ADHAN) : CHANNEL_DEFAULT,
                schedule: { at, allowWhileIdle: true },
            })),
        });
        return items.length;
    }

    // Website: browsers can't wake a closed page, so alerts work while the site is open.
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return 0;
    const day = Date.now() + 24 * 3_600_000;
    for (const { p, at } of items.filter(({ at }) => at.getTime() < day)) {
        webTimers.push(setTimeout(() => {
            const { title, body } = alertText(p, settings.minutesBefore);
            try { new Notification(title, { body, icon: '/logo.png', tag: `prayer-${p.prayer}` }); } catch { /* unsupported */ }
            if (usesAdhan(settings)) {
                new Audio(p.prayer === 'Fajr' ? ADHAN_AUDIO.fajr : ADHAN_AUDIO.regular).play().catch(() => { /* autoplay blocked */ });
            }
        }, at.getTime() - Date.now()));
    }
    return webTimers.length;
}
