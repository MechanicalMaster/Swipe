export const calculateGST = (amount, rate, isInterState) => {
    const gstAmount = (amount * rate) / 100;
    if (isInterState) {
        return {
            cgst: 0,
            sgst: 0,
            igst: gstAmount,
            totalTax: gstAmount
        };
    } else {
        return {
            cgst: gstAmount / 2,
            sgst: gstAmount / 2,
            igst: 0,
            totalTax: gstAmount
        };
    }
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
};
