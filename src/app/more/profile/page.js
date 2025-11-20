'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useAuthStore } from '@/lib/store/authStore';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiTrash2, FiLogOut, FiChevronRight } from 'react-icons/fi';
import styles from './page.module.css';

export default function UserProfilePage() {
    const { userProfile, loadSettings, resetData } = useSettingsStore();
    const { logout } = useAuthStore();

    useEffect(() => {
        loadSettings();
    }, []);

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            await resetData();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/more"><FiArrowLeft size={24} /></Link>
                User Profile
            </div>

            <div className={styles.sectionLabel}>User Details</div>
            <div className={styles.card}>
                <div className={styles.item}>
                    <FiUser className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>User Name</div>
                        <div className={styles.subLabel}>{userProfile.name || 'Add User Name'}</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
                <div className={styles.item}>
                    <FiMail className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>Email Address</div>
                        <div className={styles.subLabel}>{userProfile.email || 'Add Email Address'}</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
                <div className={styles.item}>
                    <FiPhone className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>Phone Number</div>
                        <div className={styles.subLabel}>{userProfile.phone || '8454881721'}</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
            </div>

            <div className={styles.sectionLabel}>Privacy Settings</div>
            <div className={styles.card}>
                <div className={styles.item} onClick={handleReset}>
                    <FiTrash2 className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>Reset Data</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
                <div className={styles.dangerItem}>
                    <FiUser className={styles.dangerIcon} />
                    <div className={styles.dangerLabel}>Delete Account</div>
                    <FiChevronRight className={styles.arrow} />
                </div>
                <div className={styles.item} onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                        logout();
                    }
                }}>
                    <FiLogOut className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>Logout</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
                <div className={styles.item} onClick={() => alert('This feature is coming soon')}>
                    <FiLogOut className={styles.icon} />
                    <div className={styles.content}>
                        <div className={styles.label}>Logout from all devices</div>
                    </div>
                    <FiChevronRight className={styles.arrow} />
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.supportButton}>
                    Support Code <span style={{ color: 'var(--primary)' }}>***</span>
                </button>
            </div>
        </div>
    );
}
