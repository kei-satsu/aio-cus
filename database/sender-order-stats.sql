CREATE OR REPLACE FUNCTION public.get_sender_order_stats(p_sender_id text)
RETURNS TABLE(total bigint, delivered bigint, returned bigint)
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE o.status IN ('Delivered', 'Settled')) AS delivered,
    COUNT(*) FILTER (WHERE o.status = 'Returned') AS returned
  FROM public.orders AS o
  WHERE o.sender_id::text = NULLIF(BTRIM(p_sender_id), '');
$function$;

REVOKE ALL ON FUNCTION public.get_sender_order_stats(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_sender_order_stats(text) TO authenticated;

NOTIFY pgrst, 'reload schema';
