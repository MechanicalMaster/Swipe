import Link from 'next/link';
import {
  RiFileList3Line, RiShoppingCartLine, RiClipboardLine, RiTruckLine,
  RiArrowGoBackLine, RiArchiveLine, RiWallet3Line, RiCalculatorLine,
  RiCarLine, RiFilePaper2Line, RiSecurePaymentLine, RiPieChartLine,
  RiLineChartLine, RiMoneyDollarCircleLine, RiSettings3Line, RiRocketLine
} from 'react-icons/ri';
import styles from './page.module.css';

const createItems = [
  { name: 'Invoice', icon: RiFileList3Line, href: '/invoice/create' },
  { name: 'Purchase', icon: RiShoppingCartLine, href: '#' },
  { name: 'Quotation', icon: RiClipboardLine, href: '#' },
  { name: 'Delivery Challan', icon: RiTruckLine, href: '#' },
  { name: 'Credit Note', icon: RiArrowGoBackLine, href: '#' },
  { name: 'Purchase Order', icon: RiArchiveLine, href: '#' },
  { name: 'Expenses', icon: RiWallet3Line, href: '#' },
  { name: 'Pro Forma Invoice', icon: RiCalculatorLine, href: '#' },
];

const quickAccessItems = [
  { name: 'E-way Bill', icon: RiCarLine, href: '#' },
  { name: 'E-Invoice', icon: RiFilePaper2Line, href: '#' },
  { name: 'Payments Timeline', icon: RiSecurePaymentLine, href: '#' },
  { name: 'Reports', icon: RiPieChartLine, href: '#' },
  { name: 'Insights', icon: RiLineChartLine, href: '#' },
  { name: 'Refer & Get ₹1000', icon: RiMoneyDollarCircleLine, href: '#' },
  { name: 'Invoice Templates', icon: RiFileList3Line, href: '#' },
  { name: 'Document Settings', icon: RiSettings3Line, href: '#' },
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
                <item.icon />
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
                <item.icon />
              </div>
              <span className={styles.label}>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.banner}>
        <RiRocketLine size={24} color="#0284c7" />
        <div className={styles.bannerText}>
          <div className={styles.bannerTitle}>Add company logo to bills</div>
          <div className={styles.bannerSubtitle}>Get Swipe PRO & grow business 10x!</div>
        </div>
      </div>
    </div>
  );
}
