'use client';

import React, { useState, useEffect } from 'react';
import { fetchQibla } from '@/lib/prayer-api';

const QiblaDirection: React.FC = () => {
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Alpha for the Low Pass Filter (0.0 to 1.0)
  // Higher = more responsive; Lower = smoother
  const LPF_ALPHA = 0.5;
  const previousHeading = React.useRef<number>(0);

  // 3D Tilt Compensation Math for Android Devices
  const computeCompassHeading = (alpha: number, beta: number, gamma: number) => {
    const degToRad = Math.PI / 180;
    const _x = beta ? beta * degToRad : 0; // Pitch
    const _y = gamma ? gamma * degToRad : 0; // Roll
    const _z = alpha ? alpha * degToRad : 0; // Yaw

    const cX = Math.cos(_x);
    const cY = Math.cos(_y);
    const cZ = Math.cos(_z);
    const sX = Math.sin(_x);
    const sY = Math.sin(_y);
    const sZ = Math.sin(_z);

    // Calculate Vx and Vy vector components
    const Vx = -cZ * sY - sZ * sX * cY;
    const Vy = -sZ * sY + cZ * sX * cY;

    // Calculate generic compass heading
    let compassHeading = Math.atan(Vx / Vy);

    // Convert compass heading to use the whole 360 unit circle
    if (Vy < 0) {
      compassHeading += Math.PI;
    } else if (Vx < 0) {
      compassHeading += 2 * Math.PI;
    }

    return compassHeading * (180 / Math.PI);
  };

  // Filter math to smooth crossing the 360/0 degree threshold safely
  const smoothHeading = (rawHeading: number) => {
    let prev = previousHeading.current;
    let delta = rawHeading - prev;

    // Shortest path around the circle
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;

    let smoothed = prev + LPF_ALPHA * delta;
    // Normalize 0-360
    if (smoothed < 0) smoothed += 360;
    else if (smoothed >= 360) smoothed -= 360;

    previousHeading.current = smoothed;
    return smoothed;
  };

  useEffect(() => {
    let watchId: number;
    // Find Qibla using geographic coordinates
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const exactQibla = await fetchQibla(position.coords.latitude, position.coords.longitude);
          if (exactQibla !== null) setQibla(exactQibla);
        },
        (err) => console.log('Geolocation denied or failed', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    // Check if device requires explicitly requested hardware permission (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      // Android and older browsers generally allow it openly, assume granted
      setPermissionGranted(true);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    // Chrome/Android Absolute Orientation (Magnetometer with 3D Tilt Compensation)
    const handleDeviceOrientationAbsolute = (e: any) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        // Compensate for phone being held upright (Pitch & Roll) rather than flat on a table
        const tiltCompensatedHeading = computeCompassHeading(e.alpha, e.beta, e.gamma);
        setHeading(smoothHeading(tiltCompensatedHeading));
      }
    };

    // iOS Safari Compass Events
    const handleDeviceOrientation = (e: any) => {
      if (e.webkitCompassHeading !== undefined) {
        // Prefer True North if the device provides it, otherwise magnetic north
        let rHeading = e.webkitCompassTrueHeading !== undefined && e.webkitCompassTrueHeading >= 0
          ? e.webkitCompassTrueHeading
          : e.webkitCompassHeading;
        setHeading(smoothHeading(rHeading));
      }
    };

    // We bind both listeners separately.
    // On Android, deviceorientation e.webkitCompassHeading is undefined, so it gracefully does nothing,
    // and does NOT overwrite the absolute magnetometer data from deviceorientationabsolute.
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientationAbsolute, true);
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleDeviceOrientationAbsolute, true);
      window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    };
  }, [permissionGranted]);

  const requestCompassPermission = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          setNeedsPermission(false);
          setError(null);
        } else {
          setError('Permission denied. Cannot access compass.');
        }
      } else {
        setPermissionGranted(true);
        setNeedsPermission(false);
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setError('Hardware compass not supported on this device.');
    }
  };

  // Note: The indicator div is visually rotated by the Qibla bearing statically inside the Dial. 
  // The Dial itself spins counter to the phone's Heading (pointing to True North). 
  // This perfectly isolates the math.
  return (
    <div className="qibla-widget glass-card">
      <h4 className="label gold-text">Live Qibla Compass</h4>

      <div className="compass-container">
        {needsPermission && !permissionGranted ? (
          <div className="activation-overlay">
            <p className="activation-text">Compass requires sensor permission.</p>
            <button className="activate-btn" onClick={requestCompassPermission}>
              Activate Compass
            </button>
          </div>
        ) : (
          <div
            className="compass-dial"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="compass-ring"></div>
            <div className="north-marker">N</div>

            <div
              className="qibla-indicator"
              style={{ transform: `rotate(${qibla || 0}deg)` }}
            >
              <div className="kaaba-icon">🕋</div>
              <div className="pointer-line"></div>
            </div>
          </div>
        )}
      </div>

      <div className="qibla-info">
        {error ? (
          <p className="error-text">{error}</p>
        ) : (
          <>
            <p className="qibla-angle">
              {qibla ? `Qibla is ${qibla.toFixed(1)}° from North` : 'Locating Qibla...'}
            </p>
            {!needsPermission && heading === 0 && permissionGranted && (
              <p className="sub-hint">Rotate device to calibrate hardware</p>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .qibla-widget {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          border-color: var(--emerald-medium);
          position: relative;
        }

        .label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .compass-container {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(212,175,55,0.05) 100%);
          box-shadow: 0 0 20px rgba(0,0,0,0.2) inset, 0 0 10px rgba(212,175,55,0.1);
        }

        .activation-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          padding: 1rem;
        }

        .activation-text {
          font-size: 0.8rem;
          color: var(--gray-light);
          line-height: 1.4;
        }

        .activate-btn {
          background: var(--gold-primary);
          color: var(--matte-black);
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .activate-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .compass-dial {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          position: relative;
          will-change: transform;
          /* Specifically NOT animating transform natively here because LPF algorithm handles interpolation smoothly. */
          /* Setting a CSS transition on an LPF stream causes double-smoothing jitter. */
        }

        .compass-ring {
            position: absolute;
            top: 5px; left: 5px; right: 5px; bottom: 5px;
            border: 2px dashed rgba(212, 175, 55, 0.3);
            border-radius: 50%;
            pointer-events: none;
        }

        .north-marker {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--gold-secondary);
          font-weight: 800;
          font-size: 1.1rem;
          text-shadow: 0 0 8px rgba(212,175,55,0.5);
        }

        .qibla-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .kaaba-icon {
          margin-top: 25px;
          font-size: 2rem;
          filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
          z-index: 2;
        }

        .pointer-line {
            width: 2px;
            height: 35px;
            background: linear-gradient(to bottom, var(--emerald-medium), transparent);
            margin-top: -5px;
        }

        .qibla-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .qibla-angle {
          font-size: 0.9rem;
          color: var(--emerald-light);
          font-weight: 500;
        }

        .sub-hint {
            font-size: 0.7rem;
            color: var(--gray-light);
            font-style: italic;
            opacity: 0.6;
        }

        .error-text {
            color: #ff6b6b;
            font-size: 0.8rem;
            text-align: center;
        }
      `}</style>
    </div>
  );
};

export default QiblaDirection;
