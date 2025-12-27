# IndexedDB Database Schema

**Database Name:** `SwipeInvoiceDB`  
**Current Version:** `11`  
**Database Type:** Dexie.js (IndexedDB wrapper)

---

## Tables Overview

This document describes all tables in the Swipe Invoice application's IndexedDB database, including their indexed columns and data types.

---

## 1. invoices

**Purpose:** Stores invoice and billing records (including regular invoices, proforma invoices, and lending bills)

**Indexes:** `++id, invoiceNumber, date, customerId, status, balanceDue, type`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `invoiceNumber` | String | Unique invoice identifier (e.g., "INV-1234") |
| `date` | String (ISO Date) | Invoice date |
| `dueDate` | String (ISO Date) | Payment due date |
| `placeOfSupply` | String | Location where goods/services are supplied |
| `invoiceCopyType` | String | Type of copy (e.g., "Original for Recipient") |
| `customerId` | Number | Foreign key to customers table |
| `customer` | Object | Embedded customer snapshot {name, id, phone} |
| `items` | Array | Array of line items with product details |
| `details` | Object | {reference, notes, terms, extraDiscount, shippingCharges, packagingCharges} |
| `weightSummary` | Object | {grossWeight, netWeight} for jewelry items |
| `toggles` | Object | {tds, tcs, rcm} - tax toggles |
| `totals` | Object | Calculated totals {subtotal, totalTax, total, roundOffAmount, cgst, sgst, igst} |
| `status` | String | Payment status: "Paid", "Partial", "Unpaid", "Pending" |
| `balanceDue` | Number | Outstanding amount |
| `type` | String | Invoice type: "INVOICE", "PROFORMA", or "LENDING" |
| `cgstAmount` | Number | CGST calculated amount |
| `sgstAmount` | Number | SGST calculated amount |
| `totalBeforeTax` | Number | Subtotal before taxes |
| `totalAfterTax` | Number | Final total amount |
| `createdAt` | String (ISO DateTime) | Record creation timestamp |
| `updatedAt` | String (ISO DateTime) | Last update timestamp |

---

## 2. purchases

**Purpose:** Stores purchase orders and vendor invoices

**Indexes:** `++id, purchaseNumber, date, vendorId, status, balanceDue`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `purchaseNumber` | String | Unique purchase identifier (e.g., "PUR-1234") |
| `date` | String (ISO Date) | Purchase date |
| `dueDate` | String (ISO Date) | Payment due date |
| `vendorId` | Number | Foreign key to vendors table |
| `vendor` | Object | Embedded vendor snapshot {name, id, phone} |
| `items` | Array | Array of purchased items |
| `details` | Object | {reference, notes, terms, extraDiscount, shippingCharges, packagingCharges} |
| `weightSummary` | Object | {grossWeight, netWeight} |
| `gstEnabled` | Boolean | Whether GST is enabled for this purchase |
| `totals` | Object | Calculated totals {subtotal, totalTax, total, roundOffAmount, cgst, sgst, igst} |
| `status` | String | Payment status: "Paid", "Partial", "Unpaid" |
| `balanceDue` | Number | Outstanding amount |
| `cgstAmount` | Number | CGST calculated amount |
| `sgstAmount` | Number | SGST calculated amount |
| `totalBeforeTax` | Number | Subtotal before taxes |
| `totalAfterTax` | Number | Final total amount |
| `createdAt` | String (ISO DateTime) | Record creation timestamp |
| `updatedAt` | String (ISO DateTime) | Last update timestamp |

---

## 3. customers

**Purpose:** Stores customer/party information

**Indexes:** `++id, name, gstin, phone, email, isDeleted`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `name` | String | Customer name |
| `gstin` | String | GST identification number |
| `phone` | String | Contact phone number |
| `email` | String | Email address |
| `balance` | Number | Current account balance (receivable) |
| `isDeleted` | Boolean | Soft delete flag |
| `address` | Object (Optional) | Address details |
| `createdAt` | String (ISO DateTime) | Record creation timestamp |

---

## 4. vendors

**Purpose:** Stores vendor/supplier information

**Indexes:** `++id, name, gstin, phone, email, isDeleted`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `name` | String | Vendor name |
| `gstin` | String | GST identification number |
| `phone` | String | Contact phone number |
| `email` | String | Email address |
| `balance` | Number | Current account balance (payable) |
| `isDeleted` | Boolean | Soft delete flag |
| `address` | Object (Optional) | Address details |
| `createdAt` | String (ISO DateTime) | Record creation timestamp |

