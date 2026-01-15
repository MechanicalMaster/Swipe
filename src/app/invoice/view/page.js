'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { formatCurrency } from '@/lib/utils/tax';
import { shareInvoicePDF, downloadInvoicePDF } from '@/lib/utils/invoiceActions';

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

// Extract address from customer object
const formatAddress = (customer) => {
    if (!customer) return 'N/A';
    const addr = customer.address;
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr || 'N/A';
    // Object format
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
};


import BottomSheet from '@/components/BottomSheet';
import {
    FiArrowLeft, FiEdit, FiMoreHorizontal, FiShare2, FiPrinter, FiDownload,
    FiCopy, FiClock, FiRefreshCw, FiSettings, FiMail, FiMessageSquare,
    FiTruck, FiFileText, FiXCircle
} from 'react-icons/fi';
import CancelInvoiceModal from '@/components/CancelInvoiceModal';

function InvoiceViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [invoice, setInvoice] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { getInvoice, deleteInvoice } = useInvoiceStore();

    useEffect(() => {
        const loadInvoice = async () => {
            if (id) {
                try {
                    const inv = await getInvoice(id);
                    setInvoice(inv);
                } catch (error) {
                    console.error('Failed to load invoice:', error);
                }
            }
        };
        loadInvoice();
    }, [id, getInvoice]);

    const handleShare = async () => {
        if (!invoice) return;
        await shareInvoicePDF(invoice);
    };

    const handleDownload = async () => {
        if (!invoice) return;
        await downloadInvoicePDF(invoice);
    };

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const handleCancelInvoice = async (reason) => {
        if (invoice) {
            await deleteInvoice(invoice.id);
            setIsCancelModalOpen(false);
            router.push('/'); // Redirect to home/dashboard after deletion
        }
    };

    if (!invoice) return <div style={{ padding: 20 }}>Loading...</div>;

    const menuGridItems = [
        { label: 'Edit', icon: FiEdit, onClick: () => router.push(`/invoice/edit?id=${invoice.id}`) },
        {
            label: 'View PDF', icon: FiDownload, onClick: async () => {
                await handleDownload();
                setIsMenuOpen(false);
            }
        },

        {
            label: 'Send Bill', icon: FiShare2, onClick: () => {
                handleShare();
                setIsMenuOpen(false);
            }
        },
    ];

    const menuListItems = [
        { label: 'Duplicate', icon: FiCopy },
        { label: 'Thermal Print', icon: FiPrinter },
        { label: 'Activity', icon: FiClock },
        { label: 'Convert', icon: FiRefreshCw, sub: '(3 free trials left)' },
        { label: 'Document Settings', icon: FiSettings },
        { label: 'Send Email', icon: FiMail },
        { label: 'Send SMS', icon: FiMessageSquare },

        {
            label: 'Cancel Invoice',
            icon: FiXCircle,
            danger: true,
            action: true,
            onClick: () => {
                setIsMenuOpen(false);
                setIsCancelModalOpen(true);
            }
        },
    ];

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', paddingBottom: 100 }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiArrowLeft size={24} onClick={() => router.push('/')} style={{ cursor: 'pointer' }} />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{invoice.invoiceNumber}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Invoice</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={() => router.push(`/invoice/edit?id=${invoice.id}`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#fef3c7', color: '#d97706',
                            border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 600
                        }}>
                        <FiEdit size={14} /> Edit
                    </button>
                    <FiMoreHorizontal size={24} onClick={() => setIsMenuOpen(true)} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <div style={{ padding: 16 }}>
                {/* Customer Details */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Customer Details</div>
                <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Customer Details</div>
                        <div style={{
                            background: invoice.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                            color: invoice.status === 'Paid' ? '#166534' : '#991b1b',
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4
                        }}>
                            {invoice.status.toUpperCase()}
                        </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{invoice.customer.name}</div>

                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Invoice date <FiEdit size={10} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(invoice.date)}</div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Billing Address</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{formatAddress(invoice.customer)}</div>
                    </div>
                </div>

                {/* Items */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                    Items <span style={{ color: '#6b7280', fontWeight: 400 }}>({invoice.items?.length || 0} Product)</span>
                </div>
                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    {invoice.items?.map((item, idx) => (
                        <div key={idx} style={{ padding: 16, borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ fontWeight: 600 }}>{item.description || item.name || 'Unnamed Item'}</div>
                                <div style={{ fontWeight: 600 }}>{formatCurrency(item.itemTotal || item.total || 0)}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                                <div>x {item.quantity || 1}</div>
                                <div>&gt;</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: 16, background: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                            <div>Subtotal</div>
                            <div>{formatCurrency(invoice.totals?.subtotal || 0)}</div>
                        </div>
                        {/* Tax breakdown - only show if non-zero */}
                        {(invoice.totals?.cgst > 0 || invoice.totals?.sgst > 0) && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
                                    <div>CGST (1.5%)</div>
                                    <div>{formatCurrency(invoice.totals?.cgst || 0)}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
                                    <div>SGST (1.5%)</div>
                                    <div>{formatCurrency(invoice.totals?.sgst || 0)}</div>
                                </div>
                            </>
                        )}
                        {invoice.totals?.igst > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
                                <div>IGST (3%)</div>
                                <div>{formatCurrency(invoice.totals?.igst || 0)}</div>
                            </div>
                        )}
                        {invoice.totals?.roundOff !== 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#6b7280' }}>
                                <div>Round Off</div>
                                <div>{formatCurrency(invoice.totals?.roundOff || 0)}</div>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                            <div>Total Amount</div>
                            <div>{formatCurrency(invoice.totals?.grandTotal || 0)}</div>
                        </div>
                    </div>
                </div>

                {/* Payments */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Payments</div>
                <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    {invoice.payment?.amountReceived > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600 }}>{formatDate(invoice.date)}</span>
                                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                                        {invoice.payment?.mode}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>PAYIN-1</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600 }}>{formatCurrency(invoice.payment?.amountReceived || 0)}</div>
                                <button style={{
                                    background: '#2563eb', color: 'white', border: 'none',
                                    padding: '4px 8px', borderRadius: 4, fontSize: 10, marginTop: 4
                                }}>
                                    📄 View Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#6b7280', fontSize: 14 }}>No payments recorded</div>
                    )}
                </div>

            </div>

            {/* Bottom Actions */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'white', padding: 16, borderTop: '1px solid #e5e7eb',
                display: 'flex', gap: 12, overflowX: 'auto'
            }}>
                <button
                    onClick={handleDownload}
                    style={{
                        flex: 1, padding: '12px', borderRadius: 24, border: '1px solid #e5e7eb',
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        minWidth: 120
                    }}>
                    <FiDownload /> View PDF
                </button>
                <button style={{
                    flex: 1, padding: '12px', borderRadius: 24, border: '1px solid #e5e7eb',
                    background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    minWidth: 140
                }}>
                    <FiPrinter /> Thermal Print
                </button>
                <button
                    onClick={handleShare}
                    style={{
                        flex: 1, padding: '12px', borderRadius: 24, border: 'none',
                        background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        minWidth: 120
                    }}>
                    <FiShare2 /> Send Bill
                </button>
            </div>

            <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {menuGridItems.map((item, idx) => (
                        <div key={idx} onClick={item.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12, background: 'white',
                                border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <item.icon size={20} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {menuListItems.map((item, idx) => (
                        <div key={idx}
                            onClick={item.onClick || (() => alert(`${item.label} coming soon`))}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
                                borderBottom: idx < menuListItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                                color: item.danger ? '#ef4444' : 'inherit'
                            }}
                        >
                            <item.icon size={20} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                                {item.sub && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.sub}</div>}
                            </div>
                            {item.action && (
                                <div style={{
                                    width: 24, height: 24, borderRadius: 12, background: item.danger ? '#fee2e2' : '#f3f4f6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: 0, height: 0,
                                        borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
                                        borderLeft: `6px solid ${item.danger ? '#ef4444' : '#6b7280'}`
                                    }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </BottomSheet>

            <CancelInvoiceModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelInvoice}
            />
        </div>
    );
}

export default function InvoiceViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoiceViewContent />
        </Suspense>
    );
}
