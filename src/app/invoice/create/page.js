import InvoiceForm from '@/components/InvoiceForm';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateInvoicePage() {
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
                <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Create Invoice</h1>
            </div>
            <InvoiceForm />
        </div>
    );
}
