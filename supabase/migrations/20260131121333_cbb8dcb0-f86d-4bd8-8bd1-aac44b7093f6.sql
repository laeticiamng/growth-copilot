-- =============================================
-- GROWTH OS AUTOPILOT - COMPLETE DATABASE SCHEMA
-- =============================================

-- 1) ENUMS
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.agency_role AS ENUM ('agency_owner', 'agency_member');
CREATE TYPE public.integration_provider AS ENUM ('google_search_console', 'google_analytics', 'google_ads', 'google_business_profile', 'meta', 'instagram', 'wordpress', 'shopify', 'webflow', 'email_provider', 'crm', 'calendar');
CREATE TYPE public.integration_status AS ENUM ('connected', 'disconnected', 'error', 'pending');
CREATE TYPE public.issue_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE public.issue_status AS ENUM ('open', 'in_progress', 'fixed', 'ignored', 'wont_fix');
CREATE TYPE public.content_status AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE public.agent_type AS ENUM ('tech_auditor', 'keyword_strategist', 'content_builder', 'local_manager', 'ads_manager', 'analytics_guardian', 'cro_optimizer', 'offer_architect', 'lifecycle_manager', 'sales_ops', 'reputation_manager', 'competitive_analyst', 'chief_growth_officer', 'quality_compliance');
CREATE TYPE public.agent_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'starter', 'growth', 'agency');

-- 2) WORKSPACES (Multi-tenant root)
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    plan subscription_plan DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    quota_sites INTEGER DEFAULT 1,
    quota_crawls_month INTEGER DEFAULT 10,
    quota_agent_runs_month INTEGER DEFAULT 50,
    is_agency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) USER ROLES (RBAC - separate table as required)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, workspace_id)
);

-- 4) AGENCY CLIENTS (for agency mode)
CREATE TABLE public.agency_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    client_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    agency_role agency_role DEFAULT 'agency_member',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(agency_workspace_id, client_workspace_id)
);

-- 5) SITES
CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    name TEXT,
    sector TEXT,
    geographic_zone TEXT,
    language TEXT DEFAULT 'fr',
    business_type TEXT, -- local/ecom/service
    objectives JSONB DEFAULT '[]'::jsonb, -- leads/calls/sales
    cms_type TEXT, -- wordpress/shopify/webflow/none
    cms_access_level TEXT, -- full/limited/none
    tracking_status TEXT DEFAULT 'not_configured',
    is_active BOOLEAN DEFAULT TRUE,
    last_crawl_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) INTEGRATIONS
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    status integration_status DEFAULT 'pending',
    access_token_ref TEXT, -- Reference to secret, never store token directly
    refresh_token_ref TEXT,
    scopes JSONB DEFAULT '[]'::jsonb,
    account_id TEXT,
    account_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7) CRAWLS
CREATE TABLE public.crawls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending/running/completed/failed
    pages_crawled INTEGER DEFAULT 0,
    pages_total INTEGER,
    issues_found INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8) PAGES (crawled pages)
CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    crawl_id UUID REFERENCES public.crawls(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    h1 TEXT,
    h2_count INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    status_code INTEGER,
    canonical_url TEXT,
    is_indexable BOOLEAN DEFAULT TRUE,
    schema_types JSONB DEFAULT '[]'::jsonb,
    internal_links_count INTEGER DEFAULT 0,
    external_links_count INTEGER DEFAULT 0,
    load_time_ms INTEGER,
    page_size_kb INTEGER,
    last_crawled_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9) ISSUES
CREATE TABLE public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    crawl_id UUID REFERENCES public.crawls(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- seo_tech/content/performance/local/ads/cro
    issue_type TEXT NOT NULL,
    severity issue_severity DEFAULT 'medium',
    status issue_status DEFAULT 'open',
    title TEXT NOT NULL,
    description TEXT,
    impact_score INTEGER DEFAULT 50, -- 0-100
    confidence_score INTEGER DEFAULT 50, -- 0-100
    effort_score INTEGER DEFAULT 50, -- 0-100 (lower = easier)
    recommendation TEXT,
    fix_instructions TEXT,
    auto_fixable BOOLEAN DEFAULT FALSE,
    fixed_at TIMESTAMPTZ,
    fixed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10) RECOMMENDATIONS
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    impact_score INTEGER DEFAULT 50,
    confidence_score INTEGER DEFAULT 50,
    effort_score INTEGER DEFAULT 50,
    priority_rank INTEGER,
    status TEXT DEFAULT 'pending', -- pending/approved/rejected/completed
    is_automated BOOLEAN DEFAULT FALSE,
    agent_type agent_type,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11) KEYWORDS
