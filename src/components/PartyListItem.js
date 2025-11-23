import React from 'react';
import { FiArrowDown } from 'react-icons/fi';

export const PartyListItem = ({ party, onClick }) => {
    const balance = party.balance || 0;
    const isDue = balance > 0;
    const isAdvance = balance < 0;

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'white',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer'
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#3730a3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginRight: '12px'
            }}>
                {party.name[0].toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#111827' }}>{party.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {party.phone || 'No phone'}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                {balance === 0 ? (
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>No dues</div>
                ) : (
                    <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDue ? '#dc2626' : '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px'
                    }}>
                        {isDue && <FiArrowDown />}
                        ₹ {Math.abs(balance).toFixed(2)}
                    </div>
                )}
                {balance !== 0 && (
                    <div style={{ fontSize: '10px', color: isDue ? '#dc2626' : '#16a34a' }}>
                        {isDue ? 'You get' : 'You pay'}
                    </div>
                )}
            </div>
        </div>
    );
};
