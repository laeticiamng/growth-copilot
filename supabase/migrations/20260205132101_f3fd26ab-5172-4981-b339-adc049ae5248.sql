-- Améliorer la table email_log avec les colonnes manquantes
ALTER TABLE IF EXISTS email_log ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE IF EXISTS email_log ADD COLUMN IF NOT EXISTS resend_id text;

-- Créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_email_log_workspace ON email_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_resend_id ON email_log(resend_id) WHERE resend_id IS NOT NULL;

-- Supprimer les anciennes policies si elles existent pour éviter les conflits
DROP POLICY IF EXISTS "workspace_admins_view_email_log" ON email_log;
DROP POLICY IF EXISTS "Users can view their workspace emails" ON email_log;

-- Créer la nouvelle policy RLS
CREATE POLICY "workspace_admins_view_email_log" ON email_log
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );