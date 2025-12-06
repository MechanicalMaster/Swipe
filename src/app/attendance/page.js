'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { FiArrowLeft, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

export default function AttendancePage() {
    const router = useRouter();
    const [todayLogin, setTodayLogin] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkLoginStatus = async () => {
        try {
            // Get today's date string YYYY-MM-DD
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // Check if record exists for today
            // Assuming simple single user for now as per app structure, or userId=1
            const record = await db.attendance_log
                .where('loginDate')
                .equals(todayStr)
                .first();

            setTodayLogin(record || null);

            // Load last 5 history items
            const recentLogs = await db.attendance_log
                .orderBy('loginTimestamp')
                .reverse()
                .limit(5)
                .toArray();

            setHistory(recentLogs);
        } catch (error) {
            console.error('Error checking attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const handleLogin = async () => {
        try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // Double check
            const exists = await db.attendance_log
                .where('loginDate')
                .equals(todayStr)
                .first();

            if (exists) {
                alert('Already logged in for today!');
                setTodayLogin(exists);
                return;
            }

            const newRecord = {
                userId: 1, // Default user
                loginDate: todayStr,
                loginTimestamp: now.toISOString(),
                created_at: now.toISOString()
            };

            await db.attendance_log.add(newRecord);
            await checkLoginStatus(); // Refresh

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
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    if (loading) return <div className={styles.container}><div className={styles.content}>Loading...</div></div>;

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

                    {todayLogin ? (
                        <div className={styles.successBadge}>
                            <FiCheckCircle className={styles.successIcon} />
                            <div className={styles.timeDisplay}>
                                {formatTime(todayLogin.loginTimestamp)}
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
                                            {formatTime(log.loginTimestamp)}
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
