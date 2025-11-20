'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductStore } from '@/lib/store/productStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiArrowLeft, FiSearch, FiPlus, FiMinus, FiX, FiMaximize } from 'react-icons/fi'; // FiMaximize as placeholder for barcode
import { formatCurrency } from '@/lib/utils/tax';

export default function SelectProductPage() {
    const router = useRouter();
    const { products, loadProducts } = useProductStore();
    const { items, addOrUpdateItem } = useInvoiceStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All'); // All, Product, Service

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' ||
            (filter === 'Product' && p.type === 'product') ||
            (filter === 'Service' && p.type === 'service');
        return matchesSearch && matchesFilter;
    });

    const getItemQuantity = (productId) => {
        const item = items.find(i => i.productId === productId);
        return item ? item.quantity : 0;
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <FiArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, fontSize: '18px', fontWeight: 600, color: '#4b5563' }}>
                    Search Products
                </div>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <FiMaximize size={24} style={{ transform: 'rotate(45deg)' }} /> {/* Barcode icon placeholder */}
                </button>
            </div>

            {/* Add New Product & Search */}
            <div style={{ background: 'white', padding: '12px 16px', paddingBottom: 0 }}>
                <Link href="/products/add?returnUrl=/invoice/create/select-product" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: '#e0e7ff',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#3730a3',
                        fontWeight: 600,
                        borderRadius: '8px',
                        marginBottom: '16px'
                    }}>
                        <FiPlus size={18} /> Add New Product
                    </div>
                </Link>

                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
                    {['All', 'Product', 'Service'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: filter === f ? '#2563eb' : '#e5e7eb',
                                color: filter === f ? 'white' : '#4b5563',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProducts.map(product => {
                    const qty = getItemQuantity(product.id);
                    return (
                        <div
                            key={product.id}
                            style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827', marginBottom: '4px' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>
                                        {formatCurrency(product.sellingPrice)}
                                    </div>
                                </div>
                                {qty > 0 && (
                                    <div style={{
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        Qty: {qty}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                                <button
                                    style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                                    onClick={() => router.push(`/products/edit/${product.id}`)} // Assuming edit page exists or will exist
                                >
                                    Edit
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button
                                        onClick={() => addOrUpdateItem(product, -1)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#9ca3af',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FiMinus size={16} />
                                    </button>
                                    <span style={{ fontSize: '18px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => addOrUpdateItem(product, 1)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: '#2563eb',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FiPlus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
