import { calculateGST, formatCurrency } from '../tax';

describe('calculateGST', () => {
    describe('intra-state transactions (same state)', () => {
        it('should split GST equally between CGST and SGST', () => {
            const result = calculateGST(1000, 18, false);

            expect(result.cgst).toBe(90);
            expect(result.sgst).toBe(90);
            expect(result.igst).toBe(0);
            expect(result.totalTax).toBe(180);
        });

        it('should handle 5% GST rate', () => {
            const result = calculateGST(2000, 5, false);

            expect(result.cgst).toBe(50);
            expect(result.sgst).toBe(50);
            expect(result.igst).toBe(0);
            expect(result.totalTax).toBe(100);
        });

        it('should handle 3% GST rate (for jewellery)', () => {
            const result = calculateGST(10000, 3, false);

            expect(result.cgst).toBe(150);
            expect(result.sgst).toBe(150);
            expect(result.igst).toBe(0);
            expect(result.totalTax).toBe(300);
        });

        it('should handle zero amount', () => {
            const result = calculateGST(0, 18, false);

            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
            expect(result.igst).toBe(0);
            expect(result.totalTax).toBe(0);
        });
    });

    describe('inter-state transactions (different states)', () => {
        it('should apply full GST as IGST', () => {
            const result = calculateGST(1000, 18, true);

            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
            expect(result.igst).toBe(180);
            expect(result.totalTax).toBe(180);
        });

        it('should handle 12% GST rate', () => {
            const result = calculateGST(5000, 12, true);

            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
            expect(result.igst).toBe(600);
            expect(result.totalTax).toBe(600);
        });
    });

    describe('edge cases', () => {
        it('should handle decimal amounts', () => {
            const result = calculateGST(999.99, 18, false);

            expect(result.totalTax).toBeCloseTo(179.9982, 2);
        });

        it('should handle zero GST rate', () => {
            const result = calculateGST(1000, 0, false);

            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
            expect(result.igst).toBe(0);
            expect(result.totalTax).toBe(0);
        });
    });
});

describe('formatCurrency', () => {
    it('should format whole numbers in INR', () => {
        const formatted = formatCurrency(1000);

        expect(formatted).toContain('1,000');
        expect(formatted).toMatch(/₹|INR/);
    });

    it('should format decimal amounts', () => {
        const formatted = formatCurrency(1234.56);

        expect(formatted).toContain('1,234.56');
    });

    it('should format large amounts with Indian number system', () => {
        const formatted = formatCurrency(1234567);

        // Indian format: 12,34,567
        expect(formatted).toContain('12,34,567');
    });

    it('should handle zero', () => {
        const formatted = formatCurrency(0);

        expect(formatted).toContain('0');
    });

    it('should handle negative amounts', () => {
        const formatted = formatCurrency(-500);

        expect(formatted).toContain('500');
        expect(formatted).toContain('-');
    });
});
