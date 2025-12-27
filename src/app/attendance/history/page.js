'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAttendanceStore } from '@/lib/store/attendanceStore';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import styles from '../page.module.css'; // Reusing styles

export default function AttendanceHistoryPage() {
    const router = useRouter();
    const { history, isLoading, loadHistory } = useAttendanceStore();

    const userId = '1'; // Default user ID

    useEffect(() => {
        loadHistory(userId, 100); // Load more history for this page
    }, [loadHistory]);

    const formatFullDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <FiArrowLeft />
                </button>
                <div>
                    <div className={styles.title}>Attendance History</div>
                    <div className={styles.subtext}>All your login records</div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.historySection}>
                    <div className={styles.historyList}>
                        {isLoading ? (
                            <div className={styles.emptyState}>Loading...</div>
                        ) : history.length === 0 ? (
                            <div className={styles.emptyState}>No history available</div>
                        ) : (
                            history.map(log => (
                                <div key={log.id} className={styles.historyItem}>
                                    <div>
                                        <div className={styles.historyDate}>
                                            {formatFullDate(log.loginDate)}
                                        </div>
                                        <div className={styles.historyTime}>
                                            Login at {formatTime(log.loginAt || log.loginTimestamp)}
                                        </div>
                                    </div>
                                    <div className={styles.statusTag}>Present</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
