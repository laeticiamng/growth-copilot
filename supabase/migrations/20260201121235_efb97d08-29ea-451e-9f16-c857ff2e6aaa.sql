-- =====================================================
-- CMS SYSTEM: Tables for Pages, Media, and Workflows
-- =====================================================

-- 1. CMS Pages table
CREATE TABLE public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    
    -- Page content
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB DEFAULT '[]'::jsonb, -- Block-based content (Notion-like)
    excerpt TEXT,
    featured_image_url TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    
    -- Status & workflow
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES auth.users(id),
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_version_id UUID REFERENCES public.cms_pages(id),
    
    -- Metadata
    page_type TEXT DEFAULT 'page' CHECK (page_type IN ('page', 'landing', 'article', 'template')),
    template_id UUID REFERENCES public.cms_pages(id),
    settings JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(workspace_id, slug, version)
);

-- 2. Media library table
CREATE TABLE public.cms_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- File info
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- Image specific
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    
    -- Organization
    folder TEXT DEFAULT '/',
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- 3. Publication workflow/reviews
CREATE TABLE public.cms_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    
    -- Review info
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    reviewer_id UUID REFERENCES auth.users(id),
    
    -- Comments
    comment TEXT,
    changes_requested JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Page revisions (history)
CREATE TABLE public.cms_page_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- Snapshot
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    
    -- Revision info
    revision_number INTEGER NOT NULL,
    change_summary TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "cms_pages workspace access" ON public.cms_pages
    FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "cms_media workspace access" ON public.cms_media
    FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "cms_reviews workspace access" ON public.cms_reviews
    FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

CREATE POLICY "cms_page_revisions workspace access" ON public.cms_page_revisions
    FOR ALL USING (public.has_workspace_access(auth.uid(), workspace_id));

-- Indexes
CREATE INDEX idx_cms_pages_workspace ON public.cms_pages(workspace_id);
CREATE INDEX idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(workspace_id, slug);
CREATE INDEX idx_cms_media_workspace ON public.cms_media(workspace_id);
CREATE INDEX idx_cms_media_folder ON public.cms_media(workspace_id, folder);
CREATE INDEX idx_cms_media_tags ON public.cms_media USING GIN(tags);
CREATE INDEX idx_cms_reviews_page ON public.cms_reviews(page_id);

-- Triggers for updated_at
CREATE TRIGGER update_cms_pages_updated_at
    BEFORE UPDATE ON public.cms_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at
    BEFORE UPDATE ON public.cms_media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CMS media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cms-media', 
    'cms-media', 
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for cms-media bucket
CREATE POLICY "CMS media public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'cms-media');

CREATE POLICY "CMS media workspace upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cms-media' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "CMS media workspace delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cms-media' 
        AND auth.uid() IS NOT NULL
    );