CREATE TABLE public.keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    difficulty INTEGER,
    cpc DECIMAL(10,2),
    intent TEXT, -- info/commercial/transactional/local
    source TEXT, -- gsc/manual/ads/competitor
    clicks_30d INTEGER,
    impressions_30d INTEGER,
    ctr_30d DECIMAL(5,2),
    position_avg DECIMAL(5,2),
    is_tracked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12) KEYWORD CLUSTERS
CREATE TABLE public.keyword_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    main_intent TEXT,
    keywords_count INTEGER DEFAULT 0,
    total_volume INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13) PAGE MAP (keyword to page mapping)
CREATE TABLE public.page_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    keyword_id UUID REFERENCES public.keywords(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
    mapping_type TEXT, -- existing/to_create/cannibalization
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14) CONTENT BRIEFS
CREATE TABLE public.content_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_keyword TEXT,
    cluster_id UUID REFERENCES public.keyword_clusters(id) ON DELETE SET NULL,
    brief_content JSONB DEFAULT '{}'::jsonb, -- structure, headings, topics, competitors
    word_count_target INTEGER,
    status content_status DEFAULT 'draft',
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15) CONTENT DRAFTS
CREATE TABLE public.content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    brief_id UUID REFERENCES public.content_briefs(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    meta_description TEXT,
    schema_markup JSONB,
    internal_links JSONB DEFAULT '[]'::jsonb,
    status content_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16) PUBLICATIONS
CREATE TABLE public.publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    draft_id UUID REFERENCES public.content_drafts(id) ON DELETE SET NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    published_url TEXT,
    published_at TIMESTAMPTZ,
    cms_post_id TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled/published/failed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17) GBP PROFILES
CREATE TABLE public.gbp_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
    location_id TEXT,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    website TEXT,
    categories JSONB DEFAULT '[]'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    hours JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    photos_count INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(2,1),
    audit_score INTEGER, -- 0-100
    last_audit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18) GBP POSTS
CREATE TABLE public.gbp_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    gbp_profile_id UUID REFERENCES public.gbp_profiles(id) ON DELETE CASCADE NOT NULL,
    post_type TEXT, -- update/event/offer
    title TEXT,
    content TEXT,
    cta_type TEXT,
    cta_url TEXT,
    image_url TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    gbp_post_id TEXT,
    status TEXT DEFAULT 'draft', -- draft/scheduled/published/failed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 19) REVIEWS
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    gbp_profile_id UUID REFERENCES public.gbp_profiles(id) ON DELETE CASCADE NOT NULL,
    review_id TEXT,
    author_name TEXT,
    rating INTEGER,
    comment TEXT,
    reply TEXT,
    replied_at TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    sentiment TEXT, -- positive/neutral/negative
    requires_attention BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 20) REVIEW REQUESTS
CREATE TABLE public.review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    gbp_profile_id UUID REFERENCES public.gbp_profiles(id) ON DELETE CASCADE NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_name TEXT,
    channel TEXT, -- email/sms/qr
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    review_received BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 21) ADS ACCOUNTS
CREATE TABLE public.ads_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    currency TEXT DEFAULT 'EUR',
    timezone TEXT,
    budget_limit_daily DECIMAL(10,2),
    budget_limit_monthly DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22) CAMPAIGNS
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    ads_account_id UUID REFERENCES public.ads_accounts(id) ON DELETE CASCADE NOT NULL,
    campaign_id TEXT,
    name TEXT NOT NULL,
    campaign_type TEXT, -- search/display/pmax/local
    strategy TEXT, -- brand/non-brand/local/retargeting
    status TEXT DEFAULT 'draft',
    budget_daily DECIMAL(10,2),
    target_cpa DECIMAL(10,2),
    target_roas DECIMAL(5,2),
    impressions_30d INTEGER DEFAULT 0,
    clicks_30d INTEGER DEFAULT 0,
    cost_30d DECIMAL(10,2) DEFAULT 0,
    conversions_30d INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 23) AD GROUPS
CREATE TABLE public.adgroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    adgroup_id TEXT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'enabled',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 24) ADS
CREATE TABLE public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    adgroup_id UUID REFERENCES public.adgroups(id) ON DELETE CASCADE NOT NULL,
    ad_id TEXT,
    ad_type TEXT, -- rsa/eta/display
    headlines JSONB DEFAULT '[]'::jsonb,
    descriptions JSONB DEFAULT '[]'::jsonb,
    final_url TEXT,
    status TEXT DEFAULT 'draft',
    quality_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 25) ADS KEYWORDS
