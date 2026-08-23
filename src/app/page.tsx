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
import OrnateFrame from '@/components/OrnateFrame';
import OrnateDivider from '@/components/OrnateDivider';

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const counters = getReligiousCounters();

  return (
    <div className="container">
      <main className="main-content">
        {/* Header Section */}
        <section className="header-section">
          <OrnateFrame style={{ background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05), transparent 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <h1 className="gold-text font-display">Nur Al-Quran</h1>
            <p className="subtitle">Light of the Quran</p>
          </OrnateFrame>

          <div className="search-container">
            <button
              className="global-search-trigger glass-card"
              onClick={() => setShowSearchModal(true)}
            >
              <span className="search-icon">🔍</span>
              <span className="search-label">Search Quran (Verses, Surahs, Translations)</span>
            </button>
          </div>
        </section>

        <OrnateDivider style={{ maxWidth: 320, margin: '0 auto 3rem' }} />

        {/* Spiritual Dashboard Section */}
        <section className="dashboard-section">
          <div className="dashboard-grid">
            <PrayerTimes />
            <div className="book-spine" aria-hidden="true" />
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
                    <p className="days-label">
                      {counters.isRamadan ? 'Mubarak' : counters.daysToRamadan === 0 ? 'Begins Today' : 'Days'}
                    </p>
                    <button className="view-cal-btn" onClick={() => setShowCalendar(true)}>Full Schedule</button>
                  </div>
                  <div className="ramadan-card glass-card">
                    <h4 className="label gold-text">Eid al-Fitr</h4>
                    <div className="countdown-val">{counters.daysToEidFitr}</div>
                    <p className="days-label">{counters.daysToEidFitr === 0 ? 'Mubarak' : 'Expected'}</p>
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
              <h2 className="gold-text font-display">The Complete Revelation</h2>
              <p className="hero-desc">Explore all 114 Surahs, beautifully formatted with word-by-word translations, interactive memorization modes, and immersive audio recitation.</p>
              <Link href="/surahs" className="read-now-btn">
                <span>Enter the Quran</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
            <div className="hero-decorator amiri-text">
              القرآن
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <Link href="/sources" className="authenticity-badge">
            <span className="badge-icon">✓</span>
            Text verified from official Quran API
          </Link>
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
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
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
          margin-bottom: 0.4rem;
        }

        .subtitle {
          font-size: 1.2rem;
          color: var(--emerald-light);
          margin-bottom: 0;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .search-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .global-search-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.9rem;
          width: 100%;
          max-width: 520px;
          background: rgba(212, 175, 55, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 50px;
          padding: 0.9rem 1.6rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .global-search-trigger:hover {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.12);
          transform: translateY(-2px);
        }

        .global-search-trigger:focus-visible {
          outline: 2px solid var(--gold-primary);
          outline-offset: 3px;
        }

        .global-search-trigger .search-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .global-search-trigger .search-label {
          color: var(--off-white);
          font-size: 0.95rem;
          opacity: 0.85;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-section {
          margin-bottom: 4rem;
          width: 100%;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr auto 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        .book-spine {
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(212, 175, 55, 0.5) 15%,
            rgba(212, 175, 55, 0.5) 85%,
            transparent
          );
          position: relative;
        }

        .book-spine::before,
        .book-spine::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 16px;
        }

        .book-spine::before {
          right: 0;
          background: linear-gradient(to left, rgba(0, 0, 0, 0.25), transparent);
        }

        .book-spine::after {
          left: 0;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.25), transparent);
        }

        @media (max-width: 1024px) {
          .book-spine {
            display: none;
          }
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
           padding: 2rem 1.5rem;
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
          padding: 0.7rem 1rem;
          font-size: 0.75rem;
          min-height: 44px;
          border-radius: 6px;
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

        :global(.read-now-btn) {
            display: inline-flex;
            align-items: center;
            gap: 0.9rem;
            background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
            border: 2px solid var(--gold-secondary);
            color: var(--matte-black);
            padding: 1.2rem 3rem;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.15rem;
            letter-spacing: 0.04em;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 12px 35px rgba(212, 175, 55, 0.45);
        }

        :global(.read-now-btn .btn-arrow) {
            transition: transform 0.3s ease;
        }

        :global(.read-now-btn:hover) {
            transform: translateY(-3px);
            box-shadow: 0 18px 45px rgba(212, 175, 55, 0.6);
        }

        :global(.read-now-btn:hover .btn-arrow) {
            transform: translateX(4px);
        }

        :global(.read-now-btn:focus-visible) {
            outline: 2px solid var(--gold-secondary);
            outline-offset: 3px;
        }

        .hero-decorator {
            font-size: 11rem;
            color: rgba(212, 175, 55, 0.09);
            position: absolute;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
            pointer-events: none;
            line-height: 1;
            white-space: nowrap;
        }

        :global(.authenticity-badge) {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.8rem;
          background: rgba(4, 57, 39, 0.4);
          border: 1px solid var(--emerald-medium);
          border-radius: 30px;
          font-size: 0.8rem;
          color: var(--emerald-light);
          margin-bottom: 1.5rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        :global(.authenticity-badge:hover) {
          border-color: var(--gold-primary);
          color: var(--gold-primary);
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
