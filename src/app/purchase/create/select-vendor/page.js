'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { usePurchaseStore } from '@/lib/store/purchaseStore';
import { FiArrowLeft, FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils/tax';

export default function SelectVendorPage() {
    const router = useRouter();
    const { vendors, loadParties } = usePartyStore();
    const { setVendor } = usePurchaseStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadParties();
    }, [loadParties]);

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.phone && v.phone.includes(searchQuery))
    );

    const handleSelect = (vendor) => {
        setVendor(vendor);
        router.back();
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
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        placeholder="Search Vendor"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 0',
                            fontSize: '16px',
                            border: 'none',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                </div>
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <FiX size={20} color="#6b7280" />
                    </button>
                )}
            </div>

            {/* Add New Vendor Button */}
            <Link href="/parties/vendor/add?returnUrl=/purchase/create" style={{ textDecoration: 'none' }}>
                <div style={{
                    background: '#fef3c7',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#92400e',
                    fontWeight: 500,
                    cursor: 'pointer'
                }}>
                    <FiPlus size={18} /> Add new vendor
                </div>
            </Link>

            {/* Vendor List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredVendors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        {vendors.length === 0 ? 'No vendors found. Add a vendor first.' : 'No vendors match your search.'}
                    </div>
                ) : (
                    filteredVendors.map(vendor => (
                        <div
                            key={vendor.id}
                            onClick={() => handleSelect(vendor)}
                            style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '16px'
                                }}>
                                    {vendor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#111827' }}>{vendor.name}</div>
                                    {vendor.phone && (
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{vendor.phone}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {vendor.balance ? (
                                    <div style={{
                                        color: vendor.balance > 0 ? '#dc2626' : '#10b981',
                                        fontWeight: 500
                                    }}>
                                        {vendor.balance > 0 ? '↑' : ''} {formatCurrency(Math.abs(vendor.balance))}
                                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                            {vendor.balance > 0 ? 'You owe' : 'They owe'}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>No dues</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
