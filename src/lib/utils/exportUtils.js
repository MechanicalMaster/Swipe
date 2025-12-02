import jsPDF from 'jspdf';

export const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const value = row[fieldName];
            // Handle strings with commas by wrapping in quotes
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = (customer, transactions, filename) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(customer.name, 14, 22);
    doc.setFontSize(12);
    doc.text(`Phone: ${customer.phone || 'N/A'}`, 14, 30);
    doc.text(`Balance: ${customer.balance?.toFixed(2)}`, 14, 38);

    // Table Header
    let y = 50;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Date', 14, y);
    doc.text('Type', 60, y);
    doc.text('Number', 100, y);
    doc.text('Amount', 150, y);
    doc.text('Balance', 180, y);

    doc.line(14, y + 2, 200, y + 2); // Header line
    y += 10;
    doc.setTextColor(0);

    // Table Rows
    transactions.forEach(tx => {
        if (y > 280) { // New page
            doc.addPage();
            y = 20;
        }

        const date = new Date(tx.date).toLocaleDateString();
        const type = tx.type === 'payment_in' ? 'Payment In' :
            tx.type === 'payment_out' ? 'Payment Out' : 'Invoice';
        const number = tx.number;
        const amount = tx.amount.toFixed(2);
        const balance = tx.balance !== undefined ? tx.balance.toFixed(2) : '-';

        doc.text(date, 14, y);
        doc.text(type, 60, y);
        doc.text(number, 100, y);
        doc.text(amount, 150, y);
        doc.text(balance, 180, y);

        y += 8;
    });

    doc.save(filename);
};
