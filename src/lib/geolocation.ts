import { Geolocation } from '@capacitor/geolocation';
import { isNativeApp } from './api-config';

export interface Coords {
    latitude: number;
    longitude: number;
}

export class GeolocationError extends Error {}

// Shared short-lived cache: PrayerTimes, QiblaDirection, and PrayerCalendar
// all independently ask for the device's location on the same dashboard
// load. Without sharing, each one repeats the full request, competing with
// QiblaDirection's continuous high-accuracy watchPosition and sometimes
// timing out. Reusing one recent fix for a few minutes fixes that.
let cachedPosition: { coords: Coords; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;
let inFlightRequest: Promise<Coords> | null = null;

/**
 * Gets a single current position. Uses the native Capacitor Geolocation
 * plugin when running as a packaged app (which also triggers the native
 * iOS/Android permission prompt), and falls back to the browser
 * navigator.geolocation API on web. Shares a short-lived cache and any
 * in-flight request across callers to avoid redundant, contending
 * geolocation calls.
 */
export async function getCurrentPosition(): Promise<Coords> {
    if (cachedPosition && Date.now() - cachedPosition.timestamp < CACHE_TTL_MS) {
        return cachedPosition.coords;
    }

    if (inFlightRequest) {
        return inFlightRequest;
    }

    const fetchPosition = async (): Promise<Coords> => {
        if (isNativeApp()) {
            try {
                const pos = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: 20000,
                });
                return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            } catch (err) {
                throw new GeolocationError(
                    err instanceof Error ? err.message : 'Failed to get location'
                );
            }
        }

        if (!('geolocation' in navigator)) {
            throw new GeolocationError('Geolocation is not supported on this device');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => reject(new GeolocationError(err.message)),
                // City-level accuracy is enough for prayer times/Qibla — this
                // resolves far faster than GPS-precision mode and doesn't
                // contend with QiblaDirection's high-accuracy watch.
                { enableHighAccuracy: false, timeout: 20000, maximumAge: CACHE_TTL_MS }
            );
        });
    };

    inFlightRequest = fetchPosition()
        .then((coords) => {
            cachedPosition = { coords, timestamp: Date.now() };
            return coords;
        })
        .finally(() => {
            inFlightRequest = null;
        });

    return inFlightRequest;
}

/**
 * Watches position continuously (used by QiblaDirection for the live
 * compass). Returns an unwatch function — call it on cleanup.
 */
export async function watchPosition(
    onUpdate: (coords: Coords) => void,
    onError?: (err: GeolocationError) => void
): Promise<() => void> {
    if (isNativeApp()) {
        const watchId = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 10000 },
            (pos, err) => {
                if (err) {
                    onError?.(new GeolocationError(err.message));
                    return;
                }
                if (pos) {
                    onUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                }
            }
        );
        return () => {
            Geolocation.clearWatch({ id: watchId });
        };
    }

    if (!('geolocation' in navigator)) {
        onError?.(new GeolocationError('Geolocation is not supported on this device'));
        return () => {};
    }

    const id = navigator.geolocation.watchPosition(
        (pos) => onUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => onError?.(new GeolocationError(err.message)),
        { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(id);
}
