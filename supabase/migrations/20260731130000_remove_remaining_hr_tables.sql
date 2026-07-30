-- Drop PrimeTek HR tables
DROP TABLE IF EXISTS public.employee_presence CASCADE;
DROP TABLE IF EXISTS public.notification_reads CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.holidays CASCADE;
DROP TABLE IF EXISTS public.disputes CASCADE;
DROP TABLE IF EXISTS public.immutable_audit_logs CASCADE;
DROP TABLE IF EXISTS public.attendance_projections CASCADE;
DROP TABLE IF EXISTS public.attendance_events CASCADE;
DROP TABLE IF EXISTS public.attendance_risk_events CASCADE;
DROP TABLE IF EXISTS public.trusted_devices CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.active_sessions CASCADE;

-- Drop HR-specific columns from admin_users
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS role;
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS notification_preferences;
