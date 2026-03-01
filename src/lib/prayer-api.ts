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
