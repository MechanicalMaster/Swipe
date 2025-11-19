import { create } from 'zustand';
import { db } from '@/lib/db';

export const useSettingsStore = create((set, get) => ({
    companyDetails: {
        name: '',
        gstin: '',
        phone: '',
        email: '',
        address: '',
        logo: null
    },
    userProfile: {
        name: '',
        email: '',
        phone: ''
    },

    loadSettings: async () => {
        const company = await db.settings.get('companyDetails');
        const user = await db.settings.get('userProfile');

        if (company) set({ companyDetails: company.value });
        if (user) set({ userProfile: user.value });
    },

    updateCompanyDetails: async (details) => {
        const newDetails = { ...get().companyDetails, ...details };
        set({ companyDetails: newDetails });
        await db.settings.put({ key: 'companyDetails', value: newDetails });
    },

    updateUserProfile: async (details) => {
        const newDetails = { ...get().userProfile, ...details };
        set({ userProfile: newDetails });
        await db.settings.put({ key: 'userProfile', value: newDetails });
    },

    resetData: async () => {
        await db.delete();
        await db.open();
        set({
            companyDetails: { name: '', gstin: '', phone: '', email: '', address: '', logo: null },
            userProfile: { name: '', email: '', phone: '' }
        });
        window.location.reload();
    }
}));
