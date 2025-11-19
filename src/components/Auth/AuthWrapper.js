'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import LoginFlow from './LoginFlow';

export default function AuthWrapper({ children }) {
    const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

    useEffect(() => {
        loadAuth();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginFlow />;
    }

    return <>{children}</>;
}
