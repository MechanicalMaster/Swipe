import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';

export const InvoiceTemplate = ({ data }) => {
    const { invoiceNumber, date, items, totals } = data;

    return (
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: 'Arial, sans-serif' }} id="invoice-template">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#2563eb', margin: 0 }}>INVOICE</h1>
                    <p style={{ color: '#666', marginTop: '8px' }}>#{invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold' }}>Date: {date}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #eee' }}>Item</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #eee', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #eee', textAlign: 'right' }}>Rate</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #eee', textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{item.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Tax:</span>
                        <span>{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
