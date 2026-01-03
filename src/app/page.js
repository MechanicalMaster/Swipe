'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiBell, FiChevronRight, FiCheck, FiArrowUp, FiArrowDown, FiAlertCircle } from 'react-icons/fi';
import { FaReceipt, FaShoppingBag, FaWallet, FaFileAlt, FaStar } from 'react-icons/fa';
import { useHomeStore } from '@/lib/store/homeStore';
import styles from './page.module.css';

// Action configuration - deterministic mapping
const ACTION_CONFIG = {
  INVOICE: {
    label: 'Create Invoice',
    route: '/invoice/create',
    icon: FaReceipt
  },
  PURCHASE: {
    label: 'Purchase',
    route: '/bills/purchase/create',
    icon: FaShoppingBag
  },
  EXPENSE: {
    label: 'Expense',
    route: '/more/bills/expenses/create',
    icon: FaWallet
  }
};

// Format currency to Indian Rupees
const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format relative time from date string
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

// Get activity icon based on type
const getActivityIcon = (type) => {
  switch (type) {
    case 'INVOICE':
      return <FaReceipt size={20} color="#6B7280" />;
    case 'PAYMENT':
      return <FiCheck size={20} color="#6B7280" />;
    default:
      return <FiAlertCircle size={20} color="#6B7280" />;
  }
};

export default function Home() {
  const { snapshot, loading, error, fetchSnapshot } = useHomeStore();

  // Fetch snapshot on mount
  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  // Get primary action config with fallback to INVOICE
  const mostUsed = snapshot?.primaryAction?.mostUsed || 'INVOICE';
  const primaryAction = ACTION_CONFIG[mostUsed] || ACTION_CONFIG.INVOICE;
  const PrimaryIcon = primaryAction.icon;

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

      {/* Error State */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiAlertCircle size={20} color="#DC2626" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', marginBottom: '4px' }}>
              {error}
            </div>
            <button
              onClick={fetchSnapshot}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#DC2626',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Business Pulse Card */}
      <section className={styles.pulseCard}>
        <div className={styles.pulseDecoration}></div>
        <div className={styles.pulseContent}>
          <div className={styles.pulseLabel}>Business Pulse</div>

          {loading ? (
            // Skeleton loading
            <>
              <div style={{
                height: '38px',
                width: '60%',
                background: '#E5E7EB',
                borderRadius: '8px',
                marginBottom: '8px'
              }} />
              <div style={{
                height: '20px',
                width: '40%',
                background: '#E5E7EB',
                borderRadius: '6px'
              }} />
            </>
          ) : snapshot?.businessPulse ? (
            <>
              <div className={styles.pulseAmount}>
                {formatCurrency(snapshot.businessPulse.amountReceivedThisWeek)}
              </div>
              <div className={styles.pulseStats}>
                <span className={styles.pulseSubtext}>received this week</span>
                {snapshot.businessPulse.percentChangeWoW !== 0 && (
                  <span className={styles.pulseBadge}>
                    {snapshot.businessPulse.percentChangeWoW > 0 ? (
                      <FiArrowUp size={10} />
                    ) : (
                      <FiArrowDown size={10} />
                    )}
                    {Math.abs(snapshot.businessPulse.percentChangeWoW)}%
                  </span>
                )}
              </div>
              {snapshot.businessPulse.paymentsCompleted > 0 && (
                <div className={styles.pulseNote}>
                  {snapshot.businessPulse.paymentsCompleted} payment{snapshot.businessPulse.paymentsCompleted > 1 ? 's' : ''} completed - Great job! 🎉
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.pulseAmount}>₹0</div>
              <div className={styles.pulseStats}>
                <span className={styles.pulseSubtext}>received this week</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className={styles.actionsSection}>
        {/* Primary Action - Most Used */}
        <Link href={primaryAction.route} className={styles.primaryActionCard}>
          <div className={styles.primaryIconBox}>
            <PrimaryIcon size={22} />
            <div className={styles.starBadge}>
              <FaStar size={8} color="white" />
            </div>
          </div>
          <div className={styles.primaryActionInfo}>
            <div className={styles.primaryActionTitle}>{primaryAction.label}</div>
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
      {(!loading && snapshot?.recentActivity && snapshot.recentActivity.length > 0) && (
        <section className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            <Link href="/invoice" className={styles.seeAllLink}>
              See All <FiChevronRight size={16} />
            </Link>
          </div>

          <div className={styles.activityList}>
            {snapshot.recentActivity.map((activity, index) => {
              // Determine card rendering based on status
              const isOverdue = activity.status === 'OVERDUE';
              const isPaid = activity.status === 'PAID';
              const isRisk = activity.type === 'RISK_SUMMARY';

              return (
                <div key={index} className={styles.activityCard}>
                  {isRisk ? (
                    // Risk summary card
                    <>
                      <div className={styles.unpaidCount}>
                        {snapshot.riskSummary?.unpaidInvoicesCount || 0}
                      </div>
                      <div className={styles.activityInfo}>
                        <div className={styles.activityTitle}>{activity.title}</div>
                        <div className={styles.activitySubtitle}>{activity.subtitle}</div>
                      </div>
                      <div className={styles.activityRight}>
                        <div className={styles.activityAmount}>
                          {formatCurrency(activity.amount)}
                        </div>
                        <div className={`${styles.activityStatus} ${styles.risk}`}>
                          {activity.status || 'At risk'}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Regular activity card
                    <>
                      <div className={styles.activityAvatar}>
                        {getActivityIcon(activity.type)}
                        {(isOverdue || isPaid) && (
                          <div className={`${styles.avatarBadge} ${isPaid ? styles.success : styles.warning}`}>
                            {isPaid ? (
                              <FiCheck size={10} color="white" />
                            ) : (
                              <FiArrowDown size={10} color="white" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.activityInfo}>
                        <div className={styles.activityTitle}>{activity.title}</div>
                        <div className={styles.activitySubtitle}>
                          {activity.subtitle}
                        </div>
                      </div>
                      <div className={styles.activityRight}>
                        <div className={styles.activityAmount}>
                          {formatCurrency(activity.amount)}
                          {isPaid && (
                            <span style={{ fontWeight: 400, fontSize: 11, color: '#22C55E', marginLeft: 4 }}>
                              Paid!
                            </span>
                          )}
                        </div>
                        <div className={`${styles.activityStatus} ${isOverdue ? styles.overdue : isPaid ? styles.paid : styles.risk}`}>
                          {activity.date ? formatRelativeTime(activity.date) : activity.status}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Floating Action Button */}
      <Link href="/invoice/create" className={styles.fab}>
        <FiCheck size={20} />
        Create Invoice
        <FiChevronRight size={16} />
      </Link>
    </div>
  );
}
