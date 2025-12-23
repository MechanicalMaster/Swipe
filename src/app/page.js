'use client';

import Link from 'next/link';
import { FiBell, FiChevronRight, FiCheck, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FaReceipt, FaShoppingBag, FaWallet, FaFileAlt, FaStar } from 'react-icons/fa';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          swipe <span>🇮🇳</span>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notificationBtn}>
            <FiBell />
          </button>
          <div className={styles.langToggle}>
            <span>HI</span>
            <span>🇮🇳</span>
          </div>
        </div>
      </header>

      {/* Business Pulse Card */}
      <section className={styles.pulseCard}>
        <div className={styles.pulseDecoration}></div>
        <div className={styles.pulseContent}>
          <div className={styles.pulseLabel}>Business Pulse</div>
          <div className={styles.pulseAmount}>₹42,300</div>
          <div className={styles.pulseStats}>
            <span className={styles.pulseSubtext}>received this week</span>
            <span className={styles.pulseBadge}>
              <FiArrowUp size={10} /> 12%
            </span>
          </div>
          <div className={styles.pulseNote}>
            5 payments completed - Great job! 🎉
          </div>
        </div>
        <div className={styles.pulseChart}>
          <div className={styles.chartBar} style={{ height: '30%', background: '#E5E7EB' }}></div>
          <div className={styles.chartBar} style={{ height: '45%', background: '#BBF7D0' }}></div>
          <div className={styles.chartBar} style={{ height: '35%', background: '#86EFAC' }}></div>
          <div className={styles.chartBar} style={{ height: '60%', background: '#4ADE80' }}></div>
          <div className={styles.chartBar} style={{ height: '50%', background: '#22C55E' }}></div>
          <div className={styles.chartBar} style={{ height: '85%', background: '#F5C242' }}></div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className={styles.actionsSection}>
        {/* Primary Action - Create Invoice */}
        <Link href="/invoice/create" className={styles.primaryActionCard}>
          <div className={styles.primaryIconBox}>
            <FaReceipt size={22} />
            <div className={styles.starBadge}>
              <FaStar size={8} color="white" />
            </div>
          </div>
          <div className={styles.primaryActionInfo}>
            <div className={styles.primaryActionTitle}>Create Invoice</div>
            <div className={styles.primaryActionSubtitle}>Most used</div>
          </div>
          <FiChevronRight className={styles.actionChevron} size={24} />
        </Link>

        {/* Quick Action Buttons */}
        <div className={styles.quickActionsGrid}>
          <Link href="/bills/purchase/create" className={styles.quickActionBtn}>
            <FaShoppingBag size={16} />
            <span>Purchase</span>
          </Link>
          <Link href="/more/bills/expenses/create" className={styles.quickActionBtn}>
            <FaWallet size={16} />
            <span>Expense</span>
          </Link>
          <Link href="/invoice/create?type=proforma" className={styles.quickActionBtn}>
            <FaFileAlt size={16} />
            <span>Pro Forma</span>
          </Link>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <Link href="/invoice" className={styles.seeAllLink}>
            See All <FiChevronRight size={16} />
          </Link>
        </div>

        <div className={styles.activityList}>
          {/* Activity Item 1 - Follow up payment */}
          <div className={styles.activityCard}>
            <div className={styles.activityAvatar}>
              <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100&h=100&fit=crop" alt="Shop" />
              <div className={`${styles.avatarBadge} ${styles.success}`}>
                <FiArrowDown size={10} color="white" />
              </div>
            </div>
            <div className={styles.activityInfo}>
              <div className={styles.activityTitle}>Follow up payment</div>
              <div className={styles.activitySubtitle}>Ramesh Jewellers · ₹7,200</div>
            </div>
            <div className={styles.activityRight}>
              <div className={styles.activityAmount}>₹7,200</div>
              <div className={`${styles.activityStatus} ${styles.overdue}`}>5 days overdue</div>
            </div>
          </div>

          {/* Activity Item 2 - Last Invoice */}
          <div className={styles.activityCard}>
            <div className={styles.activityAvatar}>
              <FaReceipt size={20} color="#6B7280" />
              <div className={`${styles.avatarBadge} ${styles.warning}`}>
                <FiCheck size={10} color="white" />
              </div>
            </div>
            <div className={styles.activityInfo}>
              <div className={styles.activityTitle}>Last Invoice: INV-042</div>
              <div className={styles.activitySubtitle}>₹15,600 · Paid! 😊 · 15 mins ago</div>
            </div>
            <div className={styles.activityRight}>
              <div className={styles.activityAmount}>₹15,600 <span style={{ fontWeight: 400, fontSize: 11, color: '#22C55E' }}>Paid!</span></div>
              <div className={`${styles.activityStatus} ${styles.paid}`}>15 mins ago</div>
            </div>
          </div>

          {/* Activity Item 3 - Unpaid invoices */}
          <div className={styles.activityCard}>
            <div className={styles.unpaidCount}>3</div>
            <div className={styles.activityInfo}>
              <div className={styles.activityTitle}>3 invoices unpaid</div>
              <div className={styles.activitySubtitle}>₹18,900 at risk</div>
            </div>
            <div className={styles.activityRight}>
              <div className={styles.activityAmount}>₹18,900</div>
              <div className={`${styles.activityStatus} ${styles.risk}`}>A risk</div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/invoice/create" className={styles.fab}>
        <FiCheck size={20} />
        Create Invoice
        <FiChevronRight size={16} />
      </Link>
    </div>
  );
}
