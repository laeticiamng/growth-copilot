-- Create contact_submissions table for tracking contact form messages
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'replied')),
  resend_id text,
  created_at timestamptz DEFAULT now(),
  replied_at timestamptz
);

-- Create indexes for rate limiting and queries
CREATE INDEX idx_contact_submissions_email_created ON public.contact_submissions(email, created_at DESC);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON public.contact_submissions(created_at DESC);

-- Enable RLS (only service role can access this table)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (which is what we want for contact form)
-- This protects user messages from being read by other users