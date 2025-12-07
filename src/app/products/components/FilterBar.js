import styles from './FilterBar.module.css';
import { FiX } from 'react-icons/fi';

const FILTERS = {
    purity: ['22K', '18K'],
    weight: ['0-5g', '5-10g'],
    gender: ['Ladies', 'Gents', 'Kids'],
};

export default function FilterBar({ filters, onFilterChange, categories = [] }) {

    const handleFilterToggle = (type, value) => {
        const current = filters[type] || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [type]: updated });
    };

    const removeFilter = (type, value) => {
        const current = filters[type] || [];
        const updated = current.filter(item => item !== value);
        onFilterChange({ ...filters, [type]: updated });
    };

    // Flatten selected filters for the chip view
    const selectedChips = [];
    Object.keys(filters).forEach(key => {
        filters[key].forEach(val => {
            selectedChips.push({ type: key, value: val });
        });
    });

    return (
        <div className={styles.container}>
            {/* Scrollable Filter Pills */}
            <div className={styles.scrollContainer}>
                {/* Purity Group */}
                <div className={styles.filterGroup}>
                    <span className={styles.groupLabel}>Purity:</span>
                    {FILTERS.purity.map(val => (
                        <button
                            key={val}
                            className={`${styles.pill} ${filters.purity.includes(val) ? styles.active : ''}`}
                            onClick={() => handleFilterToggle('purity', val)}
                        >
                            {val}
                        </button>
                    ))}
                </div>

                {/* Weight Group */}
                <div className={styles.filterGroup}>
                    <span className={styles.groupLabel}>Weight:</span>
                    {FILTERS.weight.map(val => (
                        <button
                            key={val}
                            className={`${styles.pill} ${filters.weight.includes(val) ? styles.active : ''}`}
                            onClick={() => handleFilterToggle('weight', val)}
                        >
                            {val}
                        </button>
                    ))}
                </div>

                {/* Gender Group */}
                <div className={styles.filterGroup}>
                    <span className={styles.groupLabel}>Gender:</span>
                    {FILTERS.gender.map(val => (
                        <button
                            key={val}
                            className={`${styles.pill} ${filters.gender.includes(val) ? styles.active : ''}`}
                            onClick={() => handleFilterToggle('gender', val)}
                        >
                            {val}
                        </button>
                    ))}
                </div>

                {/* Category Group - if categories provided */}
                {categories.length > 0 && (
                    <div className={styles.filterGroup}>
                        <span className={styles.groupLabel}>Category:</span>
                        {categories.map(cat => (
                            <button
                                key={cat.name}
                                className={`${styles.pill} ${filters.category && filters.category.includes(cat.name) ? styles.active : ''}`}
                                onClick={() => handleFilterToggle('category', cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Chips */}
            {selectedChips.length > 0 && (
                <div className={styles.chipContainer}>
                    {selectedChips.map((chip, idx) => (
                        <div key={`${chip.type}-${chip.value}-${idx}`} className={styles.chip}>
                            {chip.value}
                            <button
                                className={styles.chipClose}
                                onClick={() => removeFilter(chip.type, chip.value)}
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
