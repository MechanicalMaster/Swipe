'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiCalendar, FiChevronDown, FiCamera, FiUpload, FiCheck } from 'react-icons/fi';
import { FaPlayCircle } from 'react-icons/fa';
import { useExpenseStore } from '@/lib/store/expenseStore';
import CategoryModal from '@/components/Expenses/CategoryModal';
import AddCategoryModal from '@/components/Expenses/AddCategoryModal';
import styles from './page.module.css';

export default function CreateExpensePage() {
    const router = useRouter();
    const { addExpense } = useExpenseStore();

    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [isPaid, setIsPaid] = useState(true);
    const [paymentType, setPaymentType] = useState('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);

    const handleCreate = () => {
        if (!amount || !category) {
            alert('Please enter amount and select a category');
            return;
        }

        addExpense({
            amount,
            date,
            category,
            isPaid,
            paymentType: isPaid ? paymentType : null,
            paymentDate: isPaid ? paymentDate : null,
            description,
        });

        router.back();
    };

    const handleEditCategory = (cat) => {
        setCategoryToEdit(cat);
        setShowCategoryModal(false);
        setShowAddCategoryModal(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <FiChevronLeft />
                    </button>
                    <h1 className={styles.title}>Create Expense</h1>
                </div>
                <FaPlayCircle className={styles.playButton} />
            </header>

            <div className={styles.content}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Enter Expense Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.input}
                        placeholder="0.00"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Expense Date</label>
                    <div className={styles.dateInputContainer}>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={styles.input}
                        />
                        <FiCalendar className={styles.calendarIcon} />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <button
                        className={`${styles.selectButton} ${category ? styles.selected : ''}`}
                        onClick={() => setShowCategoryModal(true)}
                    >
                        {category || 'Select Category'}
                        <FiChevronDown />
                    </button>
                </div>

                <div className={styles.toggleContainer}>
                    <label className={styles.toggleLabel}>Mark as Paid</label>
                    <label className={styles.toggleSwitch}>
                        <input
                            type="checkbox"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                {isPaid && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Select Type <span style={{ color: 'red' }}>*</span></label>
                            <div className={styles.paymentTypes}>
                                {['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque', 'EMI'].map((type) => (
                                    <button
                                        key={type}
                                        className={`${styles.paymentType} ${paymentType === type ? styles.active : ''}`}
                                        onClick={() => setPaymentType(type)}
                                    >
                                        {paymentType === type && <div className={styles.checkIcon}><FiCheck /></div>}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Payment date</label>
                            <div className={styles.dateInputContainer}>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className={styles.input}
                                />
                                <FiCalendar className={styles.calendarIcon} />
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={styles.textArea}
                        placeholder="Expense Description"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Attachments</label>
                    <div className={styles.attachmentButtons}>
                        <button className={styles.attachButton}>
                            <FiCamera /> Camera
                        </button>
                        <button className={styles.attachButton}>
                            <FiUpload /> Upload File
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <button onClick={handleCreate} className={styles.createButton}>
                    Create <FiChevronLeft style={{ transform: 'rotate(180deg)' }} />
                </button>
            </div>

            {showCategoryModal && (
                <CategoryModal
                    onClose={() => setShowCategoryModal(false)}
                    onSelect={(cat) => {
                        setCategory(cat);
                        setShowCategoryModal(false);
                    }}
                    onEdit={handleEditCategory}
                />
            )}

            {showAddCategoryModal && (
                <AddCategoryModal
                    onClose={() => setShowAddCategoryModal(false)}
                    categoryToEdit={categoryToEdit}
                />
            )}
        </div>
    );
}
