-- Migration: Remove Legacy PrimeTek / Attendance Features

-- 1. Drop tables (cascade drops dependent triggers, FK constraints, indexes and views)
DROP TABLE IF EXISTS public.disputes CASCADE;
DROP TABLE IF EXISTS public.attendance_events CASCADE;
DROP TABLE IF EXISTS public.attendance_risk_events CASCADE;
DROP TABLE IF EXISTS public.attendance_projections CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.trusted_devices CASCADE;
DROP TABLE IF EXISTS public.wfh_requests CASCADE;

-- 2. Drop triggers and trigger functions
DROP FUNCTION IF EXISTS public.apply_event_to_projection() CASCADE;
DROP FUNCTION IF EXISTS public.sweep_active_sessions_telemetry() CASCADE;
DROP FUNCTION IF EXISTS public.sweep_and_close_stale_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_all_employee_lates(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_employee_lates_safe(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.increment_used_days() CASCADE;
DROP FUNCTION IF EXISTS public.record_heartbeat(UUID, UUID, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.validate_desktop_session() CASCADE;
DROP FUNCTION IF EXISTS public.validate_office_ip() CASCADE;

-- 3. Drop custom types
DROP TYPE IF EXISTS public.attendance_event_type CASCADE;
