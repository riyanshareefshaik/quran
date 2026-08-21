'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';

interface EssentialItem {
    id: string;
    title: string;
    arabicTitle: string;
    description: string;
    isVerse: boolean;
    verseKey?: string; // If it's a Quranic verse, we can link/play it
    content: Array<{
        arabic: string;
        transliteration?: string;
        translation: string;
    }>;
}

const ESSENTIALS: EssentialItem[] = [
    {
        id: 'ayatul-kursi',
        title: 'Ayatul Kursi',
        arabicTitle: 'آيَةُ الْكُرْسِيِّ',
        description: 'The Verse of the Throne (Surah Al-Baqarah, 2:255). Recite for protection after mandatory prayers and before sleeping.',
        isVerse: true,
        verseKey: '2:255',
        content: [
            {
                arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
                transliteration: 'Allahu laaa ilaaha illaa Huwal Hayyul Qayyuum; laa ta\'khuzuhoo sinatunw wa laa nawm; lahoo maa fis-samaawaati wa maa fil ard; man zallazee yashfa\'u indahooo illaa bi-iznih; ya\'lamu maa baina aideehim wa maa khalfahum; wa laa yuheetoona bishai\'im min \'ilmiheee illaa bimaa shaaa\'; wasi\'a kursiyyuhus samaawaati wal arda wa laa ya\'ooduhoo hifzuhumaa; wa Huwal Aliyyul \'Azeem',
                translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.'
            }
        ]
    },
    {
        id: 'attahiyat',
        title: 'Attahiyat (Tashahhud)',
        arabicTitle: 'التَّحِيَّاتُ',
        description: 'The declaration of faith recited while sitting in prayer.',
        isVerse: false,
        content: [
            {
                arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.',
                transliteration: 'At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaat. As-salaamu \'alayka ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuh. As-salaamu \'alaynaa wa \'alaa \'ibaadillaahis-saaliheen. Ash-hadu an laa ilaaha illallaah, wa ash-hadu anna Muhammadan \'abduhu wa rasooluh.',
                translation: 'All greetings of humility are for Allah, and all prayers and goodness. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous slaves of Allah. I bear witness that there is none worthy of worship but Allah, and I bear witness that Muhammad is His slave and His Messenger.'
            }
        ]
    }
];

export default function EssentialsPage() {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        if (selectedItem === id) {
            setSelectedItem(null);
        } else {
            setSelectedItem(id);
        }
    };

    return (
        <div className="container">
            <main className="main-content">
                <header className="page-header">
                    <Link href="/" className="back-link">← Retreat to Home</Link>
                </header>

                <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', marginBottom: '2rem' }}>
                    <div className="title-area">
                        <h1 className="gold-text font-display">Islamic Essentials</h1>
                        <p className="subtitle">Daily Adhkar & Important Prayers</p>
                    </div>
                </OrnateFrame>

                <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 3rem' }} />

                <div className="essentials-list">
                    {ESSENTIALS.map((item) => (
                        <div
                            key={item.id}
                            className={`glass-card essential-card ${selectedItem === item.id ? 'expanded' : ''}`}
                        >
                            <div
                                className="essential-header"
                                onClick={() => toggleItem(item.id)}
                            >
                                <div className="essential-title-group">
                                    <h2 className="essential-title font-display">{item.title}</h2>
                                    <h3 className="essential-arabic amiri-text">{item.arabicTitle}</h3>
                                </div>
                                <div className="essential-actions">
                                    {item.isVerse && item.verseKey && (
                                        <Link
                                            href={`/surah/${item.verseKey.split(':')[0]}`}
                                            className="context-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View in Quran →
                                        </Link>
                                    )}
                                    <span className="expand-icon">{selectedItem === item.id ? '−' : '+'}</span>
                                </div>
                            </div>

                            {selectedItem === item.id && (
                                <div className="essential-body">
                                    <div className="essential-description">
                                        <p>{item.description}</p>
                                    </div>

                                    <div className="essential-segments">
                                        {item.content.map((segment, index) => (
                                            <div key={index} className="essential-segment">
                                                <p className="arabic-segment amiri-text">{segment.arabic}</p>

                                                {segment.transliteration && (
                                                    <div className="transliteration-box">
                                                        <span className="label">Pronunciation:</span>
                                                        <p className="transliteration-text">{segment.transliteration}</p>
                                                    </div>
                                                )}

                                                <div className="translation-box">
                                                    <span className="label">Meaning:</span>
                                                    <p className="translation-text">{segment.translation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .main-content {
                    max-width: 900px;
                    width: 100%;
                }

                .page-header {
                    margin-bottom: 2rem;
                    text-align: left;
                }

                .back-link {
                    color: var(--emerald-light);
                    font-size: 0.9rem;
                    transition: color 0.3s;
                }

                .back-link:hover {
                    color: var(--gold-primary);
                }

                .title-area {
                    text-align: center;
                }

                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.3rem;
                }

                .subtitle {
                    font-size: 1rem;
                    color: var(--emerald-light);
                    font-weight: 300;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .essentials-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .essential-card {
                    padding: 0;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .essential-card.expanded {
                    border-color: var(--gold-primary);
                    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
                }

                .essential-header {
                    padding: 1.5rem 2rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: transparent;
                }

                .essential-card:not(.expanded) .essential-header:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .essential-title-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .essential-title {
                    font-size: 1.4rem;
                    margin: 0;
                    color: var(--white);
                    font-weight: 600;
                }

                .essential-arabic {
                    font-size: 1.8rem;
                    margin: 0;
                    color: var(--gold-primary);
                }

                .essential-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .context-link {
                    font-size: 0.85rem;
                    color: var(--emerald-light);
                    padding: 0.4rem 0.8rem;
                    border: 1px solid var(--emerald-medium);
                    border-radius: 20px;
                    transition: all 0.3s;
                }

                .context-link:hover {
                    background: var(--gold-primary);
                    color: var(--matte-black);
                    border-color: var(--gold-primary);
                }

                .expand-icon {
                    font-size: 1.5rem;
                    color: var(--gold-primary);
                    font-weight: 300;
                    width: 24px;
                    text-align: center;
                }

                .essential-body {
                    padding: 0 2rem 2rem 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    animation: slideDown 0.4s ease-out;
                }

                .essential-description {
                    padding: 1.5rem 0;
                    color: var(--emerald-light);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .essential-segments {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    margin-top: 2rem;
                }

                .essential-segment {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .arabic-segment {
                    font-size: 2.2rem;
                    line-height: 2;
                    text-align: right;
                    color: var(--white);
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }

                .transliteration-box, .translation-box {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 1.2rem;
                    border-radius: 8px;
                    border-left: 2px solid var(--emerald-medium);
                }

                .translation-box {
                    border-left-color: var(--gold-primary);
                    background: rgba(212, 175, 55, 0.03);
                }

                .label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                    opacity: 0.6;
                }

                .transliteration-text {
                    font-size: 0.95rem;
                    font-style: italic;
                    color: #A0AEC0;
                    line-height: 1.5;
                }

                .translation-text {
                    font-size: 1.05rem;
                    color: var(--gray-light);
                    line-height: 1.6;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .essential-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .essential-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .essential-title-group {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    .essential-arabic {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
