import { Geolocation } from '@capacitor/geolocation';
import { isNativeApp } from './api-config';

export interface Coords {
    latitude: number;
    longitude: number;
}

export class GeolocationError extends Error {}

/**
 * Gets a single current position. Uses the native Capacitor Geolocation
 * plugin when running as a packaged app (which also triggers the native
 * iOS/Android permission prompt), and falls back to the browser
 * navigator.geolocation API on web.
 */
export async function getCurrentPosition(): Promise<Coords> {
    if (isNativeApp()) {
        try {
            const pos = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
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
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
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
