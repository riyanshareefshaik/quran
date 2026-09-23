import collectionsData from './hadith-collections.json';

// Hadith text comes from the open-source hadith-api dataset
// (github.com/fawazahmed0/hadith-api), served from the jsDelivr CDN.
// hadith-collections.json is a compact index of its books, generated from the
// dataset's info.json, so browsing never needs the 6 MB metadata file.
const HADITH_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

export type HadithLanguage = 'eng' | 'urd' | 'ben' | 'ind' | 'tur' | 'fra' | 'rus' | 'tam';

export const LANGUAGE_NAMES: Record<HadithLanguage, string> = {
    eng: 'English',
    urd: 'اردو Urdu',
    ben: 'বাংলা Bengali',
    ind: 'Indonesian',
    tur: 'Türkçe',
    fra: 'Français',
    rus: 'Русский',
    tam: 'தமிழ் Tamil',
};

export interface HadithBook {
    id: number;
    title: string;
    first: number;
    last: number;
}

export interface HadithCollection {
    id: string;
    name: string;
    arabicName: string;
    compiler: string;
    total: number;
    languages: HadithLanguage[];
    books: HadithBook[];
}

export interface HadithGrade {
    name: string;
    grade: string;
}

export interface Hadith {
    number: number;
    arabic: string;
    text: string;
    grades: HadithGrade[];
    reference: { book: number; hadith: number } | null;
}

type RawCollection = {
    id: string; name: string; arabicName: string; compiler: string; total: number;
    languages: string[]; sections: [number, string, number, number][];
};

export const HADITH_COLLECTIONS: HadithCollection[] = (collectionsData as RawCollection[]).map(c => ({
    id: c.id,
    name: c.name,
    arabicName: c.arabicName,
    compiler: c.compiler,
    total: c.total,
    languages: c.languages as HadithLanguage[],
    books: c.sections.map(([id, title, first, last]) => ({ id, title, first, last })),
}));

export function getCollection(id: string | null | undefined): HadithCollection | undefined {
    return HADITH_COLLECTIONS.find(c => c.id === id);
}

export function findBookForHadith(collection: HadithCollection, number: number): HadithBook | undefined {
    return collection.books.find(b => number >= b.first && number <= b.last);
}

interface RawSection {
    hadiths: { hadithnumber: number; text: string; grades?: HadithGrade[]; reference?: { book: number; hadith: number } }[];
}

const cache = new Map<string, Promise<RawSection>>();

function fetchEdition(edition: string, bookId: number): Promise<RawSection> {
    const url = `${HADITH_CDN}/${edition}/sections/${bookId}.min.json`;
    let pending = cache.get(url);
    if (!pending) {
        pending = fetch(url).then(res => {
            if (!res.ok) throw new Error(`Failed to load hadith (${res.status})`);
            return res.json() as Promise<RawSection>;
        });
        pending.catch(() => cache.delete(url)); // allow retry after a network error
        cache.set(url, pending);
    }
    return pending;
}

/** Loads one book of a collection with Arabic text and the chosen translation. */
export async function fetchHadithBook(collection: HadithCollection, bookId: number, language: HadithLanguage): Promise<Hadith[]> {
    const lang = collection.languages.includes(language) ? language : 'eng';
    const [arabic, translated] = await Promise.all([
        fetchEdition(`ara-${collection.id}`, bookId),
        fetchEdition(`${lang}-${collection.id}`, bookId),
    ]);

    const arabicByNumber = new Map(arabic.hadiths.map(h => [h.hadithnumber, h.text]));
    // English editions carry the grades; reuse them for other languages.
    const english = lang === 'eng' ? translated : await fetchEdition(`eng-${collection.id}`, bookId).catch(() => null);
    const gradesByNumber = new Map((english?.hadiths ?? []).map(h => [h.hadithnumber, h.grades ?? []]));

    return translated.hadiths
        .filter(h => (h.text ?? '').trim() || (arabicByNumber.get(h.hadithnumber) ?? '').trim())
        .map(h => ({
            number: h.hadithnumber,
            arabic: arabicByNumber.get(h.hadithnumber) ?? '',
            text: h.text ?? '',
            grades: gradesByNumber.get(h.hadithnumber) ?? h.grades ?? [],
            reference: h.reference ?? null,
        }));
}
