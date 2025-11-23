import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';

export const Template3 = ({ data }) => {
    const { invoiceNumber, date, items, totals, customer } = data;

    return (
        <div style={{ padding: '0', background: 'white', width: '800px', fontFamily: 'Georgia, serif', color: '#333', display: 'flex', flexDirection: 'column', minHeight: '1120px' }} id="invoice-template">
            {/* Header with background */}
            <div style={{ background: '#1e293b', color: 'white', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '40px', margin: 0, fontWeight: 'normal' }}>INVOICE</h1>
                    <div style={{ marginTop: '10px', opacity: 0.8 }}>#{invoiceNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase' }}>Date Issued</div>
                    <div style={{ fontSize: '18px' }}>{date}</div>
                </div>
            </div>

            <div style={{ padding: '40px', flex: 1 }}>
                {/* Customer Info */}
                <div style={{ marginBottom: '50px', display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Invoiced To</div>
                        {customer ? (
                            <div>
                                <h3 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>{customer.name}</h3>
                                {customer.address && <p style={{ margin: '8px 0 0 0', color: '#475569', lineHeight: '1.5' }}>{customer.address}</p>}
                            </div>
                        ) : (
                            <p>Customer Details</p>
                        )}
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 8px', textAlign: 'left', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</th>
                            <th style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
                            <th style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
                            <th style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '20px 8px', fontSize: '15px', color: '#334155' }}>{item.name}</td>
                                <td style={{ padding: '20px 8px', textAlign: 'right', fontSize: '15px', color: '#64748b' }}>{item.quantity}</td>
                                <td style={{ padding: '20px 8px', textAlign: 'right', fontSize: '15px', color: '#64748b' }}>{formatCurrency(item.rate)}</td>
                                <td style={{ padding: '20px 8px', textAlign: 'right', fontSize: '15px', fontWeight: 'bold', color: '#334155' }}>{formatCurrency(item.quantity * item.rate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#64748b' }}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#64748b' }}>
                            <span>Tax</span>
                            <span>{formatCurrency(totals.totalTax)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid #e2e8f0', marginTop: '8px', color: '#0f172a' }}>
                            <span style={{ fontSize: '16px' }}>Total Due</span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '40px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                <p style={{ margin: 0 }}>If you have any questions about this invoice, please contact us.</p>
            </div>
        </div>
    );
};
