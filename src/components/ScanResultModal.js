'use client';

import { FiShoppingBag, FiX, FiRefreshCw, FiPlus } from 'react-icons/fi';
import AuthenticatedImage from '@/components/AuthenticatedImage';
import styles from './ScanResultModal.module.css';

export default function ScanResultModal({
    isOpen,
    product,
    barcode,
    onAddToTray,
    onScanAgain,
    onAddManually,
    onClose
}) {
    if (!isOpen) return null;

    const hasProduct = !!product;

    // Get image URL - prefer API URL, fallback to base64 data
    const imageUrl = product?.images?.[0]?.url;
    const imageData = product?.images?.[0]?.data;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FiX size={24} />
                </button>

                {hasProduct ? (
                    <>
                        {/* Product Found */}
                        <div className={styles.productCard}>
                            <div className={styles.imageContainer}>
                                {imageUrl ? (
                                    <AuthenticatedImage
                                        src={imageUrl}
                                        alt={product.name}
                                        className={styles.image}
                                        fallback={
                                            <div className={styles.placeholderImage}>
                                                <FiShoppingBag size={40} color="#9ca3af" />
                                            </div>
                                        }
                                    />
                                ) : imageData ? (
                                    <img src={imageData} alt={product.name} className={styles.image} />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <FiShoppingBag size={40} color="#9ca3af" />
                                    </div>
                                )}
                            </div>
                            <div className={styles.productDetails}>
                                <div className={styles.purity}>{product.purity || '22K'}</div>
                                <h3 className={styles.productName}>{product.name || product.subCategory}</h3>
                                <div className={styles.productMeta}>
                                    Weight: {product.grossWeight || 0}g | {product.stoneType || 'Plain Gold'}
                                </div>
                            </div>
                        </div>

                        <button className={styles.primaryBtn} onClick={() => onAddToTray(product)}>
                            <FiPlus size={18} />
                            Add to Tray
                        </button>
                    </>
                ) : (
                    <>
                        {/* Product Not Found */}
                        <div className={styles.notFoundIcon}>
                            <FiShoppingBag size={48} color="#9ca3af" />
                        </div>
                        <h3 className={styles.title}>No Product Found</h3>
                        <p className={styles.message}>
                            No product matches barcode: <strong>{barcode}</strong>
                        </p>

                        <div className={styles.actions}>
                            <button className={styles.secondaryBtn} onClick={onScanAgain}>
                                <FiRefreshCw size={18} />
                                Scan Again
                            </button>
                            <button className={styles.primaryBtn} onClick={() => onAddManually(barcode)}>
                                <FiPlus size={18} />
                                Add Manually
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
