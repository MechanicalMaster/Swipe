'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { api } from '@/api/backendClient';
import { FiUser, FiSettings, FiChevronRight, FiBriefcase, FiUsers, FiFileText, FiCreditCard, FiEdit3, FiBookOpen, FiBox, FiTerminal, FiDownload } from 'react-icons/fi';
import { DIAGNOSTICS_ENABLED } from '@/lib/utils/isDiagnosticsEnabled';
import styles from './page.module.css';

const baseMenuItems = [
    {
        title: 'Profile',
        items: [
            { label: 'Company Details', icon: FiBriefcase, href: '/more/company' },
            { label: 'User Profile', icon: FiUser, href: '/more/profile' },
            { label: 'Users & Roles', icon: FiUsers, href: '/coming-soon' },
        ]
    },
    {
        title: 'Bills',
        items: [
            { label: 'Expenses', icon: FiCreditCard, href: '/more/bills/expenses' },
        ]
    },
    {
        title: 'Masters',
        items: [
            { label: 'Product Master', icon: FiBox, href: '/more/masters/products' },
        ]
    },
    {
        title: 'Settings',
        items: [
            { label: 'Document Settings', icon: FiFileText, href: '/coming-soon' },
            { label: 'General Settings', icon: FiSettings, href: '/coming-soon' },
            { label: 'Server Config', icon: FiSettings, href: '/more/server-config' },
            { label: 'Invoice Templates', icon: FiFileText, href: '/more/templates' },
            { label: 'Lending Bill Template', icon: FiFileText, href: '/more/templates/lending' },
            { label: 'Label Templates', icon: FiFileText, href: '/more/label-templates' },
            { label: 'Bank', icon: FiCreditCard, href: '/coming-soon' },
            { label: 'Signature', icon: FiEdit3, href: '/coming-soon' },
            { label: 'Notes & Terms', icon: FiBookOpen, href: '/coming-soon' },
        ]
    }
];

export default function MorePage() {
    const { companyDetails, loadSettings } = useSettingsStore();
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupError, setBackupError] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const handleCreateBackup = async () => {
        setBackupLoading(true);
        setBackupError(null);

        try {
            const result = await api.ops.createBackup();

            // Fetch the file with Authorization header
            const downloadUrl = api.ops.downloadBackup(result.filename);
            const token = localStorage.getItem('auth_token');

            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download backup');
            }

            // Create blob and trigger download
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up blob URL
            URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error('Backup failed:', error);

            // Handle specific error cases
            if (error.status === 409) {
                setBackupError('Backup already in progress. Please wait.');
            } else {
                setBackupError(error.message || 'Failed to create backup. Please try again.');
            }

            // Clear error after 5 seconds
            setTimeout(() => setBackupError(null), 5000);
        } finally {
            setBackupLoading(false);
        }
    };

    // Conditionally add menu items
    const menuItems = useMemo(() => {
        return baseMenuItems.map(section => {
            if (section.title === 'Settings') {
                // Find position after Server Config for backup
                const serverConfigIndex = section.items.findIndex(item => item.label === 'Server Config');
                const insertIndex = serverConfigIndex >= 0 ? serverConfigIndex + 1 : section.items.length;

                const newItems = [...section.items];
                // Add backup option after Server Config
                newItems.splice(insertIndex, 0, { label: 'Create Backup', icon: FiDownload, onClick: 'backup' });

                // Add Diagnostics at the end if enabled
                if (DIAGNOSTICS_ENABLED) {
                    newItems.push({ label: 'Diagnostics', icon: FiTerminal, href: '/more/diagnostics' });
                }

                return {
                    ...section,
                    items: newItems
                };
            }
            return section;
        });
    }, []);

    return (
        <div className={styles.container}>
            {backupError && (
                <div style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    {backupError}
                </div>
            )}

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
                        {section.items.map((item, itemIdx) => {
                            // Handle backup action (not a link)
                            if (item.onClick === 'backup') {
                                return (
                                    <div
                                        key={itemIdx}
                                        className={styles.menuItem}
                                        onClick={backupLoading ? undefined : handleCreateBackup}
                                        style={{
                                            cursor: backupLoading ? 'not-allowed' : 'pointer',
                                            opacity: backupLoading ? 0.6 : 1
                                        }}
                                    >
                                        <div className={styles.menuIcon}>
                                            <item.icon />
                                        </div>
                                        <div className={styles.menuLabel}>
                                            {backupLoading ? 'Creating Backup...' : item.label}
                                        </div>
                                        {backupLoading ? (
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #E5E7EB',
                                                borderTop: '2px solid #3B82F6',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                        ) : (
                                            <FiChevronRight className={styles.menuArrow} />
                                        )}
                                    </div>
                                );
                            }

                            // Regular link items
                            return (
                                <Link key={itemIdx} href={item.href} className={styles.menuItem}>
                                    <div className={styles.menuIcon}>
                                        <item.icon />
                                    </div>
                                    <div className={styles.menuLabel}>{item.label}</div>
                                    <FiChevronRight className={styles.menuArrow} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
