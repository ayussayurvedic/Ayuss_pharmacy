-- Migration: Expose uuid_generate_v4 in public schema
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid
SECURITY DEFINER
AS $$
BEGIN
    RETURN extensions.uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.uuid_generate_v4() TO PUBLIC;
