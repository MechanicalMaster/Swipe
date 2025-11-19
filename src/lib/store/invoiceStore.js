import { create } from 'zustand';
import { calculateGST } from '../utils/tax';

export const useInvoiceStore = create((set, get) => ({
    invoiceNumber: 'INV-1',
    date: new Date().toISOString().split('T')[0],
    customer: null,
    items: [],
    additionalCharges: [],

    setInvoiceNumber: (num) => set({ invoiceNumber: num }),
    setDate: (date) => set({ date }),
    setCustomer: (customer) => set({ customer }),

    addItem: () => set((state) => ({
        items: [...state.items, { id: Date.now(), name: '', rate: 0, quantity: 1, gstRate: 18, hsn: '' }]
    })),

    updateItem: (id, field, value) => set((state) => ({
        items: state.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        )
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
    })),

    calculateTotals: () => {
        const { items } = get();
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const amount = item.rate * item.quantity;
            const tax = (amount * item.gstRate) / 100;
            subtotal += amount;
            totalTax += tax;
        });

        return { subtotal, totalTax, total: subtotal + totalTax };
    }
}));
