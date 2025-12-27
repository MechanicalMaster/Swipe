/**
 * PII Redaction Utility for Log Export
 * 
 * Provides pattern-based redaction for sensitive data:
 * - Key-based patterns: password, token, secret, auth, apikey, credential
 * - Value-based patterns: JWT tokens, emails, phone numbers
 */

import { LogEntry } from './types';

// Key patterns that indicate sensitive data
const SENSITIVE_KEY_PATTERNS = [
    /password/i,
    /secret/i,
    /token/i,
    /auth/i,
    /apikey/i,
    /api_key/i,
    /credential/i,
    /bearer/i,
    /authorization/i,
    /session/i,
    /cookie/i,
    /private/i,
];

// Value patterns for detecting sensitive data
const JWT_PATTERN = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/;
const CREDIT_CARD_PATTERN = /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/;

const REDACTED = '[REDACTED]';

/**
 * Check if a key matches sensitive patterns
 */
function isSensitiveKey(key: string): boolean {
    return SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Check if a value matches sensitive patterns
 */
function isSensitiveValue(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    return (
        JWT_PATTERN.test(value) ||
        EMAIL_PATTERN.test(value) ||
        PHONE_PATTERN.test(value) ||
        CREDIT_CARD_PATTERN.test(value)
    );
}

/**
 * Deep clone and redact sensitive data from an object
 */
function redactObject(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
    // Prevent infinite recursion
    if (depth > 10) return { _truncated: true };

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (isSensitiveKey(key)) {
            result[key] = REDACTED;
        } else if (value === null || value === undefined) {
            result[key] = value;
        } else if (typeof value === 'string' && isSensitiveValue(value)) {
            result[key] = REDACTED;
        } else if (Array.isArray(value)) {
            result[key] = value.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return redactObject(item as Record<string, unknown>, depth + 1);
                }
                if (typeof item === 'string' && isSensitiveValue(item)) {
                    return REDACTED;
                }
                return item;
            });
        } else if (typeof value === 'object') {
            result[key] = redactObject(value as Record<string, unknown>, depth + 1);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Redact sensitive data from a log entry
 */
export function redactLogEntry(entry: LogEntry): LogEntry {
    return {
        ...entry,
        context: redactObject(entry.context as Record<string, unknown>),
    };
}

/**
 * Redact sensitive data from an array of log entries
 */
export function redactLogs(entries: LogEntry[]): LogEntry[] {
    return entries.map(redactLogEntry);
}

/**
 * Configuration for custom redaction patterns
 */
export interface RedactionConfig {
    additionalKeyPatterns?: RegExp[];
    additionalValuePatterns?: RegExp[];
}

/**
 * Create a custom redactor with additional patterns
 */
export function createRedactor(config: RedactionConfig) {
    const keyPatterns = [...SENSITIVE_KEY_PATTERNS, ...(config.additionalKeyPatterns || [])];
    const valuePatterns = [JWT_PATTERN, EMAIL_PATTERN, PHONE_PATTERN, CREDIT_CARD_PATTERN, ...(config.additionalValuePatterns || [])];

    const customIsSensitiveKey = (key: string): boolean => {
        return keyPatterns.some(pattern => pattern.test(key));
    };

    const customIsSensitiveValue = (value: unknown): boolean => {
        if (typeof value !== 'string') return false;
        return valuePatterns.some(pattern => pattern.test(value));
    };

    const customRedactObject = (obj: Record<string, unknown>, depth = 0): Record<string, unknown> => {
        if (depth > 10) return { _truncated: true };

        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
            if (customIsSensitiveKey(key)) {
                result[key] = REDACTED;
            } else if (value === null || value === undefined) {
                result[key] = value;
            } else if (typeof value === 'string' && customIsSensitiveValue(value)) {
                result[key] = REDACTED;
            } else if (Array.isArray(value)) {
                result[key] = value.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return customRedactObject(item as Record<string, unknown>, depth + 1);
                    }
                    if (typeof item === 'string' && customIsSensitiveValue(item)) {
                        return REDACTED;
                    }
                    return item;
                });
            } else if (typeof value === 'object') {
                result[key] = customRedactObject(value as Record<string, unknown>, depth + 1);
            } else {
                result[key] = value;
            }
        }

        return result;
    };

    return {
        redactEntry: (entry: LogEntry): LogEntry => ({
            ...entry,
            context: customRedactObject(entry.context as Record<string, unknown>),
        }),
        redactLogs: (entries: LogEntry[]): LogEntry[] => entries.map(entry => ({
            ...entry,
            context: customRedactObject(entry.context as Record<string, unknown>),
        })),
    };
}
