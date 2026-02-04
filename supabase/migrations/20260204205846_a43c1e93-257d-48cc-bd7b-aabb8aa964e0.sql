-- Fix remaining permissive policies on smart_link_clicks
DROP POLICY IF EXISTS "smart_link_clicks_insert_v7" ON public.smart_link_clicks;
DROP POLICY IF EXISTS "smart_link_clicks_rate_limited_insert" ON public.smart_link_clicks;