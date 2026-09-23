// Content for the Ramadan, Hajj and Umrah guidance pages.
//
// Accuracy notes for anyone editing this file:
// - Every ruling here reflects the position held by the majority of Muslim
//   scholars. Where scholars differ, the text says so instead of picking
//   one — do not "simplify" those notes away.
// - Never label content by sect or school; this app speaks to all Muslims.
// - Every Quran reference is surah:ayah. Hadith are cited by collection and
//   narrator (not by number, since numbering differs between editions).
// - Arabic duas are copied from the cited sources; check any change against
//   the original before committing.

export type GuideSlug = 'ramadan' | 'hajj' | 'umrah';

export interface GuideDua {
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    source: string;
}

export interface GuideStep {
    title: string;
    detail: string;
}

export interface GuideSection {
    id: string;
    title: string;
    label?: string; // e.g. "8 Dhul-Hijjah"
    summary?: string;
    steps?: GuideStep[];
    duas?: GuideDua[];
    notes?: string[];
    sources?: string[];
}

export interface Guide {
    slug: GuideSlug;
    title: string;
    arabicTitle: string;
    subtitle: string;
    intro: string;
    keyVerse: { arabic: string; translation: string; reference: string };
    sections: GuideSection[];
}

const TALBIYAH: GuideDua = {
    title: 'The Talbiyah',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
    transliteration: 'Labbayk Allāhumma labbayk, labbayka lā sharīka laka labbayk, inna al-ḥamda wa an-niʿmata laka wa al-mulk, lā sharīka lak.',
    translation: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed all praise, blessings and dominion belong to You. You have no partner.',
    source: 'Sahih al-Bukhari & Sahih Muslim (Ibn ʿUmar)',
};

const RABBANA_ATINA: GuideDua = {
    title: 'Between the Yemeni Corner and the Black Stone',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbanā ātinā fi ad-dunyā ḥasanatan wa fi al-ākhirati ḥasanatan wa qinā ʿadhāb an-nār.',
    translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    source: 'Quran 2:201 · recited here per Sunan Abi Dawud (ʿAbdullah ibn as-Sāʾib)',
};

const SAFA_DHIKR: GuideDua = {
    title: 'On Safa and Marwah (facing the Kaʿbah)',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ. لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
    transliteration: 'Allāhu akbar (×3). Lā ilāha illā Allāhu waḥdahu lā sharīka lah, lahu al-mulku wa lahu al-ḥamd, wa huwa ʿalā kulli shayʾin qadīr. Lā ilāha illā Allāhu waḥdah, anjaza waʿdah, wa naṣara ʿabdah, wa hazama al-aḥzāba waḥdah.',
    translation: 'Allah is the Greatest (×3). There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things. There is no god but Allah alone; He fulfilled His promise, gave victory to His servant, and alone defeated the confederates.',
    source: 'Sahih Muslim (Jābir ibn ʿAbdillāh). The Prophet ﷺ said this three times, making duʿāʾ in between.',
};

const CONDITIONAL_IHRAM: GuideDua = {
    title: 'Conditional intention (if you fear illness or being prevented)',
    arabic: 'فَإِنْ حَبَسَنِي حَابِسٌ فَمَحِلِّي حَيْثُ حَبَسْتَنِي',
    transliteration: 'Fa in ḥabasanī ḥābisun fa maḥillī ḥaythu ḥabastanī.',
    translation: 'If I am prevented by an obstacle, then my place of leaving Ihram is wherever You prevent me.',
    source: 'Sahih al-Bukhari & Sahih Muslim (ʿĀʾishah, regarding Ḍubāʿah bint az-Zubayr)',
};

