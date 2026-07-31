-- 1. Add estimated delivery date, gift message, is_flagged, and fraud_score to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS gift_message TEXT,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;

-- 2. Add indexes for fraud scoring and delivery date queries
CREATE INDEX IF NOT EXISTS idx_orders_is_flagged ON public.orders (is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_orders_fraud_score ON public.orders (fraud_score) WHERE fraud_score > 0;
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery ON public.orders (estimated_delivery_date);

-- 3. Create webhook_events audit log table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    payload JSONB,
    response_status INT,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on webhook_events" ON public.webhook_events;
CREATE POLICY "Service role full access on webhook_events"
    ON public.webhook_events FOR ALL
    USING (auth.role() = 'service_role');

GRANT ALL ON public.webhook_events TO service_role;
CREATE INDEX IF NOT EXISTS idx_webhook_events_order ON public.webhook_events (order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event ON public.webhook_events (event_name);

-- 4. Insert default config values if not present
INSERT INTO public.portal_config (config_key, config_value)
VALUES 
    ('webhook_url', ''),
    ('twilio_sid', ''),
    ('twilio_auth_token', ''),
    ('twilio_from_number', '')
ON CONFLICT (config_key) DO NOTHING;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
