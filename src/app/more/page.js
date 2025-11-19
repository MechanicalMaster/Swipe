'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { FiUser, FiSettings, FiChevronRight, FiBriefcase, FiUsers, FiFileText, FiCreditCard, FiEdit3, FiBookOpen } from 'react-icons/fi';
import styles from './page.module.css';

const menuItems = [
    {
        title: 'Profile',
        items: [
            { label: 'Company Details', icon: FiBriefcase, href: '/more/company' },
            { label: 'User Profile', icon: FiUser, href: '/more/profile' },
            { label: 'Users & Roles', icon: FiUsers, href: '#' },
        ]
    },
    {
        title: 'Settings',
        items: [
            { label: 'Document Settings', icon: FiFileText, href: '#' },
            { label: 'General Settings', icon: FiSettings, href: '#' },
            { label: 'Invoice Templates', icon: FiFileText, href: '#' },
            { label: 'Bank', icon: FiCreditCard, href: '#' },
            { label: 'Signature', icon: FiEdit3, href: '#' },
            { label: 'Notes & Terms', icon: FiBookOpen, href: '#' },
        ]
    }
];

export default function MorePage() {
    const { companyDetails, loadSettings } = useSettingsStore();

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {companyDetails.name ? companyDetails.name[0].toUpperCase() : 'S'}
                </div>
                <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{companyDetails.name || 'Set Company Name'}</div>
                    <div className={styles.profileSub}>{companyDetails.gstin || 'Add GST Details'}</div>
                </div>
            </div>

            {menuItems.map((section, idx) => (
                <div key={idx}>
                    <div className={styles.sectionTitle}>{section.title}</div>
                    <div className={styles.menuGroup}>
                        {section.items.map((item, itemIdx) => (
                            <Link key={itemIdx} href={item.href} className={styles.menuItem}>
                                <div className={styles.menuIcon}>
                                    <item.icon />
                                </div>
                                <div className={styles.menuLabel}>{item.label}</div>
                                <FiChevronRight className={styles.menuArrow} />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
