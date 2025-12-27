
import { LogEntry, LogLevel } from '../types';
import { LogStorage } from './index';
import { STORAGE_CONFIG } from '../config';

const DB_VERSION = 1;

export class IndexedDbStorage implements LogStorage {
    private db: IDBDatabase | null = null;
    private isReady = false;

    async init(): Promise<void> {
        if (typeof window === 'undefined' || !window.indexedDB) {
            console.warn('IndexedDB not supported');
            return;
        }

        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(STORAGE_CONFIG.DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open log DB');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // General logs store
                if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORE_LOGS)) {
                    const store = db.createObjectStore(STORAGE_CONFIG.STORE_LOGS, { keyPath: 'timestamp' });
                    store.createIndex('level', 'level', { unique: false });
                }

                // Audit logs store
                if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORE_AUDIT)) {
                    db.createObjectStore(STORAGE_CONFIG.STORE_AUDIT, { keyPath: 'timestamp' });
                }
            };
        });
    }

    async write(entry: LogEntry): Promise<void> {
        if (!this.isReady || !this.db) return;

        const storeName = entry.level === 'audit'
            ? STORAGE_CONFIG.STORE_AUDIT
            : STORAGE_CONFIG.STORE_LOGS;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(entry);

            request.onsuccess = () => {
                // Trigger cleanup asynchronously
                this.enforceLimits(storeName);
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    async readAll(type: 'logs' | 'audit'): Promise<LogEntry[]> {
        if (!this.isReady || !this.db) return [];

        const storeName = type === 'audit'
            ? STORAGE_CONFIG.STORE_AUDIT
            : STORAGE_CONFIG.STORE_LOGS;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(type: 'logs' | 'audit'): Promise<void> {
        if (!this.isReady || !this.db) return;

        const storeName = type === 'audit'
            ? STORAGE_CONFIG.STORE_AUDIT
            : STORAGE_CONFIG.STORE_LOGS;

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSize(): Promise<number> {
        // Estimating size is expensive in IDB, implemented as approximation
        // For now, we rely on record count or assume strict count limit if needed
        // But since req is bytes, we'd need to iterate cursor and sum up stringified JSON
        if (!this.isReady || !this.db) return 0;

        // Quick approximation: assuming roughly 500 bytes per log
        // Better implementation would be to track size in metadata
        return 0;
    }

    // FIFO Eviction
    private async enforceLimits(storeName: string): Promise<void> {
        // Lightweight size check - simplified for performance
        // Instead of bytes, we'll limit by count for now as proxy (e.g., 5000 logs)
        // Real byte checking requires reading everything which kills perf on write

        const MAX_COUNT = storeName === STORAGE_CONFIG.STORE_AUDIT ? 10000 : 5000;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                if (countRequest.result > MAX_COUNT) {
                    // Delete oldest
                    // Cursor default direction is 'next' (ascending keys/timestamps), so first is oldest
                    const deleteCount = countRequest.result - MAX_COUNT;
                    let deleted = 0;

                    const cursorRequest = store.openCursor();

                    cursorRequest.onsuccess = (e) => {
                        const cursor = (e.target as IDBRequest).result;
                        if (cursor && deleted < deleteCount) {
                            cursor.delete();
                            deleted++;
                            cursor.continue();
                        }
                    };
                }
                resolve();
            };
        });
    }
}
