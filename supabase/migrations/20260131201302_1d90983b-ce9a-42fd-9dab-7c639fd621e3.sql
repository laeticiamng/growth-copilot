-- =====================================================
-- META SUPER-CONNECTOR: 5 MODULES TABLES
-- =====================================================

-- 1. META AD ACCOUNTS (Marketing API)
CREATE TABLE public.meta_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  business_id TEXT,
  currency TEXT DEFAULT 'EUR',
  timezone TEXT,
  account_status INTEGER, -- 1=active, 2=disabled, 3=unsettled, etc.
  spend_cap NUMERIC,
  amount_spent NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, account_id)
);

-- 2. META CAMPAIGNS (Marketing API)
CREATE TABLE public.meta_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ad_account_id UUID NOT NULL REFERENCES public.meta_ad_accounts(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  objective TEXT, -- OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, etc.
  status TEXT DEFAULT 'PAUSED', -- ACTIVE, PAUSED, DELETED, ARCHIVED
  effective_status TEXT,
  daily_budget NUMERIC,
  lifetime_budget NUMERIC,
  bid_strategy TEXT,
  start_time TIMESTAMPTZ,
  stop_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, campaign_id)
);

-- 3. META ADSETS
CREATE TABLE public.meta_adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.meta_campaigns(id) ON DELETE CASCADE,
  adset_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PAUSED',
  effective_status TEXT,
  daily_budget NUMERIC,
  lifetime_budget NUMERIC,
  targeting JSONB DEFAULT '{}'::jsonb,
  optimization_goal TEXT,
  billing_event TEXT,
  bid_amount NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, adset_id)
);

-- 4. META ADS
CREATE TABLE public.meta_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  adset_id UUID NOT NULL REFERENCES public.meta_adsets(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PAUSED',
  effective_status TEXT,
  creative_id TEXT,
  creative JSONB DEFAULT '{}'::jsonb, -- image_url, video_url, headline, body, link, etc.
  preview_url TEXT,
  tracking_specs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, ad_id)
);

-- 5. META INSIGHTS (Aggregated daily metrics)
CREATE TABLE public.meta_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ad_account_id UUID REFERENCES public.meta_ad_accounts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.meta_campaigns(id) ON DELETE SET NULL,
  adset_id UUID REFERENCES public.meta_adsets(id) ON DELETE SET NULL,
  ad_id UUID REFERENCES public.meta_ads(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  level TEXT NOT NULL, -- 'account', 'campaign', 'adset', 'ad'
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  frequency NUMERIC,
  cpm NUMERIC,
  cpc NUMERIC,
  ctr NUMERIC,
  conversions INTEGER DEFAULT 0,
  conversion_value NUMERIC DEFAULT 0,
  cost_per_conversion NUMERIC,
  roas NUMERIC,
  actions JSONB DEFAULT '[]'::jsonb, -- detailed action breakdown
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, ad_account_id, campaign_id, adset_id, ad_id, date, level)
);

-- 6. META CAPI EVENTS (Conversions API)
CREATE TABLE public.meta_capi_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  pixel_id TEXT NOT NULL,
  event_name TEXT NOT NULL, -- Purchase, Lead, AddToCart, etc.
  event_time TIMESTAMPTZ NOT NULL,
  event_id TEXT, -- deduplication key
  action_source TEXT DEFAULT 'website', -- website, app, email, phone_call, etc.
  user_data JSONB DEFAULT '{}'::jsonb, -- hashed em, ph, fn, ln, ct, st, zp, country, etc.
  custom_data JSONB DEFAULT '{}'::jsonb, -- value, currency, content_ids, etc.
  event_source_url TEXT,
  opt_out BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  fb_response JSONB, -- Meta API response
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. META IG ACCOUNTS (Instagram Platform)
CREATE TABLE public.meta_ig_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  ig_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  biography TEXT,
  website TEXT,
  followers_count INTEGER DEFAULT 0,
  follows_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  is_business_account BOOLEAN DEFAULT true,
  connected_fb_page_id TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, ig_user_id)
);

-- 8. META IG MEDIA (Published posts)
CREATE TABLE public.meta_ig_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES public.meta_ig_accounts(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  media_type TEXT, -- IMAGE, VIDEO, CAROUSEL_ALBUM, REELS
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  caption TEXT,
  timestamp TIMESTAMPTZ,
  like_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reach INTEGER,
  impressions INTEGER,
  engagement INTEGER,
  saved INTEGER,
  shares INTEGER,
  plays INTEGER, -- for video/reels
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, media_id)
);

