-- ==========================================
-- S.S. Pharmacy - Create Distributor Applications Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.distributor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    state TEXT,
    gstin TEXT,
    expected_monthly_volume TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'contacted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.distributor_applications ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Public can insert new applications
CREATE POLICY "Public can insert distributor_applications" 
ON public.distributor_applications FOR INSERT 
WITH CHECK (true);

-- 2. Policy: Authenticated users (admin) can select applications
CREATE POLICY "Authenticated users can select distributor_applications" 
ON public.distributor_applications FOR SELECT 
TO authenticated 
USING (true);

-- 3. Policy: Authenticated users (admin) can update applications
CREATE POLICY "Authenticated users can update distributor_applications" 
ON public.distributor_applications FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Policy: Authenticated users (admin) can delete applications
CREATE POLICY "Authenticated users can delete distributor_applications" 
ON public.distributor_applications FOR DELETE 
TO authenticated 
USING (true);
