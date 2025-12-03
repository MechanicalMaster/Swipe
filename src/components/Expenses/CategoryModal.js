import { useState } from 'react';
import { FiX, FiSearch, FiEdit2 } from 'react-icons/fi';
import { useExpenseStore } from '@/lib/store/expenseStore';
import styles from '@/app/more/bills/expenses/create/page.module.css'; // Reusing styles

export default function CategoryModal({ onClose, onSelect, onEdit }) {
    const { categories } = useExpenseStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Select Category</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FiX />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.modalSearch}>
                        <FiSearch color="#888" />
                        <input
                            type="text"
                            placeholder="Search Expense Category"
                            className={styles.modalSearchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.categoryList}>
                        {filteredCategories.map((category) => (
                            <div
                                key={category}
                                className={styles.categoryItem}
                                onClick={() => onSelect(category)}
                            >
                                <span className={styles.categoryName}>{category}</span>
                                <FiEdit2
                                    className={styles.editIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(category);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button
                        className={styles.addCategoryButton}
                        onClick={() => onEdit(null)} // null means adding new
                    >
                        Add Category
                    </button>
                </div>
            </div>
        </div>
    );
}
