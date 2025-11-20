'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/lib/store/productStore';
import { FiArrowLeft, FiPlusCircle, FiImage, FiMoreHorizontal } from 'react-icons/fi';
import styles from '../page.module.css';

export default function AddProductPage() {
    const router = useRouter();
    const { addProduct } = useProductStore();
    const [formData, setFormData] = useState({
        type: 'product', // product, service
        name: '',
        sellingPrice: '',
        purchasePrice: '',
        taxRate: 18,
        unit: '',
        hsn: '',
        category: '',
        description: '',
        barcode: '',
        images: [],
        showOnline: true,
        notForSale: false
    });

    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');

    const handleSave = async () => {
        if (!formData.name) return alert('Product Name is required');
        await addProduct(formData);
        if (returnUrl) {
            router.push(returnUrl);
        } else {
            router.push('/products');
        }
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    Add Product
                </div>
                <FiMoreHorizontal size={24} />
            </div>

            <div className={styles.sectionTitle}>Product Details</div>
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
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    className={styles.input}
                    type="number"
                    placeholder="Selling Price"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                />
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: -8, marginBottom: 12 }}>Inclusive of taxes</div>

                <select
                    className={styles.select}
                    value={formData.taxRate}
                    onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                >
                    <option value={0}>Tax Rate 0%</option>
                    <option value={5}>Tax Rate 5%</option>
                    <option value={12}>Tax Rate 12%</option>
                    <option value={18}>Tax Rate 18%</option>
                    <option value={28}>Tax Rate 28%</option>
                </select>

                <div className={styles.link}>
                    <FiPlusCircle /> Enter GSTIN to add/change Tax
                </div>

                <input
                    className={styles.input}
                    type="number"
                    placeholder="Purchase Price"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                />
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: -8 }}>Inclusive of taxes</div>
            </div>

            <div className={styles.sectionTitle}>Units</div>
            <div className={styles.card}>
                <select
                    className={styles.select}
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ marginBottom: 0 }}
                >
                    <option value="">Select Unit</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ltr">Liters (ltr)</option>
                    <option value="box">Box</option>
                </select>
            </div>

            <div className={styles.sectionTitle}>Optional Fields</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    placeholder="HSN Code"
                    value={formData.hsn}
                    onChange={e => setFormData({ ...formData, hsn: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <input
                    className={styles.input}
                    placeholder="Barcode"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                />
            </div>

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

            <div className={styles.card}>
                <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>Show in online store</span>
                    <input
                        type="checkbox"
                        checked={formData.showOnline}
                        onChange={e => setFormData({ ...formData, showOnline: e.target.checked })}
                    />
                </div>
                <div className={styles.toggleRow} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <span className={styles.toggleLabel}>Not For Sale</span>
                    <input
                        type="checkbox"
                        checked={formData.notForSale}
                        onChange={e => setFormData({ ...formData, notForSale: e.target.checked })}
                    />
                </div>
                <div className={styles.link} style={{ marginTop: 12, color: '#6b7280' }}>
                    <FiMoreHorizontal /> Add more details
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.saveButton} onClick={handleSave}>Add Product</button>
            </div>
        </div>
    );
}
