import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';

export const Template2 = ({ data }) => {
    const { invoiceNumber, date, items, totals, customer } = data;

    return (
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: 'Times New Roman, serif', color: '#000' }} id="invoice-template">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #000', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '36px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</h1>
                <p style={{ fontSize: '16px', margin: 0 }}>#{invoiceNumber} | {date}</p>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Bill To:</p>
                {customer ? (
                    <div>
                        <p style={{ margin: 0, fontSize: '18px' }}>{customer.name}</p>
                        {customer.address && <p style={{ margin: '4px 0 0 0' }}>{customer.address}</p>}
                    </div>
                ) : (
                    <p>Customer Details</p>
                )}
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', border: '1px solid #000' }}>
                <thead>
                    <tr style={{ background: '#eee', textAlign: 'left' }}>
                        <th style={{ padding: '12px', border: '1px solid #000' }}>Description</th>
                        <th style={{ padding: '12px', border: '1px solid #000', textAlign: 'right' }}>Quantity</th>
                        <th style={{ padding: '12px', border: '1px solid #000', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '12px', border: '1px solid #000', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '12px', border: '1px solid #000' }}>{item.name}</td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #000' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #000' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #000' }}>{formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>Tax:</span>
                        <span>{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #000', fontWeight: 'bold', fontSize: '18px', marginTop: '8px' }}>
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
                Thank you for your business!
            </div>
        </div>
    );
};