export const GUIDES: Record<GuideSlug, Guide> = {
    ramadan: {
        slug: 'ramadan',
        title: 'Ramadan',
        arabicTitle: 'رَمَضَان',
        subtitle: 'The month of fasting, Quran and night prayer',
        intro: 'Fasting Ramadan is one of the five pillars of Islam. It is obligatory on every Muslim who is adult, sane, resident and able, from true dawn (Fajr) until sunset, for the whole month.',
        keyVerse: {
            arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
            translation: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you, that you may become righteous.',
            reference: 'Quran 2:183',
        },
        sections: [
            {
                id: 'start',
                title: 'When Ramadan begins and ends',
                summary: 'The Islamic month begins with the sighting of the new crescent moon.',
                steps: [
                    { title: 'Sighting the moon', detail: 'Fast when the crescent of Ramadan is sighted, and end the fast when the crescent of Shawwal is sighted. If it cannot be seen, complete 30 days of the month.' },
                    { title: 'Follow your local community', detail: 'Communities differ on whether they follow local sighting, global sighting, or calculations. Follow the announcement of your trusted local mosque or Islamic authority.' },
                ],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "Fast when you see it and break your fast when you see it; if it is hidden from you, complete the count of thirty."'],
            },
            {
                id: 'fast',
                title: 'How to fast',
                steps: [
                    { title: 'Intention (niyyah)', detail: 'Intend in your heart, before Fajr, that you are fasting Ramadan tomorrow. Waking for suhoor with this purpose is itself an intention. No fixed verbal formula is required.' },
                    { title: 'Suhoor (pre-dawn meal)', detail: 'Eat before dawn, even a little — it is a Sunnah with blessing. Delaying it close to Fajr is recommended.' },
                    { title: 'Stop at true dawn', detail: 'Eating and drinking are allowed until Fajr (true dawn) begins. Timetables often show "Imsak" about 10 minutes earlier as a precaution; the fast itself begins at Fajr.' },
                    { title: 'During the day', detail: 'Abstain from food, drink and marital relations, and guard the tongue and limbs from lying, backbiting, arguing and anything sinful.' },
                    { title: 'Iftar at sunset', detail: 'Break the fast promptly at sunset (Maghrib). The Sunnah is to break it with fresh dates; if none, dry dates; if none, a few sips of water.' },
                ],
                duas: [
                    {
                        title: 'At iftar',
                        arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
                        transliteration: 'Dhahaba aẓ-ẓamaʾu wabtallat al-ʿurūqu wa thabata al-ajru in shāʾ Allāh.',
                        translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
                        source: 'Sunan Abi Dawud (Ibn ʿUmar) — graded ḥasan',
                    },
                ],
                sources: [
                    'Quran 2:187 — "eat and drink until the white thread of dawn becomes distinct to you from the black thread. Then complete the fast until the sunset."',
                    'Sahih al-Bukhari & Sahih Muslim (Anas): "Take suhoor, for in suhoor there is blessing."',
                    'Sahih al-Bukhari & Sahih Muslim (Sahl ibn Saʿd): "People will remain upon goodness as long as they hasten to break the fast."',
                    'Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (Anas): breaking the fast with fresh dates, then dry dates, then water.',
                ],
            },
            {
                id: 'invalidators',
                title: 'What breaks the fast',
                steps: [
                    { title: 'Eating or drinking deliberately', detail: 'Anything taken by mouth on purpose, including smoking.' },
                    { title: 'Marital relations', detail: 'Intercourse during the fasting hours breaks the fast and, according to the majority, requires both a make-up day and an expiation (kaffārah). The hadith lists freeing a slave; if that is not possible (as today), fasting two consecutive months; if unable, feeding sixty poor people.' },
                    { title: 'Deliberate vomiting', detail: 'Making oneself vomit breaks the fast; vomiting involuntarily does not.' },
                    { title: 'Menstruation or post-natal bleeding', detail: 'The fast is not valid during these; the days are made up later.' },
                ],
                notes: [
                    'Eating or drinking out of genuine forgetfulness does NOT break the fast — continue fasting.',
                    'Brushing teeth, rinsing the mouth without swallowing, tasting food without swallowing, and a bath or shower do not break the fast.',
                    'Rulings on medical treatments (injections, inhalers, drips, eye/ear drops) differ between scholars — ask a qualified scholar about your specific case.',
                ],
                sources: [
                    'Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "Whoever forgets while fasting and eats or drinks, let him complete his fast, for it was Allah who fed him and gave him drink."',
                    'Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): the man who had relations with his wife in Ramadan and was told the expiation.',
                ],
            },
            {
                id: 'exemptions',
                title: 'Who is excused',
                steps: [
                    { title: 'The sick and travellers', detail: 'May break the fast and make up the missed days later.' },
                    { title: 'Menstruating women and those with post-natal bleeding', detail: 'Must not fast; they make up the days after Ramadan.' },
                    { title: 'The elderly and chronically ill', detail: 'Those permanently unable to fast feed one poor person for each day missed (fidyah) instead of making it up.' },
                    { title: 'Pregnant and breastfeeding women', detail: 'May break the fast if they fear for themselves or the child. Scholars differ on whether they make up the days, pay fidyah, or both — consult a scholar.' },
                ],
                sources: [
                    'Quran 2:184–185 — "whoever among you is ill or on a journey [during them] — then an equal number of other days. And upon those who are able [to fast, but with hardship] — a ransom [as substitute] of feeding a poor person."',
                    'Sahih Muslim (ʿĀʾishah): "We were ordered to make up the fasts, and not ordered to make up the prayers."',
                ],
            },
            {
                id: 'nights',
                title: 'Taraweeh and night prayer',
                summary: 'Standing the nights of Ramadan in prayer is a confirmed Sunnah, whether in congregation at the mosque or at home.',
                sources: ['Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "Whoever stands [in prayer] in Ramadan out of faith and seeking reward, his previous sins will be forgiven." The same is said of fasting Ramadan.'],
                notes: ['Scholars have accepted both 8 and 20 rakʿahs of taraweeh (plus witr); both are established practices.'],
            },
            {
                id: 'last-ten',
                title: 'The last ten nights & Laylat al-Qadr',
                summary: 'Laylat al-Qadr — the Night of Decree — is better than a thousand months. Seek it in the odd nights of the last ten.',
                steps: [
                    { title: 'Increase worship', detail: 'The Prophet ﷺ would strive more in the last ten nights than at any other time: praying at night, waking his family, and devoting himself to worship.' },
                    { title: 'Iʿtikāf', detail: 'Secluding oneself in the mosque for worship during the last ten days is a Sunnah for those able.' },
                ],
                duas: [
                    {
                        title: 'On Laylat al-Qadr',
                        arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
                        transliteration: 'Allāhumma innaka ʿafuwwun tuḥibbu al-ʿafwa faʿfu ʿannī.',
                        translation: 'O Allah, You are Pardoning and love to pardon, so pardon me.',
                        source: 'Jāmiʿ at-Tirmidhi & Sunan Ibn Mājah (ʿĀʾishah)',
                    },
                ],
                sources: [
                    'Quran 97:1–5 — Surah al-Qadr.',
                    'Sahih al-Bukhari (ʿĀʾishah): "Seek Laylat al-Qadr in the odd nights of the last ten of Ramadan."',
                    'Sahih al-Bukhari & Sahih Muslim (ʿĀʾishah): the Prophet ﷺ observed iʿtikāf in the last ten days until he passed away.',
                ],
            },
            {
                id: 'zakat-fitr',
                title: 'Zakat al-Fitr',
                summary: 'An obligatory charity paid for every Muslim in the household, young and old, to purify the fast and feed the poor on Eid.',
                steps: [
                    { title: 'Amount', detail: 'One ṣāʿ (about 2.5–3 kg) of a staple food — such as dates, barley, rice or wheat — per person.' },
                    { title: 'Timing', detail: 'Must be given before the Eid prayer. It may be given a day or two before Eid.' },
                ],
                notes: ['Most scholars require it to be given as food, while others permit giving its cash value. Many local mosques announce the amount in your currency.'],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Ibn ʿUmar): the Messenger of Allah ﷺ made Zakat al-Fitr obligatory — a ṣāʿ of dates or a ṣāʿ of barley — on every Muslim, and ordered it be paid before people go out to the prayer.'],
            },
            {
                id: 'eid',
                title: 'Eid al-Fitr',
                steps: [
                    { title: 'Before leaving', detail: 'Bathe, wear your best clothes, and eat an odd number of dates before going to the Eid prayer.' },
                    { title: 'Takbīr', detail: 'Glorify Allah from the sighting of the Shawwal moon until the Eid prayer.' },
                    { title: 'Six days of Shawwal', detail: 'Fasting six days of Shawwal after Ramadan is like fasting the whole year.' },
                ],
                duas: [
                    {
                        title: 'Takbīr of Eid',
                        arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ',
                        transliteration: 'Allāhu akbar, Allāhu akbar, lā ilāha illā Allāh, wa Allāhu akbar, Allāhu akbar, wa lillāhi al-ḥamd.',
                        translation: 'Allah is the Greatest, Allah is the Greatest, there is no god but Allah. Allah is the Greatest, Allah is the Greatest, and to Allah belongs all praise.',
                        source: 'Reported from Ibn Masʿūd (Muṣannaf Ibn Abī Shaybah)',
                    },
                ],
                sources: [
                    'Quran 2:185 — "…and to glorify Allah for that to which He has guided you."',
                    'Sahih al-Bukhari (Anas): the Prophet ﷺ would not go out on Eid al-Fitr until he had eaten some dates, an odd number.',
                    'Sahih Muslim (Abū Ayyūb): "Whoever fasts Ramadan then follows it with six of Shawwal, it is as if he fasted for a lifetime."',
                ],
            },
        ],
    },

    umrah: {
        slug: 'umrah',
        title: 'Umrah',
        arabicTitle: 'الْعُمْرَة',
        subtitle: 'Step-by-step guide to the lesser pilgrimage',
        intro: 'Umrah can be performed at any time of the year. It consists of four acts: entering Ihram, Tawaf around the Kaʿbah, Saʿi between Safa and Marwah, and shaving or shortening the hair. Scholars classify these slightly differently (pillar vs. obligation), but all four are performed by every pilgrim.',
        keyVerse: {
            arabic: 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ',
            translation: 'And complete the Hajj and Umrah for Allah.',
            reference: 'Quran 2:196',
        },
        sections: [
            {
                id: 'before',
                title: 'Before you travel',
                steps: [
                    { title: 'Sincere intention and repentance', detail: 'Perform Umrah only for Allah. Repent, settle debts or make arrangements for them, and ask forgiveness of anyone you have wronged.' },
                    { title: 'Learn the rites', detail: 'Study the steps before departing, and travel with a knowledgeable group where possible.' },
                    { title: 'Documents', detail: 'Obtain your visa and any required permits through official channels (e.g. the Nusuk platform or a licensed operator). Requirements change — check current Saudi regulations.' },
                ],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "From one Umrah to the next is an expiation for what is between them, and an accepted Hajj has no reward except Paradise."'],
            },
            {
                id: 'ihram',
                title: '1. Ihram at the Miqat',
                summary: 'Ihram is the sacred state entered with the intention of Umrah, before crossing the Miqat (boundary).',
                steps: [
                    { title: 'Prepare', detail: 'It is Sunnah to bathe (ghusl), trim nails and remove unwanted hair beforehand. Men may apply perfume to the body — not the Ihram cloth — before entering Ihram.' },
                    { title: 'Clothing — men', detail: 'Two plain (preferably white) unstitched sheets: an izār around the waist and a ridāʾ over the shoulders. Sandals that leave the ankles uncovered. The head stays uncovered.' },
                    { title: 'Clothing — women', detail: 'Any modest, loose clothing that covers the body, in any colour. Women must not wear the niqab (face veil) or gloves while in Ihram; they may lower a cloth over the face in front of non-mahram men.' },
                    { title: 'The Miqats', detail: 'Dhul-Ḥulayfah (for Madinah), al-Juḥfah (for Syria/Egypt; today pilgrims use Rābigh), Qarn al-Manāzil (for Najd; as-Sayl al-Kabīr), Yalamlam (for Yemen), and Dhāt ʿIrq (for Iraq). Air passengers enter Ihram before the plane passes over their Miqat. Residents of Makkah go out to the Ḥill (e.g. Masjid ʿĀʾishah at at-Tanʿīm).' },
                    { title: 'Make the intention', detail: 'Say "Labbayk Allāhumma ʿumrah" (Here I am, O Allah, for Umrah), then begin reciting the Talbiyah. Men raise their voices; women say it quietly.' },
                    { title: 'Keep reciting', detail: 'Continue the Talbiyah frequently until you begin Tawaf.' },
                ],
                duas: [
                    {
                        title: 'Intention for Umrah',
                        arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
                        transliteration: 'Labbayk Allāhumma ʿumrah.',
                        translation: 'Here I am, O Allah, for Umrah.',
                        source: 'Based on Sahih Muslim (Anas), who heard the Prophet ﷺ say: "Labbayka ʿumratan wa ḥajjan"',
                    },
                    TALBIYAH,
                    CONDITIONAL_IHRAM,
                ],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Ibn ʿAbbās): the Prophet ﷺ appointed Dhul-Ḥulayfah, al-Juḥfah, Qarn al-Manāzil and Yalamlam as Miqats, "for their people and for those who pass by them intending Hajj or Umrah." Dhāt ʿIrq is reported in Sahih Muslim (Jābir).'],
            },
            {
                id: 'prohibitions',
                title: 'Prohibited while in Ihram',
                steps: [
                    { title: 'For everyone', detail: 'Removing hair or cutting nails; using perfume or scented products; marital relations and anything leading to them; contracting a marriage; hunting land animals; arguing, obscenity and sin.' },
                    { title: 'Men only', detail: 'Wearing stitched clothing shaped to the body (shirts, trousers, underwear, socks) and covering the head with anything touching it.' },
                    { title: 'Women only', detail: 'Wearing the niqab and gloves.' },
                ],
                notes: [
                    'Allowed: bathing, changing into fresh Ihram cloths, using unscented soap, a watch, glasses, a belt or money pouch, an umbrella, and sitting in shade.',
                    'If a prohibition is broken, a compensation (fidyah) may be due. The details depend on the act and whether it was deliberate — ask a scholar.',
                ],
                sources: [
                    'Quran 2:197 — "there is to be no sexual relations, no disobedience and no disputing during Hajj."',
                    'Sahih al-Bukhari & Sahih Muslim (Ibn ʿUmar): what the muḥrim may not wear.',
                    'Quran 2:196 — fidyah of fasting, charity or sacrifice for one who must shave due to illness.',
                ],
            },
            {
                id: 'tawaf',
                title: '2. Tawaf — seven circuits around the Kaʿbah',
                summary: 'Wudu is required for Tawaf according to the majority of scholars.',
                steps: [
                    { title: 'Enter Masjid al-Ḥarām', detail: 'Enter with the right foot and the usual duʿāʾ for entering the mosque. Stop reciting the Talbiyah when you begin Tawaf.' },
                    { title: 'Idṭibāʿ (men)', detail: 'Uncover the right shoulder by passing the upper sheet under the right arm, for the whole Tawaf of Umrah only.' },
                    { title: 'Start at the Black Stone', detail: 'Face the Black Stone (al-Ḥajar al-Aswad), say "Bismillāh, Allāhu akbar", and touch or kiss it if possible — otherwise point to it with your right hand without pushing anyone.' },
                    { title: 'Walk anticlockwise', detail: 'Keep the Kaʿbah on your left. Each circuit ends back at the Black Stone line, where you say "Allāhu akbar" and point again. Complete seven circuits.' },
                    { title: 'Raml (men)', detail: 'Walk briskly with short steps in the first three circuits, if possible without harming others; walk normally in the last four.' },
                    { title: 'Remembrance', detail: 'There is no fixed duʿāʾ for each circuit. Make any duʿāʾ, dhikr or Quran recitation in your own language. Touch the Yemeni Corner if you can (without kissing or pointing).' },
                    { title: 'Two rakʿahs', detail: 'After Tawaf, cover the right shoulder and pray two rakʿahs behind Maqām Ibrāhīm if possible, otherwise anywhere in the mosque — traditionally reciting al-Kāfirūn and al-Ikhlāṣ.' },
                    { title: 'Zamzam', detail: 'Drink Zamzam water and make duʿāʾ.' },
                ],
                duas: [RABBANA_ATINA],
                sources: [
                    'Quran 2:125 — "And take, [O believers], from the standing place of Abraham a place of prayer."',
                    'Sahih Muslim (Jābir ibn ʿAbdillāh) — the long hadith describing the Prophet’s ﷺ Hajj, including the Tawaf, raml, two rakʿahs and Saʿi.',
                ],
            },
            {
                id: 'sai',
                title: '3. Saʿi — seven laps between Safa and Marwah',
                summary: 'Wudu is recommended but not required for Saʿi.',
                steps: [
                    { title: 'Begin at Safa', detail: 'On approaching Safa for the first time, recite "Inna aṣ-Ṣafā wa al-Marwata min shaʿāʾirillāh" (2:158). Climb Safa, face the Kaʿbah, raise your hands and make the dhikr and duʿāʾ below.' },
                    { title: 'Walk to Marwah', detail: 'Safa to Marwah is one lap; Marwah back to Safa is the second. Seven laps end at Marwah.' },
                    { title: 'Between the green lights (men)', detail: 'Men jog between the two green-lit markers; women walk normally throughout.' },
                    { title: 'On Marwah', detail: 'Face the Kaʿbah and repeat the same dhikr and duʿāʾ as on Safa.' },
                ],
                duas: [
                    {
                        title: 'Approaching Safa (first lap only)',
                        arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
                        transliteration: 'Inna aṣ-Ṣafā wa al-Marwata min shaʿāʾiri Allāh.',
                        translation: 'Indeed, Safa and Marwah are among the symbols of Allah.',
                        source: 'Quran 2:158 · Sahih Muslim (Jābir)',
                    },
                    SAFA_DHIKR,
                ],
            },
            {
                id: 'halq',
                title: '4. Shaving or shortening the hair',
                steps: [
                    { title: 'Men', detail: 'Shave the whole head (ḥalq), which is better, or shorten the hair evenly from all over the head (taqṣīr).' },
                    { title: 'Women', detail: 'Gather the hair and cut about a fingertip’s length (roughly 2 cm) from the ends. Women do not shave.' },
                    { title: 'Umrah complete', detail: 'Your Umrah is complete and all Ihram restrictions are lifted. May Allah accept it.' },
                ],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): the Prophet ﷺ prayed three times for those who shave their heads and once for those who shorten.'],
            },
            {
                id: 'notes',
                title: 'Important notes',
                notes: [
                    'A woman who begins menstruating may do everything except Tawaf, and must wait until she is pure to perform Tawaf (and the Saʿi after it).',
                    'If you are unsure how many circuits or laps you completed, build on the number you are certain of (the lower number).',
                    'Umrah in Ramadan carries the reward of a Hajj — though it does not replace the obligatory Hajj.',
                    'Visiting Madinah is not part of Umrah, but praying in the Prophet’s Mosque ﷺ is greatly rewarded.',
                ],
                sources: [
                    'Sahih al-Bukhari & Sahih Muslim (ʿĀʾishah): "Do what the pilgrim does, except do not perform Tawaf of the House until you are pure."',
                    'Sahih al-Bukhari & Sahih Muslim (Ibn ʿAbbās): "Umrah in Ramadan is equal to Hajj."',
                    'Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "Do not set out on a journey except to three mosques…"',
                ],
            },
        ],
    },

    hajj: {
        slug: 'hajj',
        title: 'Hajj',
        arabicTitle: 'الْحَجّ',
        subtitle: 'The five days of the pilgrimage, 8–13 Dhul-Hijjah',
        intro: 'Hajj is the fifth pillar of Islam, obligatory once in a lifetime on every adult Muslim who is physically and financially able. Its pillars (arkān) — without which Hajj is invalid — are: Ihram, standing at ʿArafah, Tawaf al-Ifāḍah and, according to the majority, Saʿi. This guide follows Hajj Tamattuʿ, the type most pilgrims from abroad perform.',
        keyVerse: {
            arabic: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
            translation: 'And [due] to Allah from the people is a pilgrimage to the House — for whoever is able to find thereto a way.',
            reference: 'Quran 3:97',
        },
        sections: [
            {
                id: 'types',
                title: 'The three types of Hajj',
                steps: [
                    { title: 'Tamattuʿ', detail: 'Perform Umrah during the Hajj months, leave Ihram, then enter Ihram again for Hajj on 8 Dhul-Hijjah. A sacrificial animal (hady) is required.' },
                    { title: 'Qirān', detail: 'Enter Ihram for Umrah and Hajj together and remain in Ihram until the Day of Sacrifice. A hady is required.' },
                    { title: 'Ifrād', detail: 'Enter Ihram for Hajj only. No hady is required.' },
                ],
                notes: ['If a Tamattuʿ or Qirān pilgrim cannot find or afford a hady, they fast three days during Hajj and seven after returning home.'],
                sources: [
                    'Quran 2:196 — "whoever performs Umrah [during the Hajj months] followed by Hajj [must offer] what can be obtained with ease of sacrificial animals. And whoever cannot find [one] — then a fast of three days during Hajj and of seven when you have returned."',
                    'Quran 2:197 — "Hajj is [during] well-known months."',
                ],
            },
            {
                id: 'conditions',
                title: 'Before you go',
                steps: [
                    { title: 'Who must perform Hajj', detail: 'A Muslim who is adult, sane and able — having the health, the means for the journey, and enough to support dependants while away.' },
                    { title: 'Official permit', detail: 'Hajj requires an official Hajj permit, obtained through your country’s licensed Hajj operators or the Nusuk platform. Performing Hajj without a permit is not allowed by Saudi law.' },
                    { title: 'Women', detail: 'Scholars differ on whether a woman must travel with a mahram or may travel with a trustworthy group. Consult a scholar and check current Saudi regulations.' },
                ],
                sources: [
                    'Quran 3:97.',
                    'Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah): "Whoever performs Hajj and does not commit obscenity or wrongdoing returns [free of sin] like the day his mother bore him."',
                ],
            },
            {
                id: 'day8',
                label: '8 Dhul-Hijjah',
                title: 'Yawm at-Tarwiyah — to Mina',
                steps: [
                    { title: 'Enter Ihram for Hajj', detail: 'Tamattuʿ pilgrims enter Ihram from where they are staying in Makkah, in the same way as for Umrah, and say "Labbayk Allāhumma ḥajjan". Qirān and Ifrād pilgrims are still in Ihram.' },
                    { title: 'Go to Mina', detail: 'Travel to Mina before noon, reciting the Talbiyah.' },
                    { title: 'Pray in Mina', detail: 'Pray Dhuhr, ʿAsr, Maghrib, ʿIshāʾ and the next Fajr in Mina, each at its own time, shortening the four-rakʿah prayers to two (not combining them).' },
                ],
                duas: [
                    {
                        title: 'Intention for Hajj',
                        arabic: 'لَبَّيْكَ اللَّهُمَّ حَجًّا',
                        transliteration: 'Labbayk Allāhumma ḥajjan.',
                        translation: 'Here I am, O Allah, for Hajj.',
                        source: 'Based on Sahih Muslim (Anas), who heard the Prophet ﷺ say: "Labbayka ʿumratan wa ḥajjan"',
                    },
                    TALBIYAH,
                ],
                sources: ['Sahih Muslim (Jābir ibn ʿAbdillāh) — the Prophet’s ﷺ Hajj.'],
            },
            {
                id: 'day9',
                label: '9 Dhul-Hijjah',
                title: 'The Day of ʿArafah',
                summary: 'Standing at ʿArafah is the essence of Hajj. Whoever misses it has missed the Hajj.',
                steps: [
                    { title: 'Go to ʿArafah', detail: 'After sunrise, travel from Mina to ʿArafah. Make sure you are within the boundaries of ʿArafah (they are clearly signposted; Masjid Namirah is partly outside them).' },
                    { title: 'Dhuhr and ʿAsr', detail: 'Pray Dhuhr and ʿAsr combined and shortened at the time of Dhuhr, with one adhan and two iqāmahs.' },
                    { title: 'The standing (wuqūf)', detail: 'Spend the afternoon until sunset in duʿāʾ, dhikr, Quran and repentance, facing the qiblah with hands raised. You do not need to climb Jabal ar-Raḥmah; all of ʿArafah is a place of standing.' },
                    { title: 'Leave after sunset', detail: 'Leave for Muzdalifah calmly after sunset — not before. Do not pray Maghrib in ʿArafah.' },
                ],
                duas: [
                    {
                        title: 'The best duʿāʾ of ʿArafah',
                        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                        transliteration: 'Lā ilāha illā Allāhu waḥdahu lā sharīka lah, lahu al-mulku wa lahu al-ḥamd, wa huwa ʿalā kulli shayʾin qadīr.',
                        translation: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things.',
                        source: 'Jāmiʿ at-Tirmidhi (ʿAbdullāh ibn ʿAmr): "The best duʿāʾ is the duʿāʾ of the Day of ʿArafah…"',
                    },
                ],
                notes: ['For those not performing Hajj, fasting the Day of ʿArafah expiates the sins of the previous and coming year (Sahih Muslim, Abū Qatādah). Pilgrims at ʿArafah do not fast.'],
                sources: [
                    'Jāmiʿ at-Tirmidhi, Sunan Abi Dawud, an-Nasāʾi & Ibn Mājah (ʿAbd ar-Raḥmān ibn Yaʿmar): "Hajj is ʿArafah."',
                    'Quran 2:198 — "when you depart from ʿArafāt, remember Allah at al-Mashʿar al-Ḥarām."',
                ],
            },
            {
                id: 'muzdalifah',
                label: 'Night of 10 Dhul-Hijjah',
                title: 'Muzdalifah',
                steps: [
                    { title: 'Maghrib and ʿIshāʾ', detail: 'On arrival, pray Maghrib (3 rakʿahs) and ʿIshāʾ (shortened to 2) combined, with one adhan and two iqāmahs.' },
                    { title: 'Spend the night', detail: 'Rest and sleep in Muzdalifah, as the Prophet ﷺ did.' },
                    { title: 'Fajr and dhikr', detail: 'Pray Fajr early, then remain in duʿāʾ and dhikr facing the qiblah until the sky is very bright, and leave for Mina before sunrise.' },
                    { title: 'Pebbles', detail: 'Pick up small pebbles — slightly larger than a chickpea. You may collect them in Muzdalifah or anywhere else: 7 for the 10th, then 21 for each of the following days (49 in total, or 70 if staying until the 13th).' },
                ],
                notes: ['The Prophet ﷺ permitted the weak, the elderly, women and those caring for them to leave Muzdalifah in the latter part of the night.'],
                sources: ['Sahih al-Bukhari & Sahih Muslim (ʿĀʾishah & Ibn ʿAbbās): permission for the weak to leave Muzdalifah early.'],
            },
            {
                id: 'day10',
                label: '10 Dhul-Hijjah',
                title: 'Yawm an-Naḥr — the Day of Sacrifice (Eid al-Aḍḥā)',
                summary: 'The busiest day of Hajj. Four acts are performed, ideally in this order — but the Prophet ﷺ said "there is no harm" to those who changed the order.',
                steps: [
                    { title: 'a. Stone Jamrat al-ʿAqabah', detail: 'Stop the Talbiyah and throw 7 pebbles, one at a time, at the large Jamrah only, saying "Allāhu akbar" with each.' },
                    { title: 'b. Sacrifice (hady)', detail: 'Tamattuʿ and Qirān pilgrims offer their sacrifice. Most pilgrims buy an official sacrifice voucher in advance.' },
                    { title: 'c. Shave or shorten', detail: 'Men shave (better) or shorten; women cut a fingertip’s length. After this you may remove Ihram and wear normal clothes — everything becomes permitted except marital relations (the first release, at-taḥallul al-awwal).' },
                    { title: 'd. Tawaf al-Ifāḍah & Saʿi', detail: 'Go to Makkah and perform Tawaf al-Ifāḍah (a pillar of Hajj), then Saʿi. Tamattuʿ pilgrims must do Saʿi; Qirān and Ifrād pilgrims do it only if they did not already do it after their arrival Tawaf. This may be delayed to the following days. After it, all restrictions are lifted (full release).' },
                ],
                sources: [
                    'Sahih al-Bukhari & Sahih Muslim (ʿAbdullāh ibn ʿAmr): on the Day of Sacrifice the Prophet ﷺ was asked about acts done out of order and replied, "Do it, there is no harm."',
                    'Quran 22:29 — "then let them end their untidiness and fulfil their vows and perform Tawaf around the Ancient House."',
                ],
            },
            {
                id: 'tashreeq',
                label: '11–13 Dhul-Hijjah',
                title: 'The Days of Tashrīq in Mina',
                steps: [
                    { title: 'Stay in Mina', detail: 'Spend the nights of the 11th and 12th (and 13th if staying) in Mina.' },
                    { title: 'Stone all three Jamarāt daily', detail: 'After midday (zawāl), throw 7 pebbles at each Jamrah in order: the small (al-Ṣughrā), the middle (al-Wusṭā), then the large (al-ʿAqabah), saying "Allāhu akbar" with each pebble.' },
                    { title: 'Duʿāʾ after the first two', detail: 'After stoning the small and middle Jamrahs, move aside, face the qiblah and make a long duʿāʾ. Do not stop for duʿāʾ after the large Jamrah.' },
                    { title: 'Leaving early or staying', detail: 'You may leave Mina on the 12th after stoning, before sunset. Otherwise, stay the night and stone again on the 13th.' },
                ],
                notes: ['Those unable to stone themselves (illness, old age, pregnancy) may appoint someone who is also performing Hajj to stone on their behalf — the deputy stones for themselves first.'],
                sources: [
                    'Quran 2:203 — "remember Allah during [specific] numbered days. Then whoever hastens [his departure] in two days — there is no sin upon him; and whoever delays — there is no sin upon him — for him who fears Allah."',
                    'Sahih al-Bukhari (Ibn ʿUmar): the order of stoning and standing for duʿāʾ after the first two Jamrahs.',
                    'Sahih Muslim (Jābir): the Prophet ﷺ stoned on the Day of Sacrifice in the forenoon, and after that after the sun passed its zenith.',
                ],
            },
            {
                id: 'farewell',
                title: 'Farewell Tawaf (Ṭawāf al-Wadāʿ)',
                steps: [
                    { title: 'The last act in Makkah', detail: 'Before leaving Makkah, perform a final Tawaf of seven circuits (no Saʿi, no raml or idṭibāʿ), and pray two rakʿahs. It should be your last act before departing.' },
                    { title: 'Exemption', detail: 'Women who are menstruating or have post-natal bleeding are excused from it.' },
                ],
                sources: ['Sahih al-Bukhari & Sahih Muslim (Ibn ʿAbbās): "The people were commanded that their last act be at the House, except that it was lightened for the menstruating woman."'],
            },
        ],
    },
};

export const GUIDE_ORDER: GuideSlug[] = ['ramadan', 'umrah', 'hajj'];

export const GUIDE_DISCLAIMER =
    'This guide summarises Islamic practice as held by the majority of scholars, with references to the Quran and authentic hadith. Some details differ between scholars. It is not a substitute for learning from a qualified scholar — please verify rulings that apply to your situation, and follow the instructions of the Saudi authorities and your group leader during Hajj and Umrah.';
