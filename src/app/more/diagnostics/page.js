'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { DIAGNOSTICS_ENABLED } from '@/lib/utils/isDiagnosticsEnabled';
import styles from './page.module.css';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'audit'];
const PAGE_SIZE = 50;

export default function DiagnosticsPage() {
    const router = useRouter();

    // Guard: Return null if diagnostics not enabled (dead code in prod)
    if (!DIAGNOSTICS_ENABLED) {
        return null;
    }

    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [eventSearch, setEventSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [offset, setOffset] = useState(0);

    // UI State
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [excludeAudit, setExcludeAudit] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Load logs
    const loadLogs = useCallback(async (resetOffset = true) => {
        setLoading(true);
        setError(null);

        try {
            // Dynamic import to support tree-shaking
            const { getDevice } = await import('@/lib/logger/context');
            const device = getDevice();

            let storage;
            if (device !== 'web') {
                const { CapacitorStorage } = await import('@/lib/logger/storage/capacitorFs');
                storage = new CapacitorStorage();
            } else {
                const { IndexedDbStorage } = await import('@/lib/logger/storage/indexedDb');
                storage = new IndexedDbStorage();
            }
            await storage.init();

            const currentOffset = resetOffset ? 0 : offset;

            const result = await storage.query({
                levels: selectedLevels.length > 0 ? selectedLevels : undefined,
                event: eventSearch || undefined,
                startTime: startDate ? new Date(startDate).toISOString() : undefined,
                endTime: endDate ? new Date(endDate + 'T23:59:59').toISOString() : undefined,
                limit: PAGE_SIZE,
                offset: currentOffset,
            });

            if (resetOffset) {
                setLogs(result.entries);
                setOffset(PAGE_SIZE);
            } else {
                setLogs(prev => [...prev, ...result.entries]);
                setOffset(prev => prev + PAGE_SIZE);
            }

            setTotal(result.total);
            setHasMore(result.hasMore);
        } catch (e) {
            console.error('Failed to load logs:', e);
            setError('Failed to load logs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedLevels, eventSearch, startDate, endDate, offset]);

    // Initial load
    useEffect(() => {
        loadLogs(true);
    }, []);

    // Reload when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs(true);
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [selectedLevels, eventSearch, startDate, endDate]);

    // Toggle level filter
    const toggleLevel = (level) => {
        setSelectedLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    // Toggle log expansion
    const toggleExpand = (timestamp) => {
        setExpandedLogs(prev => {
            const next = new Set(prev);
            if (next.has(timestamp)) {
                next.delete(timestamp);
            } else {
                next.add(timestamp);
            }
            return next;
        });
    };

    // Export handler
    const handleExport = async () => {
        if (excludeAudit) {
            setShowExportDialog(true);
        } else {
            await performExport(true);
        }
    };

    const performExport = async (includeAudit) => {
        setExporting(true);
        setShowExportDialog(false);

        try {
            const { exportOrShareLogs } = await import('@/lib/logger/export');
            await exportOrShareLogs({
                includeAudit,
                applyRedaction: true,
                format: 'json',
            });
        } catch (e) {
            console.error('Export failed:', e);
            setError('Failed to export logs. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const formatTimestamp = (iso) => {
        const date = new Date(iso);
        return date.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <FiArrowLeft size={20} />
                </button>
                <h1 className={styles.title}>Diagnostics</h1>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Filters */}
            <div className={styles.filterBar}>
                <div className={styles.filterRow}>
                    {LOG_LEVELS.map(level => (
                        <button
                            key={level}
                            className={`${styles.levelChip} ${styles[level]} ${selectedLevels.includes(level) ? styles.active : ''}`}
                            onClick={() => toggleLevel(level)}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                <div className={styles.filterRow}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search events..."
                        value={eventSearch}
                        onChange={e => setEventSearch(e.target.value)}
                    />
                </div>
                <div className={styles.filterRow}>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        placeholder="Start date"
                    />
                    <span style={{ color: 'var(--text-muted)' }}>to</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        placeholder="End date"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={`${styles.exportButton} ${styles.primary}`}
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <FiDownload size={16} />
                    {exporting ? 'Exporting...' : 'Export Logs'}
                </button>
                <button className={styles.exportButton} onClick={() => loadLogs(true)} disabled={loading}>
                    <FiRefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                Showing {logs.length} of {total} logs
            </div>

            {/* Log List */}
            {loading && logs.length === 0 ? (
                <div className={styles.loading}>Loading logs...</div>
            ) : logs.length === 0 ? (
                <div className={styles.empty}>No logs found matching your filters.</div>
            ) : (
                <div className={styles.logList}>
                    {logs.map(log => (
                        <div
                            key={log.timestamp}
                            className={styles.logCard}
                            onClick={() => toggleExpand(log.timestamp)}
                        >
                            <div className={styles.logHeader}>
                                <span className={`${styles.levelBadge} ${styles[log.level]}`}>
                                    {log.level}
                                </span>
                                <span className={styles.timestamp}>{formatTimestamp(log.timestamp)}</span>
                            </div>
                            <div className={styles.eventName}>{log.event}</div>
                            <div className={styles.sessionInfo}>
                                Session: {log.sessionId?.slice(0, 8)}... | {log.device} | v{log.appVersion}
                            </div>

                            {Object.keys(log.context || {}).length > 0 && (
                                <div className={styles.contextWrapper}>
                                    <div className={styles.contextToggle}>
                                        {expandedLogs.has(log.timestamp) ? (
                                            <>
                                                <FiChevronUp size={14} /> Hide Context
                                            </>
                                        ) : (
                                            <>
                                                <FiChevronDown size={14} /> Show Context
                                            </>
                                        )}
                                    </div>
                                    {expandedLogs.has(log.timestamp) && (
                                        <pre className={styles.contextJson}>
                                            {JSON.stringify(log.context, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {hasMore && (
                        <div className={styles.loadMore} onClick={() => loadLogs(false)}>
                            {loading ? 'Loading...' : 'Load More'}
                        </div>
                    )}
                </div>
            )}

            {/* Export Confirmation Dialog */}
            {showExportDialog && (
                <div className={styles.overlay} onClick={() => setShowExportDialog(false)}>
                    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                        <div className={styles.dialogTitle}>Exclude Audit Logs?</div>
                        <div className={styles.dialogText}>
                            You have chosen to exclude audit logs from the export. Audit logs contain
                            important security and compliance information. Are you sure you want to
                            proceed without them?
                        </div>
                        <div className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                id="confirmExclude"
                                checked={excludeAudit}
                                onChange={e => setExcludeAudit(e.target.checked)}
                            />
                            <label htmlFor="confirmExclude">Yes, exclude audit logs</label>
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={`${styles.dialogButton} ${styles.secondary}`}
                                onClick={() => setShowExportDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`${styles.dialogButton} ${styles.danger}`}
                                onClick={() => performExport(false)}
                            >
                                Export Without Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
