'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiArrowLeft, FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils/tax';

export default function SelectCustomerPage() {
    const router = useRouter();
    const { customers, loadParties } = usePartyStore();
    const { setCustomer } = useInvoiceStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadParties();
    }, [loadParties]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone && c.phone.includes(searchQuery))
    );

    const handleSelect = (customer) => {
        setCustomer(customer);
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
                        placeholder="Search Customer"
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

            {/* Add New Customer Button */}
            <Link href="/parties/customer/add?returnUrl=/invoice/create" style={{ textDecoration: 'none' }}>
                <div style={{
                    background: '#e0e7ff',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#3730a3',
                    fontWeight: 500,
                    cursor: 'pointer'
                }}>
                    <FiPlus size={18} /> Add new customer
                </div>
            </Link>

            {/* Customer List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCustomers.map(customer => (
                    <div
                        key={customer.id}
                        onClick={() => handleSelect(customer)}
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
                                background: '#fce7f3',
                                color: '#be185d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '16px'
                            }}>
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500, color: '#111827' }}>{customer.name}</div>
                                {customer.phone && (
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{customer.phone}</div>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {customer.balance ? (
                                <div style={{
                                    color: customer.balance > 0 ? '#ef4444' : '#10b981',
                                    fontWeight: 500
                                }}>
                                    {customer.balance > 0 ? '↓' : ''} {formatCurrency(Math.abs(customer.balance))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>No dues</div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Export/SEZ Banner (Static for now as per screenshot design) */}
                <div style={{
                    background: '#eff6ff',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                }}>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: '4px' }}>Export/SEZ/ Multi currency</div>
                        <div style={{ fontSize: '12px', color: '#60a5fa' }}>Easily Create your export or multi currency invoices.</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>🎧</div>
                </div>
            </div>
        </div>
    );
}
