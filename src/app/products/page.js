'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { useMasterStore } from '@/lib/store/masterStore';
import { FiMenu, FiPlus, FiSearch, FiMoreHorizontal, FiDownload, FiUpload } from 'react-icons/fi';
import ProductCard from './components/ProductCard';
import FilterBar from './components/FilterBar';
import Pagination from './components/Pagination';
import BottomSheet from '@/components/BottomSheet';
import { BulkUploadService } from '@/lib/services/bulkUploadService';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
    const router = useRouter();
    const { products, loadProducts, addProduct } = useProductStore();
    const { categories, loadCategories } = useMasterStore();

    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        purity: [],
        weight: [],
        gender: [],
        category: []
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    // --- Filtering Logic ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Search
            if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;

            // 2. Purity
            if (filters.purity.length > 0) {
                // Approximate match (e.g. "22K" in "22K")
                const productPurity = product.purity || '';
                if (!filters.purity.some(f => productPurity.includes(f))) return false;
            }

            // 3. Weight
            if (filters.weight.length > 0) {
                const weight = Number(product.grossWeight || 0);
                const matchesWeight = filters.weight.some(range => {
                    if (range === '0-5g') return weight >= 0 && weight <= 5;
                    if (range === '5-10g') return weight > 5 && weight <= 10;
                    return false;
                });
                if (!matchesWeight) return false;
            }

            // 4. Gender (Inferred from Category or Name)
            if (filters.gender.length > 0) {
                const genderText = (product.category + ' ' + product.name + ' ' + (product.tags || '')).toLowerCase();
                const matchesGender = filters.gender.some(g => genderText.includes(g.toLowerCase()));

                // If distinct gender field existed, we'd use it. For now, we infer.
                // If inference fails, we might hide it, but rigorous filtering might hide too much.
                // strict inference:
                if (!matchesGender) return false;
            }

            // 5. Category
            if (filters.category.length > 0) {
                if (!filters.category.includes(product.category)) return false;
            }

            return true;
        });
    }, [products, search, filters]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // --- Handlers ---
    const handleAddToTray = (product) => {
        console.log("Added to tray:", product.name);
        // TODO: Implement Tray Logic
    };

    const handleShare = async (product) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out this ${product.name}`,
                    url: window.location.href // or specific product link
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            alert("Sharing not supported on this device.");
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/">
                        <FiMenu size={24} className={styles.menuIcon} />
                    </Link>
                    <span className={styles.headerTitle}>Products & Services</span>
                </div>
                <div className={styles.headerActions}>
                    <FiSearch size={24} />
                    <FiMoreHorizontal size={24} onClick={() => setIsMenuOpen(true)} />
                </div>
            </div>

            {/* Search Bar - Matches uploaded_image_2 */}
            <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                    <FiSearch color="#9ca3af" size={20} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterSection}>
                <FilterBar
                    filters={filters}
                    onFilterChange={(newFilters) => {
                        setFilters(newFilters);
                        setCurrentPage(1); // Reset page on filter change
                    }}
                    categories={categories}
                />
            </div>

            {/* Product Grid */}
            <div className={styles.grid}>
                {paginatedProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToTray={handleAddToTray}
                        onShare={handleShare}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className={styles.emptyState}>
                    No products found.
                </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onRecentlyViewed={() => console.log('Recently Viewed')}
                />
            )}

            {/* Floating Create Button */}
            <Link href="/products/add">
                <div className={styles.fab}>
                    <FiPlus size={18} />
                    NEW PRODUCT
                </div>
            </Link>

            <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px 20px' }}>
                    <div className={styles.menuItem} onClick={() => { BulkUploadService.downloadAllProducts(); setIsMenuOpen(false); }}>
                        <FiDownload size={20} />
                        <span>Bulk Download</span>
                    </div>
                    <Link href="/products/bulk-upload" onClick={() => setIsMenuOpen(false)}>
                        <div className={styles.menuItem}>
                            <FiUpload size={20} />
                            <span>Bulk Upload</span>
                        </div>
                    </Link>
                </div>
            </BottomSheet>
        </div>
    );
}
