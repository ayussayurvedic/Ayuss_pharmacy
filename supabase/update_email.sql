-- SQL Script to Update Support Email in Database
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Alter the default value for new records in the business_tax_settings table
ALTER TABLE public.business_tax_settings 
ALTER COLUMN support_email SET DEFAULT 'ayuss.ayurvedic@gmail.com';

-- 2. Update existing records that have the old default email address
UPDATE public.business_tax_settings 
SET support_email = 'ayuss.ayurvedic@gmail.com' 
WHERE support_email = 'support@sspharmacy.in';
