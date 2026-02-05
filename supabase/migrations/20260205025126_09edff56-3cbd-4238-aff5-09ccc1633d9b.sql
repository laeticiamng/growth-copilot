-- Clean up redundant and overly permissive INSERT policies on smart_link_emails
-- Keep only ONE properly secured INSERT policy that requires consent + valid email

-- Drop all existing INSERT policies (they are redundant/conflicting)
DROP POLICY IF EXISTS "sle_ins_public" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Anyone can insert smart link emails" ON public.smart_link_emails;
DROP POLICY IF EXISTS "Public can insert smart link emails with rate limit" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_consent_insert_v7" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_consent_required_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_rate_limited_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_validated_v8" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_workspace_insert" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_public_insert_consent" ON public.smart_link_emails;

-- Also clean up redundant SELECT policies
DROP POLICY IF EXISTS "Marketing managers can view email list" ON public.smart_link_emails;
DROP POLICY IF EXISTS "sle_sel_admin" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_final_v9" ON public.smart_link_emails;
DROP POLICY IF EXISTS "smart_link_emails_owner_mgr" ON public.smart_link_emails;

-- Create ONE clean INSERT policy with proper validation
-- Public lead capture requires: consent + valid email + valid media_asset_id (via FK)
CREATE POLICY "sle_public_insert_validated_v10"
  ON public.smart_link_emails
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent_given = true
    AND email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND media_asset_id IS NOT NULL
    AND workspace_id IS NOT NULL
    -- Verify workspace_id matches the media asset (join validation)
    AND EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_asset_id
        AND ma.workspace_id = smart_link_emails.workspace_id
    )
  );

-- Create ONE clean SELECT policy for workspace admins/owners
CREATE POLICY "sle_select_workspace_admin_v10"
  ON public.smart_link_emails
  FOR SELECT
  TO authenticated
  USING (
    has_workspace_access(auth.uid(), workspace_id)
    AND (
      has_role(auth.uid(), workspace_id, 'owner'::app_role)
      OR has_role(auth.uid(), workspace_id, 'admin'::app_role)
      OR has_role(auth.uid(), workspace_id, 'manager'::app_role)
    )
  );