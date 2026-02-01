-- Create team_invitations table for workspace member invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID REFERENCES auth.users(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (workspace_id, email, status)
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups
CREATE INDEX idx_team_invitations_workspace ON public.team_invitations(workspace_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);

-- Policy: Users with manage_team permission can view and manage invitations
CREATE POLICY "Team managers can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  public.has_permission(auth.uid(), workspace_id, 'manage_team')
);

CREATE POLICY "Team managers can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_permission(auth.uid(), workspace_id, 'manage_team')
);

CREATE POLICY "Team managers can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  public.has_permission(auth.uid(), workspace_id, 'manage_team')
);

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(_token UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation RECORD;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find and validate invitation
  SELECT * INTO _invitation
  FROM public.team_invitations
  WHERE token = _token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Add user to workspace
  INSERT INTO public.user_roles (user_id, workspace_id, role)
  VALUES (_user_id, _invitation.workspace_id, _invitation.role)
  ON CONFLICT (user_id, workspace_id) DO UPDATE SET role = EXCLUDED.role;
  
  -- Mark invitation as accepted
  UPDATE public.team_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = _invitation.id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'workspace_id', _invitation.workspace_id,
    'role', _invitation.role
  );
END;
$$;