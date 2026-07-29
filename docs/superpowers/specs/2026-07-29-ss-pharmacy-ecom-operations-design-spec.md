# Design Specification: S.S. Pharmacy Public Order Tracking & Admin Analytics

## 1. Goal Description
Implement the next phase of the S.S. Pharmacy D2C storefront and operations, consisting of two main modules:
1. **Public Order Tracking**: A secure, public-facing page (`/order-tracking`) where customers can view their order status without registering/logging in, protected by PII masking.
2. **Admin Dashboard Analytics & PDF Automation**: Interactive charts visualizing sales metrics on the Admin Dashboard, and automatic invoice PDF generation hooks.

---

## 2. Component 1: Public Order Tracking (`/order-tracking`)

### 2.1 Route & Entry Point
- **Route**: `/order-tracking`
- **Navigation Links**: Add to header [Navbar](file:///c:/Users/janak/Downloads/sspharmacy_next%20js/src/components/layout/Navbar.tsx) and [Footer](file:///c:/Users/janak/Downloads/sspharmacy_next%20js/src/components/layout/Footer.tsx).

### 2.2 Security & PII Masking
To prevent scraping and protect user privacy, the `/api/orders/track` API endpoint will perform validation and mask sensitive details:
- **Inputs Required**: Both `order_number` (e.g., `SSP-384920`) and `customer_phone` (10-digit number) must match the database.
- **Masking Rules**:
  - Name: `J**** S****` (First and last character of each word, rest asterisked).
  - Address: `Pr****** Nagar, Yerraguntla, A**** P******` (Mask street names and preserve state/pincode).
  - Email: `j***@gmail.com`

### 2.3 Status Timeline UI
A visual vertical or horizontal progression stepper based on the order's state:
1. **Placed**: Timestamp of order creation.
2. **Processing**: Highlighted when status is `processing` or `paid`.
3. **Shipped**: Highlighted when status is `shipped`. Displays:
   - Courier Carrier (e.g., Delhivery)
   - Tracking / AWB Number
   - Direct link to tracking portal
4. **Delivered**: Highlighted when status is `delivered`.
- **Cancelled**: If the order is cancelled, a clear alert banner will display the cancellation reason instead of the timeline.

---

## 3. Component 2: Admin Dashboard Analytics & PDF Automation

### 3.1 Admin Dashboard Charts
- **Location**: `/admin/dashboard`
- **Charts to Implement**:
  - **Revenue & Orders Trend**: Line chart showing daily/weekly sales over the last 30 days.
  - **Product Performance**: Bar chart showing units sold per formulation (Dr. Lion Pain Cream, Pain Pills, Moon Light Cream).
- **Technology**: Built using SVG paths directly or integrating standard canvas renderers, styled in Warm Teal & Accent Gold.

### 3.2 Automated PDF Invoice Trigger
- **Fulfillment Transition**: Automatically trigger PDF generation when:
  - An order is marked as `Paid` or `Shipped` via the Admin Controls.
- **Worker Hook**: Connects to the Supabase `generate-invoice-pdf` edge function.

---

## 4. Database Integration
- Queries target the `orders` and `order_items` tables.
- A new database index will be defined on `orders(order_number, customer_phone)` to ensure lightning-fast tracking queries.
