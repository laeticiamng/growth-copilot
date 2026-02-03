-- Add Stripe columns to workspace_subscriptions
ALTER TABLE public.workspace_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_subscriptions_stripe_customer 
ON public.workspace_subscriptions(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_subscriptions_stripe_subscription 
ON public.workspace_subscriptions(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;