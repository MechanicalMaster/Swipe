
import { LogEntry } from '../types';
import { LogStorage, LogQueryOptions, LogQueryResult } from './index';
import { STORAGE_CONFIG } from '../config';

/**
 * JSONL Chunked Storage for Capacitor (Android/iOS)
 * 
 * Uses JSONL (newline-delimited JSON) format for efficient append-only writes.
 * Logs are stored in chunks (logs_0001.jsonl, logs_0002.jsonl, etc.)
 * Each chunk targets ~500KB, with a 5MB total cap (10 chunks max).
 * FIFO eviction removes oldest chunks when limit is reached.
 */

const CHUNK_SIZE_BYTES = 500 * 1024; // 500KB per chunk
const MAX_CHUNKS = 10; // 5MB total

export class CapacitorStorage implements LogStorage {
    private isReady = false;
    private queuedWrites: LogEntry[] = [];
    private isWriting = false;
    private currentLogChunk = 0;
    private currentAuditChunk = 0;

    async init(): Promise<void> {
        try {
            const { Filesystem, Directory } = await import('@capacitor/filesystem');

            // Ensure logs directory exists
            try {
                await Filesystem.mkdir({
                    path: STORAGE_CONFIG.DIR_LOGS,
                    directory: Directory.Documents,
                    recursive: true
                });
            } catch {
                // Directory may already exist
            }

            // Find current chunk numbers
            this.currentLogChunk = await this.findLatestChunk('logs');
            this.currentAuditChunk = await this.findLatestChunk('audit');

            this.isReady = true;
            this.processQueue();
        } catch (e) {
            console.error('Failed to init Capacitor Storage', e);
        }
    }

    private async findLatestChunk(type: 'logs' | 'audit'): Promise<number> {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const prefix = type === 'audit' ? 'audit' : 'logs';

        try {
            const result = await Filesystem.readdir({
                path: STORAGE_CONFIG.DIR_LOGS,
                directory: Directory.Documents
            });

            const chunkNums = result.files
                .filter(f => f.name.startsWith(prefix) && f.name.endsWith('.jsonl'))
                .map(f => {
                    const match = f.name.match(/_(\d+)\.jsonl$/);
                    return match ? parseInt(match[1], 10) : 0;
                })
                .filter(n => !isNaN(n));

            return chunkNums.length > 0 ? Math.max(...chunkNums) : 1;
        } catch {
            return 1;
        }
    }

    private getChunkPath(type: 'logs' | 'audit', chunkNum: number): string {
        const prefix = type === 'audit' ? 'audit' : 'logs';
        return `${STORAGE_CONFIG.DIR_LOGS}/${prefix}_${String(chunkNum).padStart(4, '0')}.jsonl`;
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
            const batch = [...this.queuedWrites];
            this.queuedWrites = [];

            const logs = batch.filter(e => e.level !== 'audit');
            const audits = batch.filter(e => e.level === 'audit');

            if (logs.length > 0) {
                await this.appendToChunk('logs', logs);
            }
            if (audits.length > 0) {
                await this.appendToChunk('audit', audits);
            }

        } catch (e) {
            console.error('Failed to write logs to FS', e);
        }

