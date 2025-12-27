import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { getTemplate } from '@/components/InvoiceTemplates';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const generatePDF = async (data) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.top = '0';
    document.body.appendChild(div);

    const TemplateComponent = getTemplate(data.templateId || 'modern').component;

    const root = createRoot(div);
    flushSync(() => {
        root.render(<TemplateComponent data={data} />);
    });

    // Wait for render? flushSync should handle it, but images might need load time.
    // Since we have no images yet, it's fine.

    try {
        const templateElement = div.querySelector('#invoice-template');
        if (!templateElement) {
            throw new Error('Invoice template failed to render. Check that all required invoice data (totals, items, customer) is present.');
        }

        const canvas = await html2canvas(templateElement, {
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        if (data.returnBlob) {
            return pdf.output('blob');
        }

        pdf.save(`Invoice-${data.invoiceNumber}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        document.body.removeChild(div);
    }
};
