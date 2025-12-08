import Link from 'next/link';
import {
  InvoiceIcon, PurchaseIcon, QuotationIcon, DailyLoginIcon,
  LendingBillIcon, ExpensesIcon, ProFormaInvoiceIcon,
  PaymentsTimelineIcon, ReportsIcon, InsightsIcon,
  InvoiceTemplatesIcon, DocumentSettingsIcon
} from '@/components/icons';
import styles from './page.module.css';

const createItems = [
  { name: 'Invoice', icon: InvoiceIcon, href: '/invoice/create' },
  { name: 'Purchase', icon: PurchaseIcon, href: '/bills/purchase/create' },
  { name: 'Quotation', icon: QuotationIcon, href: '/coming-soon' },
  { name: 'Daily Login', icon: DailyLoginIcon, href: '/attendance' },
  { name: 'Lending Bill', icon: LendingBillIcon, href: '/invoice/create?type=lending' },
  { name: 'Expenses', icon: ExpensesIcon, href: '/more/bills/expenses/create' },
  { name: 'Pro Forma Invoice', icon: ProFormaInvoiceIcon, href: '/invoice/create?type=proforma' },
];

const quickAccessItems = [
  { name: 'Payments Timeline', icon: PaymentsTimelineIcon, href: '/coming-soon' },
  { name: 'Reports', icon: ReportsIcon, href: '/reports' },
  { name: 'Insights', icon: InsightsIcon, href: '/coming-soon' },
  { name: 'Invoice Templates', icon: InvoiceTemplatesIcon, href: '/coming-soon' },
  { name: 'Document Settings', icon: DocumentSettingsIcon, href: '/coming-soon' },
];

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          swipe 🇮🇳
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          Create
        </div>
        <div className={styles.grid}>
          {createItems.map((item) => (
            <Link key={item.name} href={item.href} className={styles.gridItem}>
              <div className={styles.iconBox}>
                <item.icon size={32} />
              </div>
              <span className={styles.label}>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          Quick Access
        </div>
        <div className={styles.grid}>
          {quickAccessItems.map((item) => (
            <Link key={item.name} href={item.href} className={styles.gridItem}>
              <div className={styles.iconBox}>
                <item.icon size={32} />
              </div>
              <span className={styles.label}>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>


    </div>
  );
}

