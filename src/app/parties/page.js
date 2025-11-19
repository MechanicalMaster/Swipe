'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiUsers, FiSearch, FiMoreHorizontal } from 'react-icons/fi';
import styles from './page.module.css';

export default function PartiesPage() {
    const [activeTab, setActiveTab] = useState('customers');
    const { customers, vendors, loadParties } = usePartyStore();

    useEffect(() => {
        loadParties();
    }, []);

    const currentList = activeTab === 'customers' ? customers : vendors;

    return (
        <div className={styles.container}>
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
            </div>

            <div className={styles.summaryRow}>
                <div className={`${styles.summaryCard} ${styles.collectCard}`}>
                    <span className={styles.summaryLabel}>You Collect:</span>
                    <span className={styles.summaryAmount}>₹ 0</span>
                </div>
                <div className={`${styles.summaryCard} ${styles.payCard}`}>
                    <span className={styles.summaryLabel}>You Pay:</span>
                    <span className={styles.summaryAmount}>₹ 0</span>
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
                    <button className={styles.secondaryButton}>
                        Import {activeTab === 'customers' ? 'Customers' : 'Vendors'}
                    </button>
                </div>
            ) : (
                <div className={styles.list}>
                    {currentList.map((item) => (
                        <div key={item.id} className={styles.listItem}>
                            <div className={styles.avatar}>{item.name[0]}</div>
                            <div className={styles.info}>
                                <div className={styles.name}>{item.name}</div>
                                <div className={styles.subtext}>No dues</div>
                            </div>
                        </div>
                    ))}
                    <Link href={`/parties/${activeTab === 'customers' ? 'customer' : 'vendor'}/add`} style={{ position: 'fixed', bottom: 80, right: 16 }}>
                        <button className={styles.addButton} style={{ width: 'auto', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            + New {activeTab === 'customers' ? 'Customer' : 'Vendor'}
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