        this.isWriting = false;
        if (this.queuedWrites.length > 0) {
            this.processQueue();
        }
    }

    private async appendToChunk(type: 'logs' | 'audit', entries: LogEntry[]) {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        const currentChunk = type === 'audit' ? this.currentAuditChunk : this.currentLogChunk;
        const chunkPath = this.getChunkPath(type, currentChunk);

        // Convert entries to JSONL format
        const jsonlLines = entries.map(e => JSON.stringify(e)).join('\n') + '\n';

        try {
            // Check if current chunk exists and its size
            let currentSize = 0;
            try {
                const stat = await Filesystem.stat({
                    path: chunkPath,
                    directory: Directory.Documents
                });
                currentSize = stat.size || 0;
            } catch {
                // File doesn't exist yet
            }

            // If adding would exceed chunk size, rotate
            if (currentSize + jsonlLines.length > CHUNK_SIZE_BYTES) {
                const newChunkNum = currentChunk + 1;

                if (type === 'audit') {
                    this.currentAuditChunk = newChunkNum;
                } else {
                    this.currentLogChunk = newChunkNum;
                }

                // Write to new chunk
                const newPath = this.getChunkPath(type, newChunkNum);
                await Filesystem.writeFile({
                    path: newPath,
                    data: jsonlLines,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8
                });

                // Enforce max chunks (FIFO eviction)
                await this.enforceChunkLimit(type, newChunkNum);
            } else {
                // Append to current chunk
                await Filesystem.appendFile({
                    path: chunkPath,
                    data: jsonlLines,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8
                });
            }
        } catch (e) {
            console.error(`Error appending to ${chunkPath}`, e);
        }
    }

    private async enforceChunkLimit(type: 'logs' | 'audit', latestChunk: number) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const oldestToKeep = latestChunk - MAX_CHUNKS + 1;

        if (oldestToKeep <= 0) return;

        // Delete chunks older than the limit
        for (let i = 1; i < oldestToKeep; i++) {
            try {
                await Filesystem.deleteFile({
                    path: this.getChunkPath(type, i),
                    directory: Directory.Documents
                });
            } catch {
                // Chunk may not exist
            }
        }
    }

    async readAll(type: 'logs' | 'audit'): Promise<LogEntry[]> {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

        try {
            const entries: LogEntry[] = [];
            const latestChunk = type === 'audit' ? this.currentAuditChunk : this.currentLogChunk;
            const oldestChunk = Math.max(1, latestChunk - MAX_CHUNKS + 1);

            for (let i = oldestChunk; i <= latestChunk; i++) {
                try {
                    const contents = await Filesystem.readFile({
                        path: this.getChunkPath(type, i),
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8
                    });

                    if (typeof contents.data === 'string') {
                        const lines = contents.data.split('\n').filter(line => line.trim());
                        for (const line of lines) {
                            try {
                                entries.push(JSON.parse(line));
                            } catch {
                                // Skip malformed lines
                            }
                        }
                    }
                } catch {
                    // Chunk may not exist
                }
            }

            return entries;
        } catch {
            return [];
        }
    }

    async query(options: LogQueryOptions): Promise<LogQueryResult> {
        const { levels, event, startTime, endTime, sessionId, correlationId, limit = 50, offset = 0 } = options;

        try {
            // Read all entries from both logs and audit
            const [logs, audits] = await Promise.all([
                this.readAll('logs'),
                this.readAll('audit')
            ]);

            // Merge and filter
            const allEntries = [...logs, ...audits].filter(entry => {
                if (levels && levels.length > 0 && !levels.includes(entry.level)) {
                    return false;
                }
                if (event && !entry.event.toLowerCase().includes(event.toLowerCase())) {
                    return false;
                }
                if (startTime && entry.timestamp < startTime) {
                    return false;
                }
                if (endTime && entry.timestamp > endTime) {
                    return false;
                }
                if (sessionId && entry.sessionId !== sessionId) {
                    return false;
                }
                if (correlationId && (entry.context as Record<string, unknown>)?.correlationId !== correlationId) {
                    return false;
                }
                return true;
            });

            // Sort by timestamp descending (reverse-chronological)
            allEntries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

            const total = allEntries.length;
            const paginatedEntries = allEntries.slice(offset, offset + limit);
            const hasMore = offset + limit < total;

            return { entries: paginatedEntries, total, hasMore };
        } catch (error) {
            console.error('Query failed:', error);
            return { entries: [], total: 0, hasMore: false };
        }
    }

    async clear(type: 'logs' | 'audit'): Promise<void> {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const latestChunk = type === 'audit' ? this.currentAuditChunk : this.currentLogChunk;

        for (let i = 1; i <= latestChunk; i++) {
            try {
                await Filesystem.deleteFile({
                    path: this.getChunkPath(type, i),
                    directory: Directory.Documents
                });
            } catch {
                // Chunk may not exist
            }
        }

        // Reset chunk counter
        if (type === 'audit') {
            this.currentAuditChunk = 1;
        } else {
            this.currentLogChunk = 1;
        }
    }

    async getSize(): Promise<number> {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        let totalSize = 0;

        try {
            const result = await Filesystem.readdir({
                path: STORAGE_CONFIG.DIR_LOGS,
                directory: Directory.Documents
            });

            for (const file of result.files) {
                if (file.name.endsWith('.jsonl')) {
                    totalSize += file.size || 0;
                }
            }
        } catch {
            // Directory may not exist
        }

        return totalSize;
    }
}
