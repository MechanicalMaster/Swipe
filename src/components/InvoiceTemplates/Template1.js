import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';

export const Template1 = ({ data }) => {
    const { invoiceNumber, date, items, totals, customer } = data;

    return (
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: 'Inter, sans-serif', color: '#1f2937' }} id="invoice-template">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#2563eb', margin: '0 0 8px 0', fontWeight: 800 }}>INVOICE</h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>#{invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Date: {date}</p>
                    {customer && (
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Bill To:</p>
                            <p style={{ fontWeight: '600', margin: 0 }}>{customer.name}</p>
                            {customer.address && <p style={{ fontSize: '14px', margin: '4px 0 0 0', color: '#4b5563' }}>{customer.address}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151', fontSize: '14px', fontWeight: 600 }}>Item</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', textAlign: 'right', color: '#374151', fontSize: '14px', fontWeight: 600 }}>Qty</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', textAlign: 'right', color: '#374151', fontSize: '14px', fontWeight: 600 }}>Rate</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', textAlign: 'right', color: '#374151', fontSize: '14px', fontWeight: 600 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px', fontSize: '14px' }}>{item.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 500 }}>{formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px', background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: '#4b5563' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', color: '#4b5563' }}>
                        <span>Tax:</span>
                        <span>{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0 0', borderTop: '1px solid #e5e7eb', fontWeight: 'bold', fontSize: '18px', color: '#111827', marginTop: '12px' }}>
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
