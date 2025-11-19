import { create } from 'zustand';

export const usePurchaseStore = create((set, get) => ({
    purchaseNumber: 'PUR-1',
    date: new Date().toISOString().split('T')[0],
    vendor: null,
    items: [],

    setPurchaseNumber: (num) => set({ purchaseNumber: num }),
    setDate: (date) => set({ date }),
    setVendor: (vendor) => set({ vendor }),

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
    },

    resetStore: () => set({
        purchaseNumber: `PUR-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString().split('T')[0],
        vendor: null,
        items: []
    })
}));
