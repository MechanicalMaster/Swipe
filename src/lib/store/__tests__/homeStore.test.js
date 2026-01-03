/**
 * @jest-environment jsdom
 */

// Mock the API client
jest.mock('@/api/backendClient', () => ({
    api: {
        home: {
            snapshot: jest.fn(),
        },
    },
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
    LOG_EVENTS: {
        DATA_LOAD: 'DATA_LOAD',
    },
}));

import { useHomeStore } from '../homeStore';
import { api } from '@/api/backendClient';

describe('homeStore', () => {
    beforeEach(() => {
        // Reset to initial state
        useHomeStore.getState().reset();
        jest.clearAllMocks();
    });

    describe('initial state', () => {
        it('should have correct default values', () => {
            const state = useHomeStore.getState();
            expect(state.snapshot).toBeNull();
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('fetchSnapshot', () => {
        it('should set loading to true immediately', async () => {
            api.home.snapshot.mockImplementation(() => new Promise(() => { })); // Never resolves

            const promise = useHomeStore.getState().fetchSnapshot();

            // Check loading state immediately
            expect(useHomeStore.getState().loading).toBe(true);
            expect(useHomeStore.getState().error).toBeNull();
        });

        it('should load snapshot successfully', async () => {
            const mockSnapshot = {
                snapshotVersion: 1,
                businessPulse: {
                    amountReceivedThisWeek: 50000,
                    percentChangeWoW: 25.5,
                    paymentsCompleted: 3
                },
                primaryAction: {
                    mostUsed: 'INVOICE'
                },
                recentActivity: [],
                riskSummary: {
                    unpaidInvoicesCount: 5,
                    unpaidAmount: 125000
                },
                momentum: {
                    invoiceStreakDays: 7,
                    totalSentThisWeek: 12
                },
                generatedAt: '2026-01-03T13:52:00.000Z'
            };

            api.home.snapshot.mockResolvedValue(mockSnapshot);

            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.snapshot).toEqual(mockSnapshot);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(api.home.snapshot).toHaveBeenCalledTimes(1);
        });

        it('should handle network errors with human-readable message', async () => {
            const networkError = {
                message: 'Network error',
                status: 0,
            };

            api.home.snapshot.mockRejectedValue(networkError);

            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.snapshot).toBeNull();
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Unable to reach server. Please check your connection.');
        });

        it('should handle 401 unauthorized with human-readable message', async () => {
            const authError = {
                message: 'Unauthorized',
                status: 401,
            };

            api.home.snapshot.mockRejectedValue(authError);

            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.error).toBe('Session expired. Please log in again.');
            expect(state.loading).toBe(false);
        });

        it('should handle 500 server errors with human-readable message', async () => {
            const serverError = {
                message: 'Internal Server Error',
                status: 500,
            };

            api.home.snapshot.mockRejectedValue(serverError);

            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.error).toBe('Server error. Please try again later.');
            expect(state.loading).toBe(false);
        });

        it('should handle generic errors with default message', async () => {
            const genericError = {
                message: 'Something went wrong',
                status: 400,
            };

            api.home.snapshot.mockRejectedValue(genericError);

            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.error).toBe('Unable to load business summary');
            expect(state.loading).toBe(false);
        });

        it('should NOT overwrite existing snapshot on fetch failure', async () => {
            const mockSnapshot = {
                snapshotVersion: 1,
                businessPulse: { amountReceivedThisWeek: 50000 },
                generatedAt: '2026-01-03T13:52:00.000Z'
            };

            // First successful fetch
            api.home.snapshot.mockResolvedValueOnce(mockSnapshot);
            await useHomeStore.getState().fetchSnapshot();

            expect(useHomeStore.getState().snapshot).toEqual(mockSnapshot);

            // Second fetch fails
            api.home.snapshot.mockRejectedValueOnce({ status: 500 });
            await useHomeStore.getState().fetchSnapshot();

            // Snapshot should remain unchanged
            const state = useHomeStore.getState();
            expect(state.snapshot).toEqual(mockSnapshot);
            expect(state.error).toBe('Server error. Please try again later.');
        });

        it('should clear previous error before new fetch', async () => {
            // First fetch fails
            api.home.snapshot.mockRejectedValueOnce({ status: 500 });
            await useHomeStore.getState().fetchSnapshot();
            expect(useHomeStore.getState().error).toBeTruthy();

            // Second fetch succeeds
            const mockSnapshot = { snapshotVersion: 1 };
            api.home.snapshot.mockResolvedValueOnce(mockSnapshot);
            await useHomeStore.getState().fetchSnapshot();

            const state = useHomeStore.getState();
            expect(state.error).toBeNull();
            expect(state.snapshot).toEqual(mockSnapshot);
        });

        it('should never throw errors', async () => {
            api.home.snapshot.mockRejectedValue(new Error('Catastrophic failure'));

            // Should not throw
            await expect(
                useHomeStore.getState().fetchSnapshot()
            ).resolves.toBeUndefined();

            expect(useHomeStore.getState().loading).toBe(false);
            expect(useHomeStore.getState().error).toBeTruthy();
        });
    });

    describe('reset', () => {
        it('should reset all fields to initial state', async () => {
            const mockSnapshot = { snapshotVersion: 1 };
            api.home.snapshot.mockResolvedValue(mockSnapshot);

            await useHomeStore.getState().fetchSnapshot();

            // Verify state has data
            expect(useHomeStore.getState().snapshot).toEqual(mockSnapshot);

            // Reset
            useHomeStore.getState().reset();

            // Verify back to initial state
            const state = useHomeStore.getState();
            expect(state.snapshot).toBeNull();
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });
});
