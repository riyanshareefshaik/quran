'use client';

import React, { useState, useEffect } from 'react';
import { fetchMonthlyCalendar, PrayerData } from '@/lib/prayer-api';
import { getCurrentPosition } from '@/lib/geolocation';

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="calendar-modal glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="gold-text">Monthly Prayer Schedule</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
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
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Hijri</th>
                                        <th>Suhoor</th>
                                        <th>Iftar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calendar.map((day, i) => (
                                        <tr key={i} className={new Date().getDate() === i + 1 ? 'today' : ''}>
                                            <td>{day.date.readable}</td>
                                            <td className="ar-font">{day.date.hijri.day} {day.date.hijri.month.ar}</td>
                                            <td className="gold-text">{day.timings.Fajr}</td>
                                            <td className="gold-text">{day.timings.Maghrib}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
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

                    .table-wrapper {
                        width: 100%;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    table {
                        width: 100%;
                        min-width: 420px;
                        border-collapse: collapse;
                        text-align: left;
                    }

                    @media (max-width: 480px) {
                        .calendar-overlay {
                            padding: 0.75rem;
                        }
                        .calendar-modal {
                            padding: 1.25rem;
                            max-height: 88vh;
                        }
                        .modal-header {
                            margin-bottom: 1.25rem;
                        }
                        th, td {
                            padding: 0.65rem;
                            font-size: 0.8rem;
                        }
                    }

                    th {
                        padding: 1rem;
                        color: var(--emerald-light);
                        border-bottom: 1px solid var(--glass-border);
                        font-size: 0.8rem;
                        text-transform: uppercase;
                    }

                    td {
                        padding: 1rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        font-size: 0.95rem;
                        color: var(--off-white);
                    }

                    .ar-font {
                        font-family: 'Amiri', serif;
                        direction: rtl;
                    }

                    .today {
                        background: rgba(212, 175, 55, 0.1);
                        border-left: 2px solid var(--gold-primary);
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
            </div>
        </div>
    );
};

export default PrayerCalendar;
