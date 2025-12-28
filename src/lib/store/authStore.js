import { create } from 'zustand';
import { api, setToken, clearToken, ApiError } from '@/api/backendClient';

export const useAuthStore = create((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    phoneNumber: '',
    currentStep: 'welcome', // welcome, phone, otp, notAssigned
    error: null,
    isNotAssignedToShop: false, // True when user exists but not assigned to any shop

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

    setStep: (step) => set({ currentStep: step, isNotAssignedToShop: false, error: null }),

    setPhoneNumber: (phone) => set({ phoneNumber: phone }),

    // Request OTP from backend
    requestOTP: async (phone) => {
        console.log('[authStore] requestOTP called with:', phone);
        set({ isLoading: true, error: null });
        try {
            console.log('[authStore] calling api.auth.requestOTP');
            await api.auth.requestOTP(phone);
            console.log('[authStore] api.auth.requestOTP succeeded');
            set({ phoneNumber: phone, currentStep: 'otp', isLoading: false });
            return true;
        } catch (error) {
            console.log('[authStore] api.auth.requestOTP failed:', error.message);
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
            // Check if this is a "user not registered" error (403)
            const isNotAssigned = error.status === 403 &&
                (error.message?.toLowerCase().includes('not registered') ||
                    error.message?.toLowerCase().includes('not assigned') ||
                    error.message?.toLowerCase().includes('contact your shop admin'));

            if (isNotAssigned) {
                set({
                    error: 'You are not added to any shop. Please contact your administrator.',
                    isNotAssignedToShop: true,
                    currentStep: 'notAssigned',
                    isLoading: false
                });
            } else {
                set({
                    error: error.message || 'Invalid OTP',
                    isNotAssignedToShop: false,
                    isLoading: false
                });
            }
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
            error: null,
            isNotAssignedToShop: false
        });
    },

    clearError: () => set({ error: null }),
}));
