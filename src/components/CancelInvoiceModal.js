'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS } from '@/lib/animations';

export default function CancelInvoiceModal({ isOpen, onClose, onConfirm }) {
    const [mounted, setMounted] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px'
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(2px)'
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: ANIMATIONS.duration.fast, ease: ANIMATIONS.ease.out }}
                        style={{
                            position: 'relative',
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '340px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <h3 style={{
                            fontSize: '18px', fontWeight: 700, color: '#111827',
                            marginBottom: '16px', textAlign: 'center', lineHeight: 1.3
                        }}>
                            Do you want to cancel this invoice?
                        </h3>

                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder=" "
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #2563eb',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    color: '#111827'
                                }}
                            />
                            <label style={{
                                position: 'absolute',
                                left: '12px',
                                top: '-8px',
                                background: 'white',
                                padding: '0 4px',
                                fontSize: '12px',
                                color: '#2563eb'
                            }}>
                                Enter reason
                            </label>
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '14px',
                                width: '1px',
                                height: '20px',
                                background: '#111827',
                                animation: 'blink 1s step-end infinite'
                            }} />
                            <style jsx>{`
                                @keyframes blink {
                                    0%, 100% { opacity: 1; }
                                    50% { opacity: 0; }
                                }
                            `}</style>
                        </div>

                        <p style={{
                            color: '#ef4444',
                            fontSize: '13px',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            This action cannot be reversed
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: '#e5e7eb',
                                    color: '#4b5563',
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}
                            >
                                No
                            </button>
                            <button
                                onClick={() => onConfirm(reason)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}
                            >
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
