import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useExpenseStore } from '@/lib/store/expenseStore';
import styles from '@/app/more/bills/expenses/create/page.module.css';

export default function AddCategoryModal({ onClose, categoryToEdit }) {
    const { addCategory, updateCategory, deleteCategory } = useExpenseStore();
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        if (categoryToEdit) {
            setCategoryName(categoryToEdit);
        } else {
            setCategoryName('');
        }
    }, [categoryToEdit]);

    const handleSave = () => {
        if (!categoryName.trim()) return;

        if (categoryToEdit) {
            updateCategory(categoryToEdit, categoryName);
        } else {
            addCategory(categoryName);
        }
        onClose();
    };

    const handleDelete = () => {
        if (categoryToEdit) {
            deleteCategory(categoryToEdit);
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {categoryToEdit ? 'Edit Category' : 'Add Category'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FiX />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category Name</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className={styles.input}
                            placeholder="Enter category name"
                            autoFocus
                        />
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <div className={styles.modalActions}>
                        {categoryToEdit && (
                            <button className={styles.deleteButton} onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button className={styles.saveButton} onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
