
CREATE TABLE public.notification_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('slack', 'teams')),
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_briefings BOOLEAN NOT NULL DEFAULT true,
  notify_approvals BOOLEAN NOT NULL DEFAULT true,
  notify_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, channel)
);

ALTER TABLE public.notification_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspace webhooks"
  ON public.notification_webhooks
  FOR ALL
  TO authenticated
  USING (public.has_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.has_workspace_access(auth.uid(), workspace_id));

CREATE TRIGGER update_notification_webhooks_updated_at
  BEFORE UPDATE ON public.notification_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
