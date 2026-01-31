-- Fix RLS policy for smart_link_clicks - require valid media_asset_id
DROP POLICY IF EXISTS "Anyone can insert smart link clicks" ON public.smart_link_clicks;

CREATE POLICY "Public insert smart link clicks with valid asset" ON public.smart_link_clicks
    FOR INSERT WITH CHECK (
        media_asset_id IN (SELECT id FROM public.media_assets)
    );