'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterStore } from '@/lib/store/masterStore';
import { FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import styles from './page.module.css';
import clsx from 'clsx';

export default function ProductMastersPage() {
    const router = useRouter();
    const {
        categories, loadCategories,
        subCategories, loadSubCategories,
        addCategory, updateCategory, deleteCategory,
        addSubCategory, updateSubCategory, deleteSubCategory
    } = useMasterStore();

    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'subcategories'
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // If set, we are editing

    useEffect(() => {
        loadCategories();
        loadSubCategories();
    }, []);

    const filteredItems = activeTab === 'categories'
        ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        : subCategories.filter(sc =>
            sc.name.toLowerCase().includes(search.toLowerCase()) ||
            categories.find(c => c.id === sc.categoryId)?.name.toLowerCase().includes(search.toLowerCase())
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
                    <div className={styles.title}>Product Masters</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabContainer}>
                <div
                    className={clsx(styles.tab, activeTab === 'categories' && styles.active)}
                    onClick={() => setActiveTab('categories')}
                >
                    Categories
                </div>
                <div
                    className={clsx(styles.tab, activeTab === 'subcategories' && styles.active)}
                    onClick={() => setActiveTab('subcategories')}
                >
                    Sub-Categories
                </div>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 16px 0 16px' }}>
                <div className={styles.searchBar}>
                    <FiSearch color="#9ca3af" size={20} />
                    <input
                        className={styles.searchInput}
                        placeholder={`Search ${activeTab === 'categories' ? 'categories...' : 'sub-categories...'}`}
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
                            {activeTab === 'subcategories' && (
                                <div className={styles.itemSub}>
                                    {categories.find(c => c.id === item.categoryId)?.name || 'Unknown Category'}
                                </div>
                            )}
                        </div>
                        <FiEdit2 color="#6b7280" />
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 32 }}>
                        No {activeTab} found
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className={styles.fab} onClick={handleAdd}>
                <FiPlus size={24} />
                <span>NEW {activeTab === 'categories' ? 'CATEGORY' : 'SUB-CATEGORY'}</span>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <MasterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={activeTab}
                    item={editingItem}
                    categories={categories}
                    actions={{
                        addCategory, updateCategory, deleteCategory,
                        addSubCategory, updateSubCategory, deleteSubCategory
                    }}
                />
            )}
        </div>
    );
}

function MasterModal({ isOpen, onClose, mode, item, categories, actions }) {
    // Shared State
    const [name, setName] = useState(item ? item.name : '');
    const [categoryId, setCategoryId] = useState(item ? item.categoryId : '');

    // Reset when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setName(item ? item.name : '');
            setCategoryId(item ? item.categoryId : '');
        }
    }, [isOpen, item]);

    const handleSave = async () => {
        if (!name.trim()) return alert('Name is required');

        if (mode === 'categories') {
            if (item) {
                await actions.updateCategory(item.id, { name });
            } else {
                await actions.addCategory(name);
            }
        } else {
            // Subcategory
            if (!categoryId) return alert('Category is required for Sub-Category');
            if (item) {
                await actions.updateSubCategory(item.id, { name, categoryId });
            } else {
                await actions.addSubCategory(name, categoryId);
            }
        }
        onClose();
    };

    const handleDelete = async () => {
        if (!item) return;
        if (confirm('Are you sure you want to delete this item?')) {
            if (mode === 'categories') {
                await actions.deleteCategory(item.id);
            } else {
                await actions.deleteSubCategory(item.id);
            }
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        {item ? 'Edit' : 'Add'} {mode === 'categories' ? 'Category' : 'Sub-Category'}
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
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {mode === 'subcategories' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Parent Category</label>
                            <select
                                className={styles.select}
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
