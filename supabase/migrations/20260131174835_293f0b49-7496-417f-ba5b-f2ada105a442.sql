-- Create secure token storage table (tokens encrypted at rest, no direct RLS access)
CREATE TABLE public.oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  iv TEXT NOT NULL, -- Initialization vector for AES-GCM
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but deny all direct access (only edge functions with service role can access)
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

-- No RLS policies = no access from client side
-- Edge functions use service role key which bypasses RLS

-- Create OAuth state nonces table for replay protection
CREATE TABLE public.oauth_state_nonces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nonce TEXT NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  user_id UUID NOT NULL,
  hmac_signature TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - no policies means only service role can access
ALTER TABLE public.oauth_state_nonces ENABLE ROW LEVEL SECURITY;

-- Index for fast nonce lookup
CREATE INDEX idx_oauth_state_nonces_nonce ON public.oauth_state_nonces(nonce);

-- Index for cleanup of expired nonces
CREATE INDEX idx_oauth_state_nonces_expires ON public.oauth_state_nonces(expires_at);

-- Clean up old nonces automatically (function to be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_nonces()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.oauth_state_nonces 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
$$;

-- Remove sensitive token columns from integrations table
-- (keeping access_token_ref and refresh_token_ref as they may contain other data)
-- We'll use oauth_tokens table for actual encrypted tokens

-- Add trigger for updated_at on oauth_tokens
CREATE TRIGGER update_oauth_tokens_updated_at
BEFORE UPDATE ON public.oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();