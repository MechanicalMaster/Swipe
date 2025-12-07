import styles from './Pagination.module.css';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { useState } from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange, onRecentlyViewed }) {
    const [jumpPage, setJumpPage] = useState('');

    const handleJump = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(jumpPage);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                onPageChange(page);
                setJumpPage('');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <button
                    className={styles.navButton}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <FiChevronLeft />
                </button>

                <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className={styles.navButton}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <FiChevronRight />
                </button>
            </div>

            <div className={styles.jumpContainer}>
                <span className={styles.jumpLabel}>Jump to:</span>
                <input
                    className={styles.jumpInput}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    onKeyDown={handleJump}
                    placeholder="#"
                />
            </div>

            <button className={styles.recentButton} onClick={onRecentlyViewed}>
                <FiClock size={16} />
                Recently Viewed
            </button>
        </div>
    );
}
