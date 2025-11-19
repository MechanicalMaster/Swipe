Here is a comprehensive yet crisp **UI Design Guideline** tailored for your development team. This document standardizes the visual language of the "First Screenshot" (the ideal state) to ensure consistency across all future screens.

***

# 🎨 Swipe App – UI Design System & Guidelines
**Version 1.0** | **Goal:** Clean, Modern, High-Contrast Consistency

---

## 1. Color Palette
**Rule:** Avoid pastel/washed-out colors. Use high-contrast neutrals for structure and the specific Blue Accent for actions/highlights.

### **Primary Colors (Neutrals)**
*   **`#FFFFFF` (Surface White):** Main cards, bottom navigation, input fields.
*   **`#F5F7FA` (Background Grey):** The global background behind the white cards. *Crucial for depth.*
*   **`#111827` (Ink Black):** Primary Headings (e.g., "Create"), Icon Strokes.
*   **`#6B7280` (Slate Grey):** Secondary text, sub-labels (e.g., "Invoice," "Purchase").

### **Accent Colors (Brand)**
*   **`#0F6CBD` (Brand Blue):** Primary buttons, links, active tab icons.
*   **`#E0F2FE` (Soft Blue Wash):** Backgrounds for informational banners (e.g., the "Add Logo" banner).

---

## 2. Typography
**Font Family:** Use a modern Geometric Sans-Serif (e.g., **Inter**, **Roboto**, or System Default).
**Rule:** Text must never be lighter than Medium (500) weight for labels. Avoid "Regular (400)" weight for small text to prevent a "washed out" look.

| Element | Weight | Size (px/sp) | Color | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Section Header** | **Bold (700)** | 18px | Ink Black | "Create", "Quick Access" |
| **Icon Label** | **Medium (500)** | 12px | Slate Grey | "Invoice", "Purchase Order" |
| **Banner Title** | **SemiBold (600)** | 14px | Brand Blue | "Add company logo..." |
| **Banner Body** | **Regular (400)** | 12px | Brand Blue | "Get Swipe PRO & grow..." |

---

## 3. Iconography (Strict Rules)
**Rule:** Icons must be uniform. Do not mix filled and outlined styles. Do not use multiple colors for icons.

*   **Style:** **Linear / Outline** (Stroke-based).
*   **Stroke Width:** **1.5px** constant width.
*   **Color:** **`#111827` (Ink Black)**.
*   **Container:** Every icon must reside inside a **Squircle** (rounded square) container.
    *   *Container Border:* 1px solid `#E5E7EB` (Light Grey).
    *   *Container Radius:* `12px`.
    *   *Container Size:* `48x48px` (approx).
    *   *Container Background:* Transparent or `#FFFFFF`.

---

## 4. Layout & Spacing (The "Card" Look)
**Rule:** The app is not a flat white sheet. It is a collection of **White Cards** floating on a **Grey Background**.

### **Grid System**
*   **Columns:** 4-column grid for icons.
*   **Alignment:** Center-aligned text relative to the icon container.

### **Spacing (Padding & Margins)**
*   **Global Page Background:** `#F5F7FA`.
*   **Card Padding:** `16px` internal padding.
*   **Card Radius:** `16px` (Rounded corners for the white sections).
*   **Section Gap:** `24px` vertical space between "Create" and "Quick Access" sections.
*   **Element Gap:** `8px` vertical space between an Icon and its Label.

---

## 5. UI Components

### **A. The Feature Card (White Area)**
*   **Usage:** Wrapper for all icon grids.
*   **CSS/Style:**
    ```css
    background-color: #FFFFFF;
    border-radius: 16px;
    margin-bottom: 16px;
    /* Optional: Very subtle shadow for lift */
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
    ```

### **B. The Action Banner (Blue Box)**
*   **Usage:** Upsells, Tips, or "Add Logo" prompts.
*   **Style:**
    *   **Background:** `#E0F2FE` (Light Blue).
    *   **Icon:** Brand Blue color, left-aligned.
    *   **Text:** Brand Blue color (`#0F6CBD`).
    *   **Border Radius:** `8px` or `12px`.

### **C. Bottom Navigation**
*   **Background:** White (`#FFFFFF`).
*   **Border Top:** 1px solid `#F3F4F6`.
*   **Active State:** Icon turns Filled + Brand Blue. Text turns Brand Blue.
*   **Inactive State:** Icon is Outline + Grey. Text is Grey.

---

## 6. Developer Checklist (Do's & Don'ts)

*   ✅ **DO** ensure the background behind the icons is pure white, but the screen background is light grey.
*   ✅ **DO** use `text-transform: capitalize` for labels.
*   ❌ **DON'T** use shadows on the text.
*   ❌ **DON'T** use the "Trusted by" footer inside the main dashboard; it creates clutter.
*   ❌ **DON'T** color the icons; keep them black/dark grey. Color is reserved for interactive buttons only.