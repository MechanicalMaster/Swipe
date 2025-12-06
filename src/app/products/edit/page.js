'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { useMasterStore } from '@/lib/store/masterStore';
import { db } from '@/lib/db';
import { FiArrowLeft, FiPlusCircle, FiImage, FiMoreHorizontal, FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiLock, FiUnlock } from 'react-icons/fi';
import styles from '../page.module.css'; // Reuse styles

export default function EditProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { updateProduct } = useProductStore();
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

        images: [],
        showOnline: true,
        notForSale: false
    });

    useEffect(() => {
        loadCategories();
        loadSubCategories();
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            try {
                const product = await db.products.get(Number(id));
                if (product) {
                    setFormData(prev => ({ ...prev, ...product }));
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

        if (!skuLocked) {
            try {
                await db.audit_logs.add({
                    entityType: 'product',
                    entityId: Number(id),
                    action: 'MANUAL_SKU_OVERRIDE',
                    details: `SKU updated to ${formData.sku}`,
                    timestamp: new Date()
                });
            } catch (e) {
                console.error("Failed to log audit", e);
            }
        }

        await updateProduct(Number(id), formData);
        router.back();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, { name: file.name, data: reader.result }]
                }));
            };
            reader.readAsDataURL(file);
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

            {/* Taxation & Compliance */}
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

            {/* Media & Attachments */}
            <div className={styles.sectionTitle}>Product Images</div>
            <div className={styles.card}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    Product images must be PNG or JPEG, recommended 1024 px by 1024 px or 1:1 aspect ratio.
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                    <label style={{
                        width: 80, height: 80, border: '1px dashed #e5e7eb', borderRadius: 8,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0
                    }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                        <FiImage size={24} color="#3b82f6" />
                        <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>New<br />Image</span>
                    </label>
                    {formData.images.map((img, idx) => (
                        <img key={idx} src={img.data} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                </div>
            </div>

            {/* Optional Metadata */}
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
                <button className={styles.saveButton} onClick={handleSave}>Update Product</button>
            </div>
        </div >
    );
}
