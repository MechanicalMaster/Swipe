'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { api } from '@/api/backendClient';
import { FiUser, FiSettings, FiChevronRight, FiBriefcase, FiUsers, FiFileText, FiCreditCard, FiEdit3, FiBookOpen, FiBox, FiTerminal, FiDownload, FiUpload } from 'react-icons/fi';
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
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [restoreError, setRestoreError] = useState(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [pendingRestoreFile, setPendingRestoreFile] = useState(null);
    const fileInputRef = useRef(null);

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

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.zip')) {
            setRestoreError('Only ZIP files are allowed');
            setTimeout(() => setRestoreError(null), 5000);
            return;
        }

        // Show confirmation dialog
        setPendingRestoreFile(file);
        setShowRestoreConfirm(true);

        // Reset file input
        e.target.value = '';
    };

    const handleRestoreConfirm = async () => {
        if (!pendingRestoreFile) return;

        setShowRestoreConfirm(false);
        setRestoreLoading(true);
        setRestoreError(null);

        try {
            const result = await api.ops.restoreBackup(pendingRestoreFile);

            // Show success message - server will shut down
            alert(`Restore complete! ${result.photosRestored} photos restored. The server will restart - please wait and refresh the page.`);

        } catch (error) {
            console.error('Restore failed:', error);

            if (error.status === 403) {
                setRestoreError('Admin access required for restore operations');
            } else if (error.status === 409) {
                setRestoreError('Restore already in progress. Please wait.');
            } else if (error.status === 415) {
                setRestoreError('Only ZIP files are allowed');
            } else {
                setRestoreError(error.message || 'Failed to restore backup. Please try again.');
            }

            setTimeout(() => setRestoreError(null), 5000);
        } finally {
            setRestoreLoading(false);
            setPendingRestoreFile(null);
        }
    };

    const handleRestoreCancel = () => {
        setShowRestoreConfirm(false);
        setPendingRestoreFile(null);
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
                // Add restore option after backup
                newItems.splice(insertIndex + 1, 0, { label: 'Restore Backup', icon: FiUpload, onClick: 'restore' });

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

            {restoreError && (
                <div style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    {restoreError}
                </div>
            )}

            {/* Hidden file input for restore */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".zip"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {/* Restore confirmation dialog */}
            {showRestoreConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '16px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#DC2626' }}>
                            ⚠️ Confirm Restore
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                            This will <strong>permanently replace all current data</strong> with the backup contents.
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
                            File: {pendingRestoreFile?.name}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleRestoreCancel}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #D1D5DB',
                                    background: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRestoreConfirm}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#DC2626',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Restore
                            </button>
                        </div>
                    </div>
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

                            // Handle restore action
                            if (item.onClick === 'restore') {
                                return (
                                    <div
                                        key={itemIdx}
                                        className={styles.menuItem}
                                        onClick={restoreLoading ? undefined : handleRestoreClick}
                                        style={{
                                            cursor: restoreLoading ? 'not-allowed' : 'pointer',
                                            opacity: restoreLoading ? 0.6 : 1
                                        }}
                                    >
                                        <div className={styles.menuIcon}>
                                            <item.icon />
                                        </div>
                                        <div className={styles.menuLabel}>
                                            {restoreLoading ? 'Restoring...' : item.label}
                                        </div>
                                        {restoreLoading ? (
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
