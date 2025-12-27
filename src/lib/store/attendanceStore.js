import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useAttendanceStore = create((set, get) => ({
    currentLogId: null,
    isLoggedIn: false,
    todayAttendance: null,
    history: [],
    isLoading: false,
    error: null,

    // Record login
    login: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const result = await api.attendance.login(userId);
            set({
                currentLogId: result.id,
                isLoggedIn: true,
                todayAttendance: result,
                isLoading: false
            });
            return result;
        } catch (error) {
            logger.error(LOG_EVENTS.AUTH_LOGIN_FAILED, { error: error.message, userId });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Record logout
    logout: async () => {
        const logId = get().currentLogId;
        if (!logId) {
            logger.warn(LOG_EVENTS.AUTH_LOGOUT_FAILED, { reason: 'no_active_session' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            await api.attendance.logout(logId);
            set({
                currentLogId: null,
                isLoggedIn: false,
                isLoading: false
            });
        } catch (error) {
            logger.error(LOG_EVENTS.AUTH_LOGOUT_FAILED, { error: error.message, logId });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Get attendance history for a user
    loadHistory: async (userId, limit = 30) => {
        set({ isLoading: true, error: null });
        try {
            const history = await api.attendance.getHistory(userId, limit);
            set({ history, isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'attendance_history', userId, error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    // Get attendance for a specific date
    getByDate: async (userId, date) => {
        try {
            return await api.attendance.getByDate(userId, date);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'attendance_by_date', userId, date, error: error.message });
            return null;
        }
    },

    // Check today's attendance status
    checkTodayStatus: async (userId) => {
        set({ isLoading: true });
        try {
            const today = new Date().toISOString().split('T')[0];
            const attendance = await api.attendance.getByDate(userId, today);

            if (attendance) {
                set({
                    todayAttendance: attendance,
                    currentLogId: attendance.id,
                    isLoggedIn: !attendance.logoutAt, // Logged in if no logout recorded
                    isLoading: false
                });
            } else {
                set({
                    todayAttendance: null,
                    currentLogId: null,
                    isLoggedIn: false,
                    isLoading: false
                });
            }
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'attendance_today_status', userId, error: error.message });
            set({ isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