CREATE TABLE public.ads_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    adgroup_id UUID REFERENCES public.adgroups(id) ON DELETE CASCADE NOT NULL,
    keyword TEXT NOT NULL,
    match_type TEXT DEFAULT 'broad', -- exact/phrase/broad
    status TEXT DEFAULT 'enabled',
    max_cpc DECIMAL(10,2),
    quality_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 26) ADS NEGATIVES
CREATE TABLE public.ads_negatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    adgroup_id UUID REFERENCES public.adgroups(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    match_type TEXT DEFAULT 'exact',
    level TEXT DEFAULT 'campaign', -- campaign/adgroup
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 27) SOCIAL ACCOUNTS
CREATE TABLE public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
    platform TEXT NOT NULL, -- instagram/facebook/linkedin/twitter
    account_id TEXT,
    account_name TEXT,
    followers_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 28) SOCIAL CALENDAR
CREATE TABLE public.social_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content_type TEXT, -- post/story/reel/carousel
    platforms JSONB DEFAULT '[]'::jsonb,
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 29) SOCIAL POSTS
CREATE TABLE public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    calendar_id UUID REFERENCES public.social_calendar(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    hashtags JSONB DEFAULT '[]'::jsonb,
    utm_params JSONB DEFAULT '{}'::jsonb,
    platform_post_id TEXT,
    published_at TIMESTAMPTZ,
    engagement_likes INTEGER DEFAULT 0,
    engagement_comments INTEGER DEFAULT 0,
    engagement_shares INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 30) CRO AUDITS
CREATE TABLE public.cro_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    page_type TEXT, -- home/service/pricing/contact/checkout
    friction_score INTEGER, -- 0-100 (lower = better)
    findings JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 31) CRO EXPERIMENTS
CREATE TABLE public.cro_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    cro_audit_id UUID REFERENCES public.cro_audits(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    hypothesis TEXT,
    page_url TEXT,
    element_type TEXT, -- hero/cta/form/pricing/testimonial
    status TEXT DEFAULT 'draft', -- draft/running/completed/paused
    test_type TEXT DEFAULT 'sequential', -- ab/sequential
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    winner_variant_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 32) CRO VARIANTS
CREATE TABLE public.cro_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    experiment_id UUID REFERENCES public.cro_experiments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_control BOOLEAN DEFAULT FALSE,
    changes JSONB DEFAULT '{}'::jsonb, -- what changed
    visitors INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 33) OFFERS
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    tier TEXT, -- starter/growth/premium
    price DECIMAL(10,2),
    price_period TEXT, -- monthly/yearly/one-time
    features JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    guarantees JSONB DEFAULT '[]'::jsonb,
    objections_answers JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 34) PRICING VERSIONS
CREATE TABLE public.pricing_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER DEFAULT 1,
    offers JSONB DEFAULT '[]'::jsonb, -- snapshot of offers
    page_content JSONB DEFAULT '{}'::jsonb,
    is_live BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 35) LEADS
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    name TEXT,
    company TEXT,
    source TEXT, -- organic/ads/social/referral/direct
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    status lead_status DEFAULT 'new',
    score INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES auth.users(id),
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 36) PIPELINE STAGES
CREATE TABLE public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    color TEXT,
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 37) DEALS
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    probability INTEGER DEFAULT 50,
    expected_close_date DATE,
    closed_at TIMESTAMPTZ,
    won BOOLEAN,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 38) ACTIVITIES
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- call/email/meeting/note/task
    subject TEXT,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 39) ACTION LOG (APPEND-ONLY AUDIT TRAIL)
CREATE TABLE public.action_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL, -- user/agent/system
    actor_id TEXT, -- user_id or agent_type
    action_type TEXT NOT NULL,
    action_category TEXT, -- seo/local/ads/cro/content/sales
    entity_type TEXT,
    entity_id UUID,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    result TEXT, -- success/failure/pending
    is_automated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 40) KPIs DAILY
