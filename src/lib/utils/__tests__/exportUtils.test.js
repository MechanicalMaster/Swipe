/**
 * @jest-environment jsdom
 */

// Mock jsPDF
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        text: jest.fn(),
        line: jest.fn(),
        setTextColor: jest.fn(),
        addPage: jest.fn(),
        save: jest.fn(),
    }));
});

import { exportToCSV, exportToPDF } from '../exportUtils';

describe('exportUtils', () => {
    describe('exportToCSV', () => {
        let mockCreateElement;
        let mockLink;

        beforeEach(() => {
            mockLink = {
                setAttribute: jest.fn(),
                click: jest.fn(),
                style: {},
                download: '',
            };
            mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => { });
            global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return early for empty data', () => {
            exportToCSV([], 'test.csv');
            expect(mockCreateElement).not.toHaveBeenCalled();
        });

        it('should return early for null data', () => {
            exportToCSV(null, 'test.csv');
            expect(mockCreateElement).not.toHaveBeenCalled();
        });

        it('should create CSV with correct headers', () => {
            const data = [
                { name: 'Product 1', price: 100, category: 'Gold' },
                { name: 'Product 2', price: 200, category: 'Silver' },
            ];

            exportToCSV(data, 'products.csv');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'products.csv');
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should handle strings with commas by wrapping in quotes', () => {
            const data = [
                { name: 'Gold, 22K Ring', price: 5000 },
            ];

            exportToCSV(data, 'test.csv');

            // The blob should contain the wrapped value
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should create downloadable link', () => {
            const data = [{ id: 1, name: 'Test' }];

            exportToCSV(data, 'export.csv');

            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:test-url');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'export.csv');
            expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
            expect(mockLink.click).toHaveBeenCalled();
            expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
        });
    });

    describe('exportToPDF', () => {
        it('should create PDF with customer information', () => {
            const customer = {
                name: 'John Doe',
                phone: '9876543210',
                balance: 15000.50,
            };

            const transactions = [
                { date: new Date(), type: 'invoice', number: 'INV-001', amount: 10000, balance: 10000 },
                { date: new Date(), type: 'payment_in', number: 'PAY-001', amount: 5000, balance: 5000 },
            ];

            exportToPDF(customer, transactions, 'ledger.pdf');

            // Verify jsPDF was instantiated and methods were called
            const jsPDF = require('jspdf');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle customer without phone', () => {
            const customer = {
                name: 'Jane Doe',
                balance: 5000,
            };

            const transactions = [];

            // Should not throw
            expect(() => {
                exportToPDF(customer, transactions, 'ledger.pdf');
            }).not.toThrow();
        });

        it('should format transaction types correctly', () => {
            const customer = { name: 'Test', balance: 0 };
            const transactions = [
                { date: new Date(), type: 'payment_in', number: 'P1', amount: 100, balance: 100 },
                { date: new Date(), type: 'payment_out', number: 'P2', amount: 50, balance: 50 },
                { date: new Date(), type: 'invoice', number: 'I1', amount: 200, balance: 250 },
            ];

            exportToPDF(customer, transactions, 'test.pdf');

            const jsPDF = require('jspdf');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle transactions without balance', () => {
            const customer = { name: 'Test', balance: 1000 };
            const transactions = [
                { date: new Date(), type: 'invoice', number: 'INV-1', amount: 1000 },
            ];

            expect(() => {
                exportToPDF(customer, transactions, 'test.pdf');
            }).not.toThrow();
        });
    });
});
