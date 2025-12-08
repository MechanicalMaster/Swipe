'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { registerToastCallback } from '@/lib/utils/invoiceActions';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        console.warn('useToast must be used within ToastProvider');
        return { showToast: () => { } };
    }
    return context;
};

// Toast styles
const toastStyles = {
    container: {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none'
    },
    toast: {
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'slideUp 0.3s ease-out',
        maxWidth: '90vw',
        textAlign: 'center'
    },
    success: {
        background: '#10b981',
        color: 'white'
    },
    error: {
        background: '#ef4444',
        color: 'white'
    },
    info: {
        background: '#3b82f6',
        color: 'white'
    }
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    return (
        <div style={{ ...toastStyles.toast, ...toastStyles[type] }}>
            <span>{icons[type]}</span>
            <span>{message}</span>
        </div>
    );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [mounted, setMounted] = useState(false);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Register callback with invoiceActions utility
    useEffect(() => {
        setMounted(true);
        registerToastCallback(showToast);
        return () => registerToastCallback(null);
    }, [showToast]);

    // Inject keyframes for animation
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const styleId = 'toast-animations';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {mounted && typeof document !== 'undefined' && createPortal(
                <div style={toastStyles.container}>
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
