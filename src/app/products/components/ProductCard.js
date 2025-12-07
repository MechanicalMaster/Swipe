import styles from './ProductCard.module.css';
import { FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, onAddToTray, onShare }) {
    const router = useRouter();

    // Infer badges
    // Removed "New" tag as requested. Retaining Bestseller if needed, or remove all if implied? 
    // "Remove the 'New' tag" was specific. I'll keep Bestseller for now to be safe, or check complexity.
    // Let's keep logic simple.
    const isBestseller = product.tags && product.tags.toLowerCase().includes('bestseller');

    // Format fields
    const purity = product.purity || '22K';
    const category = product.category || 'Product';
    const title = `${category} – ${purity}`;
    const weight = product.grossWeight ? `${Number(product.grossWeight).toFixed(2)}g` : '0.00g';
    const stone = product.stoneType || 'Plain Gold';
    // Price removed as requested

    const handleCardClick = () => {
        router.push(`/products/edit?id=${product.id}`);
    };

    const handleAction = (e, callback) => {
        e.stopPropagation();
        callback();
    };

    return (
        <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className={styles.imageContainer}>
                {/* Badges */}
                <div className={styles.purityBadge}>{purity}</div>
                {isBestseller && (
                    <div className={`${styles.statusBadge} ${styles.bestseller}`}>
                        Bestseller
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
                {/* Price Removed */}
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.primaryBtn}
                    onClick={(e) => handleAction(e, () => onAddToTray(product))}
                >
                    Add to Tray
                </button>
                <button
                    className={styles.iconBtn}
                    onClick={(e) => handleAction(e, () => onShare(product))}
                >
                    <FaWhatsapp size={18} color="#25D366" />
                </button>
                {/* Edit and Duplicate buttons removed */}
            </div>
        </div>
    );
}
