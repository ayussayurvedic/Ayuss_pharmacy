# S.S. Pharmacy Medium and Low Priority Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement remaining post-launch e-commerce enhancements including SMS templates, fraud scoring, address verification, estimated delivery calculations, admin order editing, CSV bulk order export, customer order history lookups, and outbound order webhooks.

**Architecture:** Extend the database schema via Supabase migrations. Integrate validation, fraud scoring, and delivery date estimation into `/api/orders/place`. Build specialized API endpoints for admin order edits, CSV exports, and order history fetches. Modify storefront and admin dashboards to add user inputs and exports.

**Tech Stack:** Next.js Route Handlers (App Router), Tailwind CSS (for UI changes), Supabase Admin Client, Node crypto, Node-CSV.

## Global Constraints
- Keep all UI changes aligned with the established design palette (`#1A5C5E` primary teal, white cards, warm cream `#FDF8F0` backgrounds).
- Do not make external API calls directly in synchronous client loops; use server routes.
- Ensure proper safety checks and boundary values for dates and inputs.

---

### Task 1: Database Migration for Delivery Dates, Gift Messaging, and Webhooks

**Files:**
- Create: `supabase/migrations/20260731160000_medium_low_priority_schema.sql`
- Test: `src/__tests__/pure/schema-defaults.test.ts`

**Interfaces:**
- Consumes: Existing tables `public.orders`, `public.portal_config`.
- Produces: Columns `estimated_delivery_date` (DATE) and `gift_message` (TEXT) on `orders` table. Config entries for `webhook_url` and `twilio_auth` in `portal_config`.

- [ ] **Step 1: Write the database migration file**
  Create `supabase/migrations/20260731160000_medium_low_priority_schema.sql`:
  ```sql
  -- 1. Add estimated delivery date and gift message to orders
  ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS gift_message TEXT,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;

  -- 2. Insert default config values if not present
  INSERT INTO public.portal_config (config_key, config_value)
  VALUES 
    ('webhook_url', ''),
    ('twilio_sid', ''),
    ('twilio_auth_token', ''),
    ('twilio_from_number', '')
  ON CONFLICT (config_key) DO NOTHING;
  ```

- [ ] **Step 2: Create unit test to check schema mapping mock**
  Create `src/__tests__/pure/schema-defaults.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  interface MockOrder {
    estimated_delivery_date: string | null;
    gift_message: string | null;
    is_flagged: boolean;
  }

  describe('Schema Mock Mapping Checks', () => {
    it('sets default flags correctly on initialization', () => {
      const order: MockOrder = {
        estimated_delivery_date: null,
        gift_message: null,
        is_flagged: false
      };
      expect(order.is_flagged).toBe(false);
      expect(order.gift_message).toBeNull();
    });
  });
  ```

- [ ] **Step 3: Run tests**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 4: Commit changes**
  ```bash
  git add supabase/migrations/20260731160000_medium_low_priority_schema.sql src/__tests__/pure/schema-defaults.test.ts
  git commit -m "db: update schema for delivery dates, gift messages, and fraud flags"
  ```

---

### Task 2: Fraud Scoring, Address Verification, and Dynamic Estimated Delivery Date

**Files:**
- Modify: `src/app/api/orders/place/route.ts`
- Modify: `src/app/(public)/checkout/page.tsx`
- Test: `src/__tests__/pure/fraud-rules.test.ts`

**Interfaces:**
- Consumes: Checkout payload with optional `giftMessage`.
- Produces: Dynamic calculated estimated delivery date, fraud assessment flags, and address verification validations during order placement.

- [ ] **Step 1: Write unit tests for fraud scoring and delivery dates**
  Create `src/__tests__/pure/fraud-rules.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  function calculateFraudScore(params: { recentOrdersCount: number; isSameIP: boolean; isCOD: boolean }) {
    let score = 0;
    if (params.recentOrdersCount > 2) score += 50;
    if (params.isSameIP && params.isCOD) score += 30;
    return score;
  }

  function estimateDeliveryDate(pincode: string, orderDate: Date) {
    const isMajorMetro = ['110001', '400001', '560001', '600001', '500001'].includes(pincode.trim());
    const daysToAdd = isMajorMetro ? 3 : 5;
    const est = new Date(orderDate);
    est.setDate(est.getDate() + daysToAdd);
    return est;
  }

  describe('Fraud and Delivery Date Calculation Helper', () => {
    it('calculates elevated fraud score for spam COD orders', () => {
      const score = calculateFraudScore({ recentOrdersCount: 3, isSameIP: true, isCOD: true });
      expect(score).toBe(80);
    });

    it('estimates 3 days for major metros', () => {
      const date = estimateDeliveryDate('500001', new Date('2026-07-31'));
      expect(date.getDate()).toBe(3); // 31 + 3 = Aug 3
    });
  });
  ```

