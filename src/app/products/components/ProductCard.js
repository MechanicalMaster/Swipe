import styles from './ProductCard.module.css';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, onAddToTray, onShare, quantity = 0, isSelectMode = false }) {
    const router = useRouter();

    const isBestseller = product.tags && product.tags.toLowerCase().includes('bestseller');
    const isInTray = quantity > 0;

    // Format fields
    const purity = product.purity || '22K';
    const category = product.category || 'Product';
    const title = `${category} – ${purity}`;
    const weight = product.grossWeight ? `${Number(product.grossWeight).toFixed(2)}g` : '0.00g';
    const stone = product.stoneType || 'Plain Gold';

    const handleCardClick = () => {
        if (!isSelectMode) {
            router.push(`/products/edit?id=${product.id}`);
        }
    };

    const handleAction = (e, callback) => {
        e.stopPropagation();
        callback();
    };

    return (
        <div className={styles.card} onClick={handleCardClick} style={{ cursor: isSelectMode ? 'default' : 'pointer' }}>
            <div className={styles.imageContainer}>
                {/* Badges */}
                <div className={styles.purityBadge}>{purity}</div>
                {isBestseller && (
                    <div className={`${styles.statusBadge} ${styles.bestseller}`}>
                        Bestseller
                    </div>
                )}
                {/* Quantity Badge in Select Mode */}
                {isSelectMode && isInTray && (
                    <div className={styles.quantityBadge}>
                        {quantity}
                    </div>
                )}

                {/* Image */}
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].data} alt={product.name} className={styles.image} />
                ) : (
                    <div className={styles.placeholderImage}>
                        <FiShoppingBag size={32} color="#ccc" />
                    </div>
                )}
            </div>

            <div className={styles.details}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.infoRow}>Weight: {weight} | Stone: {stone}</div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.primaryBtn} ${isInTray ? styles.addedBtn : ''}`}
                    onClick={(e) => handleAction(e, () => onAddToTray(product))}
                >
                    {isInTray ? (
                        <>
                            <FiCheck size={14} style={{ marginRight: 4 }} />
                            Added ({quantity})
                        </>
                    ) : (
                        'Add to Tray'
                    )}
                </button>
                {!isSelectMode && (
                    <button
                        className={styles.iconBtn}
                        onClick={(e) => handleAction(e, () => onShare(product))}
                    >
                        <FaWhatsapp size={18} color="#25D366" />
                    </button>
                )}
            </div>
        </div>
    );
}

