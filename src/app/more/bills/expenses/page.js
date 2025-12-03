'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiSearch, FiChevronDown, FiPlus } from 'react-icons/fi';
import { useExpenseStore } from '@/lib/store/expenseStore';
import styles from './page.module.css';

export default function ExpensesPage() {
    const router = useRouter();
    const { expenses } = useExpenseStore();
    const [activeTab, setActiveTab] = useState('All Transactions');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearch = expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expense.description && expense.description.toLowerCase().includes(searchQuery.toLowerCase()));

        if (activeTab === 'All Transactions') return matchesSearch;
        if (activeTab === 'Paid') return matchesSearch && expense.isPaid;
        if (activeTab === 'Pending') return matchesSearch && !expense.isPaid;
        if (activeTab === 'Cancelled') return matchesSearch && expense.status === 'cancelled'; // Assuming we add cancelled status later
        return matchesSearch;
    });

    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const pendingAmount = expenses.filter(exp => !exp.isPaid).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <FiChevronLeft />
                </button>
                <h1 className={styles.title}>Expenses</h1>
            </header>

            <div className={styles.content}>
                <div className={styles.searchSection}>
                    <FiSearch color="#888" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.filterButton}>
                        This Year <FiChevronDown />
                    </button>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.summaryHeader}>
                        <div className={styles.summaryLabel}>Total Amount <FiChevronDown /></div>
                        <div className={styles.pendingLabel}>Pending</div>
                    </div>
                    <div className={styles.summaryHeader}>
                        <div className={styles.totalAmount}>{totalAmount.toFixed(2)}</div>
                        <div className={styles.pendingAmount}>{pendingAmount.toFixed(2)}</div>
                    </div>
                </div>

                <div className={styles.tabs}>
                    {['All Transactions', 'Paid', 'Pending', 'Cancelled'].map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                            {tab === 'All Transactions' && <span className={styles.tabCount}>{expenses.length}</span>}
                        </button>
                    ))}
                </div>

                <div className={styles.transactionList}>
                    {filteredExpenses.map((expense, index) => (
                        <div key={expense.id} className={styles.transactionCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardId}>#{expenses.length - index}</span>
                                <span className={styles.cardAmount}>₹{parseFloat(expense.amount).toFixed(2)}</span>
                            </div>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardCategory}>{expense.category}</span>
                                <span className={`${styles.cardStatus} ${expense.isPaid ? styles.statusPaid : styles.statusPending}`}>
                                    {expense.isPaid ? 'paid' : 'pending'}
                                </span>
                            </div>
                            <div className={styles.cardDate}>{formatDate(expense.date)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Link href="/more/bills/expenses/create" className={styles.createButton}>
                <FiPlus /> CREATE EXPENSE
            </Link>
        </div>
    );
}
