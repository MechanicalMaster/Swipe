
import { logger } from './logger';
import { getDevice, getAppVersion, SESSION_ID } from './context';
import { redactLogs } from './redact';
import { LogEntry } from './types';

/**
 * Export options for log data
 */
export interface ExportOptions {
    /** Include audit logs (default: true, requires explicit false to exclude) */
    includeAudit?: boolean;
    /** Apply PII redaction (default: true) */
    applyRedaction?: boolean;
    /** Format: 'json' for pretty JSON, 'jsonl' for newline-delimited */
    format?: 'json' | 'jsonl';
}

/**
 * Export metadata included with logs
 */
export interface ExportMetadata {
    exportTimestamp: string;
    appVersion: string;
    buildType: string;
    device: string;
    sessionId: string;
    logCount: number;
    auditLogCount: number;
}

// Dynamic import strategy for storage reading
const getStorageReader = async () => {
    const device = getDevice();
    let storage;

    if (device !== 'web') {
        const { CapacitorStorage } = await import('./storage/capacitorFs');
        storage = new CapacitorStorage();
    } else {
        const { IndexedDbStorage } = await import('./storage/indexedDb');
        storage = new IndexedDbStorage();
    }

    // We need to init to ensure DB/Files are accessible
    await storage.init();
    return storage;
};

/**
 * Export logs with metadata and optional redaction
 */
export const exportLogs = async (options: ExportOptions = {}): Promise<Blob> => {
    const { includeAudit = true, applyRedaction = true, format = 'json' } = options;

    try {
        const storage = await getStorageReader();
        let logs = await storage.readAll('logs');
        let audits: LogEntry[] = [];

        if (includeAudit) {
            audits = await storage.readAll('audit');
        }

        // Apply redaction if enabled
        if (applyRedaction) {
            logs = redactLogs(logs);
            audits = redactLogs(audits);
        }

        const metadata: ExportMetadata = {
            exportTimestamp: new Date().toISOString(),
            appVersion: getAppVersion(),
            buildType: process.env.NODE_ENV || 'unknown',
            device: getDevice(),
            sessionId: SESSION_ID,
            logCount: logs.length,
            auditLogCount: audits.length,
        };

        if (format === 'jsonl') {
            // JSONL format: metadata on first line, then logs
            const lines = [
                JSON.stringify({ _metadata: metadata }),
                ...logs.map(log => JSON.stringify(log)),
                ...audits.map(audit => JSON.stringify(audit)),
            ];
            return new Blob([lines.join('\n')], { type: 'application/x-ndjson' });
        }

        // Standard JSON format
        const exportData = {
            metadata,
            logs,
            auditLogs: audits,
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        return new Blob([jsonString], { type: 'application/json' });

    } catch (error) {
        logger.error('LOG_EXPORT_FAILED', { error: (error as Error).message });
        throw error;
    }
};

/**
 * Trigger download in browser
 */
export const triggerLogDownload = async (options: ExportOptions = {}): Promise<boolean> => {
    try {
        const blob = await exportLogs(options);
        const ext = options.format === 'jsonl' ? 'jsonl' : 'json';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `swipe-diagnostics-${new Date().toISOString()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (e) {
        console.error('Failed to export logs', e);
        return false;
    }
};

/**
 * Share logs via native share sheet (Android/iOS)
 */
export const shareLogsNative = async (options: ExportOptions = {}): Promise<boolean> => {
    try {
        const blob = await exportLogs(options);
        const ext = options.format === 'jsonl' ? 'jsonl' : 'json';
        const filename = `swipe-diagnostics-${new Date().toISOString()}.${ext}`;

        // Convert blob to base64 for Capacitor
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        // Write file to cache
        const result = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
        });

        // Share the file
        const { Share } = await import('@capacitor/share');
        await Share.share({
            title: 'Swipe Diagnostics',
            text: 'Diagnostic logs from Swipe app',
            files: [result.uri],
            dialogTitle: 'Share Diagnostics',
        });

        return true;
    } catch (e) {
        console.error('Failed to share logs', e);
        return false;
    }
};

/**
 * Platform-aware export: download on web, share on native
 */
export const exportOrShareLogs = async (options: ExportOptions = {}): Promise<boolean> => {
    const device = getDevice();

    if (device === 'web') {
        return triggerLogDownload(options);
    } else {
        return shareLogsNative(options);
    }
};
