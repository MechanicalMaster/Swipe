'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBox, FiUsers, FiGrid } from 'react-icons/fi';
import { RiBillLine } from 'react-icons/ri';
import clsx from 'clsx';
import styles from './BottomNav.module.css';

const navItems = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Bills', href: '/bills', icon: RiBillLine },
    { name: 'Products', href: '/products', icon: FiBox },
    { name: 'Parties', href: '/parties', icon: FiUsers },
    { name: 'More', href: '/more', icon: FiGrid },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide BottomNav on specific routes
    if (pathname.includes('/add') || pathname.includes('/create')) {
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
                    <Link key={item.name} href={item.href} className={clsx(styles.item, isActive && styles.active)}>
                        <Icon size={24} />
                        <span className={styles.label}>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
