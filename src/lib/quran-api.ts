const BASE_URL = 'https://api.quran.com/api/v4';

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
        const res = await fetch(`${BASE_URL}/chapters?language=${language}`);
        if (!res.ok) throw new Error('Failed to fetch chapters');
        const data = await res.json();
        return data.chapters;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
}

export async function fetchChapterInfo(chapterId: number, language: string = 'en'): Promise<Chapter | null> {
    try {
        const res = await fetch(`${BASE_URL}/chapters/${chapterId}?language=${language}`);
        if (!res.ok) throw new Error('Failed to fetch chapter info');
        const data = await res.json();
        return data.chapter;
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
        const res = await fetch(
            `${BASE_URL}/verses/by_chapter/${chapterId}?language=${language}&words=true&translations=${translationId}&per_page=${perPage}&page=${page}&fields=text_uthmani,verse_number,verse_key`
        );
        if (!res.ok) throw new Error('Failed to fetch verses');
        const data = await res.json();
        return data.verses;
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

export async function fetchTranslationsList(language: string = 'en'): Promise<TranslationResource[]> {
    try {
        const res = await fetch(`${BASE_URL}/resources/translations?language=${language}`);
        if (!res.ok) throw new Error('Failed to fetch translations list');
        const data = await res.json();
        return data.translations;
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