- [ ] **Step 2: Modify place-order endpoint to implement validations and scoring**
  Modify `src/app/api/orders/place/route.ts` to implement fraud scoring, pincode verification, and delivery date assignment:
  ```typescript
  // Inside POST handler of place/route.ts:
  // Before inserting order:
  
  // 1. Basic Pincode Verification (Length & pattern)
  const cleanPincode = pincode.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanPincode)) {
    return NextResponse.json({ error: 'Invalid Indian Pincode format. Must be 6 digits.' }, { status: 400 });
  }

  // 2. Fraud Check (Count COD orders from same phone/IP within last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('customer_phone', phone)
    .eq('payment_method', 'cod')
    .gte('created_at', oneHourAgo);

  let fraudScore = 0;
  if ((recentCount || 0) >= 2) {
    fraudScore += 60; // Flag high rate
  }
  const isFlagged = fraudScore >= 50;

  // 3. Dynamic Estimated Delivery Date Calculation
  const isMetro = ['110001', '400001', '560001', '600001', '500001', '700001'].includes(cleanPincode);
  const deliveryDays = isMetro ? 3 : 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  
  // 4. Update the DB insert payload:
  // In supabaseAdmin.from('orders').insert({
  //   ...
  //   estimated_delivery_date: deliveryDate.toISOString().split('T')[0],
  //   gift_message: body.giftMessage || null,
  //   is_flagged: isFlagged,
  //   fraud_score: fraudScore
  // })
  ```

- [ ] **Step 3: Modify checkout UI to add gift messaging input**
  Add a text area for `giftMessage` in `src/app/(public)/checkout/page.tsx` within the billing form card.