---

## 5. products

**Purpose:** Stores product catalog (primarily jewelry items)

**Indexes:** `++id, name, type, sku, hsn, category, sellingPrice, purchasePrice, taxRate, unit, barcode`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `type` | String | "product" or "service" |
| `name` | String | Product name/title |
| `sku` | String | Stock Keeping Unit code (format: CAT-SUB-000001) |
| `barcode` | String | Barcode identifier |
| `hsn` | String | HSN/SAC code for taxation |
| `category` | String | Product category name |
| `subCategory` | String | Product sub-category name |
| `description` | String | Product description |
| `sellingPrice` | Number | Selling price |
| `purchasePrice` | Number | Purchase/cost price |
| `taxRate` | Number | Applicable tax rate percentage |
| `unit` | String | Unit of measurement (e.g., "gms") |
| **Metal Attributes** | | |
| `metalType` | String | "Gold", "Silver", "Platinum" |
| `metalColor` | String | "Yellow", "White", "Rose", "Two-tone" |
| `purity` | String | "24K", "22K", "18K", "14K" |
| `grossWeight` | Number | Gross weight in grams |
| `netWeight` | Number | Net metal weight in grams |
| `wastagePercentage` | Number | Wastage percentage |
| `wastageWeight` | Number | Wastage weight |
| `makingCharges` | Number | Making charges amount |
| `makingChargesType` | String | "per_gram" or "fixed" |
| `metalRateRef` | String | Reference to metal rate |
| **Gemstone Attributes** | | |
| `hasStones` | Boolean | Whether product has gemstones |
| `stoneType` | String | Type of stone (e.g., "Diamond", "Ruby") |
| `stoneCount` | Number | Number of stones |
| `stoneWeight` | Number | Weight in carats |
| `stoneShape` | String | Shape of stone |
| `stoneClarity` | String | Clarity grade (SI, VS, VVS) |
| `stoneColor` | String | Color grade |
| `stoneCut` | String | Cut quality |
| `stoneCertification` | String | Certification body (GIA, IGI) |
| `stonePrice` | Number | Stone charges/price |
| `stoneSetting` | String | Setting type |
| **Design & Dimensions** | | |
| `size` | String | Product size |
| `pattern` | String | Design pattern details |
| `customizable` | Boolean | Can be customized |
| `engravingText` | String | Engraving details |
| **Other** | | |
| `vendorRef` | String | Vendor reference |
| `procurementDate` | String (ISO Date) | Date of procurement |
| `hallmarkCert` | String | BIS Hallmark certification number |
| `launchDate` | String (ISO Date) | Product launch date |
| `images` | Array | Product images array |
| `showOnline` | Boolean | Show in online store |
| `notForSale` | Boolean | Not available for sale |
| `createdAt` | Date | Record creation timestamp |

---

## 6. payments

**Purpose:** Stores payment transactions

**Indexes:** `++id, transactionNumber, date, type, partyType, partyId`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `transactionNumber` | String | Unique transaction identifier |
| `date` | String (ISO Date) | Payment date |
| `type` | String | "IN" (received) or "OUT" (paid) |
| `partyType` | String | "CUSTOMER" or "VENDOR" |
| `partyId` | Number | Foreign key to customer/vendor |
| `amount` | Number | Payment amount |
| `mode` | String | Payment mode: "Cash", "UPI", "CASH", etc. |
| `notes` | String | Payment notes |
| `createdAt` | String (ISO DateTime) | Record creation timestamp |

---

## 7. payment_allocations

**Purpose:** Links payments to specific invoices

**Indexes:** `++id, paymentId, invoiceId`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `paymentId` | Number | Foreign key to payments table |
| `invoiceId` | Number | Foreign key to invoices table |
| `amount` | Number | Allocated amount |

---

## 8. audit_logs

**Purpose:** Tracks audit trail for important actions

**Indexes:** `++id, entityType, entityId, action, timestamp`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `entityType` | String | Type of entity (e.g., "product") |
| `entityId` | Number | ID of the affected entity |
| `action` | String | Action performed (e.g., "MANUAL_SKU_OVERRIDE") |
| `details` | String | Detailed description of action |
| `timestamp` | Date | When the action occurred |

---

## 9. attendance_log

**Purpose:** Tracks user login/logout sessions

