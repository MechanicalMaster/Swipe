import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { numberToWords } from '@/lib/utils/numberToWords';
import { useSettingsStore } from '@/lib/store/settingsStore';

export const Template3 = ({ data }) => {
    const {
        invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType,
        items, totals, customer, details, payment
    } = data;
    const companyDetails = data.companyDetails || useSettingsStore.getState().companyDetails;

    const formatAddress = (addr) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.addressLine1,
            addr.addressLine2,
            addr.city,
            addr.state ? `${addr.state}${addr.pincode ? ' - ' + addr.pincode : ''}` : addr.pincode
        ].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: 'Georgia, serif', color: '#444', fontSize: '12px' }} id="invoice-template">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', color: '#c2410c', margin: '0 0 10px 0' }}>{data.type === 'PROFORMA' ? 'PRO FORMA' : data.type === 'LENDING' ? 'LENDING BILL' : 'INVOICE'}</h1>
                    <div style={{ fontSize: '14px', color: '#78716c' }}>#{invoiceNumber}</div>
                    <div style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>{invoiceCopyType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {companyDetails.logo && <img src={companyDetails.logo} alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />}
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#c2410c' }}>{companyDetails.name}</div>
                    <div>{formatAddress(companyDetails.billingAddress)}</div>
                    <div>GSTIN: {companyDetails.gstin}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fff7ed', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <div>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#c2410c', margin: '0 0 8px 0' }}>Billed To</h3>
                    {customer ? (
                        <>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{customer.name}</div>
                            <div>{formatAddress(customer.billingAddress)}</div>
                            <div>GSTIN: {customer.gstin}</div>
                        </>
                    ) : <div>No Customer</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#c2410c', margin: '0 0 8px 0' }}>Invoice Details</h3>
                    <div><strong>Date:</strong> {date}</div>
                    <div><strong>Due Date:</strong> {dueDate}</div>
                    <div><strong>Place of Supply:</strong> {placeOfSupply}</div>
                </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #c2410c', color: '#c2410c' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                        {data.type !== 'LENDING' && <th style={{ padding: '10px', textAlign: 'center' }}>HSN</th>}
                        {data.type !== 'LENDING' && <th style={{ padding: '10px', textAlign: 'right' }}>Rate</th>}
                        <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                        {data.type !== 'LENDING' && <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            <tr style={{ borderBottom: (item.netWeight || item.makingChargePerGram) ? 'none' : '1px solid #e7e5e4' }}>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                </td>
                                {data.type !== 'LENDING' && <td style={{ padding: '10px', textAlign: 'center' }}>{item.hsn || '-'}</td>}
                                {data.type !== 'LENDING' && <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>}
                                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                {data.type !== 'LENDING' && <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.rate)}</td>}
                            </tr>
                            {/* Jewellery Detail Row */}
                            {(item.netWeight || item.makingChargePerGram) > 0 && (
                                <tr style={{ borderBottom: '1px solid #e7e5e4', fontSize: '10px', color: '#444', background: '#F7F7F7' }}>
                                    <td colSpan={5} style={{ padding: '8px 12px 8px 12px' }}>
                                        <div style={{ display: 'flex', gap: '8px 16px', flexWrap: 'wrap', marginLeft: '24px' }}>
                                            <span><strong>Gross Wt:</strong> {item.grossWeight || 0}g</span>
                                            <span><strong>Net Wt:</strong> {item.netWeight || 0}g</span>
                                            <span><strong>Rate/gm:</strong> {formatCurrency(item.ratePerGram || 0)}</span>
                                            <span><strong>MC/gm:</strong> {formatCurrency(item.makingChargePerGram || 0)}</span>
                                            <span><strong>Mat. Val.:</strong> {formatCurrency(item.materialValue || 0)}</span>
                                            <span><strong>Making Chg:</strong> {formatCurrency(item.makingCharge || 0)}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            {data.type === 'LENDING' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                    <div style={{ width: '300px', background: '#fff7ed', padding: '10px', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #fed7aa', paddingBottom: '8px', color: '#c2410c' }}>Weight Summary</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Gross Weight:</span>
                            <strong>{data.weightSummary?.grossWeight || '0'} g</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Net Weight:</span>
                            <strong>{data.weightSummary?.netWeight || '0'} g</strong>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                    <div style={{ width: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        {data.type !== 'PROFORMA' && (totals.igst > 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                <span>IGST</span>
                                <span>{formatCurrency(totals.igst)}</span>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                    <span>CGST (1.5%)</span>
                                    <span>{formatCurrency(totals.cgst)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                    <span>SGST (1.5%)</span>
                                    <span>{formatCurrency(totals.sgst)}</span>
                                </div>
                            </>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #c2410c', marginTop: '10px', color: '#c2410c', fontWeight: 'bold', fontSize: '16px' }}>
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {data.type !== 'LENDING' && (
                <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '30px', fontStyle: 'italic' }}>
                    {numberToWords(Math.round(totals.total))} Rupees Only
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h4 style={{ color: '#c2410c', margin: '0 0 5px 0' }}>Bank Details</h4>
                    <div>{companyDetails.bankDetails?.bankName}</div>
                    <div>{companyDetails.bankDetails?.accountNumber}</div>
                    <div>{companyDetails.bankDetails?.ifscCode}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {companyDetails.signatureUrl && <img src={companyDetails.signatureUrl} alt="Signature" style={{ height: '40px' }} />}
                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>{companyDetails.authorizedSignatoryLabel}</div>
                </div>
            </div>
        </div>
    );
};
