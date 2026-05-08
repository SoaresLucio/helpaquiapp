CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action_type text, p_max_requests integer DEFAULT 10, p_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  v_window_start timestamp with time zone;
BEGIN
  v_window_start := date_trunc('hour', now()) +
    (EXTRACT(minute FROM now())::integer / p_window_minutes) *
    INTERVAL '1 minute' * p_window_minutes;

  INSERT INTO public.rate_limits (user_id, action_type, window_start)
  VALUES (p_user_id, p_action_type, v_window_start)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1, created_at = now()
  RETURNING public.rate_limits.count INTO current_count;

  RETURN current_count <= p_max_requests;
END;
$function$;