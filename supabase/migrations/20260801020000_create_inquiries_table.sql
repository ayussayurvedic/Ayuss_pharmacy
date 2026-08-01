-- Migration: Create public.inquiries table with RLS policies

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public contact inquiry insertion" ON public.inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON public.inquiries;

-- RLS Policy: Anyone can submit a contact inquiry
CREATE POLICY "Allow public contact inquiry insertion"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Full access for service role and admin
CREATE POLICY "Allow admin full access to inquiries"
    ON public.inquiries FOR ALL
    USING (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'admin');

-- Index for fast status and date queries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
