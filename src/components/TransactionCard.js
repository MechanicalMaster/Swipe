import React from 'react';

export const TransactionCard = ({ transaction, onClick }) => {
    const isCredit = transaction.type === 'credit' || transaction.type === 'payment';
    const amount = parseFloat(transaction.amount || 0);

    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                padding: '16px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
            }}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>
                        {transaction.type?.toUpperCase() || 'TRANSACTION'}
                    </span>
                    {transaction.status === 'pending' && (
                        <span style={{ fontSize: '12px', color: '#dc2626' }}>• Pending</span>
                    )}
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {transaction.number || 'REF-NA'}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{
                    fontSize: '14px',
                    color: isCredit ? '#16a34a' : '#dc2626',
                    fontWeight: 500
                }}>
                    {isCredit ? '+' : '-'} ₹ {amount.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#111827', fontWeight: 600, marginTop: '4px' }}>
                    ₹ {transaction.balance?.toFixed(2) || '0.00'}
                </div>
            </div>
        </div>
    );
};
