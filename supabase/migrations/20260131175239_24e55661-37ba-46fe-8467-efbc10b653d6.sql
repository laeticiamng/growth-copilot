-- Update oauth_tokens to have separate IV for each token
ALTER TABLE public.oauth_tokens 
  RENAME COLUMN access_token_encrypted TO access_ct;

ALTER TABLE public.oauth_tokens 
  RENAME COLUMN iv TO access_iv;

ALTER TABLE public.oauth_tokens 
  ADD COLUMN refresh_iv TEXT,
  ADD COLUMN refresh_ct TEXT;

-- Drop the old refresh_token_encrypted column
ALTER TABLE public.oauth_tokens 
  DROP COLUMN IF EXISTS refresh_token_encrypted;