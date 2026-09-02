const BASE_URL = 'https://api.aladhan.com/v1';

export interface PrayerTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
}

export interface PrayerData {
    timings: PrayerTimings;
    date: {
        readable: string;
        timestamp: string;
        hijri: HijriDate;
        gregorian: any;
    };
}

export async function fetchPrayerTimes(lat: number, lon: number, method: number = 2): Promise<PrayerData | null> {
    try {
        const res = await fetch(`${BASE_URL}/timings?latitude=${lat}&longitude=${lon}&method=${method}`);
        if (!res.ok) throw new Error('Failed to fetch prayer times');
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        return null;
    }
}

export async function fetchMonthlyCalendar(lat: number, lon: number, month: number, year: number, method: number = 2): Promise<PrayerData[] | null> {
    try {
        const res = await fetch(`${BASE_URL}/calendar?latitude=${lat}&longitude=${lon}&method=${method}&month=${month}&year=${year}`);
        if (!res.ok) throw new Error('Failed to fetch monthly calendar');
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching monthly calendar:', error);
        return null;
    }
}

export async function fetchNextPrayer(timings: PrayerTimings): Promise<{ name: string; time: string; countdown: string } | null> {
    const now = new Date();
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const name of prayerOrder) {
        const [hours, minutes] = timings[name as keyof PrayerTimings].split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        if (prayerTime > now) {
            const diff = prayerTime.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return {
                name,
                time: timings[name as keyof PrayerTimings],
                countdown: `${h}h ${m}m`
            };
        }
    }

    // If all prayers today are passed, the next one is Fajr tomorrow
    return { name: 'Fajr', time: timings.Fajr, countdown: 'Tomorrow' };
}

export async function fetchQibla(lat: number, lon: number): Promise<number | null> {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
        if (!res.ok) throw new Error('Failed to fetch Qibla direction');
        const data = await res.json();
        return data.data.direction;
    } catch (error) {
        console.error('Error fetching Qibla:', error);
        return null; // Fallback handled by UI
    }
}

function parseAladhanDate(ddmmyyyy: string): Date {
    const [d, m, y] = ddmmyyyy.split('-').map(Number);
    return new Date(y, m - 1, d);
}

async function hijriToGregorian(day: number, month: number, year: number): Promise<Date | null> {
    try {
        const dd = String(day).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        const res = await fetch(`${BASE_URL}/hToG/${dd}-${mm}-${year}`);
        if (!res.ok) throw new Error('Failed to convert Hijri date');
        const data = await res.json();
        return parseAladhanDate(data.data.gregorian.date);
    } catch (error) {
        console.error('Error converting Hijri to Gregorian:', error);
        return null;
    }
}

export interface ReligiousCounters {
    isRamadan: boolean;
    daysToRamadan: number;
    daysToEidFitr: number;
    daysToEidAdha: number;
}

/**
 * Calculates Ramadan/Eid countdowns by converting the actual Hijri calendar
 * dates (1 Ramadan, 1 Shawwal, 10 Dhul Hijjah) to Gregorian via Aladhan's
 * conversion API. This replaces a previous approach of hardcoding specific
 * Gregorian dates for a single year, which silently broke (always showed 0)
 * once that year's dates had passed, and would need a manual code update
 * every year going forward.
 */
export async function getReligiousCounters(): Promise<ReligiousCounters> {
    const now = new Date();
    const fallback: ReligiousCounters = {
        isRamadan: false,
        daysToRamadan: 0,
        daysToEidFitr: 0,
        daysToEidAdha: 0,
    };

    try {
        // Find the current Hijri year by converting today's Gregorian date.
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const todayRes = await fetch(`${BASE_URL}/gToH/${dd}-${mm}-${now.getFullYear()}`);
        if (!todayRes.ok) throw new Error('Failed to fetch current Hijri date');
        const todayData = await todayRes.json();
        const currentHijriYear = parseInt(todayData.data.hijri.year, 10);
        const currentHijriMonth = todayData.data.hijri.month.number;

        // If we're already past Ramadan (month 9) this Hijri year, the next
        // occurrence is in the following Hijri year.
        const ramadanHijriYear = currentHijriMonth > 9 ? currentHijriYear + 1 : currentHijriYear;

        const [ramadanStart, eidFitr, eidAdha] = await Promise.all([
            hijriToGregorian(1, 9, ramadanHijriYear),
            hijriToGregorian(1, 10, ramadanHijriYear),
            hijriToGregorian(10, 12, ramadanHijriYear),
        ]);

        if (!ramadanStart || !eidFitr || !eidAdha) return fallback;

        return {
            isRamadan: now >= ramadanStart && now < eidFitr,
            daysToRamadan: Math.max(0, getDaysUntil(ramadanStart)),
            daysToEidFitr: Math.max(0, getDaysUntil(eidFitr)),
            daysToEidAdha: Math.max(0, getDaysUntil(eidAdha)),
        };
    } catch (error) {
        console.error('Error calculating religious counters:', error);
        return fallback;
    }
}

function getDaysUntil(targetDate: Date): number {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
