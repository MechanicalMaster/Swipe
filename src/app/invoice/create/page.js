'use client';

import InvoiceForm from '@/components/InvoiceForm';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useInvoiceStore } from '@/lib/store/invoiceStore';

export default function CreateInvoicePage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const { setInvoiceType } = useInvoiceStore();

    // Set the invoice type based on query param when component mounts
    // We assume resetInvoice has already been called or we call it here to be safe?
    // Usually a layout or a parent "create" wrapper would handle reset.
    // For now we just ensure type is set.

    // We need to allow effect to run.
    useEffect(() => {
        if (type === 'proforma') {
            setInvoiceType('PROFORMA');
        } else if (type === 'lending') {
            setInvoiceType('LENDING');
        } else {
            setInvoiceType('INVOICE');
        }
    }, [type, setInvoiceType]);

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
                <h1 style={{ fontSize: '18px', fontWeight: 600 }}>
                    {type === 'proforma' ? 'Create Pro Forma Invoice' : type === 'LENDING' ? 'Create Lending Bill' : 'Create Invoice'}
                </h1>
                {(type === 'proforma' || type === 'LENDING') && (
                    <span style={{ fontSize: '12px', background: type === 'LENDING' ? '#f3f4f6' : '#e0e7ff', color: type === 'LENDING' ? '#374151' : '#4338ca', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {type === 'LENDING' ? 'Lending Bill' : 'Pro Forma'}
                    </span>
                )}
            </div>
            <InvoiceForm />
        </div>
    );
}
