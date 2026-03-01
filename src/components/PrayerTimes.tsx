'use client';

import React, { useState, useEffect } from 'react';
import { fetchPrayerTimes, PrayerData } from '@/lib/prayer-api';
import { useSettings } from '@/context/SettingsContext';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PrayerTimes: React.FC = () => {
  const { prayerCalculationMethod, prayerSilentMode } = useSettings();
  const [data, setData] = useState<PrayerData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>('--:--:--');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [nextPrayerName, setNextPrayerName] = useState<string>('Loading...');

  // Fetch Prayer Data
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const prayerData = await fetchPrayerTimes(latitude, longitude, prayerCalculationMethod);
          if (prayerData) {
            setData(prayerData);
          }
        },
        (error) => {
          console.warn('Geolocation access denied or failed. Prayer times need location.');
          setLocationError('Allow location for accurate prayer times.');
        }
      );
    }
  }, [prayerCalculationMethod]);

  // Live Timer tick
  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      const now = new Date();
      let nextPrayerDate: Date | null = null;
      let prevPrayerDate: Date | null = null;
      let nameObj = '';

      // Find Next Prayer
      for (let i = 0; i < PRAYERS.length; i++) {
        const pName = PRAYERS[i];
        const [hours, minutes] = data.timings[pName as keyof typeof data.timings].split(':').map(Number);

        const pt = new Date();
        pt.setHours(hours, minutes, 0, 0);

        if (pt > now) {
          nextPrayerDate = pt;
          nameObj = pName;

          if (i > 0) {
            const prevName = PRAYERS[i - 1];
            const [pHours, pMinutes] = data.timings[prevName as keyof typeof data.timings].split(':').map(Number);
            prevPrayerDate = new Date();
            prevPrayerDate.setHours(pHours, pMinutes, 0, 0);
          } else {
            // Technically prev is Isha from yesterday, but we'll approximate midnight
            prevPrayerDate = new Date();
            prevPrayerDate.setHours(0, 0, 0, 0);
          }
          break;
        }
      }

      // If all passed, next is Fajr tomorrow
      if (!nextPrayerDate) {
        const [fHours, fMinutes] = data.timings['Fajr'].split(':').map(Number);
        nextPrayerDate = new Date();
        nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
        nextPrayerDate.setHours(fHours, fMinutes, 0, 0);
        nameObj = 'Fajr (Tomorrow)';

        const [iHours, iMinutes] = data.timings['Isha'].split(':').map(Number);
        prevPrayerDate = new Date();
        prevPrayerDate.setHours(iHours, iMinutes, 0, 0);
      }

      setNextPrayerName(nameObj);

      if (nextPrayerDate && prevPrayerDate) {
        const diffMs = nextPrayerDate.getTime() - now.getTime();
        const totalMs = nextPrayerDate.getTime() - prevPrayerDate.getTime();

        const h = Math.floor(diffMs / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffMs % (1000 * 60)) / 1000);

        let pct = 100 - ((diffMs / totalMs) * 100);
        pct = Math.max(0, Math.min(100, pct)); // Clamp 0-100

        setCountdownStr(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        setProgressPercent(pct);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  if (locationError) return <div className="error-msg glass-card">{locationError}</div>;
  if (!data) return <div className="loading-dots glass-card">Aligning compass...</div>;

  const circleRadius = 50;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  return (
    <div className="prayer-times-widget glass-card">
      <div className="widget-header">
        <div className="hijri-date amiri-text">
          {data.date.hijri.day} {data.date.hijri.month.ar} {data.date.hijri.year} AH
        </div>
        {prayerSilentMode && <span className="silent-badge" title="Silent Mode Active">🔕</span>}
      </div>

      <div className="countdown-section">
        <div className="ring-wrapper">
          <svg width="120" height="120" className="countdown-ring">
            <circle
              className="track"
              strokeWidth="6"
              fill="transparent"
              r={circleRadius}
              cx="60"
              cy="60"
            />
            <circle
              className="fill"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              r={circleRadius}
              cx="60"
              cy="60"
              style={{ strokeDasharray: circleCircumference, strokeDashoffset }}
            />
          </svg>
          <div className="ring-content">
            <span className="ring-time gold-text">{countdownStr}</span>
            <span className="ring-title">{nextPrayerName}</span>
          </div>
        </div>
      </div>

      <div className="prayer-grid">
        {PRAYERS.map((name) => {
          let displayName = name;
          if (name === 'Fajr') displayName = 'Suhoor / Fajr';
          if (name === 'Maghrib') displayName = 'Iftar / Maghrib';

          const time = data.timings[name as keyof typeof data.timings];
          // Simple active check
          const isActive = nextPrayerName.includes(name);

          return (
            <div key={name} className={`prayer-item ${isActive ? 'active' : ''}`}>
              <span className="p-name">{displayName}</span>
              <span className="p-time">{time}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .prayer-times-widget {
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: center;
          border-color: var(--emerald-medium);
        }

        .widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .hijri-date {
          font-size: 1.4rem;
          color: var(--gold-primary);
        }

        .silent-badge {
            font-size: 1.2rem;
            opacity: 0.8;
            filter: grayscale(100%);
        }

        .countdown-section {
            display: flex;
            justify-content: center;
            margin-bottom: 2.5rem;
        }

        .ring-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
        }

        .countdown-ring {
            transform: rotate(-90deg);
        }

        .countdown-ring .track {
            stroke: rgba(255, 255, 255, 0.05);
        }

        .countdown-ring .fill {
            stroke: var(--gold-primary);
            transition: stroke-dashoffset 1s linear;
            filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
        }

        .ring-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        .ring-time {
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: 1px;
            font-family: monospace;
        }

        .ring-title {
            font-size: 0.7rem;
            color: var(--emerald-light);
            text-transform: uppercase;
            margin-top: 0.2rem;
        }

        .prayer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .prayer-item {
          display: flex;
          flex-direction: column;
          padding: 0.6rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.3s;
          border: 1px solid transparent;
        }

        .prayer-item.active {
          background: rgba(4, 57, 39, 0.4);
          border-color: var(--gold-primary);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
        }

        .p-name {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--emerald-light);
          margin-bottom: 0.2rem;
        }

        .p-time {
          font-size: 1rem;
          font-weight: 600;
          color: var(--white);
        }

        .error-msg, .loading-dots {
          color: var(--gold-primary);
          padding: 2rem;
          margin: 2rem 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default PrayerTimes;
