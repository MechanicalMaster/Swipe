'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterStore } from '@/lib/store/masterStore';
import { FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import styles from './page.module.css';

export default function ProductMastersPage() {
    const router = useRouter();
    const {
        categories, loadCategories,
        addCategory, updateCategory, deleteCategory
    } = useMasterStore();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // If set, we are editing

    useEffect(() => {
        loadCategories();
    }, []);

    const filteredItems = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.backButton} onClick={() => router.back()}>
                        <FiArrowLeft />
                    </button>
                    <div className={styles.title}>Product Categories</div>
                </div>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 16px 0 16px' }}>
                <div className={styles.searchBar}>
                    <FiSearch color="#9ca3af" size={20} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className={styles.content}>
                {filteredItems.map(item => (
                    <div key={item.id} className={styles.itemCard} onClick={() => handleEdit(item)}>
                        <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.name}</div>
                        </div>
                        <FiEdit2 color="#6b7280" />
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 32 }}>
                        No categories found
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className={styles.fab} onClick={handleAdd}>
                <FiPlus size={24} />
                <span>NEW CATEGORY</span>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CategoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    item={editingItem}
                    actions={{
                        addCategory, updateCategory, deleteCategory
                    }}
                />
            )}
        </div>
    );
}

function CategoryModal({ isOpen, onClose, item, actions }) {
    const [name, setName] = useState(item ? item.name : '');

    // Reset when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setName(item ? item.name : '');
        }
    }, [isOpen, item]);

    const handleSave = async () => {
        if (!name.trim()) return alert('Name is required');

        if (item) {
            await actions.updateCategory(item.id, { name });
        } else {
            await actions.addCategory(name);
        }
        onClose();
    };

    const handleDelete = async () => {
        if (!item) return;
        if (confirm('Are you sure you want to delete this category?')) {
            await actions.deleteCategory(item.id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        {item ? 'Edit' : 'Add'} Category
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            className={styles.input}
                            placeholder="Enter Category Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <div className={styles.modalActions}>
                        {item && (
                            <button className={styles.deleteButton} onClick={handleDelete}>Delete</button>
                        )}
                        <button className={styles.saveButton} onClick={handleSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
