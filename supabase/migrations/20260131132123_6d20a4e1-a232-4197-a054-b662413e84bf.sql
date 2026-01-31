-- Media Launch OS Schema

-- Enum for media platforms
CREATE TYPE public.media_platform AS ENUM ('youtube_video', 'youtube_channel', 'spotify_track', 'spotify_album', 'spotify_artist', 'apple_music', 'soundcloud', 'tiktok', 'other');

-- Enum for media asset status
CREATE TYPE public.media_asset_status AS ENUM ('draft', 'planning', 'pre_launch', 'launching', 'post_launch', 'evergreen', 'archived');

-- Enum for creative status
CREATE TYPE public.media_creative_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'rejected');

-- Main media assets table
CREATE TABLE public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    platform media_platform NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    platform_id TEXT,
    thumbnail_url TEXT,
    embed_html TEXT,
    artist_name TEXT,
    release_date DATE,
    language TEXT DEFAULT 'en',
    genre TEXT,
    target_markets JSONB DEFAULT '[]'::jsonb,
    smart_link_slug TEXT UNIQUE,
    smart_link_config JSONB DEFAULT '{}'::jsonb,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    status media_asset_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Metadata snapshots for tracking changes
CREATE TABLE public.media_metadata_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ DEFAULT now()
);

-- Media campaigns
CREATE TABLE public.media_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT,
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    targeting_json JSONB DEFAULT '{}'::jsonb,
    results_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Media creatives (hooks, captions, scripts, etc.)
CREATE TABLE public.media_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    format TEXT NOT NULL,
    name TEXT,
    copy_json JSONB DEFAULT '{}'::jsonb,
    file_refs JSONB DEFAULT '[]'::jsonb,
    platform_target TEXT,
    status media_creative_status DEFAULT 'draft',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Distribution plan
CREATE TABLE public.media_distribution_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan_json JSONB DEFAULT '{}'::jsonb,
    calendar_json JSONB DEFAULT '[]'::jsonb,
    phases JSONB DEFAULT '{"pre_launch": [], "launch": [], "post_launch": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Media KPIs daily tracking
CREATE TABLE public.media_kpis_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    watch_time_minutes INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    subscribers_gained INTEGER DEFAULT 0,
    ctr NUMERIC,
    avg_view_duration NUMERIC,
    retention_rate NUMERIC,
    streams INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    playlist_adds INTEGER DEFAULT 0,
    smart_link_clicks INTEGER DEFAULT 0,
    email_signups INTEGER DEFAULT 0,
    metrics_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(media_asset_id, source, date)
);

-- Media competitors analysis
CREATE TABLE public.media_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    competitor_url TEXT NOT NULL,
    competitor_name TEXT,
    platform media_platform,
    metrics_json JSONB DEFAULT '{}'::jsonb,
    insights_json JSONB DEFAULT '{}'::jsonb,
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Smart link clicks tracking
CREATE TABLE public.smart_link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    country TEXT,
    device TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Smart link email captures
CREATE TABLE public.smart_link_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    consent_given BOOLEAN DEFAULT false,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_metadata_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_distribution_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_kpis_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_link_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_assets
CREATE POLICY "Workspace access for media_assets" ON public.media_assets
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_metadata_snapshots
CREATE POLICY "Workspace access for media_metadata_snapshots" ON public.media_metadata_snapshots
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_campaigns
CREATE POLICY "Workspace access for media_campaigns" ON public.media_campaigns
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_creatives
CREATE POLICY "Workspace access for media_creatives" ON public.media_creatives
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_distribution_plan
CREATE POLICY "Workspace access for media_distribution_plan" ON public.media_distribution_plan
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_kpis_daily
CREATE POLICY "Workspace access for media_kpis_daily" ON public.media_kpis_daily
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- RLS Policies for media_competitors
CREATE POLICY "Workspace access for media_competitors" ON public.media_competitors
    FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
    WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Smart link clicks - public insert for tracking, workspace read
CREATE POLICY "Anyone can insert smart link clicks" ON public.smart_link_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Workspace can read smart link clicks" ON public.smart_link_clicks
    FOR SELECT USING (
        media_asset_id IN (
            SELECT id FROM public.media_assets 
            WHERE workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
        )
    );

-- Smart link emails - public insert with consent, workspace read
CREATE POLICY "Anyone can insert smart link emails" ON public.smart_link_emails
    FOR INSERT WITH CHECK (consent_given = true);

CREATE POLICY "Workspace access for smart_link_emails" ON public.smart_link_emails
    FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- Indexes for performance
CREATE INDEX idx_media_assets_workspace ON public.media_assets(workspace_id);
CREATE INDEX idx_media_assets_platform ON public.media_assets(platform);
CREATE INDEX idx_media_assets_smart_link ON public.media_assets(smart_link_slug);
CREATE INDEX idx_media_kpis_asset_date ON public.media_kpis_daily(media_asset_id, date);
CREATE INDEX idx_smart_link_clicks_asset ON public.smart_link_clicks(media_asset_id);
CREATE INDEX idx_media_creatives_asset ON public.media_creatives(media_asset_id);

-- Add media agent types to enum
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'media_strategy';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'youtube_optimizer';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'streaming_packager';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'shortform_repurposer';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'ads_creative';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'media_competitive_analyst';
ALTER TYPE public.agent_type ADD VALUE IF NOT EXISTS 'media_analytics_guardian';

-- Triggers for updated_at
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON public.media_assets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_campaigns_updated_at BEFORE UPDATE ON public.media_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_creatives_updated_at BEFORE UPDATE ON public.media_creatives
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_distribution_updated_at BEFORE UPDATE ON public.media_distribution_plan
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_competitors_updated_at BEFORE UPDATE ON public.media_competitors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();