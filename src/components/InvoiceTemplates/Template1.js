import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { numberToWords } from '@/lib/utils/numberToWords';
import { useSettingsStore } from '@/lib/store/settingsStore';

export const Template1 = ({ data }) => {
    const {
        invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType,
        items, totals, customer, details, payment
    } = data;
    const companyDetails = data.companyDetails || useSettingsStore.getState().companyDetails;

    // Helper to format address
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
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: 'Inter, sans-serif', color: '#1f2937', fontSize: '12px' }} id="invoice-template">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    {companyDetails.logo && <img src={companyDetails.logo} alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />}
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#111827' }}>{companyDetails.name}</h2>
                    <p style={{ margin: 0 }}><strong>GSTIN:</strong> {companyDetails.gstin}</p>
                    <p style={{ margin: 0, maxWidth: '300px' }}>{formatAddress(companyDetails.billingAddress)}</p>
                    <p style={{ margin: 0 }}><strong>Mobile:</strong> {companyDetails.phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '24px', color: '#2563eb', margin: '0 0 4px 0', fontWeight: 800 }}>TAX INVOICE</h1>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', margin: 0 }}>{invoiceCopyType}</p>

                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 12px', justifyContent: 'end', textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>Invoice #:</span> <span>{invoiceNumber}</span>
                        <span style={{ fontWeight: 600 }}>Invoice Date:</span> <span>{date}</span>
                        <span style={{ fontWeight: 600 }}>Due Date:</span> <span>{dueDate}</span>
                        <span style={{ fontWeight: 600 }}>Place of Supply:</span> <span>{placeOfSupply}</span>
                    </div>
                </div>
            </div>

            {/* Buyer & Shipping Details */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: '#374151' }}>Bill To:</h3>
                    {customer ? (
                        <>
                            <p style={{ fontWeight: 700, margin: '0 0 2px 0' }}>{customer.name}</p>
                            <p style={{ margin: '0 0 2px 0' }}><strong>GSTIN:</strong> {customer.gstin}</p>
                            <p style={{ margin: '0 0 2px 0' }}><strong>Ph:</strong> {customer.phone}</p>
                            <p style={{ margin: 0, maxWidth: '300px' }}>{formatAddress(customer.billingAddress)}</p>
                        </>
                    ) : <p style={{ color: '#9ca3af' }}>No Customer Selected</p>}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: '#374151' }}>Ship To:</h3>
                    {customer ? (
                        <>
                            <p style={{ fontWeight: 700, margin: '0 0 2px 0' }}>{customer.companyName || customer.name}</p>
                            <p style={{ margin: 0, maxWidth: '300px' }}>{formatAddress(customer.shippingAddress || customer.billingAddress)}</p>
                        </>
                    ) : <p style={{ color: '#9ca3af' }}>Same as Billing</p>}
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ background: '#2563eb', color: 'white' }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>#</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px', width: '40%' }}>Item</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>HSN/SAC</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>Rate</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px' }}>{index + 1}</td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                {/* Placeholder for sub-details if we add them later */}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{item.hsn || '-'}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals & Tax Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Items / Qty: {items.length} / {items.reduce((acc, item) => acc + item.quantity, 0)}</div>
                </div>
                <div style={{ width: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span>Taxable Amount</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {/* Conditional Tax Rendering */}
                    {totals.igst > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <span>IGST</span>
                            <span>{formatCurrency(totals.igst)}</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span>CGST</span>
                                <span>{formatCurrency(totals.cgst)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span>SGST</span>
                                <span>{formatCurrency(totals.sgst)}</span>
                            </div>
                        </>
                    )}

                    {totals.roundOffAmount !== 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <span>Round Off</span>
                            <span>{totals.roundOffAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px', fontSize: '16px', fontWeight: 800 }}>
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            {/* Amount in Words */}
            <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '8px 0', marginBottom: '20px', fontStyle: 'italic' }}>
                <span style={{ fontWeight: 600 }}>Total amount (in words): </span>
                INR {numberToWords(Math.round(totals.total))} Only.
            </div>

            {/* Footer: Bank & Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ width: '50%' }}>
                    {/* Payment / Bank Details */}
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Bank Details:</h4>
                    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                        <div><strong>Bank:</strong> {companyDetails.bankDetails?.bankName || '-'}</div>
                        <div><strong>Account #:</strong> {companyDetails.bankDetails?.accountNumber || '-'}</div>
                        <div><strong>IFSC:</strong> {companyDetails.bankDetails?.ifscCode || '-'}</div>
                        <div><strong>Branch:</strong> {companyDetails.bankDetails?.branchName || '-'}</div>
                    </div>

                    {/* QR Code Placeholder */}
                    {companyDetails.upiId && (
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Pay using UPI:</p>
                            <div style={{ width: '80px', height: '80px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                QR CODE
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px' }}>For {companyDetails.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '40px' }}>
                        {companyDetails.signatureUrl && (
                            <img src={companyDetails.signatureUrl} alt="Signature" style={{ height: '50px', marginBottom: '4px' }} />
                        )}
                        <div style={{ borderTop: '1px solid #374151', width: '150px', paddingTop: '4px', fontSize: '12px', fontWeight: 600 }}>
                            {companyDetails.authorizedSignatoryLabel || 'Authorized Signatory'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Notes */}
            <div style={{ marginTop: '30px', fontSize: '10px', color: '#4b5563' }}>
                {details.notes && (
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Notes:</strong> {details.notes}
                    </div>
                )}
                {details.terms && (
                    <div>
                        <strong>Terms and Conditions:</strong> {details.terms}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '10px', textAlign: 'center', color: '#9ca3af' }}>
                This is a digitally signed document
            </div>
        </div>
    );
};
