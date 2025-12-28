'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import LoginFlow from './LoginFlow';

/**
 * AuthWrapper - Handles authentication state only
 * 
 * Backend connectivity is now handled by AppBootstrap (parent).
 * This component only manages:
 * - Loading auth state from storage
 * - Rendering LoginFlow if not authenticated
 * - Rendering children if authenticated
 */
export default function AuthWrapper({ children }) {
    const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

    useEffect(() => {
        // Load auth state - backend is already confirmed reachable by AppBootstrap
        loadAuth();
    }, [loadAuth]);

    // Show loading while checking auth state
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    // Not authenticated - show login
    if (!isAuthenticated) {
        return <LoginFlow />;
    }

    // Authenticated - render app
    return <>{children}</>;
}
