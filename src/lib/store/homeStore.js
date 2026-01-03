import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

/**
 * Home Snapshot Store
 * 
 * Manages the home screen snapshot data from /api/home/snapshot.
 * All business logic is backend-owned; this store only manages state.
 * 
 * CRITICAL RULES:
 * - Never crash the home screen (all errors caught)
 * - Never auto-retry (backend caching handles freshness)
 * - Never compute metrics client-side
 */
export const useHomeStore = create((set, get) => ({
    // State
    snapshot: null,
    loading: false,
    error: null,

    /**
     * Fetch home snapshot from backend
     * 
     * Sets loading immediately, clears error before fetch.
     * On success: sets snapshot and loading = false
     * On failure: sets human-readable error and loading = false
     * Never throws - home screen must never crash
     */
    fetchSnapshot: async () => {
        set({ loading: true, error: null });

        try {
            const snapshot = await api.home.snapshot();

            set({
                snapshot,
                loading: false,
                error: null
            });

            logger.info(LOG_EVENTS.DATA_LOAD, 'Home snapshot loaded successfully', {
                snapshotVersion: snapshot.snapshotVersion,
                generatedAt: snapshot.generatedAt
            });
        } catch (error) {
            // Convert technical errors to human-readable messages
            let errorMessage = 'Unable to load business summary';

            if (error.status === 0) {
                // Network error or timeout
                errorMessage = 'Unable to reach server. Please check your connection.';
            } else if (error.status === 401 || error.status === 403) {
                errorMessage = 'Session expired. Please log in again.';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            set({
                error: errorMessage,
                loading: false
            });

            logger.error(LOG_EVENTS.DATA_LOAD, 'Failed to load home snapshot', {
                error: error.message,
                status: error.status
            });

            // Do NOT throw - home screen must render even if snapshot fails
        }
    },

    /**
     * Reset store to initial state
     */
    reset: () => {
        set({
            snapshot: null,
            loading: false,
            error: null
        });
    },
}));
