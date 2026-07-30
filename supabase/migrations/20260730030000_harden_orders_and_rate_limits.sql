-- Security Hardening Migration: Restrict Order Updates & Grant Full Admin Access to Orders

-- 1. Harden Orders UPDATE policy (only Admins & Service Role can update order status or payment status)
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;

-- 2. Add Admin Full Access Policy for Orders
CREATE POLICY "Admins have full access to orders" 
    ON public.orders FOR ALL 
    USING (public.is_admin() OR auth.role() = 'service_role');

-- 3. Add Admin Full Access Policy for Order Items
CREATE POLICY "Admins have full access to order_items" 
    ON public.order_items FOR ALL 
    USING (public.is_admin() OR auth.role() = 'service_role');

-- 4. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
