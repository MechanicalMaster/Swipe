# Icon Design Guide

## Overview
Custom SVG icons for the Swipe application featuring a modern, minimal line style with subtle gold accents.

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Gray | `#666666` | Main strokes, outlines, borders |
| Gold Accent | `#D4AF37` | Key details, checkmarks, highlights |
| Gold Light | `#E5C76B` | Optional lighter gold variant |

## Grid & Sizing

- **Canvas**: 30×30 px
- **Padding**: 2.5 px on all sides
- **Drawable area**: ~25×25 px centered
- No strokes should touch the outer padding

## Stroke Specifications

```
stroke-width: 2.25
stroke-linecap: round
stroke-linejoin: round
fill: none (except small accent fills)
```

## Color Rules

1. **Primary strokes**: `#666666` at 100% opacity
2. **Accent strokes/fills**: `#D4AF37` at 100% opacity
3. **Accent usage**: 10–20% of icon area only
4. Use gold for: checkmarks, pointers, trend lines, key highlights
5. Keep main shapes and borders in gray

## Shape Language

- Use simple geometric primitives
- Circles, rounded rectangles, straight lines, simple curves
- No drop shadows, gradients, or 3D effects
- Maintain consistent visual weight across all icons

## React Component Template

```jsx
export const IconName = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Gray elements */}
    <path stroke="#666666" d="..." />
    
    {/* Gold accent */}
    <path stroke="#D4AF37" d="..." />
  </svg>
);
```

## Icon Set Reference

| Icon | Gray Elements | Gold Accent |
|------|---------------|-------------|
| Invoice | Document + lines | Top header line |
| Purchase | Cart body + wheels | Plus sign |
| Quotation | Clipboard + lines | Header bar |
| DailyLogin | Calendar + grid | Checkmark |
| LendingBill | Archive box | Arrow accent |
| Expenses | Wallet outline | Coin symbol |
| ProFormaInvoice | Calculator | Display accent |
| PaymentsTimeline | Document/card | Checkmark |
| Reports | Clock + ticks | Clock hands |
| Insights | X/Y axis | Trend line |
| InvoiceTemplates | Document + lines | Title line |
| DocumentSettings | Gear shape | Center hub |

## Adding New Icons

1. Follow the 24×24 canvas with 2 px padding
2. Use 1.75 px stroke with rounded caps/joins
3. Keep most strokes gray (`#666666`)
4. Reserve gold (`#D4AF37`) for 1–2 key details only
5. Match visual weight of existing icons
6. Export with `fill="none"` at root level