**Indexes:** `++id, userId, loginDate, loginTimestamp, logoutTimestamp, created_at`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `userId` | Number/String | User identifier |
| `loginDate` | String (ISO Date) | Login date |
| `loginTimestamp` | String (ISO DateTime) | Login timestamp |
| `logoutTimestamp` | String (ISO DateTime) | Logout timestamp |
| `created_at` | String (ISO DateTime) | Record creation timestamp |

---

## 10. bulk_upload_logs

**Purpose:** Tracks bulk data upload operations

**Indexes:** `++id, userId, fileName, totalRecords, successCount, failureCount, timestamp`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `userId` | Number/String | User who performed the upload |
| `fileName` | String | Name of uploaded file |
| `totalRecords` | Number | Total records in upload |
| `successCount` | Number | Successfully imported records |
| `failureCount` | Number | Failed records |
| `timestamp` | String (ISO DateTime) | Upload timestamp |

---

## 11. categories

**Purpose:** Stores product categories

**Indexes:** `++id, name, type`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `name` | String | Category name |
| `type` | String | Category type (e.g., "product_category") |

---

## 12. subCategories

**Purpose:** Stores product sub-categories

**Indexes:** `++id, name, categoryId`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `name` | String | Sub-category name |
| `categoryId` | Number | Foreign key to categories table |

---

## 13. sequences

**Purpose:** Stores auto-increment sequences for various entities

**Indexes:** `key` (Primary key)

| Column Name | Type | Description |
|------------|------|-------------|
| `key` | String | Sequence identifier (e.g., "product_sku") |
| `value` | Number | Current sequence value |

---

## 14. settings

**Purpose:** Stores application settings and configuration

**Indexes:** `key` (Primary key)

| Column Name | Type | Description |
|------------|------|-------------|
| `key` | String | Setting identifier |
| `value` | Any | Setting value (can be object, string, etc.) |

**Common Settings:**
- `companyDetails`: Company information object
- `userProfile`: User profile object
- `templateId`: Invoice template ID (default: "modern")
- `lendingBillTemplateId`: Lending bill template ID (default: "modern")

---

## 15. tag_templates

**Purpose:** Stores barcode tag/label templates for products

**Indexes:** `template_id, name, version`

| Column Name | Type | Description |
|------------|------|-------------|
| `template_id` | String | Primary key, template identifier |
| `name` | String | Template name |
| `version` | String | Template version |
| `frontFields` | Array (Optional) | Fields to show on front of tag |
| `backFields` | Array (Optional) | Fields to show on back of tag |
| `previewImage` | String (Optional) | Preview image path |

---

## 16. product_tag_config

**Purpose:** Links products to their selected tag templates

**Indexes:** `++id, product_id, template_id`

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Number (Auto-increment) | Primary key, auto-generated |
| `product_id` | Number | Foreign key to products table |
| `template_id` | String | Foreign key to tag_templates table |

---

## Database Schema Diagram

```
┌─────────────┐         ┌──────────────┐
│  customers  │◄───────┤   invoices   │
└─────────────┘         └──────────────┘
                               │
                               ▼
                        ┌──────────────────────┐
                        │ payment_allocations  │
                        └──────────────────────┘
                               ▲
                               │
┌─────────────┐         ┌──────────────┐
│   vendors   │◄───────┤  purchases   │
└─────────────┘         └──────────────┘
       ▲                       
       │                       
       │                ┌──────────────┐
       └───────────────┤   payments   │
                        └──────────────┘

┌──────────────┐        ┌──────────────────┐        ┌──────────────────────┐
│  categories  │◄──────┤  subCategories   │◄──────┤     products         │
└──────────────┘        └──────────────────┘        └──────────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────────┐
                                                     │ product_tag_config   │
                                                     └──────────────────────┘
                                                              │
                                                              ▼
                                                     ┌──────────────────────┐
                                                     │   tag_templates      │
                                                     └──────────────────────┘
```

---

## Notes

1. **Auto-increment IDs**: All tables use `++id` for auto-incrementing primary keys except `sequences` and `settings` which use `key` as primary key
2. **Soft Deletes**: `customers` and `vendors` use `isDeleted` flag for soft deletion
3. **Embedded Data**: Invoice and purchase records embed customer/vendor snapshots for historical accuracy
4. **Timestamps**: Most tables include `createdAt` and `updatedAt` timestamps in ISO DateTime format
5. **Balance Tracking**: Customer and vendor balances are updated atomically within transactions
6. **Jewelry-Specific**: The schema is optimized for jewelry business with metal, gemstone, and weight-related fields
