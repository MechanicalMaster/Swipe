'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { api } from '@/api/backendClient';
import LoginFlow from './LoginFlow';
import ServerSetup from '@/components/ServerConfig/ServerSetup';
import styles from './AuthWrapper.module.css'; // We'll need to create this for the banner

export default function AuthWrapper({ children }) {
    const { isAuthenticated, isLoading, loadAuth } = useAuthStore();
    const [needsConfig, setNeedsConfig] = useState(false);
    const [connectionError, setConnectionError] = useState(false);
    const [initLoading, setInitLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const url = await api.init();
                if (!url) {
                    setNeedsConfig(true);
                } else {
                    loadAuth();
                }
            } catch (e) {
                console.error('Init failed', e);
                // Fallback or error state?
            } finally {
                setInitLoading(false);
            }
        };
        init();

        // Listen for connection drops
        return api.onConnectionError(() => setConnectionError(true));
    }, []);

    const handleRetryConnection = async () => {
        // Try health check
        try {
            const ok = await api.health();
            if (ok) {
                setConnectionError(false);
            } else {
                alert('Still unreachable');
            }
        } catch (e) {
            alert('Connection failed');
        }
    };

    if (initLoading || isLoading) {

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (needsConfig) {
        return <ServerSetup onConfigured={() => {
            setNeedsConfig(false);
            loadAuth();
        }} />;
    }

    return (
        <>
            {connectionError && (
                <div className={styles.banner}>
                    <span>Connection Lost</span>
                    <div className={styles.actions}>
                        <button onClick={handleRetryConnection}>Retry</button>
                        <button onClick={() => setNeedsConfig(true)}>Change Server</button>
                    </div>
                </div>
            )}
            {!isAuthenticated ? <LoginFlow /> : children}
        </>
    );
}
