'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiArrowLeft, FiPhone, FiMail, FiShare2, FiMessageCircle, FiEdit2 } from 'react-icons/fi';
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

    useEffect(() => {
        if (id) {
            const c = getCustomer(id);
            if (c) setCustomer(c);
            loadInvoices();
        }
    }, [id]);

    useEffect(() => {
        if (customer && invoices.length > 0) {
            const customerInvoices = invoices.filter(inv => inv.customer?.name === customer.name);

            const txs = customerInvoices.map(inv => ({
                id: inv.id,
                date: inv.date,
                type: 'invoice',
                number: inv.invoiceNumber,
                amount: inv.total,
                status: 'pending',
                balance: inv.total,
                data: inv
            }));
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
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <FiEdit2 size={20} onClick={() => router.push(`/parties/customer/edit?id=${customer.id}`)} style={{ cursor: 'pointer' }} />
                    </div>
                </div>

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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiMessageCircle size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>WhatsApp</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiPhone size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Call</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #eee' }}><FiMail size={20} color="#2563eb" /></div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Mail</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
                <button style={{
                    flex: 1, background: '#dc2626', color: 'white', padding: '16px', borderRadius: '8px',
                    border: 'none', fontWeight: 'bold', fontSize: '16px'
                }}>
                    YOU GAVE ₹
                </button>
                <button style={{
                    flex: 1, background: '#16a34a', color: 'white', padding: '16px', borderRadius: '8px',
                    border: 'none', fontWeight: 'bold', fontSize: '16px'
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
