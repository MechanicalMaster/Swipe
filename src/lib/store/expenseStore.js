import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useExpenseStore = create(
    persist(
        (set, get) => ({
            expenses: [],
            categories: [
                'Karigar',
                'Miscellaneous',
                'Transportation & Travel Expense',
                'Telephone & Internet Bills',
                'Repair & Maintenance',
                'Rent Expense',
                'Raw Material',
                'Printing and Stationery',
                'Employee Salaries & Advances',
                'Electricity Bill',
                'Bank Fee and Charges',
            ],

            addExpense: (expense) =>
                set((state) => ({
                    expenses: [
                        {
                            id: Date.now().toString(),
                            createdAt: new Date().toISOString(),
                            ...expense,
                        },
                        ...state.expenses,
                    ],
                })),

            updateExpense: (id, updatedExpense) =>
                set((state) => ({
                    expenses: state.expenses.map((exp) =>
                        exp.id === id ? { ...exp, ...updatedExpense } : exp
                    ),
                })),

            deleteExpense: (id) =>
                set((state) => ({
                    expenses: state.expenses.filter((exp) => exp.id !== id),
                })),

            addCategory: (category) =>
                set((state) => ({
                    categories: [...state.categories, category],
                })),

            updateCategory: (oldCategory, newCategory) =>
                set((state) => ({
                    categories: state.categories.map((cat) =>
                        cat === oldCategory ? newCategory : cat
                    ),
                    // Also update expenses that use this category
                    expenses: state.expenses.map((exp) =>
                        exp.category === oldCategory ? { ...exp, category: newCategory } : exp
                    ),
                })),

            deleteCategory: (category) =>
                set((state) => ({
                    categories: state.categories.filter((cat) => cat !== category),
                })),
        }),
        {
            name: 'expense-storage',
        }
    )
);
