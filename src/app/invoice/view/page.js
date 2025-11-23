'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils/tax';
import { generatePDF } from '@/lib/utils/pdf';
import BottomSheet from '@/components/BottomSheet';
import {
    FiArrowLeft, FiEdit, FiMoreHorizontal, FiShare2, FiPrinter, FiDownload, FiPlus,
    FiCopy, FiClock, FiRefreshCw, FiSettings, FiMail, FiMessageSquare,
    FiTruck, FiFileText, FiXCircle
} from 'react-icons/fi';

function InvoiceViewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [invoice, setInvoice] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const loadInvoice = async () => {
            if (id) {
                const inv = await db.invoices.get(Number(id));
                setInvoice(inv);
            }
        };
        loadInvoice();
    }, [id]);

    const handleShare = async () => {
        if (!invoice) return;
        try {
            const settings = await db.settings.get('templateId');
            const templateId = settings ? settings.value : 'modern';
            const blob = await generatePDF({ ...invoice, templateId, returnBlob: true });
            const file = new File([blob], `Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });

            if (navigator.share) {
                await navigator.share({
                    title: `Invoice ${invoice.invoiceNumber}`,
                    text: `Hello ${invoice.customer.name},\n\nPlease find attached invoice ${invoice.invoiceNumber} from ${invoice.date}.\n\nTotal Amount: ${formatCurrency(invoice.totals.total)}\n\nThank you for your business!`,
                    files: [file]
                });
            } else {
                alert('Sharing is not supported on this device/browser.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share invoice');
        }
    };

    if (!invoice) return <div style={{ padding: 20 }}>Loading...</div>;

    const menuGridItems = [
        { label: 'Edit', icon: FiEdit, onClick: () => router.push(`/invoice/edit?id=${invoice.id}`) },
        {
            label: 'View PDF', icon: FiDownload, onClick: async () => {
                const settings = await db.settings.get('templateId');
                const templateId = settings ? settings.value : 'modern';
                await generatePDF({ ...invoice, templateId });
                setIsMenuOpen(false);
            }
        },
        { label: 'Delivery Challan', icon: FiTruck, onClick: () => alert('Delivery Challan coming soon') },
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
        { label: 'Create E-way Bill', icon: FiTruck, sub: '(3 free trials left)' },
        { label: 'Create E-Invoice', icon: FiFileText, sub: '(3 free trials left)', action: true },
        { label: 'Cancel Invoice', icon: FiXCircle, danger: true, action: true },
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
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{invoice.date}</div>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Billing Address</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{invoice.customer.address || 'NA'}</div>
                    </div>
                </div>

                {/* Items */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                    Items <span style={{ color: '#6b7280', fontWeight: 400 }}>({invoice.items.length} Product)</span>
                </div>
                <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    {invoice.items.map((item, idx) => (
                        <div key={idx} style={{ padding: 16, borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontWeight: 600 }}>{formatCurrency(item.rate)}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                                <div>x {item.quantity}</div>
                                <div>&gt;</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: 16, background: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                            <div>Subtotal</div>
                            <div>{formatCurrency(invoice.totals.subtotal)}</div>
                        </div>
                        {/* Add other charges here if present */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                            <div>Total Amount</div>
                            <div>{formatCurrency(invoice.totals.total)}</div>
                        </div>
                    </div>
                </div>

                {/* Payments */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Payments</div>
                <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    {invoice.payment.amountReceived > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600 }}>{invoice.date}</span>
                                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                                        {invoice.payment.mode}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>PAYIN-1</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600 }}>{formatCurrency(invoice.payment.amountReceived)}</div>
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

                {/* Internal Notes */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Internal Notes</div>
                <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                    <button style={{
                        border: 'none', background: 'none', color: '#2563eb', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <FiPlus size={16} /> Add Internal Notes
                    </button>
                </div>

                {/* Attachments */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Attachments</div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{
                        flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
                        padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        color: '#2563eb', fontWeight: 600
                    }}>
                        📷 Camera
                    </button>
                    <button style={{
                        flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
                        padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        color: '#2563eb', fontWeight: 600
                    }}>
                        ⬆️ Upload File
                    </button>
                </div>
            </div>

            {/* Bottom Actions */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'white', padding: 16, borderTop: '1px solid #e5e7eb',
                display: 'flex', gap: 12, overflowX: 'auto'
            }}>
                <button style={{
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
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
                            onClick={() => alert(`${item.label} coming soon`)}
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
