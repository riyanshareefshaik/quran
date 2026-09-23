// Daily adhkar, salawat and duas shown on the Essentials page.
//
// Accuracy notes for anyone editing this file:
// - Quranic text is copied verbatim (Uthmani script) from the Quran.com API
//   with the Saheeh International translation; do not retype it by hand.
// - Every non-Quranic entry names the hadith collection and narrator it comes
//   from. Only add duas with a known, reliable source.
// - Never label content by sect or school; this app speaks to all Muslims.

export type EssentialCategory = 'salawat' | 'prayer' | 'quran' | 'daily' | 'remembrance' | 'quranic-duas';

export const ESSENTIAL_CATEGORIES: { id: EssentialCategory; label: string }[] = [
    { id: 'salawat', label: 'Durood & Salawat' },
    { id: 'prayer', label: 'In Prayer' },
    { id: 'quran', label: 'Protection from the Quran' },
    { id: 'remembrance', label: 'Dhikr & Istighfar' },
    { id: 'daily', label: 'Daily Duas' },
    { id: 'quranic-duas', label: 'Duas from the Quran' },
];

export interface EssentialSegment {
    arabic: string;
    transliteration?: string;
    translation: string;
    note?: string; // e.g. "Recite 3 times"
}

export interface EssentialItem {
    id: string;
    category: EssentialCategory;
    title: string;
    arabicTitle: string;
    description: string;
    source: string;
    verseKey?: string; // Quranic items link to the surah
    content: EssentialSegment[];
}

