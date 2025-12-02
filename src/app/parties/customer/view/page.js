'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiArrowLeft, FiPhone, FiMail, FiShare2, FiMessageCircle, FiEdit2, FiMoreHorizontal, FiFileText, FiFile, FiPlusSquare, FiGitMerge, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionCard } from '@/components/TransactionCard';
import { InvoiceBottomSheet } from '@/components/InvoiceBottomSheet';

function CustomerLedgerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { getCustomer } = usePartyStore();
    const { invoices, loadInvoices } = useInvoiceStore();

    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('ledger');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { deleteCustomer } = usePartyStore();

    const handleWhatsApp = () => {
        if (customer.phone) {
            // Remove non-numeric characters for the link
            const cleanNumber = customer.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
        } else {
            alert('Phone number not available');
        }
    };

    const handleCall = () => {
        if (customer.phone) {
            window.open(`tel:${customer.phone}`, '_self');
        } else {
            alert('Phone number not available');
        }
    };

    const handleEmail = () => {
        if (customer.email) {
            window.open(`mailto:${customer.email}`, '_self');
        } else {
            alert('Email not available');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Customer Details',
            text: `Customer: ${customer.name}\nPhone: ${customer.phone || 'N/A'}\nBalance: ₹${customer.balance?.toFixed(2) || '0.00'}`,
            dialogTitle: 'Share Customer Details'
        };

        try {
            // Dynamic import for Capacitor Share to avoid SSR issues or if not available
            const { Share } = await import('@capacitor/share');
            await Share.share(shareData);
        } catch (error) {
            console.log('Capacitor Share failed, trying navigator.share', error);
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.error('Share failed:', err);
                }
            } else {
                alert('Sharing is not supported on this device');
            }
        }
    };

    const handleDownloadExcel = () => {
        const data = transactions.map(tx => ({
            Date: new Date(tx.date).toLocaleDateString(),
            Type: tx.type,
            Number: tx.number,
            Amount: tx.amount,
            Status: tx.status
        }));
        import('@/lib/utils/exportUtils').then(utils => {
            utils.exportToCSV(data, `${customer.name}_ledger.csv`);
        });
        setIsMenuOpen(false);
    };

    const handleDownloadPDF = () => {
        import('@/lib/utils/exportUtils').then(utils => {
            utils.exportToPDF(customer, transactions, `${customer.name}_ledger.pdf`);
        });
        setIsMenuOpen(false);
    };

    const handleDeleteCustomer = async () => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            await deleteCustomer(customer.id);
            router.push('/parties');
        }
    };

    const menuItemStyle = {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
        fontSize: '16px', fontWeight: 500, color: '#374151', cursor: 'pointer',
        borderRadius: '8px', transition: 'background 0.2s'
    };

    useEffect(() => {
        if (id) {
            const c = getCustomer(id);
            if (c) setCustomer(c);
            loadInvoices();
        }
    }, [id]);

    useEffect(() => {
        if (customer && invoices.length > 0) {
            // Filter invoices and payments for this customer
            const customerRecords = invoices.filter(inv =>
                inv.customer?.name === customer.name ||
                (inv.customer?.id === customer.id)
            );

            const txs = customerRecords.map(inv => ({
                id: inv.id,
                date: inv.date,
                type: inv.type || 'invoice', // 'invoice', 'payment_in', 'payment_out'
                number: inv.invoiceNumber,
                amount: inv.totals?.total || inv.total || 0,
                status: inv.status || 'pending',
                balance: (inv.type === 'payment_in' || inv.type === 'payment_out') ? 0 : (inv.total || inv.totals?.total),
                data: inv
            }));

            // Sort by date descending
            txs.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(txs);
        }
    }, [customer, invoices]);

    if (!customer) return <div>Loading...</div>;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                        <FiMoreHorizontal size={24} onClick={() => setIsMenuOpen(true)} style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Menu Bottom Sheet */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40
                                }}
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    position: 'fixed', bottom: 0, left: 0, right: 0,
                                    background: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                                    padding: '20px', zIndex: 50, maxHeight: '80vh', overflowY: 'auto'
                                }}
                            >
                                <div style={{ width: '40px', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 auto 20px' }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div onClick={() => { setIsMenuOpen(false); router.push(`/parties/customer/edit?id=${customer.id}`); }} style={menuItemStyle}>
                                        <FiEdit2 size={20} /> Edit Customer
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={handleDownloadExcel} style={menuItemStyle}>
                                        <FiFileText size={20} /> Download Ledger Excel
                                    </div>
                                    <div onClick={handleDownloadPDF} style={menuItemStyle}>
                                        <FiFile size={20} /> Download Ledger Pdf
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={() => { setIsMenuOpen(false); router.push(`/invoice/create?customerId=${customer.id}`); }} style={menuItemStyle}>
                                        <FiPlusSquare size={20} /> Create Invoice
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={() => alert('Merge functionality coming soon')} style={menuItemStyle}>
                                        <FiGitMerge size={20} /> Merge
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={handleDeleteCustomer} style={{ ...menuItemStyle, color: '#dc2626' }}>
                                        <FiTrash2 size={20} /> Delete Customer
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff',
                        color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 'bold', marginBottom: '12px'
                    }}>
                        {customer.name[0]}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{customer.name}</div>
                    <div style={{ fontSize: '16px', color: '#dc2626', fontWeight: 600 }}>
                        ₹ {customer.balance?.toFixed(2) || '0.00'}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: '8px' }}>
                    <div onClick={handleWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiMessageCircle size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>WhatsApp</span>
                    </div>
                    <div onClick={handleCall} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiPhone size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Call</span>
                    </div>
                    <div onClick={handleEmail} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiMail size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Mail</span>
                    </div>
                    <div onClick={handleShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiShare2 size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Share</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: 'white', display: 'flex', borderBottom: '1px solid #eee' }}>
                <div
                    onClick={() => setActiveTab('ledger')}
                    style={{
                        flex: 1, textAlign: 'center', padding: '16px', fontWeight: 600, cursor: 'pointer',
                        color: activeTab === 'ledger' ? '#2563eb' : '#6b7280',
                        borderBottom: activeTab === 'ledger' ? '2px solid #2563eb' : 'none'
                    }}
                >
                    Ledger
                </div>
                <div
                    onClick={() => setActiveTab('transactions')}
                    style={{
                        flex: 1, textAlign: 'center', padding: '16px', fontWeight: 600, cursor: 'pointer',
                        color: activeTab === 'transactions' ? '#2563eb' : '#6b7280',
                        borderBottom: activeTab === 'transactions' ? '2px solid #2563eb' : 'none'
                    }}
                >
                    Transactions
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No transactions found</div>
                ) : (
                    transactions.map(tx => (
                        <TransactionCard
                            key={tx.id}
                            transaction={tx}
                            onClick={() => setSelectedInvoice(tx.data)}
                        />
                    ))
                )}
            </div>

            {/* Footer Actions */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px',
                display: 'flex', gap: '16px', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={() => router.push(`/parties/payment/create?customerId=${customer.id}&mode=out`)}
                    style={{
                        flex: 1, background: '#dc2626', color: 'white', padding: '16px', borderRadius: '8px',
                        border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                    }}>
                    YOU GAVE ₹
                </button>
                <button
                    onClick={() => router.push(`/parties/payment/create?customerId=${customer.id}`)}
                    style={{
                        flex: 1, background: '#16a34a', color: 'white', padding: '16px', borderRadius: '8px',
                        border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                    }}>
                    YOU GOT ₹
                </button>
            </div>

            <InvoiceBottomSheet
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
                onRecordPayment={() => alert('Record Payment Coming Soon')}
                onShare={() => alert('Share functionality already implemented in Invoice View')}
            />
        </div>
    );
}

export default function CustomerLedgerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CustomerLedgerContent />
        </Suspense>
    );
}
