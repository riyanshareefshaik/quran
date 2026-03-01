'use client';

import React, { useState, useEffect } from 'react';
import { fetchMonthlyCalendar, PrayerData } from '@/lib/prayer-api';

interface PrayerCalendarProps {
    onClose: () => void;
}

const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ onClose }) => {
    const [calendar, setCalendar] = useState<PrayerData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const now = new Date();
            const data = await fetchMonthlyCalendar(
                pos.coords.latitude,
                pos.coords.longitude,
                now.getMonth() + 1,
                now.getFullYear()
            );
            if (data) setCalendar(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="calendar-modal glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="gold-text">Ramadan / Prayer Calendar</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="calendar-content">
                    {loading ? (
                        <div className="loader-center">Calculating timings...</div>
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
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: left;
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
                `}</style>
            </div>
        </div>
    );
};

export default PrayerCalendar;
