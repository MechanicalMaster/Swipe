// Custom SVG Icons with Gray Outlines and Gold Accents
// Design specs: 30x30 canvas, 2.25px stroke, rounded caps/joins
// Primary: #666666 | Accent: #D4AF37

// Invoice - Document with header line accent
export const InvoiceIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Document outline */}
        <rect x="5" y="4" width="20" height="22" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold header line */}
        <line x1="9" y1="9" x2="21" y2="9" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        {/* Content lines */}
        <line x1="9" y1="14" x2="21" y2="14" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="9" y1="19" x2="16" y2="19" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// Purchase - Shopping Bag with plus accent
export const PurchaseIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Bag handles */}
        <path d="M11 10V7a4 4 0 018 0v3" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Bag body */}
        <rect x="6" y="10" width="18" height="16" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold plus sign */}
        <line x1="15" y1="15" x2="15" y2="21" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="12" y1="18" x2="18" y2="18" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// Quotation - Clipboard with header accent
export const QuotationIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Clipboard body */}
        <rect x="5" y="5" width="20" height="21" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Clipboard clip */}
        <path d="M11 3h8v4a1 1 0 01-1 1h-6a1 1 0 01-1-1V3z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold header bar */}
        <line x1="9" y1="12" x2="21" y2="12" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        {/* Content lines */}
        <line x1="9" y1="17" x2="21" y2="17" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="9" y1="22" x2="15" y2="22" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// DailyLogin - Calendar with checkmark accent
export const DailyLoginIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Calendar body */}
        <rect x="4" y="5" width="22" height="21" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Calendar hooks */}
        <line x1="10" y1="3" x2="10" y2="8" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="20" y1="3" x2="20" y2="8" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        {/* Horizontal divider */}
        <line x1="4" y1="11" x2="26" y2="11" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        {/* Gold checkmark */}
        <path d="M10 18l3 3L20 15" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// LendingBill - Archive box with stroked arrow (fixed weight consistency)
export const LendingBillIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Archive box top */}
        <path d="M4 6.5a2.5 2.5 0 012.5-2.5h17a2.5 2.5 0 012.5 2.5v2.5H4V6.5z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Archive box body */}
        <path d="M4 9h22v15a2.5 2.5 0 01-2.5 2.5h-17A2.5 2.5 0 014 24V9z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold arrow pointing down - Simple stroke */}
        <line x1="15" y1="13" x2="15" y2="21" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="11" y1="17" x2="15" y2="21" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="19" y1="17" x2="15" y2="21" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// Expenses - Wallet with coin accent (centered)
export const ExpensesIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Wallet body - optically centered */}
        <rect x="3" y="6" width="24" height="18" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Wallet flap */}
        <path d="M3 11h24" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        {/* Gold coin circle */}
        <circle cx="21" cy="16.5" r="2.5" stroke="#D4AF37" strokeWidth="2.25" />
    </svg>
);

// ProFormaInvoice - Simplified density (replaced buttons with lines)
export const ProFormaInvoiceIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Calculator body */}
        <rect x="5" y="3" width="20" height="24" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold display screen */}
        <rect x="8" y="7" width="14" height="4" rx="1" stroke="#D4AF37" strokeWidth="2.25" />
        {/* Simple keypad lines - Less noise */}
        <line x1="8" y1="16" x2="13" y2="16" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="17" y1="16" x2="22" y2="16" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="8" y1="21" x2="13" y2="21" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="17" y1="21" x2="22" y2="21" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// PaymentsTimeline - Document/card with checkmark
export const PaymentsTimelineIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Card/document outline */}
        <rect x="4" y="5" width="22" height="20" rx="2.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Horizontal lines */}
        <line x1="8" y1="11" x2="13" y2="11" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="8" y1="16" x2="15" y2="16" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        {/* Gold checkmark */}
        <path d="M17 14l2.5 2.5 5-5" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Reports - Clock with gold hands
export const ReportsIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Clock circle */}
        <circle cx="15" cy="15" r="11" stroke="#666666" strokeWidth="2.25" />
        {/* Tick marks */}
        <line x1="15" y1="4.5" x2="15" y2="6.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="15" y1="23.5" x2="15" y2="25.5" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="4.5" y1="15" x2="6.5" y2="15" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="23.5" y1="15" x2="25.5" y2="15" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
        {/* Gold clock hands */}
        <line x1="15" y1="15" x2="15" y2="9" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        <line x1="15" y1="15" x2="20" y2="15" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// Insights - Optically balanced
export const InsightsIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* X and Y axis - shifted down slightly to ground it */}
        <path d="M4 5v21h22" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold rising trend line with nodes */}
        <path d="M9 20l5-5 5 2.5 6-7.5" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="2" fill="#D4AF37" />
        <circle cx="14" cy="15" r="2" fill="#D4AF37" />
        <circle cx="19" cy="17.5" r="2" fill="#D4AF37" />
        <circle cx="25" cy="10" r="2" fill="#D4AF37" />
    </svg>
);

// InvoiceTemplates - Simplified visual density
export const InvoiceTemplatesIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Document outline */}
        <path d="M17.5 3H8a2.5 2.5 0 00-2.5 2.5v19A2.5 2.5 0 008 27h14a2.5 2.5 0 002.5-2.5V10l-7-7z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Folded corner */}
        <path d="M17.5 3v7.5H25" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold title line */}
        <line x1="10" y1="15" x2="20" y2="15" stroke="#D4AF37" strokeWidth="2.25" strokeLinecap="round" />
        {/* Content lines - Removed extra lines for density */}
        <line x1="10" y1="21" x2="20" y2="21" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
);

// DocumentSettings - Consistency fix
export const DocumentSettingsIcon = ({ size = 30, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        className={className}
    >
        {/* Gear outer shape */}
        <path d="M15 18.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24.25 18.75a2.06 2.06 0 00.41 2.28l.08.08a2.5 2.5 0 11-3.54 3.54l-.08-.08a2.06 2.06 0 00-2.28-.41 2.06 2.06 0 00-1.25 1.89v.2a2.5 2.5 0 01-5 0v-.11a2.06 2.06 0 00-1.35-1.89 2.06 2.06 0 00-2.28.41l-.08.08a2.5 2.5 0 11-3.54-3.54l.08-.08a2.06 2.06 0 00.41-2.28 2.06 2.06 0 00-1.89-1.25h-.2a2.5 2.5 0 010-5h.11a2.06 2.06 0 001.89-1.35 2.06 2.06 0 00-.41-2.28l-.08-.08a2.5 2.5 0 113.54-3.54l.08.08a2.06 2.06 0 002.28.41h.09a2.06 2.06 0 001.25-1.89v-.2a2.5 2.5 0 015 0v.11a2.06 2.06 0 001.25 1.89 2.06 2.06 0 002.28-.41l.08-.08a2.5 2.5 0 113.54 3.54l-.08.08a2.06 2.06 0 00-.41 2.28v.09a2.06 2.06 0 001.89 1.25h.2a2.5 2.5 0 010 5h-.11a2.06 2.06 0 00-1.89 1.25z" stroke="#666666" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        {/* Gold center hub */}
        <circle cx="15" cy="15" r="2" fill="#D4AF37" />
    </svg>
);