export const ESSENTIALS: EssentialItem[] = [
    // ── Durood & Salawat ──────────────────────────────────────────────
    {
        id: 'durood-ibrahim',
        category: 'salawat',
        title: 'Durood Ibrahim (Durood Shareef)',
        arabicTitle: 'الصَّلَاةُ الْإِبْرَاهِيمِيَّة',
        description: 'The blessing upon the Prophet ﷺ that he himself taught his Companions when they asked how to send salah upon him. It is recited in the final sitting of every prayer, and at any time.',
        source: 'Sahih al-Bukhari & Sahih Muslim (Kaʿb ibn ʿUjrah)',
        content: [
            {
                arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
                transliteration: 'Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd.',
                translation: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim; You are indeed Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are indeed Praiseworthy, Glorious.',
            },
        ],
    },
    {
        id: 'salawat-verse',
        category: 'salawat',
        title: 'The Command to Send Salawat',
        arabicTitle: 'إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ',
        description: 'Allah Himself commands the believers to send blessings and peace upon the Prophet ﷺ. He ﷺ said: "Whoever sends one blessing upon me, Allah sends ten upon him" (Sahih Muslim, Abū Hurayrah).',
        source: 'Quran 33:56',
        verseKey: '33:56',
        content: [
            {
                arabic: 'إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ صَلُّوا۟ عَلَيْهِ وَسَلِّمُوا۟ تَسْلِيمًا',
                transliteration: 'Inna Allāha wa malāʾikatahū yuṣallūna ʿala an-Nabiyy. Yā ayyuha alladhīna āmanū ṣallū ʿalayhi wa sallimū taslīmā.',
                translation: 'Indeed, Allah confers blessing upon the Prophet, and His angels [ask Him to do so]. O you who have believed, ask [Allah to confer] blessing upon him and ask [Allah to grant him] peace.',
            },
        ],
    },
    {
        id: 'short-salawat',
        category: 'salawat',
        title: 'Short Salawat',
        arabicTitle: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
        description: 'Said whenever the name of the Prophet ﷺ is mentioned or heard. He ﷺ said: "The miser is the one in whose presence I am mentioned and he does not send salah upon me."',
        source: 'Jāmiʿ at-Tirmidhi (ʿAlī ibn Abī Ṭālib) — graded ḥasan ṣaḥīḥ',
        content: [
            {
                arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
                transliteration: 'Ṣalla Allāhu ʿalayhi wa sallam.',
                translation: 'May Allah send blessings and peace upon him.',
            },
        ],
    },

    // ── In Prayer ────────────────────────────────────────────────────
    {
        id: 'sana',
        category: 'prayer',
        title: 'Sana (Opening Supplication)',
        arabicTitle: 'دُعَاءُ الِاسْتِفْتَاح',
        description: 'Recited quietly after the opening takbīr, before Surah al-Fatihah.',
        source: 'Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (ʿĀʾishah)',
        content: [
            {
                arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
                transliteration: 'Subḥānaka Allāhumma wa biḥamdika, wa tabāraka ismuka, wa taʿālā jadduka, wa lā ilāha ghayruk.',
                translation: 'Glory be to You, O Allah, and all praise. Blessed is Your Name, exalted is Your Majesty, and there is no god besides You.',
            },
        ],
    },
    {
        id: 'attahiyat',
        category: 'prayer',
        title: 'Attahiyat (Tashahhud)',
        arabicTitle: 'التَّحِيَّاتُ',
        description: 'The declaration of faith recited while sitting in prayer.',
        source: 'Sahih al-Bukhari & Sahih Muslim (ʿAbdullāh ibn Masʿūd)',
        content: [
            {
                arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.',
                transliteration: 'At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt. As-salāmu ʿalayka ayyuhan-Nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu ʿalaynā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn. Ashhadu an lā ilāha illallāh, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.',
                translation: 'All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.',
            },
        ],
    },
    {
        id: 'qunoot',
        category: 'prayer',
        title: 'Dua Qunoot (in Witr)',
        arabicTitle: 'دُعَاءُ الْقُنُوت',
        description: 'Recited in the Witr prayer. The Prophet ﷺ taught the first wording to his grandson al-Ḥasan ibn ʿAlī. The second wording is reported from ʿUmar ibn al-Khaṭṭāb and is widely recited; either may be used.',
        source: 'First: Sunan Abi Dawud, Jāmiʿ at-Tirmidhi & an-Nasāʾi (al-Ḥasan ibn ʿAlī). Second: Sunan al-Bayhaqi (ʿUmar ibn al-Khaṭṭāb)',
        content: [
            {
                arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
                transliteration: 'Allāhumma ihdinī fīman hadayt, wa ʿāfinī fīman ʿāfayt, wa tawallanī fīman tawallayt, wa bārik lī fīmā aʿṭayt, wa qinī sharra mā qaḍayt, fa innaka taqḍī wa lā yuqḍā ʿalayk, wa innahū lā yadhillu man wālayt, tabārakta Rabbanā wa taʿālayt.',
                translation: 'O Allah, guide me among those You have guided, grant me well-being among those You have granted well-being, take me into Your care among those You have taken into Your care, bless me in what You have given, and protect me from the evil of what You have decreed. For You decree and none can decree over You. Indeed, the one You befriend is never humiliated. Blessed are You, our Lord, and Exalted.',
            },
            {
                arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ، وَنَشْكُرُكَ وَلَا نَكْفُرُكَ، وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ، وَلَكَ نُصَلِّي وَنَسْجُدُ، وَإِلَيْكَ نَسْعَى وَنَحْفِدُ، وَنَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ، إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
                transliteration: 'Allāhumma innā nastaʿīnuka wa nastaghfiruka wa nuʾminu bika wa natawakkalu ʿalayka wa nuthnī ʿalaykal-khayr, wa nashkuruka wa lā nakfuruk, wa nakhlaʿu wa natruku man yafjuruk. Allāhumma iyyāka naʿbudu wa laka nuṣallī wa nasjud, wa ilayka nasʿā wa naḥfid, wa narjū raḥmataka wa nakhshā ʿadhābak, inna ʿadhābaka bil-kuffāri mulḥiq.',
                translation: 'O Allah, we seek Your help and Your forgiveness, we believe in You and rely on You, and we praise You with all good. We thank You and are not ungrateful to You, and we abandon and forsake whoever disobeys You. O Allah, You alone we worship, to You we pray and prostrate, towards You we strive and hasten. We hope for Your mercy and fear Your punishment; surely Your punishment will reach the disbelievers.',
            },
        ],
    },
    {
        id: 'after-prayer-tasbih',
        category: 'prayer',
        title: 'Tasbih after Prayer',
        arabicTitle: 'التَّسْبِيحُ بَعْدَ الصَّلَاة',
        description: 'After each obligatory prayer. The Prophet ﷺ said whoever says these, his sins are forgiven even if they are like the foam of the sea.',
        source: 'Sahih Muslim (Abū Hurayrah)',
        content: [
            { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subḥān Allāh', translation: 'Glory be to Allah.', note: '33 times' },
            { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Al-ḥamdu lillāh', translation: 'All praise is for Allah.', note: '33 times' },
            { arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allāhu akbar', translation: 'Allah is the Greatest.', note: '33 times' },
            {
                arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                transliteration: 'Lā ilāha illā Allāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shayʾin qadīr.',
                translation: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things.',
                note: 'Once, to complete one hundred',
            },
        ],
    },
    {
        id: 'after-adhan',
        category: 'prayer',
        title: 'Dua after the Adhan',
        arabicTitle: 'دُعَاءُ بَعْدَ الْأَذَان',
        description: 'The Prophet ﷺ said whoever says this after hearing the call to prayer, his intercession will be granted on the Day of Resurrection.',
        source: 'Sahih al-Bukhari (Jābir ibn ʿAbdillāh)',
        content: [
            {
                arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
                transliteration: 'Allāhumma Rabba hādhihid-daʿwatit-tāmmah, waṣ-ṣalātil-qāʾimah, āti Muḥammadanil-wasīlata wal-faḍīlah, wabʿathhu maqāman maḥmūdanil-ladhī waʿadtah.',
                translation: 'O Allah, Lord of this perfect call and the prayer about to be established, grant Muhammad al-Wasīlah and excellence, and raise him to the praised station You have promised him.',
            },
        ],
    },

    // ── Protection from the Quran ─────────────────────────────────────
    {
        id: 'ayatul-kursi',
        category: 'quran',
        title: 'Ayatul Kursi',
        arabicTitle: 'آيَةُ الْكُرْسِيِّ',
        description: 'The Verse of the Throne. Recite for protection after obligatory prayers and before sleeping.',
        source: 'Quran 2:255 · before sleep: Sahih al-Bukhari (Abū Hurayrah); after prayer: Sunan an-Nasāʾi al-Kubrā (Abū Umāmah)',
        verseKey: '2:255',
        content: [
            {
                arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
                transliteration: 'Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm; lā taʾkhudhuhū sinatun wa lā nawm; lahū mā fis-samāwāti wa mā fil-arḍ; man dhal-ladhī yashfaʿu ʿindahū illā bi-idhnih; yaʿlamu mā bayna aydīhim wa mā khalfahum; wa lā yuḥīṭūna bi-shayʾin min ʿilmihī illā bimā shāʾ; wasiʿa kursiyyuhus-samāwāti wal-arḍ; wa lā yaʾūduhū ḥifẓuhumā; wa Huwal-ʿAliyyul-ʿAẓīm.',
                translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
            },
        ],
    },
    {
        id: 'last-two-baqarah',
        category: 'quran',
        title: 'Last Two Verses of Al-Baqarah',
        arabicTitle: 'خَوَاتِيمُ سُورَةِ الْبَقَرَة',
        description: 'The Prophet ﷺ said: "Whoever recites the last two verses of Surah al-Baqarah at night, they will suffice him."',
        source: 'Quran 2:285–286 · virtue in Sahih al-Bukhari & Sahih Muslim (Abū Masʿūd al-Anṣārī)',
        verseKey: '2:285',
        content: [
            {
                arabic: 'ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ',
                translation: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers. All of them have believed in Allah and His angels and His books and His messengers, [saying], "We make no distinction between any of His messengers." And they say, "We hear and we obey. [We seek] Your forgiveness, our Lord, and to You is the [final] destination."',
                note: '2:285',
            },
            {
                arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ',
                translation: 'Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. "Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people."',
                note: '2:286',
            },
        ],
    },
    {
        id: 'three-quls',
        category: 'quran',
        title: 'The Three Quls',
        arabicTitle: 'الْمُعَوِّذَات',
        description: 'Al-Ikhlāṣ, al-Falaq and an-Nās. The Prophet ﷺ said reciting them three times in the morning and evening "will suffice you against everything," and he recited them before sleeping, blowing into his palms and wiping over his body.',
        source: 'Quran 112–114 · Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (ʿAbdullāh ibn Khubayb); Sahih al-Bukhari (ʿĀʾishah)',
        verseKey: '112:1',
        content: [
            {
                arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
                transliteration: 'Qul huwa Allāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.',
                translation: 'Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent."',
                note: 'Surah al-Ikhlāṣ (112) — 3 times',
            },
            {
                arabic: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
                transliteration: 'Qul aʿūdhu bi-Rabbil-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharrin-naffāthāti fil-ʿuqad. Wa min sharri ḥāsidin idhā ḥasad.',
                translation: 'Say, "I seek refuge in the Lord of daybreak from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies."',
                note: 'Surah al-Falaq (113) — 3 times',
            },
            {
                arabic: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَـٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
                transliteration: 'Qul aʿūdhu bi-Rabbin-nās. Malikin-nās. Ilāhin-nās. Min sharril-waswāsil-khannās. Alladhī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.',
                translation: 'Say, "I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer — who whispers [evil] into the breasts of mankind — from among the jinn and mankind."',
                note: 'Surah an-Nās (114) — 3 times',
            },
        ],
    },

    // ── Dhikr & Istighfar ─────────────────────────────────────────────
    {
        id: 'shahadah',
        category: 'remembrance',
        title: 'Kalimah & Shahadah',
        arabicTitle: 'كَلِمَةُ التَّوْحِيد',
        description: 'The declaration of faith. The Prophet ﷺ said: "The best remembrance is lā ilāha illā Allāh."',
        source: 'Quran 47:19 & 48:29 · Jāmiʿ at-Tirmidhi (Jābir ibn ʿAbdillāh); Shahadah wording in Sahih Muslim',
        content: [
            {
                arabic: 'لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
                transliteration: 'Lā ilāha illā Allāh, Muḥammadur-Rasūlullāh.',
                translation: 'There is no god but Allah; Muhammad is the Messenger of Allah.',
                note: 'Kalimah Ṭayyibah',
            },
            {
                arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                transliteration: 'Ashhadu an lā ilāha illā Allāh, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.',
                translation: 'I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.',
                note: 'Shahādah',
            },
        ],
    },
    {
        id: 'sayyid-istighfar',
        category: 'remembrance',
        title: 'Sayyid al-Istighfar',
        arabicTitle: 'سَيِّدُ الِاسْتِغْفَار',
        description: 'The best way of seeking forgiveness. The Prophet ﷺ said whoever says it during the day with firm faith and dies before evening, or at night and dies before morning, will be among the people of Paradise.',
        source: 'Sahih al-Bukhari (Shaddād ibn Aws)',
        content: [
            {
                arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
                transliteration: 'Allāhumma anta Rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayya, wa abūʾu laka bi-dhanbī faghfir lī, fa innahū lā yaghfirudh-dhunūba illā ant.',
                translation: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
            },
        ],
    },
    {
        id: 'two-light-words',
        category: 'remembrance',
        title: 'Two Words Beloved to Allah',
        arabicTitle: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        description: 'The Prophet ﷺ said: "Two words are light on the tongue, heavy on the Scale, and beloved to the Most Merciful." He also said whoever says "Subḥān Allāhi wa biḥamdih" a hundred times a day, his sins are wiped away even if they are like the foam of the sea.',
        source: 'Sahih al-Bukhari & Sahih Muslim (Abū Hurayrah)',
        content: [
            {
                arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
                transliteration: 'Subḥān Allāhi wa biḥamdih, Subḥān Allāhil-ʿAẓīm.',
                translation: 'Glory be to Allah and all praise is His; glory be to Allah, the Magnificent.',
            },
        ],
    },
    {
        id: 'la-hawla',
        category: 'remembrance',
        title: 'La Hawla wa la Quwwata',
        arabicTitle: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        description: 'The Prophet ﷺ called it "a treasure from the treasures of Paradise."',
        source: 'Sahih al-Bukhari & Sahih Muslim (Abū Mūsā al-Ashʿarī)',
        content: [
            {
                arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
                transliteration: 'Lā ḥawla wa lā quwwata illā billāh.',
                translation: 'There is no might nor power except with Allah.',
            },
        ],
    },
    {
        id: 'dua-yunus',
        category: 'remembrance',
        title: 'Dua of Prophet Yunus',
        arabicTitle: 'دَعْوَةُ ذِي النُّون',
        description: 'The supplication of Yunus (Jonah) in the belly of the whale. The Prophet ﷺ said no Muslim calls upon Allah with it for anything except that Allah answers him.',
        source: 'Quran 21:87 · Jāmiʿ at-Tirmidhi (Saʿd ibn Abī Waqqāṣ)',
        verseKey: '21:87',
        content: [
            {
                arabic: 'لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ',
                transliteration: 'Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn.',
                translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
            },
        ],
    },

    // ── Daily Duas ───────────────────────────────────────────────────
    {
        id: 'morning-evening',
        category: 'daily',
        title: 'Morning & Evening Protection',
        arabicTitle: 'أَذْكَارُ الصَّبَاحِ وَالْمَسَاء',
        description: 'The Prophet ﷺ said whoever says this three times in the morning and three times in the evening, nothing will harm him.',
        source: 'Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (ʿUthmān ibn ʿAffān)',
        content: [
            {
                arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
                transliteration: 'Bismillāhil-ladhī lā yaḍurru maʿasmihī shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-Samīʿul-ʿAlīm.',
                translation: 'In the Name of Allah, with whose Name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
                note: '3 times morning and evening',
            },
        ],
    },
    {
        id: 'sleep-wake',
        category: 'daily',
        title: 'Before Sleeping & Upon Waking',
        arabicTitle: 'أَذْكَارُ النَّوْم',
        description: 'What the Prophet ﷺ said when lying down to sleep and when he woke up.',
        source: 'Sahih al-Bukhari (Ḥudhayfah ibn al-Yamān)',
        content: [
            {
                arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
                transliteration: 'Bismika Allāhumma amūtu wa aḥyā.',
                translation: 'In Your Name, O Allah, I die and I live.',
                note: 'Before sleeping',
            },
            {
                arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
                transliteration: 'Al-ḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr.',
                translation: 'All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.',
                note: 'Upon waking',
            },
        ],
    },
    {
        id: 'eating',
        category: 'daily',
        title: 'Before & After Eating',
        arabicTitle: 'آدَابُ الطَّعَام',
        description: 'Say Bismillah before eating. If you forget at the start, say the second wording when you remember. Praise Allah when you finish.',
        source: 'Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (ʿĀʾishah; Muʿādh ibn Anas)',
        content: [
            { arabic: 'بِسْمِ اللَّهِ', transliteration: 'Bismillāh.', translation: 'In the Name of Allah.', note: 'Before eating' },
            { arabic: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ', transliteration: 'Bismillāhi awwalahū wa ākhirah.', translation: 'In the Name of Allah, at its beginning and at its end.', note: 'If you forgot at the start' },
            {
                arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
                transliteration: 'Al-ḥamdu lillāhil-ladhī aṭʿamanī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah.',
                translation: 'All praise is for Allah who fed me this and provided it for me without any might or power on my part.',
                note: 'After eating',
            },
        ],
    },
    {
        id: 'leaving-home',
        category: 'daily',
        title: 'Leaving the Home',
        arabicTitle: 'دُعَاءُ الْخُرُوجِ مِنَ الْمَنْزِل',
        description: 'The Prophet ﷺ said that whoever says this when leaving home is told: "You are guided, sufficed and protected."',
        source: 'Sunan Abi Dawud & Jāmiʿ at-Tirmidhi (Anas ibn Mālik)',
        content: [
            {
                arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
                transliteration: 'Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh.',
                translation: 'In the Name of Allah; I place my trust in Allah, and there is no might nor power except with Allah.',
            },
        ],
    },
    {
        id: 'mosque',
        category: 'daily',
        title: 'Entering & Leaving the Mosque',
        arabicTitle: 'دُعَاءُ الْمَسْجِد',
        description: 'Enter with the right foot and leave with the left.',
        source: 'Sahih Muslim (Abū Ḥumayd or Abū Usayd)',
        content: [
            { arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration: 'Allāhumma iftaḥ lī abwāba raḥmatik.', translation: 'O Allah, open for me the doors of Your mercy.', note: 'Entering' },
            { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', transliteration: 'Allāhumma innī asʾaluka min faḍlik.', translation: 'O Allah, I ask You of Your bounty.', note: 'Leaving' },
        ],
    },
    {
        id: 'travel',
        category: 'daily',
        title: 'Travelling',
        arabicTitle: 'دُعَاءُ السَّفَر',
        description: 'When mounting a vehicle for a journey, say "Allāhu akbar" three times, then this.',
        source: 'Quran 43:13–14 · Sahih Muslim (ʿAbdullāh ibn ʿUmar)',
        content: [
            {
                arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
                transliteration: 'Subḥānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā Rabbinā lamunqalibūn.',
                translation: 'Glory be to the One who has subjected this to us, and we could never have done it ourselves. And indeed, to our Lord we will surely return.',
            },
        ],
    },

    // ── Duas from the Quran ───────────────────────────────────────────
    {
        id: 'rabbana-atina',
        category: 'quranic-duas',
        title: 'Good in This World and the Next',
        arabicTitle: 'رَبَّنَآ ءَاتِنَا',
        description: 'The supplication the Prophet ﷺ made most often (Sahih al-Bukhari & Sahih Muslim, Anas).',
        source: 'Quran 2:201',
        verseKey: '2:201',
        content: [
            {
                arabic: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
                transliteration: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār.',
                translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
            },
        ],
    },
    {
        id: 'steadfast-hearts',
        category: 'quranic-duas',
        title: 'For Steadfast Hearts',
        arabicTitle: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا',
        description: 'A supplication of those firmly grounded in knowledge.',
        source: 'Quran 3:8',
        verseKey: '3:8',
        content: [
            {
                arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ',
                transliteration: 'Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā min ladunka raḥmah, innaka antal-Wahhāb.',
                translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
            },
        ],
    },
    {
        id: 'adam-repentance',
        category: 'quranic-duas',
        title: 'Repentance of Adam and Hawwa',
        arabicTitle: 'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا',
        description: 'The words of repentance of Adam and his wife.',
        source: 'Quran 7:23',
        verseKey: '7:23',
        content: [
            {
                arabic: 'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ',
                transliteration: 'Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn.',
                translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
            },
        ],
    },
    {
        id: 'parents',
        category: 'quranic-duas',
        title: 'For Parents',
        arabicTitle: 'رَّبِّ ٱرْحَمْهُمَا',
        description: 'Allah commands kindness and humility towards parents, and to pray for them.',
        source: 'Quran 17:24',
        verseKey: '17:24',
        content: [
            {
                arabic: 'رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا',
                transliteration: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā.',
                translation: 'My Lord, have mercy upon them as they brought me up [when I was] small.',
            },
        ],
    },
    {
        id: 'family',
        category: 'quranic-duas',
        title: 'For Spouse and Children',
        arabicTitle: 'رَبَّنَا هَبْ لَنَا',
        description: 'A supplication of "the servants of the Most Merciful".',
        source: 'Quran 25:74',
        verseKey: '25:74',
        content: [
            {
                arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
                transliteration: 'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin wajʿalnā lil-muttaqīna imāmā.',
                translation: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us a leader [i.e., example] for the righteous.',
            },
        ],
    },
    {
        id: 'knowledge',
        category: 'quranic-duas',
        title: 'For Knowledge',
        arabicTitle: 'رَّبِّ زِدْنِى عِلْمًا',
        description: 'Allah commanded His Prophet ﷺ to ask Him for an increase in knowledge.',
        source: 'Quran 20:114',
        verseKey: '20:114',
        content: [
            {
                arabic: 'رَّبِّ زِدْنِى عِلْمًا',
                transliteration: 'Rabbi zidnī ʿilmā.',
                translation: 'My Lord, increase me in knowledge.',
            },
        ],
    },
];
