-- Migration: Create audit_logs and rate_limits tables and functions

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create log_action RPC function
CREATE OR REPLACE FUNCTION public.log_action(
  p_user_id UUID,
  p_user_role TEXT,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_role,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    created_at
  )
  VALUES (
    p_user_id,
    p_user_role,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_data,
    p_new_data,
    now()
  );
END;
$$;

-- 3. Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    points INT NOT NULL,
    expire_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create consume_rate_limit RPC function
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_max_points INT,
  p_duration_sec INT,
  p_block_duration_sec INT DEFAULT 0
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining_points INT,
  ms_before_next BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_now_ms BIGINT := EXTRACT(EPOCH FROM now()) * 1000;
  v_expire_at TIMESTAMPTZ;
  v_points INT;
  v_allowed BOOLEAN := true;
  v_ms_before_next BIGINT := 0;
BEGIN
  -- Select existing rate limit record
  SELECT points, expire_at INTO v_points, v_expire_at
  FROM public.rate_limits
  WHERE key = p_key;

  IF NOT FOUND OR v_expire_at <= v_now THEN
    -- No active record or expired: create new
    v_points := p_max_points - 1;
    v_expire_at := v_now + (p_duration_sec * INTERVAL '1 second');
    
    INSERT INTO public.rate_limits (key, points, expire_at, updated_at)
    VALUES (p_key, v_points, v_expire_at, v_now)
    ON CONFLICT (key) DO UPDATE
    SET points = EXCLUDED.points, expire_at = EXCLUDED.expire_at, updated_at = EXCLUDED.updated_at;
    
    v_ms_before_next := 0;
    v_allowed := true;
  ELSIF v_points <= 0 THEN
    -- Blocked / no points remaining
    v_allowed := false;
    v_ms_before_next := (EXTRACT(EPOCH FROM v_expire_at) * 1000) - v_now_ms;
    IF v_ms_before_next < 0 THEN
      v_ms_before_next := 0;
    END IF;
  ELSE
    -- Points remaining: consume one
    v_points := v_points - 1;
    
    IF v_points <= 0 AND p_block_duration_sec > 0 THEN
      -- If it hits 0 and block duration is specified, extend expiration (block them)
      v_expire_at := v_now + (p_block_duration_sec * INTERVAL '1 second');
      v_allowed := false;
      v_ms_before_next := p_block_duration_sec * 1000;
    ELSE
      v_ms_before_next := (EXTRACT(EPOCH FROM v_expire_at) * 1000) - v_now_ms;
      IF v_ms_before_next < 0 THEN
        v_ms_before_next := 0;
      END IF;
    END IF;

    UPDATE public.rate_limits
    SET points = v_points, expire_at = v_expire_at, updated_at = v_now
    WHERE key = p_key;
  END IF;

  RETURN QUERY SELECT v_allowed, v_points, v_ms_before_next;
END;
$$;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_action(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INT, INT, INT) TO anon, authenticated, service_role;
