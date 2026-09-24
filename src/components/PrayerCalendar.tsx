'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchMonthlyCalendar, PrayerData } from '@/lib/prayer-api';
import { getCurrentPosition } from '@/lib/geolocation';

/** "04:53 (IST)" → "04:53" */
const clockTime = (value: string) => value.replace(/\s*\(.*\)\s*$/, '');

interface PrayerCalendarProps {
    onClose: () => void;
}

const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ onClose }) => {
    const [calendar, setCalendar] = useState<PrayerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(null);

        getCurrentPosition()
            .then(async ({ latitude, longitude }) => {
                const now = new Date();
                const data = await fetchMonthlyCalendar(
                    latitude,
                    longitude,
                    now.getMonth() + 1,
                    now.getFullYear()
                );
                if (data) {
                    setCalendar(data);
                } else {
                    setError('Could not load the prayer schedule. Please try again.');
                }
                setLoading(false);
            })
            .catch((err) => {
                const isPermissionDenied =
                    typeof err?.message === 'string' && /denied/i.test(err.message);
                setError(
                    isPermissionDenied
                        ? 'Location access was denied. Allow location access in your browser/device settings to view the prayer calendar.'
                        : 'Could not determine your location in time. This can happen on a slow connection — please try again.'
                );
                setLoading(false);
            });
    }, [retryKey]);

    // Open with today's row in view.
    useEffect(() => {
        if (calendar.length) document.querySelector('.modal-overlay .today')?.scrollIntoView({ block: 'center' });
    }, [calendar]);

    // Portalled to <body>: dashboard cards use transforms/backdrop-filter,
    // which would otherwise trap this position:fixed overlay inside them.
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="calendar-modal glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="gold-text">Monthly Prayer Schedule</h3>
                    <button className="close-btn" onClick={onClose} aria-label="Close schedule">&times;</button>
                </div>

                <div className="calendar-content">
                    {loading ? (
                        <div className="loader-center">Calculating timings...</div>
                    ) : error ? (
                        <div className="loader-center">
                            <p>{error}</p>
                            <button className="retry-btn" onClick={() => setRetryKey((k) => k + 1)}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="schedule">
                            <div className="schedule-head" aria-hidden="true">
                                <span>Date</span>
                                <span>Suhoor ends · Fajr</span>
                                <span>Iftar · Maghrib</span>
                            </div>
                            <ul>
                                {calendar.map((day, i) => {
                                    const g = day.date.gregorian;
                                    const isToday = new Date().getDate() === i + 1;
                                    return (
                                        <li key={i} className={isToday ? 'today' : ''} aria-current={isToday ? 'date' : undefined}>
                                            <span className="date">
                                                <span className="greg">{g?.weekday?.en?.slice(0, 3)} {g?.day} {g?.month?.en?.slice(0, 3)}</span>
                                                <span className="hijri">{day.date.hijri.day} {day.date.hijri.month.en} {day.date.hijri.year}</span>
                                            </span>
                                            <span className="time">{clockTime(day.timings.Fajr)}</span>
                                            <span className="time">{clockTime(day.timings.Maghrib)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>


            </div>
                <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1300;
                    padding: 2rem;
                }

                .calendar-modal {
                    width: 100%;
                    max-width: 700px;
                    max-height: 80vh;
                    padding: 2rem;
                    background: var(--matte-black);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--gold-primary);
                    font-size: 2rem;
                    cursor: pointer;
                }

                .calendar-content {
                    overflow-y: auto;
                    flex: 1;
                }

                .schedule-head, .schedule li {
                    display: grid;
                    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
                    gap: 0.5rem;
                    align-items: center;
                }

                .schedule-head {
                    padding: 0 0.6rem 0.6rem;
                    border-bottom: 1px solid var(--glass-border);
                    font-size: 0.68rem;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: var(--emerald-light);
                }

                .schedule ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .schedule li {
                    padding: 0.7rem 0.6rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .date {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .greg {
                    color: var(--off-white);
                    font-size: 0.92rem;
                    font-weight: 600;
                }

                .hijri {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.72rem;
                    overflow-wrap: anywhere;
                }

                .time {
                    color: var(--gold-primary);
                    font-size: 1rem;
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                }

                .today {
                    background: rgba(212, 175, 55, 0.1);
                    border-left: 2px solid var(--gold-primary);
                    border-radius: 6px;
                }

                @media (max-width: 480px) {
                    .modal-overlay {
                        padding: 0.75rem;
                    }
                    .calendar-modal {
                        padding: 1.1rem;
                        max-height: 88vh;
                    }
                    .modal-header {
                        margin-bottom: 1rem;
                    }
                    .modal-header h3 {
                        font-size: 1.05rem;
                    }
                }

                .loader-center {
                    padding: 4rem;
                    text-align: center;
                    color: var(--gold-primary);
                }

                .retry-btn {
                    margin-top: 1.5rem;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid var(--gold-primary);
                    color: var(--gold-primary);
                    padding: 0.7rem 1.75rem;
                    min-height: 44px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .retry-btn:hover {
                    background: var(--gold-primary);
                    color: var(--matte-black);
                }
            `}</style>
        </div>,
        document.body
    );
};

export default PrayerCalendar;