-- 9. META IG SCHEDULED POSTS (Content Publishing)
CREATE TABLE public.meta_ig_scheduled (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ig_account_id UUID NOT NULL REFERENCES public.meta_ig_accounts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- IMAGE, VIDEO, CAROUSEL, REELS, STORIES
  media_urls JSONB DEFAULT '[]'::jsonb, -- array of image/video URLs
  caption TEXT,
  location_id TEXT,
  user_tags JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  container_id TEXT, -- Meta container ID for publishing flow
  media_id TEXT, -- resulting media ID after publish
  status TEXT DEFAULT 'draft', -- draft, scheduled, pending_approval, publishing, published, failed
  approval_id UUID REFERENCES public.approval_queue(id),
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. META CONVERSATIONS (Business Messaging - Messenger + WhatsApp)
CREATE TABLE public.meta_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'messenger' or 'whatsapp'
  page_id TEXT, -- for Messenger
  phone_number_id TEXT, -- for WhatsApp
  conversation_id TEXT NOT NULL,
  participant_id TEXT NOT NULL, -- PSID for Messenger, phone for WhatsApp
  participant_name TEXT,
  participant_profile_pic TEXT,
  status TEXT DEFAULT 'open', -- open, closed, spam
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, platform, conversation_id)
);

-- 11. META MESSAGES
CREATE TABLE public.meta_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.meta_conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  direction TEXT NOT NULL, -- 'inbound' or 'outbound'
  message_type TEXT DEFAULT 'text', -- text, image, video, audio, template, interactive
  content TEXT,
  media_url TEXT,
  template_name TEXT,
  template_params JSONB,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, message_id)
);

-- 12. META WEBHOOKS CONFIG
CREATE TABLE public.meta_webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  object_type TEXT NOT NULL, -- 'page', 'instagram', 'whatsapp_business_account'
  object_id TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  subscribed_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, object_type, object_id)
);

-- 13. META WEBHOOK EVENTS LOG
CREATE TABLE public.meta_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  webhook_config_id UUID REFERENCES public.meta_webhook_configs(id) ON DELETE SET NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  field TEXT NOT NULL, -- messages, feed, mentions, etc.
  event_type TEXT, -- message, reaction, read, etc.
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_meta_insights_date ON public.meta_insights(date DESC);
CREATE INDEX idx_meta_insights_level ON public.meta_insights(level);
CREATE INDEX idx_meta_capi_events_status ON public.meta_capi_events(status);
CREATE INDEX idx_meta_capi_events_event_name ON public.meta_capi_events(event_name);
CREATE INDEX idx_meta_ig_scheduled_status ON public.meta_ig_scheduled(status);
CREATE INDEX idx_meta_ig_scheduled_scheduled_at ON public.meta_ig_scheduled(scheduled_at);
CREATE INDEX idx_meta_conversations_last_message ON public.meta_conversations(last_message_at DESC);
CREATE INDEX idx_meta_messages_conversation ON public.meta_messages(conversation_id, created_at DESC);
CREATE INDEX idx_meta_webhook_events_processed ON public.meta_webhook_events(processed, received_at DESC);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_capi_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ig_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ig_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ig_scheduled ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_webhook_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (workspace isolation)
-- =====================================================
CREATE POLICY "Workspace access for meta_ad_accounts" ON public.meta_ad_accounts
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_campaigns" ON public.meta_campaigns
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_adsets" ON public.meta_adsets
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_ads" ON public.meta_ads
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_insights" ON public.meta_insights
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_capi_events" ON public.meta_capi_events
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_ig_accounts" ON public.meta_ig_accounts
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_ig_media" ON public.meta_ig_media
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_ig_scheduled" ON public.meta_ig_scheduled
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_conversations" ON public.meta_conversations
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_messages" ON public.meta_messages
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_webhook_configs" ON public.meta_webhook_configs
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace access for meta_webhook_events" ON public.meta_webhook_events
  FOR ALL USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================
CREATE TRIGGER update_meta_ad_accounts_updated_at BEFORE UPDATE ON public.meta_ad_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_campaigns_updated_at BEFORE UPDATE ON public.meta_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_adsets_updated_at BEFORE UPDATE ON public.meta_adsets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_ads_updated_at BEFORE UPDATE ON public.meta_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_ig_accounts_updated_at BEFORE UPDATE ON public.meta_ig_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_ig_media_updated_at BEFORE UPDATE ON public.meta_ig_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_ig_scheduled_updated_at BEFORE UPDATE ON public.meta_ig_scheduled
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_conversations_updated_at BEFORE UPDATE ON public.meta_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_webhook_configs_updated_at BEFORE UPDATE ON public.meta_webhook_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();