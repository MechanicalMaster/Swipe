
import Papa from 'papaparse';
import { api } from '@/api/backendClient';
import { useProductStore } from '@/lib/store/productStore';
import { useMasterStore } from '@/lib/store/masterStore';
import { logger, LOG_EVENTS } from '@/lib/logger';

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
            // Fetch products from backend API
            const products = await api.products.list();
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
                metalType: p.type || '',
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

            logger.info(LOG_EVENTS.INVOICE_DOWNLOADED, { type: 'all_products_csv' });
        } catch (error) {
            logger.error(LOG_EVENTS.INVOICE_DOWNLOAD_FAILED, { type: 'all_products_csv', error: error.message });
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

                    // Fetch existing categories/subcategories via API
                    let categories = [];
                    let subCategories = [];
                    try {
                        categories = await api.categories.list();
                        // Extract subcategories from nested response
                        categories.forEach(cat => {
                            if (cat.subcategories) {
                                subCategories.push(...cat.subcategories);
                            }
                        });
                    } catch (err) {
                        logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { type: 'categories', error: err.message });
                    }

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

    // 4. Process File - Sequential POSTs with progress
    processFile: async (rows, userId = 'user', onProgress = null) => {
        let successCount = 0;
        let failureCount = 0;
        const failedRows = [];

        logger.info(LOG_EVENTS.BULK_UPLOAD_START, { count: rows.length });

        try {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                // Report progress
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: rows.length,
                        percent: Math.round(((i + 1) / rows.length) * 100)
                    });
                }

                try {
                    // SKU is now generated by backend
                    const productData = {
                        name: row.product_name,
                        sku: row.product_code || undefined, // Let backend generate if not provided
                        category: row.category,
                        subCategory: row.sub_category,
                        grossWeight: parseFloat(row.gross_weight) || 0,
                        netWeight: parseFloat(row.net_weight) || 0,
                        purity: row.purity,
                        type: row.metal_type,
                        makingCharges: parseFloat(row.making_charge_per_gram) || 0,
                        ratePerGram: parseFloat(row.rate_per_gram) || 0,
                        description: row.description,
                        stock: parseFloat(row.stock_qty) || 1,
                        stoneWeight: parseFloat(row.stone_weight) || 0,
                        size: row.size,
                        hsn: row.hsn_code,
                        sellingPrice: parseFloat(row.selling_price) || 0,
                        purchasePrice: parseFloat(row.purchase_price) || 0,
                        images: []
                    };

                    // Check if product exists by SKU to update
                    if (row.product_code) {
                        const existingProducts = await api.products.list({ sku: row.product_code });
                        if (existingProducts.length > 0) {
                            await api.products.update(existingProducts[0].id, productData);
                            successCount++;
                            continue;
                        }
                    }

                    // Create new product
                    await api.products.create(productData);
                    successCount++;
                } catch (err) {
                    logger.error(LOG_EVENTS.BULK_UPLOAD_ROW_ERROR, { row: i + 1, error: err.message });
                    failureCount++;
                    failedRows.push({ row, error: err.message });
                }
            }

            // Audit
            logger.audit(LOG_EVENTS.BULK_UPLOAD_SUCCESS, {
                total: rows.length,
                success: successCount,
                failed: failureCount
            });

            // Log entry via API (if audit logs endpoint exists)
            try {
                await api.auditLogs.create({
                    entityType: 'bulk_upload',
                    action: 'PRODUCTS_UPLOAD',
                    details: `Total: ${rows.length}, Success: ${successCount}, Failed: ${failureCount}`
                });
            } catch (e) {
                logger.warn(LOG_EVENTS.AUDIT_LOG_FAILED, { error: e.message });
            }

            return { success: true, successCount, failureCount, failedRows };

        } catch (error) {
            logger.error(LOG_EVENTS.BULK_UPLOAD_FAILED, { error: error.message });
            return { success: false, error: error.message };
        }
    }
};
