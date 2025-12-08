import React from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiShare2, FiDollarSign } from 'react-icons/fi';
import { shareInvoicePDF } from '@/lib/utils/invoiceActions';
import styles from './BottomSheet.module.css'; // Reusing existing styles

export const InvoiceBottomSheet = ({ isOpen, onClose, invoice, onRecordPayment, onShare }) => {
    if (!isOpen || !invoice) return null;

    const handleShare = async () => {
        // Use the passed onShare callback if provided (for backwards compatibility)
        // Otherwise use the centralized shareInvoicePDF utility
        if (onShare && typeof onShare === 'function') {
            // Check if it's a placeholder (like the alert callback)
            const result = onShare(invoice);
            // If onShare returns void/undefined or the invoice, also try our utility
            if (result === undefined) {
                // It was likely a placeholder - use our utility instead
                await shareInvoicePDF(invoice);
            }
        } else {
            await shareInvoicePDF(invoice);
        }
        onClose();
    };

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.handleBar} />

                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Invoice #{invoice.invoiceNumber}</h3>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(invoice.date).toLocaleDateString()} • <span style={{ color: '#dc2626' }}>{invoice.status || 'Pending'}</span>
                        </div>
                    </div>
                    <FiX size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Amount Due</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                            ₹ {(invoice.totals?.total || invoice.total || 0).toFixed(2)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => onRecordPayment(invoice)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <FiDollarSign /> Record Payment
                        </button>
                        <button
                            onClick={handleShare}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'white',
                                color: '#2563eb',
                                border: '1px solid #2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <FiShare2 /> Share Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

