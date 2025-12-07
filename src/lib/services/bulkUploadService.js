
import Papa from 'papaparse';
import { db } from '@/lib/db';
import { useProductStore } from '@/lib/store/productStore';

export const BulkUploadService = {
    // 1. Download Template
    downloadTemplate: () => {
        const headers = [
            'product_name', 'product_code', 'category', 'sub_category',
            'gross_weight', 'net_weight', 'purity', 'metal_type',
            'making_charge_per_gram', 'rate_per_gram', 'description',
            'stock_qty', 'stone_weight', 'size', 'hsn_code', 'selling_price', 'purchase_price'
        ];

        const csvContent = headers.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'product_bulk_upload_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 2. Download All Products
    downloadAllProducts: async () => {
        try {
            const products = await db.products.toArray();
            if (products.length === 0) {
                alert("No products to download.");
                return;
            }

            const headers = [
                'sku', 'name', 'category', 'subCategory', 'grossWeight', 'netWeight',
                'purity', 'metalType', 'makingCharge', 'sellingPrice', 'description',
                'stock', 'stoneWeight', 'size', 'hsn', 'purchasePrice'
            ];

            const csvData = products.map(p => ({
                sku: p.sku || '',
                name: p.name || '',
                category: p.category || '',
                subCategory: p.subCategory || '',
                grossWeight: p.grossWeight || 0,
                netWeight: p.netWeight || 0,
                purity: p.purity || '',
                metalType: p.type || '', // mapping metal type to type in db
                makingCharge: p.makingCharges || 0,
                sellingPrice: p.sellingPrice || 0,
                description: p.description || '',
                stock: p.stock || 0,
                stoneWeight: p.stoneWeight || 0,
                size: p.size || '',
                hsn: p.hsn || '',
                purchasePrice: p.purchasePrice || 0
            }));

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(fieldName => {
                    const value = row[fieldName];
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'all_products.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading products:", error);
            throw error;
        }
    },

    // 3. Validate File
    validateFile: (file) => {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    const rows = results.data;
                    const errors = [];
                    const validRows = [];

                    // Fetch existing categories/subcategories for validation
                    const categories = await db.categories.toArray();
                    const subCategories = await db.subCategories.toArray();
                    const categoryNames = new Set(categories.map(c => c.name.toLowerCase()));
                    const subCategoryNames = new Set(subCategories.map(s => s.name.toLowerCase()));

                    rows.forEach((row, index) => {
                        const rowNum = index + 2; // +1 for 0-index, +1 for header
                        const rowErrors = [];

                        // Mandatory Fields
                        if (!row.product_name) rowErrors.push(`Row ${rowNum}: product_name is required.`);
                        if (!row.category) rowErrors.push(`Row ${rowNum}: category is required.`);

                        // Category Validation
                        if (row.category && !categoryNames.has(row.category.toLowerCase().trim())) {
                            rowErrors.push(`Row ${rowNum}: Category '${row.category}' not found.`);
                        }

                        // SubCategory Validation
                        if (row.sub_category && !subCategoryNames.has(row.sub_category.toLowerCase().trim())) {
                            rowErrors.push(`Row ${rowNum}: SubCategory '${row.sub_category}' not found.`);
                        }

                        // Numeric Validations
                        if (row.gross_weight && isNaN(parseFloat(row.gross_weight))) {
                            rowErrors.push(`Row ${rowNum}: gross_weight must be numeric.`);
                        }
                        if (row.net_weight && isNaN(parseFloat(row.net_weight))) {
                            rowErrors.push(`Row ${rowNum}: net_weight must be numeric.`);
                        }
                        if (row.selling_price && isNaN(parseFloat(row.selling_price))) {
                            rowErrors.push(`Row ${rowNum}: selling_price must be numeric.`);
                        }

                        if (rowErrors.length > 0) {
                            errors.push(...rowErrors);
                        } else {
                            validRows.push(row);
                        }
                    });

                    resolve({
                        valid: errors.length === 0,
                        errors,
                        data: validRows,
                        totalReceived: rows.length
                    });
                },
                error: (err) => {
                    resolve({ valid: false, errors: [`CSV Parse Error: ${err.message}`], data: [] });
                }
            });
        });
    },

    // 4. Process File
    processFile: async (rows, userId = 'user') => { // userId hardcoded for now or passed from auth
        let successCount = 0;
        let failureCount = 0;
        const failedRows = [];

        try {
            for (const row of rows) {
                try {
                    // Logic to auto-generate SKU if needed
                    let sku = row.product_code;
                    if (!sku) {
                        const store = useProductStore.getState();
                        sku = await store.generateSKU(row.category, row.sub_category);
                        await store.incrementSKUSequence();
                    }

                    const productData = {
                        name: row.product_name,
                        sku: sku,
                        category: row.category,
                        subCategory: row.sub_category,
                        grossWeight: parseFloat(row.gross_weight) || 0,
                        netWeight: parseFloat(row.net_weight) || 0,
                        purity: row.purity,
                        type: row.metal_type, // DB uses 'type' for metal type usually? or checks schema
                        makingCharges: parseFloat(row.making_charge_per_gram) || 0,
                        ratePerGram: parseFloat(row.rate_per_gram) || 0,
                        description: row.description,
                        stock: parseFloat(row.stock_qty) || 1,
                        stoneWeight: parseFloat(row.stone_weight) || 0,
                        size: row.size,
                        hsn: row.hsn_code,
                        sellingPrice: parseFloat(row.selling_price) || 0,
                        purchasePrice: parseFloat(row.purchase_price) || 0,
                        images: [], // Placeholder
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    // Check if product exists by SKU to update? 
                    // For now, if SKU is provided and exists, we update. If not, create.
                    let existingProduct = null;
                    if (row.product_code) {
                        existingProduct = await db.products.where('sku').equals(row.product_code).first();
                    }

                    if (existingProduct) {
                        await db.products.update(existingProduct.id, productData);
                    } else {
                        await db.products.add(productData);
                    }
                    successCount++;
                } catch (err) {
                    console.error("Row processing error", err);
                    failureCount++;
                    failedRows.push({ row, error: err.message });
                }
            }

            // Log entry
            await db.bulk_upload_logs.add({
                userId,
                fileName: 'bulk_upload.csv', // Ideally passed in
                totalRecords: rows.length,
                successCount,
                failureCount,
                timestamp: new Date()
            });

            return { success: true, successCount, failureCount, failedRows };

        } catch (error) {
            console.error("Bulk process critical error", error);
            return { success: false, error: error.message };
        }
    }
};
