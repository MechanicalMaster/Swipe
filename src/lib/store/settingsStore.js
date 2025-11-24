import { create } from 'zustand';
import { db } from '@/lib/db';

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
    templateId: 'modern', // Default template

    loadSettings: async () => {
        const company = await db.settings.get('companyDetails');
        const user = await db.settings.get('userProfile');
        const template = await db.settings.get('templateId');

        if (company) set({ companyDetails: company.value });
        if (user) set({ userProfile: user.value });
        if (template) set({ templateId: template.value });
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

    setTemplateId: async (id) => {
        set({ templateId: id });
        await db.settings.put({ key: 'templateId', value: id });
    },

    resetData: async () => {
        await db.delete();
        await db.open();
        set({
            companyDetails: {
                name: '', gstin: '', phone: '', email: '', address: '', logo: null,
                bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountHolderName: '' },
                signatureUrl: null, authorizedSignatoryLabel: '', upiId: ''
            },
            userProfile: { name: '', email: '', phone: '' },
            templateId: 'modern'
        });
        window.location.reload();
    }
}));
