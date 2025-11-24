'use client';

import { motion } from 'framer-motion';
import {
    RiRocketLine, RiPieChartLine, RiSecurePaymentLine, RiSmartphoneLine,
    RiInstagramLine, RiYoutubeFill, RiLinkedinFill, RiTwitterXFill, RiFacebookCircleFill,
    RiArrowUpLine
} from 'react-icons/ri';
import styles from './LandingPage.module.css';

export default function LandingPage({ onGetStarted }) {
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.logo}>swipe 🇮🇳</div>
                <button className={styles.secondaryButton} onClick={onGetStarted} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                    Login
                </button>
            </nav>

            <main className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={styles.badge}>New: GST E-Invoicing Support</span>
                    <h1 className={styles.title}>
                        Invoicing for the <br />
                        <span style={{ color: '#60a5fa' }}>Modern Business</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Create professional invoices, track payments, and manage your inventory with the #1 billing app for Indian MSMEs.
                    </p>

                    <div className={styles.ctaGroup}>
                        <button className={styles.primaryButton} onClick={onGetStarted}>
                            Get Started Free
                        </button>
                        <button className={styles.secondaryButton}>
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.heroImageContainer}
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <img
                        src="/hero-dashboard.png"
                        alt="Swipe Dashboard"
                        className={styles.heroImage}
                    />
                </motion.div>
            </main>

            <section className={styles.features}>
                <h2 className={styles.sectionTitle}>Everything you need to grow</h2>
                <div className={styles.grid}>
                    <FeatureCard
                        icon={RiRocketLine}
                        title="Lightning Fast"
                        text="Create invoices in less than 10 seconds. Share via WhatsApp or Email instantly."
                        delay={0}
                    />
                    <FeatureCard
                        icon={RiPieChartLine}
                        title="Smart Analytics"
                        text="Track your sales, expenses, and profits with beautiful, easy-to-understand charts."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={RiSecurePaymentLine}
                        title="Secure & Safe"
                        text="Your data is encrypted and backed up automatically. Access it from anywhere."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={RiSmartphoneLine}
                        title="Mobile First"
                        text="Designed for your phone. Manage your entire business from your pocket."
                        delay={0.3}
                    />
                </div>
            </section>
            <footer className={styles.footer}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerColumn}>
                        <div className={styles.footerLogo}>
                            <div className={styles.logo}>swipe 🇮🇳</div>
                        </div>
                        <div className={styles.socialIcons}>
                            <RiInstagramLine className={styles.socialIcon} />
                            <RiYoutubeFill className={styles.socialIcon} />
                            <RiLinkedinFill className={styles.socialIcon} />
                            <RiTwitterXFill className={styles.socialIcon} />
                            <RiFacebookCircleFill className={styles.socialIcon} />
                        </div>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4 className={styles.footerHeading}>Quick Links</h4>
                        <a href="#" className={styles.footerLink}>Home</a>
                        <a href="#" className={styles.footerLink}>Features</a>
                        <a href="#" className={styles.footerLink}>Pricing</a>
                        <a href="#" className={styles.footerLink}>Invoice Formats</a>
                        <a href="#" className={styles.footerLink}>Tutorials</a>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4 className={styles.footerHeading}>Features</h4>
                        <a href="#" className={styles.footerLink}>Einvoices</a>
                        <a href="#" className={styles.footerLink}>Ewaybills</a>
                        <a href="#" className={styles.footerLink}>Swipe AI</a>
                        <a href="#" className={styles.footerLink}>Online Store</a>
                        <a href="#" className={styles.footerLink}>Integrations</a>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4 className={styles.footerHeading}>Register</h4>
                        <a href="#" className={styles.footerLink}>Get Started</a>
                        <a href="#" className={styles.footerLink}>Login</a>
                        <a href="#" className={styles.footerLink}>Contact Us</a>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4 className={styles.footerHeading}>Legal</h4>
                        <a href="#" className={styles.footerLink}>Privacy Policy</a>
                        <a href="#" className={styles.footerLink}>Refund Policy</a>
                        <a href="#" className={styles.footerLink}>Terms of Service</a>
                        <a href="#" className={styles.footerLink}>Refer your friends</a>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4 className={styles.footerHeading}>Explore</h4>
                        <a href="#" className={styles.footerLink}>Blog</a>
                        <a href="#" className={styles.footerLink}>Join Community 🤝</a>
                        <a href="#" className={styles.footerLink}>Product Updates</a>
                        <a href="#" className={styles.footerLink}>Developers 👷</a>
                        <a href="#" className={styles.footerLink}>Swipe for Startups 🤝</a>
                        <a href="#" className={styles.footerLink}>Swipe for Accountants 💼</a>
                        <a href="#" className={styles.footerLink}>Tools</a>
                        <a href="#" className={styles.footerLink}>We're hiring 🚀</a>
                    </div>
                </div>
            </footer>

            <button
                className={styles.scrollTopButton}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <RiArrowUpLine size={24} />
            </button>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, text, delay }) {
    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Icon className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardText}>{text}</p>
        </motion.div>
    );
}
