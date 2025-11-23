'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiUsers, FiFilter, FiPlus } from 'react-icons/fi';
import { PartyListItem } from '@/components/PartyListItem';
import styles from './page.module.css';

export default function PartiesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('customers');
    const { customers, vendors, loadParties } = usePartyStore();

    useEffect(() => {
        loadParties();
    }, []);

    const currentList = activeTab === 'customers' ? customers : vendors;

    // Calculate totals
    const totalCollect = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);
    const totalPay = customers.reduce((acc, c) => acc + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

    return (
        <div className={styles.container}>
            {/* Sticky Header Container */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f3f4f6' }}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    <div
                        className={`${styles.tab} ${activeTab === 'customers' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        Customers
                    </div>
                    <div
                        className={`${styles.tab} ${activeTab === 'vendors' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('vendors')}
                    >
                        Vendors
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <FiUsers size={20} color="#6b7280" />
                        <FiFilter size={20} color="#6b7280" />
                    </div>
                </div>

                {/* Summary Row */}
                <div className={styles.summaryRow}>
                    <div className={`${styles.summaryCard} ${styles.collectCard}`}>
                        <span className={styles.summaryLabel}>You Collect:</span>
                        <span className={styles.summaryAmount} style={{ color: '#16a34a' }}>₹ {totalCollect.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.summaryCard} ${styles.payCard}`}>
                        <span className={styles.summaryLabel}>You Pay:</span>
                        <span className={styles.summaryAmount} style={{ color: '#dc2626' }}>₹ {totalPay.toFixed(2)}</span>
                    </div>
                </div>

                {/* Sort/Filter Row */}
                <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: '#111827', display: 'flex', gap: '16px' }}>
                        <span>Sort</span>
                        <span style={{ fontWeight: 700 }}>Default</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#111827', fontWeight: 600 }}>
                        <FiFilter size={16} /> Filter
                    </div>
                </div>
            </div>

            {currentList.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiUsers className={styles.emptyIcon} />
                    <div className={styles.emptyText}>
                        No {activeTab} to show
                    </div>
                    <Link href={`/parties/${activeTab === 'customers' ? 'customer' : 'vendor'}/add`} style={{ width: '100%' }}>
                        <button className={styles.addButton}>
                            Add {activeTab === 'customers' ? 'Customer' : 'Vendor'}
                        </button>
                    </Link>
                </div>
            ) : (
                <div className={styles.list}>
                    {currentList.map((item) => (
                        <PartyListItem
                            key={item.id}
                            party={item}
                            onClick={() => router.push(`/parties/customer/view?id=${item.id}`)}
                        />
                    ))}
                </div>
            )}

            <Link href={`/parties/${activeTab === 'customers' ? 'customer' : 'vendor'}/add`}>
                <button
                    style={{
                        position: 'fixed',
                        bottom: 80,
                        right: 16,
                        background: '#2563eb',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 20
                    }}
                >
                    <FiPlus size={20} /> NEW CUSTOMER
                </button>
            </Link>
        </div>
    );
}
