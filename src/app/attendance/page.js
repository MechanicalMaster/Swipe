'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAttendanceStore } from '@/lib/store/attendanceStore';
import { FiArrowLeft, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

export default function AttendancePage() {
    const router = useRouter();
    const {
        todayAttendance,
        history,
        isLoggedIn,
        isLoading,
        login,
        checkTodayStatus,
        loadHistory
    } = useAttendanceStore();

    const userId = '1'; // Default user ID

    useEffect(() => {
        checkTodayStatus(userId);
        loadHistory(userId, 5);
    }, [checkTodayStatus, loadHistory]);

    const handleLogin = async () => {
        try {
            await login(userId);
        } catch (error) {
            console.error('Login failed:', error);
            alert('Failed to record login. Please try again.');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    if (isLoading) return <div className={styles.container}><div className={styles.content}>Loading...</div></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <FiArrowLeft />
                </button>
                <div>
                    <div className={styles.title}>Daily Attendance</div>
                    <div className={styles.subtext}>Record your login for today</div>
                </div>
            </div>

            <div className={styles.content}>

                {/* Status Card */}
                <div className={styles.statusCard}>
                    <div className={styles.dateDisplay}>
                        {formatDate(new Date())}
                    </div>

                    {todayAttendance ? (
                        <div className={styles.successBadge}>
                            <FiCheckCircle className={styles.successIcon} />
                            <div className={styles.timeDisplay}>
                                {formatTime(todayAttendance.loginAt || todayAttendance.loginTimestamp)}
                            </div>
                            <div className={styles.statusLabel}>
                                Present Today
                            </div>
                        </div>
                    ) : (
                        <button className={styles.loginButton} onClick={handleLogin}>
                            <FiClock /> Log In Now
                        </button>
                    )}
                </div>

                {/* History Preview */}
                <div className={styles.historySection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>Recent Activity</div>
                        <Link href="/attendance/history" className={styles.viewAllLink}>
                            View Full History
                        </Link>
                    </div>

                    <div className={styles.historyList}>
                        {history.length === 0 ? (
                            <div className={styles.emptyState}>No attendance records found</div>
                        ) : (
                            history.map(log => (
                                <div key={log.id} className={styles.historyItem}>
                                    <div>
                                        <div className={styles.historyDate}>
                                            {new Date(log.loginDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className={styles.historyTime}>
                                            {formatTime(log.loginAt || log.loginTimestamp)}
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
