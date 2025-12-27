import { LogEntry } from '../types';

export interface LogStorage {
    /**
     * Initialize the storage
     */
    init(): Promise<void>;

    /**
     * Write a log entry
     */
    write(entry: LogEntry): Promise<void>;

    /**
     * Read all logs
     */
    readAll(type: 'logs' | 'audit'): Promise<LogEntry[]>;

    /**
     * Clear logs
     */
    clear(type: 'logs' | 'audit'): Promise<void>;

    /**
     * Get total size in bytes
     */
    getSize(): Promise<number>;
}
