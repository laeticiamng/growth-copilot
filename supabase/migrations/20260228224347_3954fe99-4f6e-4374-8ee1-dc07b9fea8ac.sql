
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "contact_submissions_public_insert" ON public.contact_submissions;

-- Create a tightened policy that restricts internal fields
CREATE POLICY "contact_submissions_public_insert"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND resend_id IS NULL
    AND replied_at IS NULL
  );
