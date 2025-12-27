
Integrate the existing Swipe frontend with a new local-first backend API, fully replacing IndexedDB/Dexie. **Do not retain any client-side persistence layer**. The frontend must become a thin client over the backend.

**Key Requirements & Steps**

1. **Disable IndexedDB Completely**

   * Remove Dexie initialization and all IndexedDB read/write code.
   * Delete or bypass any feature flags related to local storage.
   * Ensure no data is persisted client-side beyond UI state.

2. **Introduce a Single Backend API Client**

   * Create a centralized API layer (e.g., `src/api/backendClient.ts`).
   * All data operations (customers, products, invoices, payments, photos) must go through this layer.
   * UI components must never call `fetch` directly.

3. **Backend as Source of Truth**

   * Stop generating IDs, invoice numbers, or authoritative totals in the frontend.
   * Send minimal payloads for create/update.
   * Always replace local UI state with the backend response (aggregate object).

4. **Authentication**

   * Integrate JWT-based auth (`/auth/login`, `/auth/me`).
   * Attach JWT to every API request.
   * Handle unauthorized responses gracefully.

5. **Environment Configuration**

   * Add `VITE_API_BASE_URL` for local development (e.g., `http://localhost:3000`).
   * Ensure CORS-compatible requests.

6. **Error & Loading States**

   * Show backend errors clearly.
   * Handle offline/backend-down scenarios explicitly.

7. **Verification**

   * Test full flows: create → refresh → fetch → update → delete.
   * Verify photos load after refresh.
   * Confirm no data loss on page reload.

**Constraints**

* No IndexedDB fallback.
* No client-side syncing logic.
* Follow backend aggregate contracts exactly.

---

