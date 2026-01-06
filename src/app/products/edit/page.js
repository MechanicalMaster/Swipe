'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { useMasterStore } from '@/lib/store/masterStore';
import { api } from '@/api/backendClient';
import AuthenticatedImage from '@/components/AuthenticatedImage';
import { FiArrowLeft, FiPlusCircle, FiImage, FiMoreHorizontal, FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiLock, FiUnlock, FiX, FiLoader, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import styles from '../page.module.css'; // Reuse styles

export default function EditProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { updateProduct, uploadProductImage, deleteProductImage } = useProductStore();
    const { categories, loadCategories, subCategories, loadSubCategories } = useMasterStore();
    const [loading, setLoading] = useState(true);
    const [skuLocked, setSkuLocked] = useState(true);

    const [formData, setFormData] = useState({
        type: 'product',
        name: '',
        sellingPrice: '',
        purchasePrice: '',
        taxRate: 3,
        unit: 'gms',
        hsn: '',
        category: '',
        subCategory: '',
        sku: '',
        description: '',

        // Metal Attributes
        metalType: 'Gold',
        metalColor: 'Yellow',
        purity: '22K',
        grossWeight: '',
        netWeight: '',
        wastagePercentage: '',
        wastageWeight: '',
        makingCharges: '',
        makingChargesType: 'per_gram',
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
        barcode: '',

        // Optional
        occasion: '',
        collection: '',
        launchDate: '',
        tags: '',

        showOnline: true,
        notForSale: false
    });

    // Existing images from the server (with id and url)
    const [existingImages, setExistingImages] = useState([]);
    // Pending new images to upload (File objects with preview URLs)
    const [pendingImages, setPendingImages] = useState([]);
    // Images being deleted (for UI feedback)
    const [deletingImages, setDeletingImages] = useState(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        loadCategories();
        loadSubCategories();
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            try {
                const product = await api.products.get(id);
                if (product) {
                    // Store existing images separately (use url from API response)
                    setExistingImages(product.images || []);

                    // Map product fields with null-safe defaults to prevent controlled component warnings
                    setFormData(prev => ({
                        ...prev,
                        type: product.type || 'product',
                        name: product.name || '',
                        sellingPrice: product.sellingPrice ?? '',
                        purchasePrice: product.purchasePrice ?? '',
                        taxRate: product.taxRate ?? 3,
                        unit: product.unit || 'gms',
                        hsn: product.hsn || '',
                        category: product.category || '',
                        subCategory: product.subCategory || '',
                        sku: product.sku || '',
                        description: product.description || '',
                        vendorRef: product.vendorRef || '',
                        procurementDate: product.procurementDate || new Date().toISOString().split('T')[0],
                        hallmarkCert: product.hallmarkCert || '',
                        barcode: product.barcode || '',
                        launchDate: product.launchDate || '',
                        occasion: product.occasion || '',
                        collection: product.collection || '',
                        tags: product.tags || '',
                        showOnline: product.showOnline ?? true,
                        notForSale: product.notForSale ?? false,

                        // Flatten Metal Attributes
                        metalType: product.metal?.type || 'Gold',
                        metalColor: product.metal?.color || 'Yellow',
                        purity: product.metal?.purity || '22K',
                        grossWeight: product.metal?.grossWeight ?? '',
                        netWeight: product.metal?.netWeight ?? '',
                        wastagePercentage: product.metal?.wastagePercentage ?? '',
                        wastageWeight: product.metal?.wastageWeight ?? '',
                        makingCharges: product.metal?.makingCharges ?? '',
                        makingChargesType: product.metal?.makingChargesType || 'per_gram',
                        metalRateRef: product.metal?.rateRef || '',

                        // Flatten Gemstone Attributes
                        hasStones: !!product.gemstone,
                        stoneType: product.gemstone?.type || '',
                        stoneCount: product.gemstone?.count ?? '',
                        stoneWeight: product.gemstone?.weight ?? '',
                        stoneShape: product.gemstone?.shape || '',
                        stoneClarity: product.gemstone?.clarity || '',
                        stoneColor: product.gemstone?.color || '',
                        stoneCut: product.gemstone?.cut || '',
                        stoneCertification: product.gemstone?.certification || '',
                        stonePrice: product.gemstone?.price ?? '',
                        stoneSetting: product.gemstone?.setting || '',

                        // Flatten Design Attributes
                        size: product.design?.size || '',
                        pattern: product.design?.pattern || '',
                        customizable: product.design?.customizable ?? false,
                        engravingText: product.design?.engravingText || ''
                    }));
                }
            } catch (error) {
                console.error('Failed to load product', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    const handleSave = async () => {
        if (!formData.name) return alert('Product Name is required');

        // Audit Log for Manual SKU - via backend API
        if (!skuLocked) {
            try {
                await api.auditLogs.create({
                    entityType: 'product',
                    entityId: id,
                    action: 'MANUAL_SKU_OVERRIDE',
                    details: `SKU updated to ${formData.sku}`,
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
            taxRate: formData.taxRate,
            unit: formData.unit,
            hsn: formData.hsn,
            category: formData.category,
            subCategory: formData.subCategory,
            sku: formData.sku,
            description: formData.description,
            vendorRef: formData.vendorRef,
            procurementDate: formData.procurementDate,
            hallmarkCert: formData.hallmarkCert,
            barcode: formData.barcode,
            launchDate: formData.launchDate || null,
            showOnline: formData.showOnline,
            notForSale: formData.notForSale,
            occasion: formData.occasion,
            collection: formData.collection,
            tags: formData.tags,
            // images: NOT included - managed via separate API calls

            // Nested Objects
            metal: {
                type: formData.metalType,
                color: formData.metalColor,
                purity: formData.purity,
                grossWeight: Number(formData.grossWeight || 0),
                netWeight: Number(formData.netWeight || 0),
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
            // Step 1: Update the product (images not affected)
            await updateProduct(id, payload);

            // Step 2: Upload pending new images (if any)
            if (pendingImages.length > 0) {
                setIsUploading(true);
                setUploadProgress({ current: 0, total: pendingImages.length });

                const uploadQueue = [...pendingImages];
                const concurrencyLimit = 2;
                const failedUploads = [];

                const uploadNext = async () => {
                    while (uploadQueue.length > 0) {
                        const img = uploadQueue.shift();
                        try {
                            const result = await uploadProductImage(id, img.file);
                            // Add to existing images for display
                            setExistingImages(prev => [...prev, result]);
                        } catch (error) {
                            console.error('Image upload failed:', error);
                            failedUploads.push(img.file.name);
                        }
                        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                    }
                };

                await Promise.all(
                    Array(Math.min(concurrencyLimit, pendingImages.length))
                        .fill(null)
                        .map(() => uploadNext())
                );

                setIsUploading(false);
                setPendingImages([]);

                if (failedUploads.length > 0) {
                    alert(`Product updated, but ${failedUploads.length} image(s) failed to upload: ${failedUploads.join(', ')}`);
                }
            }

            // Cleanup preview URLs
            pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));

            router.back();
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product: ' + error.message);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPendingImages(prev => [...prev, { file, previewUrl, name: file.name }]);
        }
        e.target.value = '';
    };

    const handleRemovePendingImage = (index) => {
        setPendingImages(prev => {
            const removed = prev[index];
            URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (deletingImages.has(imageId)) return;

        setDeletingImages(prev => new Set(prev).add(imageId));

        try {
            await deleteProductImage(id, imageId);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image: ' + error.message);
        } finally {
            setDeletingImages(prev => {
                const next = new Set(prev);
                next.delete(imageId);
                return next;
            });
        }
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    Edit Product
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

                <input
                    className={styles.input}
                    placeholder="Product Name / Title"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className={styles.select}
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                        style={{ flex: 1 }}
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        className={styles.select}
                        value={formData.subCategory}
                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                        style={{ flex: 1 }}
                        disabled={!formData.category}
                    >
                        <option value="">Select Sub-category</option>
                        {subCategories
                            .filter(sc => {
                                const parent = categories.find(c => c.name === formData.category);
                                return parent && sc.categoryId === parent.id;
                            })
                            .map(sc => (
                                <option key={sc.id} value={sc.name}>{sc.name}</option>
                            ))
                        }
                    </select>
                </div>
            </div>

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
                    title={skuLocked ? "Unlock to override" : "Lock to edit"}
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

            {/* Gemstone Attributes (Collapsible)*/}
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

            {/* Pricing & Inventory*/}
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

            {/* Taxation & Compliance*/}
            <div className={styles.sectionTitle}>Taxation & Compliance</div>
            <div className={styles.card}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        className={styles.input}
                        placeholder="HSN Code"
                        value={formData.hsn}
                        onChange={e => setFormData({ ...formData, hsn: e.target.value })}
                        style={{ flex: 1 }}
                    />
                    <select
                        className={styles.select}
                        value={formData.taxRate}
                        onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                        style={{ flex: 1, marginBottom: 12 }}
                    >
                        <option value={0}>Tax Rate 0%</option>
                        <option value={3}>Tax Rate 3%</option>
                        <option value={5}>Tax Rate 5%</option>
                        <option value={12}>Tax Rate 12%</option>
                        <option value={18}>Tax Rate 18%</option>
                    </select>
                </div>
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

            {/* Media & Attachments*/}
            <div className={styles.sectionTitle}>Product Images</div>
            <div className={styles.card}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    Product images must be PNG or JPEG, recommended 1024 px by 1024 px or 1:1 aspect ratio.
                    {(existingImages.length > 0 || pendingImages.length > 0) && (
                        <span style={{ color: '#3b82f6', marginLeft: 8 }}>
                            ({existingImages.length} saved{pendingImages.length > 0 ? `, ${pendingImages.length} pending` : ''})
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                    {/* Add new image button */}
                    <label style={{
                        width: 80, height: 80, border: '1px dashed #e5e7eb', borderRadius: 8,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                    }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                        <FiImage size={24} color="#3b82f6" />
                        <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>New<br />Image</span>
                    </label>

                    {/* Existing images from server */}
                    {existingImages.map((img) => (
                        <div key={img.id} style={{ position: 'relative', flexShrink: 0 }}>
                            <AuthenticatedImage
                                src={img.url}
                                alt=""
                                style={{
                                    width: 80, height: 80, borderRadius: 8, objectFit: 'cover',
                                    opacity: deletingImages.has(img.id) ? 0.5 : 1
                                }}
                                fallback={
                                    <div style={{
                                        width: 80, height: 80, borderRadius: 8,
                                        background: '#f3f4f6', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FiShoppingBag size={24} color="#ccc" />
                                    </div>
                                }
                            />
                            <button
                                onClick={() => handleDeleteExistingImage(img.id)}
                                disabled={deletingImages.has(img.id)}
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#ef4444', border: 'none', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: deletingImages.has(img.id) ? 'not-allowed' : 'pointer', fontSize: 12
                                }}
                            >
                                {deletingImages.has(img.id) ? <FiLoader size={10} /> : <FiTrash2 size={10} />}
                            </button>
                        </div>
                    ))}

                    {/* Pending new images (not yet uploaded) */}
                    {pendingImages.map((img, idx) => (
                        <div key={`pending-${idx}`} style={{ position: 'relative', flexShrink: 0 }}>
                            <img
                                src={img.previewUrl}
                                alt=""
                                style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px dashed #3b82f6' }}
                            />
                            <button
                                onClick={() => handleRemovePendingImage(idx)}
                                style={{
                                    position: 'absolute', top: -6, right: -6,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#f97316', border: 'none', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 12
                                }}
                            >
                                <FiX size={12} />
                            </button>
                            <span style={{
                                position: 'absolute', bottom: 4, left: 4, right: 4,
                                fontSize: 8, color: '#3b82f6', textAlign: 'center',
                                background: 'rgba(255,255,255,0.9)', borderRadius: 2, padding: '1px 2px'
                            }}>Pending</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Metadata*/}
            <div className={styles.sectionTitle}>Optional Details</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    placeholder="Occasion (Wedding, Daily...)"
                    value={formData.occasion}
                    onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Collection Name"
                    value={formData.collection}
                    onChange={e => setFormData({ ...formData, collection: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Tags (Comma separated)"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                />

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
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isUploading}
                    style={isUploading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                    {isUploading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
                            Uploading {uploadProgress.current}/{uploadProgress.total}...
                        </span>
                    ) : (
                        'Update Product'
                    )}
                </button>
            </div>
        </div >
    );
}
