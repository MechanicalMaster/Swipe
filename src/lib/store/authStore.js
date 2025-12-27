import { create } from 'zustand';
import { api, setToken, clearToken, ApiError } from '@/api/backendClient';

export const useAuthStore = create((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    phoneNumber: '',
    currentStep: 'welcome', // welcome, phone, otp
    error: null,

    // Check if user is authenticated by validating token with backend
    loadAuth: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await api.auth.me();
            set({
                isAuthenticated: true,
                user,
                phoneNumber: user.phone || '',
                isLoading: false
            });
        } catch (error) {
            // Token invalid or expired
            clearToken();
            set({
                isAuthenticated: false,
                user: null,
                isLoading: false
            });
        }
    },

    setStep: (step) => set({ currentStep: step }),

    setPhoneNumber: (phone) => set({ phoneNumber: phone }),

    // Request OTP from backend
    requestOTP: async (phone) => {
        set({ isLoading: true, error: null });
        try {
            await api.auth.requestOTP(phone);
            set({ phoneNumber: phone, currentStep: 'otp', isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.message || 'Failed to send OTP', isLoading: false });
            return false;
        }
    },

    // Verify OTP and login
    verifyOTP: async (otp) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.auth.login({
                phone: get().phoneNumber,
                otp
            });

            // Store JWT token
            if (response.token) {
                setToken(response.token);
            }

            set({
                isAuthenticated: true,
                user: response.user || { phone: get().phoneNumber },
                currentStep: 'welcome',
                isLoading: false
            });
            return true;
        } catch (error) {
            set({
                error: error.message || 'Invalid OTP',
                isLoading: false
            });
            return false;
        }
    },

    logout: async () => {
        try {
            await api.auth.logout();
        } catch (error) {
            // Ignore logout errors, clear local state anyway
        }
        clearToken();
        set({
            isAuthenticated: false,
            user: null,
            phoneNumber: '',
            currentStep: 'welcome',
            error: null
        });
    },

    clearError: () => set({ error: null }),
}));
