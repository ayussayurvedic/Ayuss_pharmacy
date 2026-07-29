# Design Specification: S.S. Pharmacy Public Storefront Migration

We are migrating the public-facing storefront of **S.S. Pharmacy** into Next.js App Router, replacing the old S.S. Pharmacy IT staffing layout.

## 1. Visual Theme & Layout

### Branding & Assets
*   **Logo**: We will use `/products/logo/logo.webp` as the main branding asset in the Navbar and Footer.
*   **Colors**: Deep forest green (`#1D3A28`), warm cream (`#FEFDF8`), and gold accents (`#D49D42`).
*   **Typography**: Clean sans-serif and editorial serif fonts (Outfit / Inter).

### Header Navigation Link Map
1.  **Home** (`/`)
2.  **Catalog** (`/products`)
3.  **Why Choose Us** (`/why-choose-us`)
4.  **Manufacturing** (`/manufacturing`)
5.  **About Us** (`/about`)
6.  **Contact Us** (`/contact`)

---

## 2. Core Features & Routes

### A. Home Page (`src/app/(public)/page.tsx`)
*   **Hero Carousel**: Auto-rotating image slideshow featuring our core Ayurvedic remedies.
*   **Highlights Panel**: Leaf icons highlighting Natural Ingredients, Ayurvedic Expertise, and GMP Quality.
*   **Catalog Teaser Grid**: Compact 3-card product portfolio layout.
*   **About Summary & Manufacturing Excellence Section**: Detailed editorial sections showcasing the Kadapa District facility.

### B. Products Catalog & Details
*   **Directory Route** (`src/app/(public)/products/page.tsx`):
    - Search input filtering by name, benefits, or ingredients.
    - Category check filters (Skin Care, External Relief, Internal Medicine).
    - Quick add-to-bag buttons with instant Toast notifications.
*   **Detail Route** (`src/app/(public)/products/[id]/page.tsx`):
    - Interactive gallery with main preview and click-to-zoom.
    - Info tabs: Description, Composition/Ingredients, How to Use, and Safety notes.
    - Schema markup containing price, Ayurvedic category, and stock status.

### C. Why Choose Us (`src/app/(public)/why-choose-us/page.tsx`)
*   Responsive grid detailing:
    - Standardized production audits.
    - Potent traditional herbs sourcing.
    - GMP Schedule T certifications.

### D. Manufacturing Excellence (`src/app/(public)/manufacturing/page.tsx`)
*   Visual cards explaining active phytochemical inspections, raw materials botanical audits, and stainless steel clean rooms.

### E. Shopping Cart Context (`src/context/CartContext.tsx`)
*   Client-side React Context persisting cart items to `localStorage`.
*   Tab-sync support via `BroadcastChannel('ss_cart_channel')`.
*   Dynamic navbar badge displaying units sum.

### F. Shipping & Payment Checkout (`src/app/(public)/checkout/page.tsx`)
*   **Shipping Form**: Name, Phone, Email, Address, City, State, PIN code.
*   **GPS Autofill**: Clicking "Detect Location" reads GPS coordinates, reverse-geocoding via OpenStreetMap Nominatim API.
*   **Payment Handlers**:
    - **Cash on Delivery (COD)**: Invokes the `checkout` edge function or falls back to direct DB insert.
    - **Online (Razorpay)**:
      - Loads `https://checkout.razorpay.com/v1/checkout.js`.
      - References `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID`.
      - *Fallback Gate*: If the Razorpay Key ID is not found, the checkout executes a "Simulated Order" flow (saving orders directly to database for testing).

---

## 3. Verification & Compliance
*   Compile checks: Running `npm run build` must have zero compilation errors.
*   Unit tests: Run all pure vitest suites to confirm 100% passes.
