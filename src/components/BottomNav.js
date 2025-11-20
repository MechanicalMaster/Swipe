'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBox, FiUsers, FiGrid, FiFileText } from 'react-icons/fi';
import { RiBillLine } from 'react-icons/ri'; // This import will become unused but I'll keep it as per instructions to not make unrelated edits unless explicitly removed.
import clsx from 'clsx';
import styles from './BottomNav.module.css';

const navItems = [
    { label: 'Home', href: '/', icon: FiHome },
    { label: 'Bills', href: '/bills', icon: FiFileText },
    { label: 'Products', href: '/products', icon: FiBox },
    { label: 'Parties', href: '/parties', icon: FiUsers },
    { label: 'More', href: '/more', icon: FiGrid },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide BottomNav on specific routes
    if (pathname.includes('/add') || pathname.includes('/create') || pathname.includes('/view')) {
        return null;
    }

    // Hide bottom nav on specific pages if needed (e.g., Create Invoice)
    if (pathname.startsWith('/invoice/create')) return null;

    return (
        <nav className={styles.nav}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link key={item.label} href={item.href} className={clsx(styles.item, isActive && styles.active)}>
                        <Icon size={24} />
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
