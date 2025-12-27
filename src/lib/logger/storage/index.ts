import { LogEntry, LogLevel } from '../types';

/**
 * Query options for filtering logs
 */
export interface LogQueryOptions {
    levels?: LogLevel[];
    event?: string;
    startTime?: string; // ISO 8601
    endTime?: string;   // ISO 8601
    sessionId?: string;
    correlationId?: string;
    limit?: number;
    offset?: number;
}

/**
 * Query result with pagination info
 */
export interface LogQueryResult {
    entries: LogEntry[];
    total: number;
    hasMore: boolean;
}

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
     * Query logs with filtering and pagination
     */
    query(options: LogQueryOptions): Promise<LogQueryResult>;

    /**
     * Clear logs
     */
    clear(type: 'logs' | 'audit'): Promise<void>;

    /**
     * Get total size in bytes
     */
    getSize(): Promise<number>;
}

