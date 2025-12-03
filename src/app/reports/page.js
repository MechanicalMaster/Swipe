'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import styles from './page.module.css';

const reportSections = [
    {
        title: 'Taxes',
        items: [
            'GSTR – 1',
            'GSTR – 2B',
            'GSTR – 3B',
            'GSTR – 7',
            'Sale Summary by HSN',
            'IUS Receivable',
            'TDS Payable',
            'TCS Receivable',
            'ICS Payable',
        ],
    },
    {
        title: 'Transaction Reports',
        items: [
            'Sales',
            'Purchases',
            'Sale Returns / Credit Notes',
            'Purchase Returns / Debit Notes',
            'Quotations',
            'Sales Orders (NEW)',
            'Delivery Challans',
            'Pro Forma Invoices',
            'Purchase Orders',
            'Payments',
            'Indirect Income',
            'Category-Wise Expenses',
            'Category-Wise Indirect Income',
        ],
    },
    {
        title: 'Bill-wise Item Reports',
        items: [
            'Sales',
            'Purchases',
            'Sale Returns / Credit Notes',
            'Purchase Returns / Debit Notes',
            'Quotations',
            'Sales Orders (NEW)',
            'Delivery Challans',
            'Pro Forma Invoices',
            'Purchase Orders',
        ],
    },
    {
        title: 'Item Reports',
        items: [
            'Stock Summary',
            'Item-wise Discount',
            'Stock Value',
            'Inventory Timeline',
            'Low Stock (NEW)',
        ],
    },
    {
        title: 'Party Reports',
        items: [
            'All Customers',
            'All Vendors',
            'Customer Statement',
            'Vendor Statement',
            'Customer-wise Items',
            'Vendor-wise Items',
        ],
    },
    {
        title: 'Profit & Loss (P/L) Reports',
        items: [
            'P/L Statement',
            'Seller P/L Report',
            'Sale Items P/L Report',
            'Item-wise P/L (Purchases)',
            'Item-wise P/L Report (Purchase Price)',
            'Category-wise P/L Report (Purchase Price)',
            'Customer-wise P/L Statement',
        ],
    },
    {
        title: 'Payments Reports',
        items: [
            'Payment Timeline',
            'Payouts',
        ],
    },
    {
        title: 'Other Reports',
        items: [
            'Day Book',
            'Document Conversion',
        ],
    },
];

export default function ReportsPage() {
    const router = useRouter();
    // Initialize with all sections collapsed or expanded as per preference. 
    // The screenshot shows them collapsed, so we'll start with empty or specific ones if needed.
    // Let's keep them all collapsed initially to match the clean look, or maybe just the first one?
    // The screenshot shows all collapsed.
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (index) => {
        setExpandedSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <FiChevronLeft />
                </button>
                <h1 className={styles.title}>Reports</h1>
            </header>

            <div className={styles.content}>
                {reportSections.map((section, index) => (
                    <div key={index} className={styles.section}>
                        <div
                            className={styles.sectionHeader}
                            onClick={() => toggleSection(index)}
                        >
                            <span className={styles.sectionTitle}>{section.title}</span>
                            <FiChevronDown
                                className={`${styles.chevron} ${expandedSections[index] ? styles.expanded : ''}`}
                            />
                        </div>
                        {expandedSections[index] && (
                            <div className={styles.reportList}>
                                {section.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className={styles.reportItem}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
