'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaDirection from '@/components/QiblaDirection';
import SpiritualTracker from '@/components/SpiritualTracker';
import { getReligiousCounters } from '@/lib/date-utils';
import PrayerCalendar from '@/components/PrayerCalendar';
import SearchModal from '@/components/SearchModal';

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const counters = getReligiousCounters();

  return (
    <div className="container">
      <main className="main-content">
        {/* Header Section */}
        <section className="header-section">
          <div className="logo-mini">
            <Image
              src="/logo.png"
              alt="Nur Al-Quran Logo"
              width={80}
              height={80}
              priority
              className="glow-effect"
            />
          </div>
          <h1 className="gold-text">Nur Al-Quran</h1>
          <p className="subtitle">Light of the Quran</p>

          <div className="search-container">
            <button
              className="global-search-trigger glass-card"
              onClick={() => setShowSearchModal(true)}
            >
              <span className="search-icon">🔍</span> Search Quran (Verses, Surahs, Translations)
            </button>
          </div>
        </section>

        {/* Spiritual Dashboard Section */}
        <section className="dashboard-section">
          <div className="dashboard-grid">
            <PrayerTimes />
            <div className="dashboard-secondary">
              <SpiritualTracker />
              <div className="dash-row">
                <QiblaDirection />
                <div className="religious-events-grid">
                  <div className="ramadan-card glass-card">
                    <h4 className="label gold-text">{counters.isRamadan ? 'Ramadan' : 'Ramadan Starts'}</h4>
                    <div className="countdown-val">
                      {counters.isRamadan ? 'LIVE' : counters.daysToRamadan}
                    </div>
                    <p className="days-label">{counters.isRamadan ? 'Mubarak' : 'Days'}</p>
                    <button className="view-cal-btn" onClick={() => setShowCalendar(true)}>Full Schedule</button>
                  </div>
                  <div className="ramadan-card glass-card">
                    <h4 className="label gold-text">Eid al-Fitr</h4>
                    <div className="countdown-val">{counters.daysToEidFitr}</div>
                    <p className="days-label">Expected</p>
                    <button className="view-cal-btn" onClick={() => setShowCalendar(true)}>View Dates</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {showCalendar && <PrayerCalendar onClose={() => setShowCalendar(false)} />}
        <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

        {/* Content Section */}
        <section className="cta-section">
          <div className="hero-card glass-card">
            <div className="hero-content">
              <h2 className="gold-text">The Complete Revelation</h2>
              <p className="hero-desc">Explore all 114 Surahs, beautifully formatted with word-by-word translations, interactive memorization modes, and immersive audio recitation.</p>
              <Link href="/surahs" className="read-now-btn">
                Enter the Quran →
              </Link>
            </div>
            <div className="hero-decorator amiri-text">
              القرآن
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="authenticity-badge">
            <span className="badge-icon">✓</span>
            Text verified from official Quran API
          </div>
          <p>© 2026 Nur Al-Quran. Elegant. Authentic. Free.</p>
        </footer>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }

        .main-content {
          max-width: var(--container-max-width);
          width: 100%;
          text-align: center;
        }

        .header-section {
          margin-top: 2rem;
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-mini {
          margin-bottom: 1rem;
        }

        .glow-effect {
          filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.4));
          border-radius: 50%;
        }

        h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
          letter-spacing: -1px;
        }

        .subtitle {
          font-size: 1.2rem;
          color: var(--emerald-light);
          margin-bottom: 3rem;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .dashboard-section {
          margin-bottom: 4rem;
          width: 100%;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        .dashboard-secondary {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dash-row {
          display: flex;
          gap: 1.5rem;
        }

        .religious-events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          flex: 1;
        }

        .ramadan-card {
           padding: 1.5rem;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           border-color: var(--emerald-medium);
           flex: 1;
        }

        .ramadan-card .label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .countdown-val {
          font-size: 3rem;
          font-weight: 700;
          color: var(--gold-primary);
          line-height: 1;
        }

        .days-label {
          font-size: 0.8rem;
          color: var(--emerald-light);
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }

        .view-cal-btn {
          background: transparent;
          border: 1px solid var(--gold-primary);
          color: var(--gold-primary);
          padding: 0.4rem 0.8rem;
          font-size: 0.7rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          font-weight: 600;
        }

        .view-cal-btn:hover {
          background: var(--gold-primary);
          color: var(--matte-black);
        }

        .cta-section {
            margin-top: 1rem;
            margin-bottom: 4rem;
        }

        .hero-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 3rem 4rem;
            border-left: 4px solid var(--gold-primary);
            position: relative;
            overflow: hidden;
            text-align: left;
        }

        .hero-content {
            flex: 1;
            max-width: 600px;
            z-index: 2;
        }

        .hero-content h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .hero-desc {
            font-size: 1.1rem;
            color: var(--emerald-light);
            line-height: 1.6;
            margin-bottom: 2rem;
        }

        .read-now-btn {
            display: inline-block;
            background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
            color: var(--matte-black);
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
        }

        .read-now-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
        }

        .hero-decorator {
            font-size: 12rem;
            color: rgba(212, 175, 55, 0.03);
            position: absolute;
            right: 0rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
            pointer-events: none;
        }

        .authenticity-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.8rem;
          background: rgba(4, 57, 39, 0.4);
          border: 1px solid var(--emerald-medium);
          border-radius: 30px;
          font-size: 0.8rem;
          color: var(--emerald-light);
          margin-bottom: 1.5rem;
        }

        .badge-icon {
          margin-right: 0.4rem;
          color: var(--gold-primary);
        }

        footer {
          margin-top: 6rem;
          padding: 3rem 0;
          border-top: 1px solid var(--glass-border);
          color: var(--emerald-light);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem;
          }
          .subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
