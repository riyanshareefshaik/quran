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

export async function fetchAyahRecitation(verseKey: string, reciterId: number): Promise<string | null> {
    try {
        const res = await fetch(`${BASE_URL}/recitations/${reciterId}/by_ayah/${verseKey}`);
        if (!res.ok) throw new Error('Failed to fetch ayah recitation');
        const data = await res.json();
        const audioUrl = data.audio_files?.[0]?.url;
        return audioUrl ? (audioUrl.startsWith('http') ? audioUrl : `https://verses.quran.com/${audioUrl}`) : null;
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

export const RECITERS = [
    { id: 7, name: 'Mishary Rashid Alafasy' },
    { id: 2, name: 'Abdul Rahman Al-Sudais' },
    { id: 6, name: 'Maher Al-Muaiqly' },
    { id: 3, name: 'Saad Al-Ghamdi' }
];
