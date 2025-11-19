import { create } from 'zustand';
import { db } from '@/lib/db';

export const useAuthStore = create((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    phoneNumber: '',
    currentStep: 'welcome', // welcome, phone, otp

    loadAuth: async () => {
        try {
            const auth = await db.settings.get('auth');
            if (auth && auth.value) {
                set({ isAuthenticated: true, phoneNumber: auth.value.phoneNumber, isLoading: false });
            } else {
                set({ isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load auth:', error);
            set({ isAuthenticated: false, isLoading: false });
        }
    },

    setStep: (step) => set({ currentStep: step }),

    setPhoneNumber: (phone) => set({ phoneNumber: phone, currentStep: 'otp' }),

    verifyOTP: async (otp) => {
        if (otp === '111111') {
            const authData = { phoneNumber: get().phoneNumber, authenticatedAt: new Date() };
            await db.settings.put({ key: 'auth', value: authData });
            set({ isAuthenticated: true, currentStep: 'welcome' });
            return true;
        }
        return false;
    },

    logout: async () => {
        await db.settings.delete('auth');
        set({ isAuthenticated: false, phoneNumber: '', currentStep: 'welcome' });
    }
}));
