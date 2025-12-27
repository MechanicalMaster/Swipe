export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'audit';
export type LogEvent = string;
export type Device = 'web' | 'android' | 'ios';

export interface LogEntry {
    timestamp: string;      // ISO 8601
    level: LogLevel;
    event: LogEvent;
    context: Record<string, unknown>;
    sessionId: string;
    appVersion: string;
    device: Device;
}

export interface Logger {
    debug: (event: LogEvent, context?: Record<string, unknown>) => void;
    info: (event: LogEvent, context?: Record<string, unknown>) => void;
    warn: (event: LogEvent, context?: Record<string, unknown>) => void;
    error: (event: LogEvent, context?: Record<string, unknown>) => void;
    audit: (event: LogEvent, context: Record<string, unknown>) => void;
}
