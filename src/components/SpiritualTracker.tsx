import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';

const TOTAL_QURAN_AYAHS = 6236;

const SpiritualTracker: React.FC = () => {
  const { totalAyahsRead, completedAyahKeys, currentStreak, activityHistory, lastRead } = useProgress();

  // Calculate Completion Percentage (based on unique completed ayahs)
  const uniqueAyahsCompleted = completedAyahKeys ? completedAyahKeys.length : 0;
  const completionPercentage = Math.min((uniqueAyahsCompleted / TOTAL_QURAN_AYAHS) * 100, 100).toFixed(2);
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (parseFloat(completionPercentage) / 100) * circleCircumference;

  // Get last 7 days for the weekly chart
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  // Match history to last 7 days to get ayahs read per day (maxing out visually at 50 for the chart)
  const weeklyData = last7Days.map(date => {
    const record = activityHistory.find(h => h.date === date);
    return {
      date,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: record ? record.ayahsRead : 0
    };
  });

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 10); // Minimum scale of 10

  return (
    <div className="spiritual-tracker-widget glass-card">
      <h4 className="label gold-text">Spiritual Progress</h4>

      <div className="tracker-main">
        {/* Completion Ring */}
        <div className="completion-ring-container">
          <svg className="progress-ring" width="100" height="100">
            <circle
              className="progress-ring-track"
              strokeWidth="6"
              fill="transparent"
              r={circleRadius}
              cx="50"
              cy="50"
            />
            <circle
              className="progress-ring-fill"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              r={circleRadius}
              cx="50"
              cy="50"
              style={{ strokeDasharray: circleCircumference, strokeDashoffset }}
            />
          </svg>
          <div className="ring-text">
            <span className="percent">{completionPercentage}%</span>
            <span className="percent-label">Completed</span>
          </div>
        </div>

        <div className="stats-column">
          <div className="stat-item">
            <span className="stat-val">{totalAyahsRead}</span>
            <span className="stat-label">Total Ayahs</span>
          </div>
          <div className="stat-item">
            <span className="stat-val">{currentStreak} <span className="fire-icon">🔥</span></span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Last Read Section */}
      {lastRead && (
        <div className="last-read-section">
          <span className="last-read-label">Last Read:</span>
          <Link href={`/surah/${lastRead.chapterId}`} className="last-read-link">
            {lastRead.surahName} - {lastRead.verseKey}
          </Link>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="weekly-chart">
        <span className="chart-title">Last 7 Days</span>
        <div className="bars-container">
          {weeklyData.map((data, idx) => {
            const heightPercent = Math.min((data.count / maxWeeklyCount) * 100, 100);
            return (
              <div key={idx} className="bar-wrapper" title={`${data.count} ayahs`}>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ height: `${heightPercent}%` }}></div>
                </div>
                <span className="day-label">{data.dayName.charAt(0)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
                .spiritual-tracker-widget {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    border-color: var(--emerald-medium);
                }

                .label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-align: center;
                    margin: 0;
                }

                .tracker-main {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    gap: 1.5rem;
                }

                .completion-ring-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }

                .progress-ring {
                    transform: rotate(-90deg);
                }

                .progress-ring-track {
                    stroke: rgba(255, 255, 255, 0.05);
                }

                .progress-ring-fill {
                    stroke: var(--gold-primary);
                    transition: stroke-dashoffset 1s ease-in-out;
                    filter: drop-shadow(0 0 4px var(--gold-glow));
                }

                .ring-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .percent {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--off-white);
                }

                .percent-label {
                    font-size: 0.55rem;
                    text-transform: uppercase;
                    color: var(--emerald-light);
                }

                .stats-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                }

                .stat-val {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--gold-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .fire-icon {
                    font-size: 1.2rem;
                }

                .stat-label {
                    font-size: 0.7rem;
                    color: var(--emerald-light);
                    text-transform: uppercase;
                }

                .last-read-section {
                    background: rgba(4, 57, 39, 0.4);
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                }

                .last-read-label {
                    font-size: 0.8rem;
                    color: var(--emerald-light);
                }

                .last-read-link {
                    font-size: 0.9rem;
                    color: var(--gold-primary);
                    font-weight: 600;
                    text-decoration: none;
                }
                
                .last-read-link:hover {
                    text-decoration: underline;
                }

                .weekly-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .chart-title {
                    font-size: 0.75rem;
                    color: var(--emerald-light);
                    text-transform: uppercase;
                }

                .bars-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    height: 80px;
                }

                .bar-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    width: 12%;
                }

                .bar-bg {
                    width: 100%;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }

                .bar-fill {
                    width: 100%;
                    background: linear-gradient(0deg, var(--emerald-medium), var(--gold-primary));
                    border-radius: 4px;
                    transition: height 0.8s ease-out;
                }

                .day-label {
                    font-size: 0.65rem;
                    color: var(--emerald-light);
                }
            `}</style>
    </div>
  );
};

export default SpiritualTracker;
