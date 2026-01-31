-- Corriger la policy trop permissive pour system_logs
-- Les logs système doivent être insérés uniquement par le système (service role) 
-- ou par des utilisateurs authentifiés pour leur workspace

DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;

CREATE POLICY "Authenticated users can insert logs for their workspace"
ON public.system_logs
FOR INSERT
WITH CHECK (
    -- Soit workspace_id est null (log système global - réservé au service role)
    -- Soit l'utilisateur a accès au workspace
    (workspace_id IS NULL AND auth.uid() IS NULL)
    OR (workspace_id IS NOT NULL AND workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
);