-- Table de logs des emails transactionnels
CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  template_name text NOT NULL,
  subject text,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_email_log_workspace_id ON public.email_log(workspace_id);
CREATE INDEX idx_email_log_sent_at ON public.email_log(sent_at DESC);
CREATE INDEX idx_email_log_template ON public.email_log(template_name);

-- Enable RLS
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Seuls les admins/owners du workspace peuvent voir les logs email
CREATE POLICY "Workspace admins can view email logs"
ON public.email_log
FOR SELECT
USING (
  public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR
  public.has_workspace_role(auth.uid(), workspace_id, 'admin')
);

-- Les edge functions peuvent insérer des logs (via service role)
CREATE POLICY "Service role can insert email logs"
ON public.email_log
FOR INSERT
WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE public.email_log IS 'Historique des emails transactionnels envoyés';
COMMENT ON COLUMN public.email_log.template_name IS 'Nom du template: welcome, password_reset, payment_confirmation, agent_run_completed';
COMMENT ON COLUMN public.email_log.status IS 'Status de l''envoi: sent, failed, pending';