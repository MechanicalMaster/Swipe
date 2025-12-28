'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/api/backendClient';
import ServerSetup from '@/components/ServerConfig/ServerSetup';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import styles from './AppBootstrap.module.css';

/**
 * AppBootstrap - Top-level connectivity gate
 * 
 * Ensures backend is configured and reachable BEFORE rendering AuthWrapper.
 * Flow: Check Config → Health Check → Auth
 * 
 * States:
 * - loading: Checking configuration/connectivity
 * - needsConfig: No URL configured, show ServerSetup
 * - healthCheckFailed: URL configured but unreachable, show ServerSetup with error
 * - ready: Connected, render AuthWrapper
 */
export default function AppBootstrap({ children }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    const [state, setState] = useState('loading'); // loading | needsConfig | healthCheckFailed | ready
    const [lastUrl, setLastUrl] = useState('');
    const [connectionLost, setConnectionLost] = useState(false);

    const checkConnectivity = useCallback(async () => {
        setState('loading');

        try {
            // Get configured URL
            const url = await api.init();

            if (!url) {
                // No URL configured -> show setup
                setState('needsConfig');
                return;
            }

            setLastUrl(url);

            // URL exists, perform health check
            try {
                const isHealthy = await api.health();
                if (isHealthy) {
                    setState('ready');
                    setConnectionLost(false);
                } else {
                    setState('healthCheckFailed');
                }
            } catch (healthError) {
                console.error('Health check failed:', healthError);
                setState('healthCheckFailed');
            }
        } catch (error) {
            console.error('Bootstrap init failed:', error);
            setState('needsConfig');
        }
    }, []);

    useEffect(() => {
        checkConnectivity();

        // Listen for mid-session connection drops
        // This only affects the 'ready' state - shows a non-blocking banner
        const unsubscribe = api.onConnectionError(() => {
            // Only set connection lost if we're in ready state
            // Do NOT change state from ready - that would unmount AuthWrapper
            setConnectionLost(true);
        });

        return unsubscribe;
    }, [checkConnectivity]);

    const handleRetryConnection = async () => {
        setConnectionLost(false);
        try {
            const isHealthy = await api.health();
            if (!isHealthy) {
                setConnectionLost(true);
            }
        } catch (e) {
            setConnectionLost(true);
        }
    };

    const handleChangeServer = () => {
        setState('needsConfig');
        setConnectionLost(false);
    };

    const handleConfigured = () => {
        // After ServerSetup saves, re-check connectivity
        checkConnectivity();
    };

    // Loading state - neutral spinner to avoid UI flicker
    if (state === 'loading') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Connecting...</p>
            </div>
        );
    }

    // No URL configured - show ServerSetup (blocking)
    if (state === 'needsConfig') {
        return (
            <ServerSetup
                onConfigured={handleConfigured}
                initialUrl={lastUrl}
            />
        );
    }

    // URL configured but health check failed - show ServerSetup with error
    if (state === 'healthCheckFailed') {
        return (
            <ServerSetup
                onConfigured={handleConfigured}
                initialUrl={lastUrl}
                initialError="Unable to connect to server. Please check the URL or try again."
            />
        );
    }

    // Ready state - render content
    // Admin routes skip AuthWrapper (for shop/user setup before login)
    // Other routes go through AuthWrapper
    return (
        <>
            {/* Mid-session connection lost banner - non-blocking */}
            {connectionLost && (
                <div className={styles.connectionBanner}>
                    <span>Connection Lost</span>
                    <div className={styles.bannerActions}>
                        <button onClick={handleRetryConnection}>Retry</button>
                        <button onClick={handleChangeServer}>Change Server</button>
                    </div>
                </div>
            )}
            {isAdminRoute ? children : <AuthWrapper>{children}</AuthWrapper>}
        </>
    );
}
