'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils/tax';
import { FiPlus, FiHeadphones } from 'react-icons/fi';
import styles from './page.module.css';

import ComingSoon from '@/components/ComingSoon';

export default function BillsPage() {
    const [activeTab, setActiveTab] = useState('sales');
    const [invoices, setInvoices] = useState([]);
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const inv = await db.invoices.toArray();
            const pur = await db.purchases.toArray();
            setInvoices(inv.reverse());
            setPurchases(pur.reverse());
        };
        loadData();
    }, []);

    const currentList = activeTab === 'sales' ? invoices : purchases;
    const createLink = activeTab === 'sales' ? '/invoice/create' : '/bills/purchase/create';
    const createLabel = activeTab === 'sales' ? 'INVOICE' : 'PURCHASE';

    if (activeTab === 'quotations') {
        return (
            <div className={styles.container}>
                <div className={styles.tabs}>
                    {['Sales', 'Purchases', 'Quotations'].map((tab) => (
                        <div
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
                <ComingSoon showBackButton={false} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {['Sales', 'Purchases', 'Quotations'].map((tab) => (
                    <div
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div className={styles.summaryCard}>
                <div>
                    <div className={styles.summaryLabel}>Total Amount</div>
                    <div className={styles.summaryAmount}>₹0.00</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className={styles.summaryLabel}>Pending</div>
                    <div className={`${styles.summaryAmount} ${styles.pending}`}>₹0.00</div>
                </div>
            </div>

            <div className={styles.filterRow}>
                <div className={`${styles.filterChip} ${styles.activeFilter}`}>All Transactions</div>
                <div className={styles.filterChip}>Paid</div>
                <div className={styles.filterChip}>Pending</div>
                <div className={styles.filterChip}>Cancelled</div>
            </div>

            {currentList.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptySub}>
                        There are no {activeTab} for This Year. Please choose different dates or create a new {activeTab === 'sales' ? 'invoice' : 'purchase'}.
                    </div>
                    <Link href={createLink} className={styles.link}>
                        Create {activeTab === 'sales' ? 'Invoice' : 'Purchase'}
                    </Link>
                </div>
            ) : (
                <div>
                    {currentList.map((item) => (
                        <div key={item.id} className={styles.listItem} onClick={() => {
                            if (activeTab === 'sales') {
                                window.location.href = `/invoice/view?id=${item.id}`;
                            } else {
                                // Placeholder for purchase view
                                alert('Purchase view coming soon');
                            }
                        }}>
                            <div className={styles.itemMain}>
                                <div className={styles.itemTitle}>
                                    {item.invoiceNumber || item.purchaseNumber}
                                    <span style={{ gap: 4, display: 'flex', alignItems: 'center' }}>
                                        {item.type === 'PROFORMA' && (
                                            <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '1px 4px', borderRadius: 2 }}>PRO FORMA</span>
                                        )}
                                        {item.type === 'LENDING' && (
                                            <span style={{ fontSize: 10, background: '#f3f4f6', color: '#374151', padding: '1px 4px', borderRadius: 2 }}>LENDING</span>
                                        )}
                                        <span className={styles.status}>{item.status}</span>
                                    </span>
                                </div>
                                <div className={styles.itemSub}>{item.date}</div>
                            </div>
                            <div className={styles.itemAmount}>
                                {formatCurrency(item.totals?.total || 0)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Link href={createLink}>
                <div className={styles.fab}>
                    <FiPlus /> {createLabel}
                </div>
            </Link>
        </div>
    );
}
