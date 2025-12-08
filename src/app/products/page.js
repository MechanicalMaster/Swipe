'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { useMasterStore } from '@/lib/store/masterStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiMenu, FiPlus, FiSearch, FiMoreHorizontal, FiDownload, FiUpload, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { RiBarcodeLine } from 'react-icons/ri';
import ProductCard from './components/ProductCard';
import FilterBar from './components/FilterBar';
import Pagination from './components/Pagination';
import BottomSheet from '@/components/BottomSheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import ScanResultModal from '@/components/ScanResultModal';
import { BulkUploadService } from '@/lib/services/bulkUploadService';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { products, loadProducts, addProduct, getProductByBarcode } = useProductStore();
    const { categories, loadCategories } = useMasterStore();
    const { items: invoiceItems, addOrUpdateItem } = useInvoiceStore();

    // Detect selection mode from query params
    const isSelectMode = searchParams.get('mode') === 'select';
    const returnUrl = searchParams.get('returnUrl') || '/invoice/create';

    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Barcode Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanResult, setScanResult] = useState({ isOpen: false, product: null, barcode: '' });

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

            // 4. Gender
            if (filters.gender.length > 0) {
                const genderText = (product.category + ' ' + product.name + ' ' + (product.tags || '')).toLowerCase();
                const matchesGender = filters.gender.some(g => genderText.includes(g.toLowerCase()));
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

    // --- Get quantity in invoice for a product ---
    const getItemQuantity = (productId) => {
        const item = invoiceItems.find(i => i.productId === productId);
        return item ? item.quantity : 0;
    };

    // --- Handlers ---
    const handleAddToTray = (product) => {
        if (isSelectMode) {
            // Add to invoice store
            addOrUpdateItem(product, 1);
        } else {
            console.log("Added to tray:", product.name);
            // TODO: Implement standalone Tray Logic if needed
        }
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

    // --- Barcode Scan Handlers ---
    const handleBarcodeScan = async (barcode) => {
        setIsScannerOpen(false);
        const product = await getProductByBarcode(barcode);
        setScanResult({ isOpen: true, product, barcode });
    };

    const handleScanAddToTray = (product) => {
        if (isSelectMode) {
            addOrUpdateItem(product, 1);
        }
        setScanResult({ isOpen: false, product: null, barcode: '' });
    };

    const handleScanAgain = () => {
        setScanResult({ isOpen: false, product: null, barcode: '' });
        setIsScannerOpen(true);
    };

    const handleAddManually = (barcode) => {
        setScanResult({ isOpen: false, product: null, barcode: '' });
        router.push(`/products/add?barcode=${encodeURIComponent(barcode)}&returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    };

    return (
        <div className={styles.container}>
            {/* Header - Context Aware */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {isSelectMode ? (
                        <FiArrowLeft size={24} className={styles.menuIcon} onClick={() => router.push(returnUrl)} />
                    ) : (
                        <Link href="/">
                            <FiMenu size={24} className={styles.menuIcon} />
                        </Link>
                    )}
                    <span className={styles.headerTitle}>
                        {isSelectMode ? 'Select Products' : 'Products & Services'}
                    </span>
                </div>
                <div className={styles.headerActions}>
                    <RiBarcodeLine size={24} onClick={() => setIsScannerOpen(true)} style={{ cursor: 'pointer' }} />
                    {isSelectMode ? (
                        <button
                            onClick={() => router.push(returnUrl)}
                            style={{
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <FiCheck size={16} />
                            Done ({invoiceItems.length})
                        </button>
                    ) : (
                        <FiMoreHorizontal size={24} onClick={() => setIsMenuOpen(true)} />
                    )}
                </div>
            </div>

            {/* Search Bar */}
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
                        setCurrentPage(1);
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
                        quantity={isSelectMode ? getItemQuantity(product.id) : 0}
                        isSelectMode={isSelectMode}
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

            {/* Floating Create Button - Hidden in Select Mode */}
            {!isSelectMode && (
                <Link href="/products/add">
                    <div className={styles.fab}>
                        <FiPlus size={18} />
                        NEW PRODUCT
                    </div>
                </Link>
            )}


            {/* Bulk Actions Menu - Hidden in Select Mode */}
            {!isSelectMode && (
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
            )}

            {/* Barcode Scanner */}
            <BarcodeScanner
                isOpen={isScannerOpen}
                onScan={handleBarcodeScan}
                onClose={() => setIsScannerOpen(false)}
            />

            {/* Scan Result Modal */}
            <ScanResultModal
                isOpen={scanResult.isOpen}
                product={scanResult.product}
                barcode={scanResult.barcode}
                onAddToTray={handleScanAddToTray}
                onScanAgain={handleScanAgain}
                onAddManually={handleAddManually}
                onClose={() => setScanResult({ isOpen: false, product: null, barcode: '' })}
            />
        </div>
    );
}
