import { cacheGet, cacheKeys, networkFirst } from './offline-store';

const BASE_URL = 'https://api.quran.com/api/v4';

/** Verses per surah (Hafs), index 0 = Al-Fatihah. Verified against Quran.com. */
export const SURAH_VERSE_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

/** The verse after `verseKey`, continuing into the next surah; null after An-Nas 114:6. */
export function nextVerseKey(verseKey: string): string | null {
    const [s, a] = verseKey.split(':').map(Number);
    if (!s || !a || s > 114) return null;
    if (a < SURAH_VERSE_COUNTS[s - 1]) return `${s}:${a + 1}`;
    return s < 114 ? `${s + 1}:1` : null;
}

async function getJson(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
}

/** Plain translation text: drops footnote markers (<sup>1</sup>) and any other tags. */
export function cleanTranslation(html: string): string {
    return html.replace(/<sup[^>]*>.*?<\/sup>/gi, '').replace(/<[^>]*>?/gm, '').replace(/\s+([,.;:!?])/g, '$1').trim();
}

export const versesCacheKey = (chapterId: number, translationId: number) => `verses:${chapterId}:${translationId}`;

export interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface TranslationResource {
    id: number;
    name: string;
    author_name: string;
    language_name: string;
}

export interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
    text_indopak?: string;
    translations?: Translation[];
    words?: Word[];
}

export interface Translation {
    id: number;
    resource_id: number;
    text: string;
}

export interface Word {
    id: number;
    position: number;
    audio_url: string;
    char_type_name: string;
    text_uthmani: string;
    translation: {
        text: string;
        language_name: string;
    };
}

