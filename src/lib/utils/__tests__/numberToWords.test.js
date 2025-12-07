import { numberToWords } from '../numberToWords';

describe('numberToWords', () => {
    describe('basic numbers (1-19)', () => {
        it('should convert single digit numbers', () => {
            expect(numberToWords(1)).toBe('One only ');
            expect(numberToWords(5)).toBe('Five only ');
            expect(numberToWords(9)).toBe('Nine only ');
        });

        it('should convert teen numbers', () => {
            expect(numberToWords(11)).toBe('Eleven only ');
            expect(numberToWords(15)).toBe('Fifteen only ');
            expect(numberToWords(19)).toBe('Nineteen only ');
        });
    });

    describe('tens (20-99)', () => {
        it('should convert round tens', () => {
            expect(numberToWords(20)).toBe('Twenty only ');
            expect(numberToWords(50)).toBe('Fifty only ');
            expect(numberToWords(90)).toBe('Ninety only ');
        });

        it('should convert compound numbers', () => {
            expect(numberToWords(21)).toBe('Twenty One only ');
            expect(numberToWords(45)).toBe('Forty Five only ');
            expect(numberToWords(99)).toBe('Ninety Nine only ');
        });
    });

    describe('hundreds', () => {
        it('should convert round hundreds', () => {
            // Note: Function doesn't append 'only' for round hundreds without units
            expect(numberToWords(100)).toBe('One Hundred ');
            expect(numberToWords(500)).toBe('Five Hundred ');
        });

        it('should convert compound hundreds', () => {
            expect(numberToWords(101)).toBe('One Hundred and One only ');
            expect(numberToWords(250)).toBe('Two Hundred and Fifty only ');
            expect(numberToWords(999)).toBe('Nine Hundred and Ninety Nine only ');
        });
    });

    describe('thousands', () => {
        it('should convert round thousands', () => {
            // Note: Function doesn't append 'only' for round thousands without units
            expect(numberToWords(1000)).toBe('One Thousand ');
            expect(numberToWords(5000)).toBe('Five Thousand ');
        });

        it('should convert compound thousands', () => {
            expect(numberToWords(1234)).toBe('One Thousand Two Hundred and Thirty Four only ');
            expect(numberToWords(10000)).toBe('Ten Thousand ');
            expect(numberToWords(99999)).toBe('Ninety Nine Thousand Nine Hundred and Ninety Nine only ');
        });
    });

    describe('lakhs (Indian number system)', () => {
        it('should convert round lakhs', () => {
            // Note: Function doesn't append 'only' for round lakhs without units
            expect(numberToWords(100000)).toBe('One Lakh ');
            expect(numberToWords(500000)).toBe('Five Lakh ');
        });

        it('should convert compound lakhs', () => {
            expect(numberToWords(123456)).toBe('One Lakh Twenty Three Thousand Four Hundred and Fifty Six only ');
            expect(numberToWords(999999)).toBe('Nine Lakh Ninety Nine Thousand Nine Hundred and Ninety Nine only ');
        });
    });

    describe('crores (Indian number system)', () => {
        it('should convert round crores', () => {
            // Note: Function doesn't append 'only' for round crores without units
            expect(numberToWords(10000000)).toBe('One Crore ');
            expect(numberToWords(50000000)).toBe('Five Crore ');
        });

        it('should convert compound crores', () => {
            expect(numberToWords(12345678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred and Seventy Eight only ');
        });
    });

    describe('edge cases', () => {
        it('should return empty string for zero', () => {
            expect(numberToWords(0)).toBe('');
        });

        it('should handle typical invoice amounts', () => {
            // Round amounts don't get 'only' suffix
            expect(numberToWords(1500)).toBe('One Thousand Five Hundred ');
            expect(numberToWords(25000)).toBe('Twenty Five Thousand ');
            expect(numberToWords(150000)).toBe('One Lakh Fifty Thousand ');
        });
    });
});
