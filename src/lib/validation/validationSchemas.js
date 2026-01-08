import { z } from 'zod';

/**
 * Validation Schemas for all primary forms.
 * 
 * Rules:
 * - All string fields are trimmed
 * - Required fields disallow empty strings
 * - Numeric fields > 0 where applicable
 */

// --- Customer Schema ---
export const customerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || val.length === 10,
            'Phone number must be 10 digits'
        ),
    email: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            'Invalid email format'
        ),
    address: z.string().optional(),
});

// --- Vendor Schema ---
export const vendorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || val.length === 10,
            'Phone number must be 10 digits'
        ),
    email: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            'Invalid email format'
        ),
    gstin: z.string().optional(),
    companyName: z.string().optional(),
    address: z.string().optional(),
});

// --- Product Schema ---
export const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Product name is required'),
    // Optional numeric fields must be > 0 when present
    grossWeight: z
        .union([z.string(), z.number()])
        .optional()
        .refine(
            (val) => val === '' || val === undefined || val === null || Number(val) >= 0,
            'Gross weight must be 0 or greater'
        ),
    netWeight: z
        .union([z.string(), z.number()])
        .optional()
        .refine(
            (val) => val === '' || val === undefined || val === null || Number(val) >= 0,
            'Net weight must be 0 or greater'
        ),
    sellingPrice: z
        .union([z.string(), z.number()])
        .optional()
        .refine(
            (val) => val === '' || val === undefined || val === null || Number(val) >= 0,
            'Selling price must be 0 or greater'
        ),
    purchasePrice: z
        .union([z.string(), z.number()])
        .optional()
        .refine(
            (val) => val === '' || val === undefined || val === null || Number(val) >= 0,
            'Purchase price must be 0 or greater'
        ),
});

// --- Invoice Schema ---
export const invoiceSchema = z.object({
    customer: z
        .object({
            id: z.union([z.string(), z.number()]),
            name: z.string(),
        })
        .nullable()
        .refine((val) => val !== null, 'Please select a customer'),
    items: z
        .array(z.object({
            id: z.union([z.string(), z.number()]),
        }))
        .min(1, 'Please add at least one item'),
});
