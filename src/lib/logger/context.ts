

import { v4 as uuidv4 } from 'uuid';
import { Device } from './types';

// Simple session ID that persists for the lifetime of the module (app session)
export const SESSION_ID = uuidv4();

/**
 * Get the application version
 */
export const getAppVersion = () => {
    // TODO: Inject this via environment variable in next.config.mjs
    // process.env.NEXT_PUBLIC_APP_VERSION
    return '0.1.0';
};

export const getDevice = (): Device => {
    if (typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNative) {
        if ((window as any).Capacitor.getPlatform() === 'ios') return 'ios';
        return 'android';
    }
    return 'web';
};

export const getContext = () => ({
    sessionId: SESSION_ID,
    appVersion: getAppVersion(),
    device: getDevice(),
});
