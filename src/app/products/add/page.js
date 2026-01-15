'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { FiX, FiLoader, FiCheck } from 'react-icons/fi';
import { useMasterStore } from '@/lib/store/masterStore';
import { FiArrowLeft, FiPlusCircle, FiImage, FiMoreHorizontal, FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiLock, FiUnlock, FiRefreshCw } from 'react-icons/fi';
import { useFormValidation } from '@/lib/hooks/formValidation';
import { productSchema } from '@/lib/validation/validationSchemas';
import styles from '../page.module.css';

export default function AddProductPage() {
    const router = useRouter();
    const { addProduct, generateSKU, uploadProductImage } = useProductStore();
    const { categories, loadCategories } = useMasterStore();

    const [skuLocked, setSkuLocked] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const [formData, setFormData] = useState({
        type: 'product', // product, service
        name: '',
        sellingPrice: '',
        purchasePrice: '',
        unit: 'gms', // Default unit
        category: '',
        sku: '',
        description: '',

        // Metal Attributes
        metalType: 'Gold', // Gold, Silver, Platinum
        metalColor: 'Yellow', // Yellow, White, Rose, Two-tone
        purity: '22K', // 24K, 22K, 18K, 14K
        grossWeight: '',
        netWeight: '',
        wastagePercentage: '',
        wastageWeight: '',
        makingCharges: '', // per gram or fixed
        makingChargesType: 'per_gram', // per_gram, fixed
        metalRateRef: '',

        // Gemstone Attributes
        hasStones: false,
        stoneType: '',
        stoneCount: '',
        stoneWeight: '',
        stoneShape: '',
        stoneClarity: '',
        stoneColor: '',
        stoneCut: '',
        stoneCertification: '',
        stonePrice: '',
        stoneSetting: '',

        // Design & Dimensions
        size: '',
        pattern: '',
        customizable: false,
        engravingText: '',

        // Pricing & Inventory
        vendorRef: '',
        procurementDate: new Date().toISOString().split('T')[0],

        // Taxation & Compliance
        hallmarkCert: '',
        barcode: '', // Auto-generated if empty

        // Optional
        launchDate: '',

        showOnline: true,
        notForSale: false
    });

    // Pending images to upload after product creation (File objects with preview URLs)
    const [pendingImages, setPendingImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    // Form validation hook
    const {
        saveStatus,
        lastSavedAtFormatted,
        errors,
        validate,
        markDraft,
        startSaving,
        markSaved,
        markFailed
    } = useFormValidation(productSchema);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        markDraft(field);
    };

    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const initialBarcode = searchParams.get('barcode');

    // Prefill barcode from URL param (from scanner)
    useEffect(() => {
        if (initialBarcode) {
            setFormData(prev => ({ ...prev, barcode: initialBarcode }));
        }
    }, [initialBarcode]);

    // Auto-generate SKU based on category
    useEffect(() => {
        const gen = async () => {
            if (formData.category && skuLocked) {
                const newSku = await generateSKU(formData.category, formData.category);
                setFormData(prev => ({ ...prev, sku: newSku }));
            }
        };
        gen();
    }, [formData.category, skuLocked]);

    const handleSave = async () => {
        // Validate before submit
        const { success } = validate(formData);
        if (!success) return;

        // Double-submit prevention
        if (!startSaving()) return;

        // Audit Log for Manual SKU - via backend API
        if (!skuLocked) {
            try {
                const { api } = await import('@/api/backendClient');
                await api.auditLogs.create({
                    entityType: 'product',
                    entityId: null, // ID unknown yet
                    action: 'MANUAL_SKU_OVERRIDE',
                    details: `SKU set to ${formData.sku}`,
                });
            } catch (e) {
                console.error("Failed to log audit", e);
            }
        }

        // Product payload - NO images (managed separately per API spec)
        const payload = {
            type: formData.type,
            name: formData.name,
            sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : null,
            purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
            unit: formData.unit,
            category: formData.category,
            sku: formData.sku,
            description: formData.description,
            vendorRef: formData.vendorRef,
            procurementDate: formData.procurementDate,
            hallmarkCert: formData.hallmarkCert,
            barcode: formData.barcode,
            launchDate: formData.launchDate || null,
            showOnline: Boolean(formData.showOnline),
            notForSale: Boolean(formData.notForSale),
            // images: NOT included - managed via separate API calls

            // Top-level jewellery fields (per updated schema)
            grossWeight: Number(formData.grossWeight || 0),
            netWeight: Number(formData.netWeight || 0),
            purity: formData.purity,

            // Nested Objects
            metal: {
                type: formData.metalType,
                color: formData.metalColor,
                wastagePercentage: Number(formData.wastagePercentage || 0),
                wastageWeight: Number(formData.wastageWeight || 0),
                makingCharges: Number(formData.makingCharges || 0),
                makingChargesType: formData.makingChargesType,
                rateRef: formData.metalRateRef
            },

            gemstone: formData.hasStones ? {
                type: formData.stoneType,
                count: Number(formData.stoneCount || 0),
                weight: Number(formData.stoneWeight || 0),
                shape: formData.stoneShape,
                clarity: formData.stoneClarity,
                color: formData.stoneColor,
                cut: formData.stoneCut,
                certification: formData.stoneCertification,
                price: Number(formData.stonePrice || 0),
                setting: formData.stoneSetting
            } : null,

            design: {
                size: formData.size,
                pattern: formData.pattern,
                customizable: formData.customizable,
                engravingText: formData.engravingText
            }
        };

        try {
            // Step 1: Create the product first
            const productId = await addProduct(payload);

            // Step 2: Upload pending images (if any) AFTER product exists
            if (pendingImages.length > 0 && productId) {
                setIsUploading(true);
                setUploadProgress({ current: 0, total: pendingImages.length });

                // Upload with concurrency limit (2 at a time to avoid mobile radio saturation)
                const uploadQueue = [...pendingImages];
                const concurrencyLimit = 2;
                const failedUploads = [];

                const uploadNext = async () => {
                    while (uploadQueue.length > 0) {
                        const img = uploadQueue.shift();
                        try {
                            await uploadProductImage(productId, img.file);
                        } catch (error) {
                            console.error('Image upload failed:', error);
                            failedUploads.push(img.file.name);
                        }
                        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                    }
                };

                // Start concurrent uploads
                await Promise.all(
                    Array(Math.min(concurrencyLimit, pendingImages.length))
                        .fill(null)
                        .map(() => uploadNext())
                );

                setIsUploading(false);

                if (failedUploads.length > 0) {
                    alert(`Product saved, but ${failedUploads.length} image(s) failed to upload: ${failedUploads.join(', ')}`);
                }
            }

            // Cleanup preview URLs
            pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));

            if (returnUrl) {
                router.push(returnUrl);
            } else {
                router.push('/products');
            }
        } catch (error) {
            markFailed(error);
            console.error('Failed to save product:', error);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Store file object with preview URL (not base64)
            const previewUrl = URL.createObjectURL(file);
            setPendingImages(prev => [...prev, { file, previewUrl, name: file.name }]);
        }
        // Reset input to allow selecting same file again
        e.target.value = '';
    };

    const handleRemovePendingImage = (index) => {
        setPendingImages(prev => {
            const removed = prev[index];
            URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    Add Product
                </div>
                <FiMoreHorizontal size={24} />
            </div>

            {/* Core Product Metadata */}
            <div className={styles.sectionTitle}>Core Details</div>
            <div className={styles.card}>
                <div className={styles.radioGroup} style={{ marginBottom: 16 }}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            checked={formData.type === 'product'}
                            onChange={() => setFormData({ ...formData, type: 'product' })}
                        /> Product
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            checked={formData.type === 'service'}
                            onChange={() => setFormData({ ...formData, type: 'service' })}
                        /> Service
                    </label>
                </div>

                <div style={{ marginBottom: 12 }}>
                    <input
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Product Name / Title"
                        value={formData.name}
                        onChange={e => handleFieldChange('name', e.target.value)}
                        style={{ marginBottom: errors.name ? 4 : 0 }}
                    />
                    {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
                </div>
                <select
                    className={styles.select}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ marginBottom: 12 }}
                >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
                <div style={{ position: 'relative' }}>
                    <input
                        className={styles.input}
                        placeholder="SKU / Product Code"
                        value={formData.sku}
                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        disabled={skuLocked}
                        style={{ paddingRight: 40, backgroundColor: skuLocked ? '#f3f4f6' : 'white' }}
                    />
                    <div
                        onClick={() => setSkuLocked(!skuLocked)}
                        style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            cursor: 'pointer', color: '#6b7280'
                        }}
                        title={skuLocked ? "Unlock to override" : "Lock to auto-generate"}
                    >
                        {skuLocked ? <FiLock /> : <FiUnlock />}
                    </div>
                </div>

                <textarea
                    className={styles.input}
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{ resize: 'none', paddingTop: 14, height: 'auto', minHeight: '80px' }}
                />
            </div>

            {/* Metal-Specific Attributes */}
            <div className={styles.sectionTitle}>Metal Attributes</div>
            <div className={styles.card}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className={styles.select}
                        value={formData.metalType}
                        onChange={e => setFormData({ ...formData, metalType: e.target.value })}
                        style={{ flex: 1 }}
                    >
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                    </select>
                    <select
                        className={styles.select}
                        value={formData.metalColor}
                        onChange={e => setFormData({ ...formData, metalColor: e.target.value })}
                        style={{ flex: 1 }}
                    >
                        <option value="Yellow">Yellow</option>
                        <option value="White">White</option>
                        <option value="Rose">Rose</option>
                        <option value="Two-tone">Two-tone</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className={styles.select}
                        value={formData.purity}
                        onChange={e => setFormData({ ...formData, purity: e.target.value })}
                        style={{ flex: 1 }}
                    >
                        <option value="24K">24K (999)</option>
                        <option value="22K">22K (916)</option>
                        <option value="18K">18K (750)</option>
                        <option value="14K">14K (585)</option>
                    </select>
                    <input
                        className={styles.input}
                        type="number"
                        placeholder="Gross Weight (g)"
                        value={formData.grossWeight}
                        onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        className={styles.input}
                        type="number"
                        placeholder="Net Metal Weight (g)"
                        value={formData.netWeight}
                        onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
                        style={{ flex: 1 }}
                    />
                    <input
                        className={styles.input}
                        type="number"
                        placeholder="Wastage %"
                        value={formData.wastagePercentage}
                        onChange={e => setFormData({ ...formData, wastagePercentage: e.target.value })}
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        className={styles.input}
                        type="number"
                        placeholder="Making Charges"
                        value={formData.makingCharges}
                        onChange={e => setFormData({ ...formData, makingCharges: e.target.value })}
                        style={{ flex: 2 }}
                    />
                    <select
                        className={styles.select}
                        value={formData.makingChargesType}
                        onChange={e => setFormData({ ...formData, makingChargesType: e.target.value })}
                        style={{ flex: 1 }}
                    >
                        <option value="per_gram">Per Gram</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>
            </div>

            {/* Gemstone Attributes (Collapsible) */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                <div
                    onClick={() => setFormData({ ...formData, hasStones: !formData.hasStones })}
                    style={{
                        padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer', background: formData.hasStones ? '#f9fafb' : 'white'
                    }}
                >
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Gemstone / Diamond Attributes
                        {formData.hasStones && <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4 }}>Active</span>}
                    </div>
                    {formData.hasStones ? <FiMinus /> : <FiPlus />}
                </div>

                {formData.hasStones && (
                    <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className={styles.input}
                                placeholder="Stone Type (e.g. Diamond, Ruby)"
                                value={formData.stoneType}
                                onChange={e => setFormData({ ...formData, stoneType: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <input
                                className={styles.input}
                                type="number"
                                placeholder="Total Count"
                                value={formData.stoneCount}
                                onChange={e => setFormData({ ...formData, stoneCount: e.target.value })}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className={styles.input}
                                type="number"
                                placeholder="Weight (carats)"
                                value={formData.stoneWeight}
                                onChange={e => setFormData({ ...formData, stoneWeight: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <input
                                className={styles.input}
                                placeholder="Shape (Round, Oval)"
                                value={formData.stoneShape}
                                onChange={e => setFormData({ ...formData, stoneShape: e.target.value })}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className={styles.input}
                                placeholder="Clarity (SI, VS, VVS)"
                                value={formData.stoneClarity}
                                onChange={e => setFormData({ ...formData, stoneClarity: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <input
                                className={styles.input}
                                placeholder="Color (D, E, F...)"
                                value={formData.stoneColor}
                                onChange={e => setFormData({ ...formData, stoneColor: e.target.value })}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <input
                            className={styles.input}
                            placeholder="Certification (GIA, IGI...)"
                            value={formData.stoneCertification}
                            onChange={e => setFormData({ ...formData, stoneCertification: e.target.value })}
                        />
                        <input
                            className={styles.input}
                            type="number"
                            placeholder="Stone Price / Charges"
                            value={formData.stonePrice}
                            onChange={e => setFormData({ ...formData, stonePrice: e.target.value })}
                        />
                    </div>
                )}
            </div>

            {/* Design & Dimensions (Collapsible) */}
            <div className={styles.card} style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div
                    onClick={() => setFormData(prev => ({ ...prev, showDesign: !prev.showDesign }))}
                    style={{
                        padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer', background: formData.showDesign ? '#f9fafb' : 'white'
                    }}
                >
                    <div style={{ fontWeight: 600 }}>Design & Dimension Attributes</div>
                    {formData.showDesign ? <FiMinus /> : <FiPlus />}
                </div>

                {formData.showDesign && (
                    <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
                        <input
                            className={styles.input}
                            placeholder="Size (Ring size, Length)"
                            value={formData.size}
                            onChange={e => setFormData({ ...formData, size: e.target.value })}
                        />
                        <input
                            className={styles.input}
                            placeholder="Pattern / Design Details"
                            value={formData.pattern}
                            onChange={e => setFormData({ ...formData, pattern: e.target.value })}
                        />
                        <input
                            className={styles.input}
                            placeholder="Engraving Text"
                            value={formData.engravingText}
                            onChange={e => setFormData({ ...formData, engravingText: e.target.value })}
                        />
                        <div className={styles.toggleRow} style={{ marginTop: 8 }}>
                            <span className={styles.toggleLabel}>Customizable</span>
                            <input
                                type="checkbox"
                                checked={formData.customizable}
                                onChange={e => setFormData({ ...formData, customizable: e.target.checked })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing & Inventory */}
            <div className={styles.sectionTitle}>Pricing & Inventory</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    type="number"
                    placeholder="Selling Price (Final)"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                />
                <input
                    className={styles.input}
                    type="number"
                    placeholder="Purchase Price / Cost"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        className={styles.input}
                        placeholder="Vendor Reference"
                        value={formData.vendorRef}
                        onChange={e => setFormData({ ...formData, vendorRef: e.target.value })}
                        style={{ flex: 1 }}
                    />
                    <input
                        className={styles.input}
                        type="date"
                        placeholder="Procurement Date"
                        value={formData.procurementDate}
                        onChange={e => setFormData({ ...formData, procurementDate: e.target.value })}
                        style={{ flex: 1 }}
                    />
                </div>
            </div>

            {/* Compliance */}
            <div className={styles.sectionTitle}>Compliance</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    placeholder="BIS Hallmark Cert Number"
                    value={formData.hallmarkCert}
                    onChange={e => setFormData({ ...formData, hallmarkCert: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Barcode (Auto-generated if empty)"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                />
            </div>

            {/* Media & Attachments */}
            <div className={styles.sectionTitle}>Product Images</div>
            <div className={styles.card}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    Product images must be PNG or JPEG, recommended 1024 px by 1024 px or 1:1 aspect ratio.
                    {pendingImages.length > 0 && (
                        <span style={{ color: '#3b82f6', marginLeft: 8 }}>
                            ({pendingImages.length} image{pendingImages.length > 1 ? 's' : ''} ready to upload)
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                    <label style={{
                        width: 80, height: 80, border: '1px dashed #e5e7eb', borderRadius: 8,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                    }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                        <FiImage size={24} color="#3b82f6" />
                        <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>New<br />Image</span>
                    </label>
                    {pendingImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={img.previewUrl} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                            <button
                                onClick={() => handleRemovePendingImage(idx)}
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#ef4444', border: 'none', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 12
                                }}
                            >
                                <FiX size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Metadata */}
            <div className={styles.sectionTitle}>Optional Details</div>
            <div className={styles.card}>

                <div className={styles.toggleRow} style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                    <span className={styles.toggleLabel}>Show in online store</span>
                    <input
                        type="checkbox"
                        checked={formData.showOnline}
                        onChange={e => setFormData({ ...formData, showOnline: e.target.checked })}
                    />
                </div>
                <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>Not For Sale</span>
                    <input
                        type="checkbox"
                        checked={formData.notForSale}
                        onChange={e => setFormData({ ...formData, notForSale: e.target.checked })}
                    />
                </div>
            </div>

            <div className={styles.footer}>
                {/* Save Status Indicator */}
                {saveStatus === 'saved' && lastSavedAtFormatted && (
                    <div className={styles.saveIndicator}>
                        <FiCheck size={14} /> Saved at {lastSavedAtFormatted}
                    </div>
                )}
                {saveStatus === 'failed' && (
                    <div className={`${styles.saveIndicator} ${styles.saveIndicatorFailed}`}>
                        Save failed. Your changes are safe.
                    </div>
                )}
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isUploading || saveStatus === 'saving'}
                    style={(isUploading || saveStatus === 'saving') ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                    {saveStatus === 'saving' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
                            Saving...
                        </span>
                    ) : isUploading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
                            Uploading {uploadProgress.current}/{uploadProgress.total}...
                        </span>
                    ) : (
                        'Add Product'
                    )}
                </button>
            </div>
        </div >
    );
}
