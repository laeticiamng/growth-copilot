-- =============================================
-- LIVRAISON 1: Tables manquantes + RLS renforcé
-- =============================================

-- 1) Table feature_flags (contrôle modules par workspace)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    flags jsonb NOT NULL DEFAULT '{
        "seo_tech": true,
        "content": true,
        "local_seo": true,
        "ads": false,
        "social": false,
        "cro": false,
        "offers": false,
        "lifecycle": false,
        "reputation": false,
        "reports": true,
        "autopilot": false
    }'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(workspace_id)
);

-- 2) Table system_logs (logs système globaux)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
    level text NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    message text NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies pour feature_flags
CREATE POLICY "Workspace members can view feature flags"
ON public.feature_flags
FOR SELECT
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "Workspace owners can update feature flags"
ON public.feature_flags
FOR UPDATE
USING (is_workspace_owner(auth.uid(), workspace_id));

CREATE POLICY "System can insert feature flags"
ON public.feature_flags
FOR INSERT
WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- 5) RLS Policies pour system_logs (lecture seule pour membres)
CREATE POLICY "Workspace members can view their logs"
ON public.system_logs
FOR SELECT
USING (
    workspace_id IS NULL 
    OR workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
);

CREATE POLICY "System can insert logs"
ON public.system_logs
FOR INSERT
WITH CHECK (true);

-- 6) Renforcer action_log: APPEND-ONLY strict
-- Supprimer toute policy UPDATE/DELETE existante et garantir INSERT only
DROP POLICY IF EXISTS "Workspace access for inserting action_log" ON public.action_log;
DROP POLICY IF EXISTS "Workspace access for viewing action_log" ON public.action_log;

CREATE POLICY "action_log_select"
ON public.action_log
FOR SELECT
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

CREATE POLICY "action_log_insert"
ON public.action_log
FOR INSERT
WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));

-- NO UPDATE/DELETE policies = truly append-only

-- 7) Trigger pour créer feature_flags automatiquement à la création d'un workspace
CREATE OR REPLACE FUNCTION public.handle_new_workspace_feature_flags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.feature_flags (workspace_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created_feature_flags ON public.workspaces;
CREATE TRIGGER on_workspace_created_feature_flags
    AFTER INSERT ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_workspace_feature_flags();

-- 8) Trigger updated_at pour feature_flags
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Index pour performance
CREATE INDEX IF NOT EXISTS idx_system_logs_workspace_id ON public.system_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_workspace_id ON public.feature_flags(workspace_id);