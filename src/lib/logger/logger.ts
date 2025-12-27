
import { Logger, LogEvent, LogLevel, LogEntry, Device } from './types';
import { LOG_LEVELS, MIN_LOG_LEVEL } from './config';
import { getContext } from './context';
import { LogStorage } from './storage';

// Storage implementation will be injected
let storage: LogStorage | null = null;

// Initialize storage automatically
const initStorage = async () => {
    if (typeof window === 'undefined') return;

    const { getDevice } = await import('./context');
    const device = getDevice();

    if (device !== 'web') {
        // Native (Android/iOS)
        const { CapacitorStorage } = await import('./storage/capacitorFs');
        storage = new CapacitorStorage();
    } else {
        // Web
        const { IndexedDbStorage } = await import('./storage/indexedDb');
        storage = new IndexedDbStorage();
    }

    if (storage) {
        storage.init().catch(err => console.error('Failed to init log storage:', err));
    }
};

// Start init
if (typeof window !== 'undefined') {
    initStorage();
}

const createLogEntry = (
    level: LogLevel,
    event: LogEvent,
    context: Record<string, unknown> = {}
): LogEntry => {
    const meta = getContext();
    return {
        timestamp: new Date().toISOString(),
        level,
        event,
        context,
        ...meta
    };
};

const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
};

const log = (level: LogLevel, event: LogEvent, context: Record<string, unknown> = {}) => {
    // Always allow audit, otherwise check level
    if (level !== 'audit' && !shouldLog(level)) {
        return;
    }

    const entry = createLogEntry(level, event, context);

    // Console output (dev only or formatted)
    if (process.env.NODE_ENV !== 'production') {
        const style = level === 'error' ? 'color: red' :
            level === 'warn' ? 'color: orange' :
                level === 'debug' ? 'color: gray' : 'color: blue';
        // Use raw console methods to avoid circular dependency if we patch console later
        // eslint-disable-next-line
        console.log(`%c[${level.toUpperCase()}] ${event}`, style, context);
    }

    // Persist to storage
    if (storage) {
        storage.write(entry).catch(err => {
            // Fallback to console if storage fails, but prevent infinite loop
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line
                console.error('Logger storage failed:', err);
            }
        });
    }
};

export const logger: Logger = {
    debug: (event, context) => log('debug', event, context),
    info: (event, context) => log('info', event, context),
    warn: (event, context) => log('warn', event, context),
    error: (event, context) => log('error', event, context),
    audit: (event, context) => log('audit', event, context),
};