CREATE TABLE public.kpis_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    -- SEO
    organic_sessions INTEGER DEFAULT 0,
    organic_clicks INTEGER DEFAULT 0,
    organic_impressions INTEGER DEFAULT 0,
    avg_position DECIMAL(5,2),
    indexed_pages INTEGER DEFAULT 0,
    -- Ads
    ads_impressions INTEGER DEFAULT 0,
    ads_clicks INTEGER DEFAULT 0,
    ads_cost DECIMAL(10,2) DEFAULT 0,
    ads_conversions INTEGER DEFAULT 0,
    -- Local
    gbp_views INTEGER DEFAULT 0,
    gbp_clicks INTEGER DEFAULT 0,
    gbp_calls INTEGER DEFAULT 0,
    gbp_directions INTEGER DEFAULT 0,
    -- Conversion
    total_leads INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    -- Revenue
    revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(site_id, date)
);

-- 41) MONTHLY REPORTS
CREATE TABLE public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    summary_json JSONB DEFAULT '{}'::jsonb,
    actions_completed JSONB DEFAULT '[]'::jsonb,
    next_actions JSONB DEFAULT '[]'::jsonb,
    kpi_changes JSONB DEFAULT '{}'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    generated_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(site_id, month)
);

-- 42) AGENT RUNS
CREATE TABLE public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    agent_type agent_type NOT NULL,
    parent_run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
    status agent_run_status DEFAULT 'pending',
    inputs JSONB DEFAULT '{}'::jsonb,
    outputs JSONB DEFAULT '{}'::jsonb,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    cost_estimate DECIMAL(10,4),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 43) BRAND KIT
CREATE TABLE public.brand_kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    tone_of_voice TEXT,
    values JSONB DEFAULT '[]'::jsonb,
    style_guidelines TEXT,
    forbidden_words JSONB DEFAULT '[]'::jsonb,
    allowed_claims JSONB DEFAULT '[]'::jsonb,
    available_proofs JSONB DEFAULT '[]'::jsonb, -- testimonials, stats, certifications
    usp JSONB DEFAULT '[]'::jsonb,
    target_audience TEXT,
    competitors JSONB DEFAULT '[]'::jsonb,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(site_id)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gbp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gbp_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_negatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cro_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cro_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cro_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kit ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS (to avoid RLS recursion)
-- =============================================

-- Check if user has role in workspace
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id uuid, _workspace_id uuid, _role app_role DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND (_role IS NULL OR role = _role)
  )
$$;

-- Check if user has any role in workspace (member or above)
CREATE OR REPLACE FUNCTION public.has_workspace_access(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
  )
$$;

-- Check if user is owner of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND owner_id = _user_id
  )
$$;

-- Check if user has agency access to client workspace
CREATE OR REPLACE FUNCTION public.has_agency_access(_user_id uuid, _client_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.agency_clients ac
    JOIN public.user_roles ur ON ur.workspace_id = ac.agency_workspace_id
    WHERE ac.client_workspace_id = _client_workspace_id
      AND ur.user_id = _user_id
  )
$$;

-- Get all workspace IDs user has access to (direct + agency)
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Direct access
  SELECT workspace_id FROM public.user_roles WHERE user_id = _user_id
  UNION
  -- Agency access
  SELECT ac.client_workspace_id 
  FROM public.agency_clients ac
  JOIN public.user_roles ur ON ur.workspace_id = ac.agency_workspace_id
  WHERE ur.user_id = _user_id
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- WORKSPACES
CREATE POLICY "Users can view workspaces they have access to"
ON public.workspaces FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(auth.uid(), id) OR
  public.has_agency_access(auth.uid(), id)
);

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
TO authenticated
USING (public.is_workspace_owner(auth.uid(), id));

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
TO authenticated
USING (public.is_workspace_owner(auth.uid(), id));

-- USER ROLES
CREATE POLICY "Users can view roles in their workspaces"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "Owners/admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR
  public.has_workspace_role(auth.uid(), workspace_id, 'admin')
);

-- AGENCY CLIENTS
CREATE POLICY "Agency members can view their clients"
ON public.agency_clients FOR SELECT
TO authenticated
USING (public.has_workspace_access(auth.uid(), agency_workspace_id));

CREATE POLICY "Agency owners can manage clients"
ON public.agency_clients FOR ALL
TO authenticated
USING (public.has_workspace_role(auth.uid(), agency_workspace_id, 'owner'));

-- Generic policy for all workspace-scoped tables
-- (Applied to: sites, integrations, crawls, pages, issues, recommendations, etc.)

