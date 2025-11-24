import React from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { numberToWords } from '@/lib/utils/numberToWords';
import { useSettingsStore } from '@/lib/store/settingsStore';

export const Template2 = ({ data }) => {
    const {
        invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType,
        items, totals, customer, details, payment
    } = data;
    const companyDetails = data.companyDetails || useSettingsStore.getState().companyDetails;

    // Helper to format address without trailing commas
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
        <div style={{ padding: '40px', background: 'white', width: '800px', fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#111827', fontSize: '12px', lineHeight: '1.5' }} id="invoice-template">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ width: '50%' }}>
                    {companyDetails.logo ? (
                        <img src={companyDetails.logo} alt="Logo" style={{ height: '60px', marginBottom: '15px', objectFit: 'contain' }} />
                    ) : (
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px 0' }}>{companyDetails.name}</h2>
                    )}

                    {/* Seller Details - Mimicking Godrej Layout */}
                    {companyDetails.logo && <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{companyDetails.name}</div>}
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>GSTIN {companyDetails.gstin}</div>
                    <div style={{ maxWidth: '300px', color: '#374151' }}>{formatAddress(companyDetails.billingAddress)}</div>
                    {companyDetails.phone && <div>Mobile {companyDetails.phone}</div>}
                </div>

                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '20px', color: '#2563eb', fontWeight: 700, margin: '0 0 2px 0', textTransform: 'uppercase' }}>TAX INVOICE</h1>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '20px' }}>{invoiceCopyType || 'ORIGINAL FOR RECIPIENT'}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 16px', justifyContent: 'end', textAlign: 'right' }}>
                        <span style={{ color: '#6b7280' }}>Invoice #:</span> <span style={{ fontWeight: 600 }}>{invoiceNumber}</span>
                        <span style={{ color: '#6b7280' }}>Invoice Date:</span> <span style={{ fontWeight: 600 }}>{date}</span>
                        <span style={{ color: '#6b7280' }}>Due Date:</span> <span style={{ fontWeight: 600 }}>{dueDate}</span>
                        <span style={{ color: '#6b7280' }}>Place of Supply:</span> <span style={{ fontWeight: 600 }}>{placeOfSupply}</span>
                    </div>
                </div>
            </div>

            {/* Bill To / Ship To */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Bill To:</div>
                    {customer ? (
                        <>
                            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{customer.name}</div>
                            <div style={{ fontWeight: 700, marginBottom: '2px' }}>GSTIN: {customer.gstin}</div>
                            {customer.phone && <div style={{ marginBottom: '2px' }}>Ph: {customer.phone}</div>}
                            <div style={{ maxWidth: '250px', color: '#374151' }}>{formatAddress(customer.billingAddress)}</div>
                        </>
                    ) : <div style={{ color: '#9ca3af' }}>No Customer Selected</div>}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Ship To:</div>
                    {customer ? (
                        <>
                            <div style={{ maxWidth: '250px', color: '#374151' }}>
                                {formatAddress(customer.shippingAddress || customer.billingAddress)}
                            </div>
                        </>
                    ) : <div style={{ color: '#9ca3af' }}>Same as Billing</div>}
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ background: '#2563eb', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 600, width: '40px' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 600 }}>Item</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>HSN/SAC</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px', fontWeight: 600 }}>Rate/Item</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px', fontWeight: 600 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>{index + 1}</td>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                                {/* Placeholder for description if we had it */}
                                {/* <div style={{ fontSize: '10px', color: '#6b7280' }}>Adjustable armrest, Carbon blue...</div> */}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'top' }}>{item.hsn || '-'}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right', verticalAlign: 'top' }}>{formatCurrency(item.rate)}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'right', verticalAlign: 'top', fontWeight: 600 }}>{formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                    {/* Empty rows filler if needed, but keeping it dynamic is better */}
                </tbody>
            </table>

            {/* Footer Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ flex: 1, paddingRight: '40px' }}>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                        Total Items / Qty : {items.length} / {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </div>
                </div>

                <div style={{ width: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600 }}>Taxable Amount</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal)}</span>
                    </div>

                    {totals.igst > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                            <span>IGST</span>
                            <span>{formatCurrency(totals.igst)}</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                                <span>CGST {totals.cgst > 0 ? '9.0%' : ''}</span>
                                <span>{formatCurrency(totals.cgst)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                                <span>SGST {totals.sgst > 0 ? '9.0%' : ''}</span>
                                <span>{formatCurrency(totals.sgst)}</span>
                            </div>
                        </>
                    )}

                    {totals.roundOffAmount !== 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                            <span>Round Off</span>
                            <span>{totals.roundOffAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', marginTop: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>Total</span>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>{formatCurrency(totals.total)}</span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>
                        Amount Payable: <span style={{ color: '#000', fontWeight: 600 }}>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            {/* Amount in Words */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>Total amount (in words): </span>
                <span style={{ fontWeight: 600 }}>INR {numberToWords(Math.round(totals.total))} Only.</span>
            </div>

            {/* Bank & Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div style={{ width: '50%' }}>
                    {/* UPI QR */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {companyDetails.upiId && (
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Pay using UPI:</div>
                                <div style={{ width: '80px', height: '80px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                                    QR CODE
                                </div>
                            </div>
                        )}

                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Bank Details:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 10px', fontSize: '12px' }}>
                                <span style={{ color: '#6b7280' }}>Bank:</span> <span style={{ fontWeight: 600 }}>{companyDetails.bankDetails?.bankName || '-'}</span>
                                <span style={{ color: '#6b7280' }}>Account #:</span> <span style={{ fontWeight: 600 }}>{companyDetails.bankDetails?.accountNumber || '-'}</span>
                                <span style={{ color: '#6b7280' }}>IFSC:</span> <span style={{ fontWeight: 600 }}>{companyDetails.bankDetails?.ifscCode || '-'}</span>
                                <span style={{ color: '#6b7280' }}>Branch:</span> <span style={{ fontWeight: 600 }}>{companyDetails.bankDetails?.branchName || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '40px' }}>For {companyDetails.name}</div>
                    {companyDetails.signatureUrl && (
                        <img src={companyDetails.signatureUrl} alt="Signature" style={{ height: '50px', alignSelf: 'flex-end', marginBottom: '4px' }} />
                    )}
                    <div style={{ width: '120px', height: '60px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', alignSelf: 'flex-end', color: '#2563eb', fontWeight: 700, fontSize: '10px', transform: 'rotate(-10deg)' }}>
                        {companyDetails.signatureUrl ? '' : 'SIGNATURE'}
                    </div>
                </div>
            </div>

            {/* Terms & Notes */}
            <div style={{ marginTop: '30px', fontSize: '10px', color: '#4b5563' }}>
                {details.notes && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>Notes:</div>
                        <div>{details.notes}</div>
                    </div>
                )}
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>Terms and Conditions:</div>
                <div style={{ lineHeight: '1.4' }}>
                    {details.terms || '1. Goods once sold cannot be taken back or exchanged.\n2. We are not the manufacturers, company will stand for warranty as per their terms and conditions.\n3. Subject to local Jurisdiction.'}
                </div>
            </div>

            <div style={{ marginTop: '30px', fontSize: '10px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                <span>Page 1/1</span>
                <span>This is a digitally signed document</span>
            </div>
        </div>
    );
};
