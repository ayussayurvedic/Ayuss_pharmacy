-- ====================================================================
-- S.S. Pharmacy - Admin Notifications & Subscriptions Schema
-- ====================================================================

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'announcement' CHECK (type IN ('announcement', 'personal', 'alert')),
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE, -- NULL = broadcast to all admins
    sender_name TEXT DEFAULT 'System',
    is_read BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_for_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies for Notifications
DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.notifications;
CREATE POLICY "Admins have full access to notifications" ON public.notifications 
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 2. Create Notification Reads Table (for tracking broadcast read states)
CREATE TABLE IF NOT EXISTS public.notification_reads (
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (notification_id, admin_id)
);

-- Enable RLS on Reads
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies for Reads
DROP POLICY IF EXISTS "Admins have full access to notification_reads" ON public.notification_reads;
CREATE POLICY "Admins have full access to notification_reads" ON public.notification_reads 
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Create Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_name TEXT,
    browser_type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Push Subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies for Push Subscriptions
DROP POLICY IF EXISTS "Admins have full access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins have full access to push_subscriptions" ON public.push_subscriptions 
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_pinned_created_at ON public.notifications(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_admin_id ON public.notification_reads(admin_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_admin_id ON public.push_subscriptions(admin_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
