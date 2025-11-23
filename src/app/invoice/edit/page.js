'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { db } from '@/lib/db';
import InvoiceForm from '@/components/InvoiceForm';
import { FiArrowLeft } from 'react-icons/fi';

function InvoiceEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { setInvoice, resetInvoice } = useInvoiceStore();

    useEffect(() => {
        const loadInvoice = async () => {
            if (id) {
                const inv = await db.invoices.get(Number(id));
                if (inv) {
                    setInvoice(inv);
                } else {
                    alert('Invoice not found');
                    router.push('/');
                }
            }
        };
        loadInvoice();

        // Cleanup on unmount is tricky because we might want to keep state if navigating to select-product
        // But if we navigate away to home, we should reset.
        // For now, we rely on explicit reset in handleSave or component mount of create page if we were to add one.
        // Actually, Create page should probably reset on mount.

        return () => {
            // Optional: reset if leaving the edit flow completely? 
            // Let's not reset here to allow navigation to sub-pages (select-customer/product)
        };
    }, [id, setInvoice, router]);

    return (
        <div>
            <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                <h1 style={{ fontSize: 18, fontWeight: 600 }}>Update Invoice</h1>
            </div>
            <InvoiceForm isEditMode={true} />
        </div>
    );
}

export default function InvoiceEditPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoiceEditContent />
        </Suspense>
    );
}