export async function fetchChapters(language: string = 'en'): Promise<Chapter[]> {
    try {
        return await networkFirst(`chapters:${language}`, async () => (await getJson(`${BASE_URL}/chapters?language=${language}`)).chapters);
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
}

export async function fetchChapterInfo(chapterId: number, language: string = 'en'): Promise<Chapter | null> {
    try {
        return await networkFirst(`chapter:${chapterId}:${language}`, async () => (await getJson(`${BASE_URL}/chapters/${chapterId}?language=${language}`)).chapter);
    } catch (error) {
        console.error(`Error fetching chapter ${chapterId} info:`, error);
        return null;
    }
}

export async function fetchVersesByChapter(
    chapterId: number,
    params: { translationId?: number; perPage?: number; page?: number; language?: string } = {}
): Promise<Verse[]> {
    const { translationId = 20, perPage = 10, page = 1, language = 'en' } = params;
    try {
        const url = `${BASE_URL}/verses/by_chapter/${chapterId}?language=${language}&translations=${translationId}&per_page=${perPage}&page=${page}&fields=text_uthmani,verse_number,verse_key`;
        // Whole-surah requests are saved for offline reading.
        if (page === 1 && perPage >= SURAH_VERSE_COUNTS[chapterId - 1]) {
            return await networkFirst(versesCacheKey(chapterId, translationId), async () => (await getJson(url)).verses);
        }
        return (await getJson(url)).verses;
    } catch (error) {
        console.error(`Error fetching verses for chapter ${chapterId}:`, error);
        return [];
    }
}

export interface Recitation {
    id: number;
    reciter_name: string;
    style: string;
}

export async function fetchChapterRecitation(chapterId: number, reciterId: number): Promise<string | null> {
    try {
        const res = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterId}`);
        if (!res.ok) throw new Error('Failed to fetch recitation');
        const data = await res.json();
        return data.audio_file.audio_url;
    } catch (error) {
        console.error(`Error fetching recitation for chapter ${chapterId}:`, error);
        return null;
    }
}

function absoluteAudioUrl(url: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `https://verses.quran.com/${url.replace(/^\//, '')}`;
}

export async function fetchAyahRecitation(verseKey: string, reciterId: number): Promise<string | null> {
    const reciter = getReciter(reciterId);
    const [surah, ayah] = verseKey.split(':').map(Number);
    if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return null;

    // Reciters without per-verse audio on Quran.com use the verse-by-verse
    // everyayah.com collection (preferring Quran.com's own mirror of it).
    if ('everyayah' in reciter.ayahSource) {
        const file = `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
        const host = reciter.ayahSource.mirror ? 'https://mirrors.quranicaudio.com/everyayah' : 'https://everyayah.com/data';
        return `${host}/${reciter.ayahSource.everyayah}/${file}`;
    }

    try {
        const res = await fetch(`${BASE_URL}/recitations/${reciter.ayahSource.recitationId}/by_ayah/${verseKey}`);
        if (!res.ok) throw new Error('Failed to fetch ayah recitation');
        const data = await res.json();
        const audioUrl: string | undefined = data.audio_files?.[0]?.url;
        return audioUrl ? absoluteAudioUrl(audioUrl) : null;
    } catch (error) {
        console.error(`Error fetching recitation for ayah ${verseKey}:`, error);
        return null;
    }
}

/** One verse with a translation (used by Verse of the Day). */
export async function fetchVerseByKey(verseKey: string, translationId = 20): Promise<Verse | null> {
    try {
        return await networkFirst(`verse:${verseKey}:${translationId}`, async () =>
            (await getJson(`${BASE_URL}/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani,verse_number,verse_key`)).verse);
    } catch (error) {
        console.error(`Error fetching verse ${verseKey}:`, error);
        return null;
    }
}

/** True when a surah has been saved on this device for offline reading. */
export async function isSurahSaved(chapterId: number, translationId = 20): Promise<boolean> {
    return (await cacheGet(versesCacheKey(chapterId, translationId))) !== undefined;
}

export interface CachedSearchResult {
    verse_key: string;
    text: string;
    translations: { text: string }[];
}

// Tashkeel (Arabic diacritics): verses are stored fully vocalized, but most
// people search without typing them, so both sides are stripped before
// comparing.
function stripArabicDiacritics(text: string): string {
    return text.replace(/[ؐ-ًؚ-ٟۖ-ٰۭ]/g, '');
}

/**
 * Searches only the surahs already saved for offline reading (see the "Read
 * Offline" page) — the fallback SearchModal uses when the live Quran.com
 * search API can't be reached. Matches Arabic text (diacritic-insensitive)
 * and the cached translation; ordered by verse key since there's no
 * relevance ranking available offline.
 */
export async function searchCachedVerses(query: string, translationId = 20): Promise<CachedSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const normalizedArabicQuery = stripArabicDiacritics(trimmed);
    const lowerQuery = trimmed.toLowerCase();

    const keys = (await cacheKeys('verses:')).filter(k => k.endsWith(`:${translationId}`));
    const results: CachedSearchResult[] = [];

    for (const key of keys) {
        const verses = await cacheGet<Verse[]>(key);
        if (!verses) continue;
        for (const verse of verses) {
            const arabicMatch = stripArabicDiacritics(verse.text_uthmani).includes(normalizedArabicQuery);
            const translationRaw = verse.translations?.[0]?.text;
            const translationMatch = !!translationRaw && cleanTranslation(translationRaw).toLowerCase().includes(lowerQuery);
            if (arabicMatch || translationMatch) {
                results.push({
                    verse_key: verse.verse_key,
                    text: verse.text_uthmani,
                    translations: translationRaw ? [{ text: translationRaw }] : [],
                });
            }
        }
    }

    return results
        .sort((a, b) => {
            const [aChapter, aVerse] = a.verse_key.split(':').map(Number);
            const [bChapter, bVerse] = b.verse_key.split(':').map(Number);
            return aChapter - bChapter || aVerse - bVerse;
        })
        .slice(0, 50);
}

// Classical and widely used tafsirs available from Quran.com.
export const TAFSIRS = [
    { id: 169, name: 'Ibn Kathir (abridged)', language: 'English' },
    { id: 168, name: "Ma'arif al-Qur'an — Mufti Muhammad Shafi", language: 'English' },
    { id: 14, name: 'Tafsir Ibn Kathir', language: 'Arabic' },
    { id: 91, name: "Tafsir al-Sa'di", language: 'Arabic' },
    { id: 16, name: 'Tafsir al-Muyassar', language: 'Arabic' },
    { id: 15, name: 'Tafsir al-Tabari', language: 'Arabic' },
    { id: 90, name: 'Tafsir al-Qurtubi', language: 'Arabic' },
    { id: 94, name: 'Tafsir al-Baghawi', language: 'Arabic' },
    { id: 160, name: 'Tafsir Ibn Kathir', language: 'Urdu' },
    { id: 164, name: 'Tafsir Ibn Kathir', language: 'Bengali' },
    { id: 165, name: 'Tafsir Ahsanul Bayaan', language: 'Bengali' },
    { id: 166, name: 'Tafsir Abu Bakr Zakaria', language: 'Bengali' },
    { id: 170, name: "Tafsir al-Sa'di", language: 'Russian' },
] as const;

export interface TafsirResult {
    html: string;
    /** Verse keys this passage explains (some tafsirs cover several verses together). */
    verses: string[];
}

export async function fetchTafsir(tafsirId: number, verseKey: string): Promise<TafsirResult | null> {
    try {
        return await networkFirst(`tafsir:${tafsirId}:${verseKey}`, async () => {
            const data = await getJson(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
            return { html: String(data.tafsir?.text ?? ''), verses: Object.keys(data.tafsir?.verses ?? {}) };
        });
    } catch (error) {
        console.error(`Error fetching tafsir ${tafsirId} for ${verseKey}:`, error);
        return null;
    }
}

export async function fetchTranslationsList(language: string = 'en'): Promise<TranslationResource[]> {
    try {
        return await networkFirst(`translations:${language}`, async () => (await getJson(`${BASE_URL}/resources/translations?language=${language}`)).translations);
    } catch (error) {
        console.error('Error fetching translations list:', error);
        return [];
    }
}

export interface Reciter {
    /** Quran.com chapter-recitation id (full-surah audio). Also the id stored in settings. */
    id: number;
    name: string;
    arabicName: string;
    note?: string;
    /** Where verse-by-verse audio comes from. */
    ayahSource: { recitationId: number } | { everyayah: string; mirror: boolean };
}

// Every entry was checked against Quran.com's API: the full-surah audio and
// the verse-by-verse audio both exist for all 114 surahs.
export const RECITERS: Reciter[] = [
    { id: 7, name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', ayahSource: { recitationId: 7 } },
    { id: 3, name: 'Abdul Rahman Al-Sudais', arabicName: 'عبد الرحمن السديس', note: 'Imam, Masjid al-Haram', ayahSource: { recitationId: 3 } },
    { id: 97, name: 'Yasser Al-Dosari', arabicName: 'ياسر الدوسري', note: 'Imam, Masjid al-Haram', ayahSource: { everyayah: 'Yasser_Ad-Dussary_128kbps', mirror: true } },
    { id: 159, name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي', note: 'Imam, Masjid al-Haram', ayahSource: { everyayah: 'MaherAlMuaiqly128kbps', mirror: false } },
    { id: 162, name: 'Abdullah Awad Al-Juhany', arabicName: 'عبد الله عواد الجهني', note: 'Imam, Masjid al-Haram', ayahSource: { everyayah: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', mirror: false } },
    { id: 10, name: 'Saud Al-Shuraim', arabicName: 'سعود الشريم', note: 'Former imam, Masjid al-Haram', ayahSource: { recitationId: 10 } },
    { id: 13, name: 'Saad Al-Ghamdi', arabicName: 'سعد الغامدي', ayahSource: { everyayah: 'Ghamadi_40kbps', mirror: true } },
    { id: 4, name: 'Abu Bakr Al-Shatri', arabicName: 'أبو بكر الشاطري', ayahSource: { recitationId: 4 } },
    { id: 104, name: 'Nasser Al-Qatami', arabicName: 'ناصر القطامي', ayahSource: { everyayah: 'Nasser_Alqatami_128kbps', mirror: false } },
    { id: 158, name: 'Ali Jaber', arabicName: 'علي جابر', ayahSource: { everyayah: 'Ali_Jaber_64kbps', mirror: false } },
    { id: 163, name: 'Abdullah Basfar', arabicName: 'عبد الله بصفر', ayahSource: { everyayah: 'Abdullah_Basfar_192kbps', mirror: true } },
    { id: 5, name: 'Hani Ar-Rifai', arabicName: 'هاني الرفاعي', ayahSource: { recitationId: 5 } },
    { id: 161, name: 'Khalifa Al-Tunaiji', arabicName: 'خليفة الطنيجي', ayahSource: { everyayah: 'khalefa_al_tunaiji_64kbps', mirror: false } },
    { id: 2, name: 'Abdul Basit Abdus Samad', arabicName: 'عبد الباسط عبد الصمد', note: 'Murattal', ayahSource: { recitationId: 2 } },
    { id: 1, name: 'Abdul Basit Abdus Samad', arabicName: 'عبد الباسط عبد الصمد', note: 'Mujawwad', ayahSource: { recitationId: 1 } },
    { id: 6, name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري', ayahSource: { recitationId: 6 } },
    { id: 9, name: 'Mohamed Siddiq Al-Minshawi', arabicName: 'محمد صديق المنشاوي', note: 'Murattal', ayahSource: { recitationId: 9 } },
];

export function getReciter(id: number): Reciter {
    return RECITERS.find(r => r.id === id) ?? RECITERS[0];
}
