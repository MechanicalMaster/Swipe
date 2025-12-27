import { logger } from '../logger';
import { LOG_EVENTS } from '../events';
import { exportLogs } from '../export';

// Mock storage to prevent actual DB/FS writes during tests
jest.mock('../storage', () => ({
    initStorage: jest.fn().mockResolvedValue({
        write: jest.fn().mockResolvedValue(true),
        readAll: jest.fn().mockResolvedValue([]),
        clear: jest.fn().mockResolvedValue(true),
        getSize: jest.fn().mockResolvedValue(0)
    })
}));

describe('Logger System', () => {

    test('should expose all log levels', () => {
        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.audit).toBe('function');
    });

    test('should have defined LOG_EVENTS', () => {
        expect(LOG_EVENTS).toBeDefined();
        expect(LOG_EVENTS.APP_INIT).toBe('APP_INIT');
        expect(LOG_EVENTS.AUTH_LOGIN_SUCCESS).toBe('AUTH_LOGIN_SUCCESS');
    });

    test('should allow logging without error', async () => {
        // This primarily tests that the facade doesn't crash
        // Deep verification would require spying on the internal storage which is mocked
        expect(() => logger.info(LOG_EVENTS.APP_INIT, { test: true })).not.toThrow();
    });

    test('exportLogs should be a function', () => {
        expect(typeof exportLogs).toBe('function');
    });

});
