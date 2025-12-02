'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProductStore } from '@/lib/store/productStore';
import { formatCurrency } from '@/lib/utils/tax';
import { FiSearch, FiMoreHorizontal, FiPlus, FiHeadphones, FiShoppingBag } from 'react-icons/fi';
import styles from './page.module.css';

export default function ProductsPage() {
    const { products, loadProducts } = useProductStore();
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/"><FiArrowLeft size={24} /></Link>
                    Products & Services
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <FiSearch size={24} />
                    <FiMoreHorizontal size={24} />
                </div>
            </div>

            <div className={styles.searchBar}>
                <FiSearch color="#9ca3af" size={20} />
                <input
                    className={styles.searchInput}
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>



            {filteredProducts.map((product) => (
                <Link key={product.id} href={`/products/edit?id=${product.id}`}>
                    <div className={styles.productCard}>
                        <div className={styles.productIcon}>
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0].data} alt="" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                                <FiShoppingBag />
                            )}
                        </div>
                        <div className={styles.productInfo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className={styles.stockBadge}>Qty: 0.00</div>
                                    <div className={styles.productName}>{product.name}</div>
                                </div>
                                <div className={styles.productPrice}>{formatCurrency(product.sellingPrice || 0)}</div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}

            <Link href="/products/add">
                <div className={styles.fab}>
                    <FiPlus /> NEW PRODUCT
                </div>
            </Link>
        </div>
    );
}

function FiArrowLeft({ size }) {
    return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    );
}
