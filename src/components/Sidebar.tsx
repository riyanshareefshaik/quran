'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import OrnateDivider from './OrnateDivider';
import NavIcon from './NavIcon';

const Sidebar: React.FC = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: 'dashboard' as const },
        { name: 'Quran', path: '/surahs', icon: 'quran' as const },
        { name: 'Essentials', path: '/essentials', icon: 'essentials' as const },
    ];

    return (
        <>
            <aside className="sidebar-container glass-card">
                <div className="sidebar-logo">
                    <Image
                        src="/logo.png"
                        alt="Nur Al-Quran"
                        width={60}
                        height={60}
                        className="logo-img glow-effect"
                    />
                    <h2 className="brand-name gold-text font-display">Nur Al-Quran</h2>
                    <div style={{ width: '80%', margin: '0.25rem 0 0' }}>
                        <OrnateDivider />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon"><NavIcon name={item.icon} size={20} /></span>
                                <span className="nav-label">{item.name}</span>
                                {isActive && <div className="active-indicator"></div>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <p className="version-info">v2.0 Beta</p>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar (Visible only on small screens) */}
            <nav className="mobile-tab-bar glass-card">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`mobile-tab-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="tab-icon"><NavIcon name={item.icon} size={22} /></span>
                            <span className="tab-label">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <style jsx>{`
                .sidebar-container {
                    position: fixed;
                    left: 0;
                    top: 0;
                    height: 100vh;
                    width: 260px;
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    border-right: 1px solid rgba(212, 175, 55, 0.2);
                    border-left: none;
                    border-top: none;
                    border-bottom: none;
                    border-radius: 0;
                    padding: 2rem 0;
                    transform: translateX(0);
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .sidebar-logo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }

                :global(.logo-img) {
                    border-radius: 50%;
                    border: 2px solid var(--gold-primary);
                    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.12);
                }

                .brand-name {
                    font-size: 1.2rem;
                    letter-spacing: 1px;
                    margin: 0;
                    font-weight: 700;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 0 1rem;
                    flex: 1;
                }

                :global(.nav-item) {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.9rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(212, 175, 55, 0.12);
                    background: rgba(4, 57, 39, 0.2);
                    color: var(--emerald-light);
                    transition: all 0.3s ease;
                    position: relative;
                    font-weight: 500;
                    overflow: hidden;
                }

                :global(.nav-item:hover) {
                    background: rgba(4, 57, 39, 0.5);
                    border-color: rgba(212, 175, 55, 0.3);
                    color: var(--off-white);
                }

                :global(.nav-item.active) {
                    color: var(--gold-primary);
                    background: rgba(212, 175, 55, 0.12);
                    border-color: var(--gold-primary);
                    font-weight: 700;
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
                }

                .nav-icon {
                    width: 24px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    color: inherit;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .active-indicator {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 24px;
                    background: var(--gold-primary);
                    border-radius: 0 4px 4px 0;
                }

                .sidebar-footer {
                    padding: 1rem 2rem;
                    text-align: center;
                }

                .version-info {
                    font-size: 0.75rem;
                    color: var(--gray-light);
                    opacity: 0.5;
                }

                .mobile-tab-bar {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 70px;
                    z-index: 1000;
                    flex-direction: row;
                    justify-content: space-around;
                    align-items: center;
                    border-top: 1px solid rgba(212, 175, 55, 0.2);
                    border-bottom: none;
                    border-left: none;
                    border-right: none;
                    border-radius: 0;
                    padding: 0.5rem;
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(20px);
                }

                :global(.mobile-tab-item) {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.3rem;
                    color: var(--emerald-light);
                    transition: all 0.3s ease;
                    text-decoration: none;
                    flex: 1;
                    height: 100%;
                }

                :global(.mobile-tab-item.active) {
                    color: var(--gold-primary);
                }

                :global(.mobile-tab-item.active .tab-icon) {
                    transform: translateY(-2px);
                }

                .tab-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                }

                .tab-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Responsive Layout Rules */
                @media (max-width: 1024px) {
                    .sidebar-container {
                        width: 200px;
                    }
                    .nav-item {
                        padding: 0.8rem 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .sidebar-container {
                        transform: translateX(-100%); /* Hide sidebar */
                    }
                    .mobile-tab-bar {
                        display: flex; /* Show bottom tabs */
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