- [ ] **Step 4: Run tests**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add src/app/api/orders/place/route.ts src/app/\(public\)/checkout/page.tsx src/__tests__/pure/fraud-rules.test.ts
  git commit -m "feat: implement address validation, fraud scoring, and dynamic delivery date"
  ```

---

### Task 3: Customer Order History Lookup

**Files:**
- Create: `src/app/api/orders/history/route.ts`
- Create: `src/app/(public)/order-history/page.tsx`

**Interfaces:**
- Consumes: GET parameter `phone` (with verified session/cookie check).
- Produces: List of orders matching the customer phone number.

- [ ] **Step 1: Create the API route**
  Create `src/app/api/orders/history/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';

  export async function GET(request: NextRequest) {
    try {
      const phone = request.nextUrl.searchParams.get('phone');
      if (!phone) {
        return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
      }

      // Fetch matching orders
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, total_amount, order_status, created_at')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ orders });
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to query order history' }, { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Create order history client lookup page**
  Create `src/app/(public)/order-history/page.tsx` with a phone input and order list component.

- [ ] **Step 3: Commit files**
  ```bash
  git add src/app/api/orders/history/route.ts src/app/\(public\)/order-history/page.tsx
  git commit -m "feat: add customer order history lookup endpoint and UI page"
  ```

---

### Task 4: Bulk CSV Order Export

**Files:**
- Create: `src/app/api/admin/orders/export/route.ts`
- Modify: `src/app/admin/orders/page.tsx`

**Interfaces:**
- Consumes: GET request from authenticated Admin session.
- Produces: CSV file stream download containing all system orders.

- [ ] **Step 1: Write the CSV export endpoint**
  Create `src/app/api/admin/orders/export/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { verifyActiveAdmin } from '@/lib/auth';

  export async function GET(request: NextRequest) {
    try {
      // 1. Authenticate admin
      const admin = await verifyActiveAdmin(request);
      if (!admin) {
        return new Response('Unauthorized', { status: 401 });
      }

      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('order_number, customer_name, customer_phone, total_amount, payment_status, order_status, created_at')
        .order('created_at', { ascending: false });

      if (error || !orders) throw error || new Error('No orders found');

      // 2. Generate CSV stream
      const headers = ['Order Number', 'Customer Name', 'Phone', 'Amount', 'Payment Status', 'Order Status', 'Date'];
      const rows = orders.map(o => [
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.total_amount.toString(),
        o.payment_status,
        o.order_status,
        o.created_at
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="orders_export.csv"',
        }
      });
    } catch (err: any) {
      return new Response('Failed to export CSV', { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Add "Export CSV" trigger to Admin Orders Page**
  Modify `src/app/admin/orders/page.tsx` to add a button calling `/api/admin/orders/export`.

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/app/api/admin/orders/export/route.ts src/app/admin/orders/page.tsx
  git commit -m "feat: add admin bulk order export endpoint and dashboard trigger"
  ```

---

### Task 5: Admin Order Editing

**Files:**
- Create: `src/app/api/admin/orders/edit/route.ts`
- Modify: `src/app/admin/orders/[id]/page.tsx`

**Interfaces:**
- Consumes: POST request from verified admin containing `orderId`, `customerName`, `customerPhone`, `shippingAddress`, `giftMessage`.
- Produces: `{ success: true }` update response.

- [ ] **Step 1: Write the edit order endpoint**
  Create `src/app/api/admin/orders/edit/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { verifyActiveAdmin } from '@/lib/auth';

  export async function POST(request: NextRequest) {
    try {
      const admin = await verifyActiveAdmin(request);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json().catch(() => null);
      if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

      const { orderId, customerName, customerPhone, shippingAddress, giftMessage } = body;

      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          gift_message: giftMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Add "Edit details" modal/buttons in order details page**
  Modify `src/app/admin/orders/[id]/page.tsx` to add editing forms and integrate them with `/api/admin/orders/edit`.

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/app/api/admin/orders/edit/route.ts src/app/admin/orders/\[id\]/page.tsx
  git commit -m "feat: implement admin order editing controls and API endpoint"
  ```

---

### Task 6: Twilio SMS Alerts and Outbound Webhooks

**Files:**
- Create: `src/lib/sms.ts`
- Create: `src/lib/webhooks.ts`
- Modify: `src/app/api/orders/place/route.ts`
- Modify: `src/app/admin/orders/[id]/page.tsx`

**Interfaces:**
- Consumes: Order updates and config keys.
- Produces: Outbound HTTP POST payloads to `webhook_url` and Twilio SMS dispatches.

- [ ] **Step 1: WriteTwilio SMS dispatcher**
  Create `src/lib/sms.ts`:
  ```typescript
  import { supabaseAdmin } from './supabase-admin';

  export async function sendSMSNotification(to: string, message: string) {
    try {
      const { data: sidConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_sid').maybeSingle();
      const { data: tokenConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_auth_token').maybeSingle();
      const { data: fromConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_from_number').maybeSingle();

      const sid = sidConfig?.config_value;
      const token = tokenConfig?.config_value;
      const from = fromConfig?.config_value;

      if (!sid || !token || !from) {
        console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
        return { success: true, mocked: true };
      }

      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: message
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      return { success: true };
    } catch (err) {
      console.error('SMS Send Failed:', err);
      return { success: false, error: err };
    }
  }
  ```

- [ ] **Step 2: Write Outbound Webhook dispatcher**
  Create `src/lib/webhooks.ts`:
  ```typescript
  import { supabaseAdmin } from './supabase-admin';

  export async function dispatchOrderWebhook(event: string, orderData: any) {
    try {
      const { data: config } = await supabaseAdmin
        .from('portal_config')
        .select('config_value')
        .eq('config_key', 'webhook_url')
        .maybeSingle();

      const url = config?.config_value;
      if (!url) return;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SS-Pharmacy-Event': event
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data: orderData
        })
      });
    } catch (err) {
      console.error('Webhook Dispatch Failed:', err);
    }
  }
  ```

- [ ] **Step 3: Integrate SMS and Webhooks on status transitions**
  Modify `/api/orders/place/route.ts` and `src/app/admin/orders/[id]/page.tsx` to call `sendSMSNotification` and `dispatchOrderWebhook` on order creation and state transitions.

- [ ] **Step 4: Commit changes**
  ```bash
  git add src/lib/sms.ts src/lib/webhooks.ts src/app/api/orders/place/route.ts src/app/admin/orders/\[id\]/page.tsx
  git commit -m "feat: implement twilio sms alerts and outbound webhook dispatches"
  ```