-- SITES
CREATE POLICY "Workspace access for sites"
ON public.sites FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- INTEGRATIONS
CREATE POLICY "Workspace access for integrations"
ON public.integrations FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CRAWLS
CREATE POLICY "Workspace access for crawls"
ON public.crawls FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- PAGES
CREATE POLICY "Workspace access for pages"
ON public.pages FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ISSUES
CREATE POLICY "Workspace access for issues"
ON public.issues FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- RECOMMENDATIONS
CREATE POLICY "Workspace access for recommendations"
ON public.recommendations FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- KEYWORDS
CREATE POLICY "Workspace access for keywords"
ON public.keywords FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- KEYWORD CLUSTERS
CREATE POLICY "Workspace access for keyword_clusters"
ON public.keyword_clusters FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- PAGE MAP
CREATE POLICY "Workspace access for page_map"
ON public.page_map FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CONTENT BRIEFS
CREATE POLICY "Workspace access for content_briefs"
ON public.content_briefs FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CONTENT DRAFTS
CREATE POLICY "Workspace access for content_drafts"
ON public.content_drafts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- PUBLICATIONS
CREATE POLICY "Workspace access for publications"
ON public.publications FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- GBP PROFILES
CREATE POLICY "Workspace access for gbp_profiles"
ON public.gbp_profiles FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- GBP POSTS
CREATE POLICY "Workspace access for gbp_posts"
ON public.gbp_posts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- REVIEWS
CREATE POLICY "Workspace access for reviews"
ON public.reviews FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- REVIEW REQUESTS
CREATE POLICY "Workspace access for review_requests"
ON public.review_requests FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ADS ACCOUNTS
CREATE POLICY "Workspace access for ads_accounts"
ON public.ads_accounts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CAMPAIGNS
CREATE POLICY "Workspace access for campaigns"
ON public.campaigns FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ADGROUPS
CREATE POLICY "Workspace access for adgroups"
ON public.adgroups FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ADS
CREATE POLICY "Workspace access for ads"
ON public.ads FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ADS KEYWORDS
CREATE POLICY "Workspace access for ads_keywords"
ON public.ads_keywords FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ADS NEGATIVES
CREATE POLICY "Workspace access for ads_negatives"
ON public.ads_negatives FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- SOCIAL ACCOUNTS
CREATE POLICY "Workspace access for social_accounts"
ON public.social_accounts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- SOCIAL CALENDAR
CREATE POLICY "Workspace access for social_calendar"
ON public.social_calendar FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- SOCIAL POSTS
CREATE POLICY "Workspace access for social_posts"
ON public.social_posts FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CRO AUDITS
CREATE POLICY "Workspace access for cro_audits"
ON public.cro_audits FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CRO EXPERIMENTS
CREATE POLICY "Workspace access for cro_experiments"
ON public.cro_experiments FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- CRO VARIANTS
CREATE POLICY "Workspace access for cro_variants"
ON public.cro_variants FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- OFFERS
CREATE POLICY "Workspace access for offers"
ON public.offers FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- PRICING VERSIONS
CREATE POLICY "Workspace access for pricing_versions"
ON public.pricing_versions FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- LEADS
CREATE POLICY "Workspace access for leads"
ON public.leads FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- PIPELINE STAGES
CREATE POLICY "Workspace access for pipeline_stages"
ON public.pipeline_stages FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- DEALS
CREATE POLICY "Workspace access for deals"
ON public.deals FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ACTIVITIES
CREATE POLICY "Workspace access for activities"
ON public.activities FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- ACTION LOG (append-only: insert only, no update/delete for users)
CREATE POLICY "Workspace access for viewing action_log"
ON public.action_log FOR SELECT
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for inserting action_log"
ON public.action_log FOR INSERT
TO authenticated
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- KPIs DAILY
CREATE POLICY "Workspace access for kpis_daily"
ON public.kpis_daily FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- MONTHLY REPORTS
CREATE POLICY "Workspace access for monthly_reports"
ON public.monthly_reports FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- AGENT RUNS
CREATE POLICY "Workspace access for agent_runs"
ON public.agent_runs FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- BRAND KIT
CREATE POLICY "Workspace access for brand_kit"
ON public.brand_kit FOR ALL
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())))
WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid())));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON public.keywords FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_briefs_updated_at BEFORE UPDATE ON public.content_briefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_drafts_updated_at BEFORE UPDATE ON public.content_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gbp_profiles_updated_at BEFORE UPDATE ON public.gbp_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ads_accounts_updated_at BEFORE UPDATE ON public.ads_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_kit_updated_at BEFORE UPDATE ON public.brand_kit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create user role when workspace is created
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, workspace_id, role)
    VALUES (NEW.owner_id, NEW.id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
AFTER INSERT ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();