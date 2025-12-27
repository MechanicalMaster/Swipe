
// Log levels with numeric priority for filtering
export const LOG_LEVELS: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    audit: 4, // Audit always has highest priority
};

// Determine current environment
const isDev = process.env.NODE_ENV !== 'production';

// Minimum level to persist
export const MIN_LOG_LEVEL = isDev ? 'debug' : 'info';

// Storage configuration
export const STORAGE_CONFIG = {
    DB_NAME: 'swipe_logs_db',
    STORE_LOGS: 'logs',
    STORE_AUDIT: 'audit_logs',
    MAX_SIZE_BYTES_LOGS: 5 * 1024 * 1024, // 5 MB
    MAX_SIZE_BYTES_AUDIT: 10 * 1024 * 1024, // 10 MB
    // For file system (native)
    DIR_LOGS: 'logs',
    FILE_LOGS: 'app_logs.json',
    FILE_AUDIT: 'audit_logs.json',
};
