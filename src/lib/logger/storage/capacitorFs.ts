
import { LogEntry } from '../types';
import { LogStorage } from './index';
import { STORAGE_CONFIG } from '../config';

// Dynamic import for Capacitor to avoid breaking web builds if standard import used
// but we are in next.js so simple import might work if safe-guarded, 
// safely importing inside methods is safer.

export class CapacitorStorage implements LogStorage {
    private isReady = false;
    private queuedWrites: LogEntry[] = [];
    private isWriting = false;

    async init(): Promise<void> {
        try {
            const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

            // Ensure files exist
            await this.ensureFile(STORAGE_CONFIG.FILE_LOGS);
            await this.ensureFile(STORAGE_CONFIG.FILE_AUDIT);

            this.isReady = true;
            this.processQueue();
        } catch (e) {
            console.error('Failed to init Capacitor Storage', e);
        }
    }

    private async ensureFile(filename: string) {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        try {
            await Filesystem.stat({
                path: filename,
                directory: Directory.Documents
            });
        } catch {
            // File doesn't exist, create it with empty array
            await Filesystem.writeFile({
                path: filename,
                data: '[]',
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });
        }
    }

    async write(entry: LogEntry): Promise<void> {
        this.queuedWrites.push(entry);
        if (!this.isWriting && this.isReady) {
            this.processQueue();
        }
    }

    private async processQueue() {
        if (this.queuedWrites.length === 0) {
            this.isWriting = false;
            return;
        }

        this.isWriting = true;
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        try {
            // We cluster writes by type to minimize IO
            // Taking a snapshot of queue
            const batch = [...this.queuedWrites];
            this.queuedWrites = [];

            const logs = batch.filter(e => e.level !== 'audit');
            const audits = batch.filter(e => e.level === 'audit');

            if (logs.length > 0) await this.appendToFile(STORAGE_CONFIG.FILE_LOGS, logs);
            if (audits.length > 0) await this.appendToFile(STORAGE_CONFIG.FILE_AUDIT, audits);

        } catch (e) {
            console.error('Failed to write logs to FS', e);
            // Put back in queue? Nah, drop to prevent memory leak loop
        }

        this.isWriting = false;
        // Check if more came in
        if (this.queuedWrites.length > 0) {
            this.processQueue();
        }
    }

    private async appendToFile(filename: string, newEntries: LogEntry[]) {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        // Read full file - ineffective for large files but simple for JSON
        // Better approach: Use append if format was newline-delimited JSON (NDJSON)
        // But requirement was JSON array. 
        // To respect size limits and performance, we'll read, append, slice, write.

        try {
            const contents = await Filesystem.readFile({
                path: filename,
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });

            let currentData: LogEntry[] = [];
            try {
                if (typeof contents.data === 'string') {
                    currentData = JSON.parse(contents.data);
                }
            } catch {
                currentData = [];
            }

            const updatedData = [...currentData, ...newEntries];

            // Enforce Limits (FIFO)
            // Estimate size: 1 char = 1 byte (UTF-8 approx)
            const MAX_BYTES = filename === STORAGE_CONFIG.FILE_AUDIT
                ? STORAGE_CONFIG.MAX_SIZE_BYTES_AUDIT
                : STORAGE_CONFIG.MAX_SIZE_BYTES_LOGS;

            // Rough pruning if too large
            // If we assume avg log is 500b, then 5MB is 10k logs.
            const MAX_COUNT = filename === STORAGE_CONFIG.FILE_AUDIT ? 20000 : 10000;

            if (updatedData.length > MAX_COUNT) {
                // Remove from start (oldest)
                const removeCount = updatedData.length - MAX_COUNT;
                updatedData.splice(0, removeCount);
            }

            await Filesystem.writeFile({
                path: filename,
                data: JSON.stringify(updatedData),
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });

        } catch (e) {
            console.error(`Error appending to ${filename}`, e);
        }
    }

    async readAll(type: 'logs' | 'audit'): Promise<LogEntry[]> {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const filename = type === 'audit' ? STORAGE_CONFIG.FILE_AUDIT : STORAGE_CONFIG.FILE_LOGS;

        try {
            const contents = await Filesystem.readFile({
                path: filename,
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });
            return JSON.parse(contents.data as string);
        } catch {
            return [];
        }
    }

    async clear(type: 'logs' | 'audit'): Promise<void> {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const filename = type === 'audit' ? STORAGE_CONFIG.FILE_AUDIT : STORAGE_CONFIG.FILE_LOGS;

        await Filesystem.writeFile({
            path: filename,
            data: '[]',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });
    }

    async getSize(): Promise<number> {
        return 0; // Not implemented
    }
}
