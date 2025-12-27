import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useSettingsStore = create((set, get) => ({
    companyDetails: {
        name: '',
        gstin: '',
        phone: '',
        email: '',
        tradeName: '',
        billingAddress: { addressLine1: '', addressLine2: '', pincode: '', city: '', state: '' },
        shippingAddress: { addressLine1: '', addressLine2: '', pincode: '', city: '', state: '' },
        panNumber: '',
        alternatePhone: '',
        website: '',
        customFields: [],
        logo: null,
        bankDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            branchName: '',
            accountHolderName: ''
        },
        signatureUrl: null,
        authorizedSignatoryLabel: 'Authorized Signatory',
        upiId: ''
    },
    userProfile: {
        name: '',
        email: '',
        phone: ''
    },
    templateId: 'modern',
    lendingBillTemplateId: 'modern',
    isLoading: false,
    error: null,

    loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const settings = await api.settings.get();

            // Map backend settings to store state
            if (settings.companyDetails) {
                set({ companyDetails: settings.companyDetails });
            }
            if (settings.userProfile) {
                set({ userProfile: settings.userProfile });
            }
            if (settings.templateId) {
                set({ templateId: settings.templateId });
            }
            if (settings.lendingBillTemplateId) {
                set({ lendingBillTemplateId: settings.lendingBillTemplateId });
            }

            set({ isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'settings', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    updateCompanyDetails: async (details) => {
        const newDetails = { ...get().companyDetails, ...details };
        set({ companyDetails: newDetails });
        try {
            await api.settings.update('companyDetails', newDetails);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'settings_company', error: error.message });
            throw error;
        }
    },

    updateUserProfile: async (details) => {
        const newDetails = { ...get().userProfile, ...details };
        set({ userProfile: newDetails });
        try {
            await api.settings.update('userProfile', newDetails);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'settings_profile', error: error.message });
            throw error;
        }
    },

    setTemplateId: async (id) => {
        set({ templateId: id });
        try {
            await api.settings.update('templateId', id);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'settings_template', error: error.message });
            throw error;
        }
    },

    setLendingBillTemplateId: async (id) => {
        set({ lendingBillTemplateId: id });
        try {
            await api.settings.update('lendingBillTemplateId', id);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'settings_lending_template', error: error.message });
            throw error;
        }
    },

    // Note: resetData would require a backend endpoint
    // For now, this resets local state only
    resetData: async () => {
        logger.warn('RESET_DATA_WARNING', { message: 'Full data reset requires backend support' });
        set({
            companyDetails: {
                name: '', gstin: '', phone: '', email: '', address: '', logo: null,
                bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountHolderName: '' },
                signatureUrl: null, authorizedSignatoryLabel: '', upiId: ''
            },
            userProfile: { name: '', email: '', phone: '' },
            templateId: 'modern',
            lendingBillTemplateId: 'modern'
        });
    },

    clearError: () => set({ error: null }),
}));
