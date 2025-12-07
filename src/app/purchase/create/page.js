'use client';

import PurchaseForm from '@/components/PurchaseForm';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePurchaseStore } from '@/lib/store/purchaseStore';

export default function CreatePurchasePage() {
    const { resetPurchase } = usePurchaseStore();

    useEffect(() => {
        // Reset the store when entering create mode
        resetPurchase();
    }, []);

    return (
        <div>
            <div style={{
                padding: '16px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid #eee'
            }}>
                <Link href="/">
                    <FiArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Create Purchase</h1>
                <span style={{
                    fontSize: '12px',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                }}>
                    Purchase Order
                </span>
            </div>
            <PurchaseForm />
        </div>
    );
}
