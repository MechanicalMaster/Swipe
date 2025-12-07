'use client';

import { db } from '@/lib/db';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { usePurchaseStore } from '@/lib/store/purchaseStore';
import { FiArrowLeft, FiPhone, FiMail, FiShare2, FiMessageCircle, FiEdit2, FiMoreHorizontal, FiFileText, FiFile, FiPlusSquare, FiGitMerge, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionCard } from '@/components/TransactionCard';

function VendorLedgerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { getVendor, deleteVendor } = usePartyStore();
    const { purchases, loadPurchases } = usePurchaseStore ? usePurchaseStore() : { purchases: [], loadPurchases: () => { } };

    const [vendor, setVendor] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('ledger');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleWhatsApp = () => {
        if (vendor.phone) {
            const cleanNumber = vendor.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanNumber}`, '_blank');
        } else {
            alert('Phone number not available');
        }
    };

    const handleCall = () => {
        if (vendor.phone) {
            window.open(`tel:${vendor.phone}`, '_self');
        } else {
            alert('Phone number not available');
        }
    };

    const handleEmail = () => {
        if (vendor.email) {
            window.open(`mailto:${vendor.email}`, '_self');
        } else {
            alert('Email not available');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Vendor Details',
            text: `Vendor: ${vendor.name}\nPhone: ${vendor.phone || 'N/A'}\nBalance: ₹${vendor.balance?.toFixed(2) || '0.00'}`,
            dialogTitle: 'Share Vendor Details'
        };

        try {
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
            utils.exportToCSV(data, `${vendor.name}_ledger.csv`);
        });
        setIsMenuOpen(false);
    };

    const handleDownloadPDF = () => {
        import('@/lib/utils/exportUtils').then(utils => {
            utils.exportToPDF(vendor, transactions, `${vendor.name}_ledger.pdf`);
        });
        setIsMenuOpen(false);
    };

    const handleDeleteVendor = async () => {
        if (confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
            await deleteVendor(vendor.id);
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
            const v = getVendor(id);
            if (v) setVendor(v);
            if (loadPurchases) loadPurchases();
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            if (vendor) {
                // Get Purchases from 'purchases' table (vendor invoices)
                const allPurchaseRecords = purchases?.filter(p =>
                    p.vendorId === vendor.id || p.vendor?.id === vendor.id
                ) || [];

                // Get Payments from 'payments' table for this vendor
                const vendorPayments = await db.payments.where('partyId').equals(vendor.id).and(p => p.partyType === 'VENDOR').toArray();

                const purchaseTxs = allPurchaseRecords.map(p => ({
                    id: `pur-${p.id}`,
                    date: p.date,
                    type: 'purchase',
                    number: p.purchaseNumber,
                    amount: p.totals?.total || 0,
                    status: p.status || 'Unpaid',
                    balance: p.balanceDue !== undefined ? p.balanceDue : (p.totals?.total || 0),
                    data: p
                }));

                const paymentTxs = vendorPayments.map(pay => ({
                    id: `pay-${pay.id}`,
                    date: pay.date,
                    type: pay.type === 'OUT' ? 'payment_out' : 'payment_in',
                    number: pay.transactionNumber,
                    amount: pay.amount,
                    status: 'Paid',
                    balance: 0,
                    data: pay
                }));

                const allTxs = [...purchaseTxs, ...paymentTxs];
                allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(allTxs);
            }
        };
        loadData();
    }, [vendor, purchases]);

    if (!vendor) return <div>Loading...</div>;

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
                                    <div onClick={() => { setIsMenuOpen(false); router.push(`/parties/vendor/edit?id=${vendor.id}`); }} style={menuItemStyle}>
                                        <FiEdit2 size={20} /> Edit Vendor
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={handleDownloadExcel} style={menuItemStyle}>
                                        <FiFileText size={20} /> Download Ledger Excel
                                    </div>
                                    <div onClick={handleDownloadPDF} style={menuItemStyle}>
                                        <FiFile size={20} /> Download Ledger Pdf
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={() => { setIsMenuOpen(false); router.push(`/purchase/create?vendorId=${vendor.id}`); }} style={menuItemStyle}>
                                        <FiPlusSquare size={20} /> Create Purchase Order
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={() => alert('Merge functionality coming soon')} style={menuItemStyle}>
                                        <FiGitMerge size={20} /> Merge
                                    </div>
                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <div onClick={handleDeleteVendor} style={{ ...menuItemStyle, color: '#dc2626' }}>
                                        <FiTrash2 size={20} /> Delete Vendor
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: '#fef3c7',
                        color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 'bold', marginBottom: '12px'
                    }}>
                        {vendor.name[0]}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{vendor.name}</div>
                    <div style={{ fontSize: '16px', color: vendor.balance > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        ₹ {Math.abs(vendor.balance || 0).toFixed(2)}
                        <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                            {(vendor.balance || 0) > 0 ? '(You owe)' : (vendor.balance || 0) < 0 ? '(They owe)' : ''}
                        </span>
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
                            onClick={() => { }}
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
                    onClick={() => router.push(`/parties/payment/create?vendorId=${vendor.id}&partyType=vendor&mode=out`)}
                    style={{
                        flex: 1, background: '#dc2626', color: 'white', padding: '16px', borderRadius: '8px',
                        border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                    }}>
                    YOU GAVE ₹
                </button>
                <button
                    onClick={() => router.push(`/parties/payment/create?vendorId=${vendor.id}&partyType=vendor&mode=in`)}
                    style={{
                        flex: 1, background: '#16a34a', color: 'white', padding: '16px', borderRadius: '8px',
                        border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                    }}>
                    YOU GOT ₹
                </button>
            </div>
        </div>
    );
}

export default function VendorLedgerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VendorLedgerContent />
        </Suspense>
    );
}
