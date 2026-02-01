import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { useAuth } from './useAuth';
import { AppRole } from './usePermissions';

export interface TeamInvitation {
  id: string;
  email: string;
  role: AppRole;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  role: AppRole;
  joined_at: string;
  last_active: string | null;
}

export function useTeamInvitations() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const fetchInvitations = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    setLoading(true);
    try {
      // Fetch pending invitations
      const { data: invites, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (inviteError) {
        console.error('[TeamInvitations] Fetch error:', inviteError);
      } else {
        setInvitations((invites || []).map(inv => ({
          ...inv,
          role: inv.role as AppRole,
          status: inv.status as TeamInvitation['status'],
        })));
      }

      // Fetch current team members
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (rolesError) {
        console.error('[TeamInvitations] Roles fetch error:', rolesError);
      } else {
        setMembers((roles || []).map(r => ({
          id: r.id,
          user_id: r.user_id,
          email: '', // Would need to join with profiles
          role: r.role as AppRole,
          joined_at: r.created_at || '',
          last_active: null,
        })));
      }
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  const sendInvitation = useCallback(async (email: string, role: AppRole) => {
    if (!currentWorkspace?.id || !user?.id) {
      return { error: new Error('No workspace or user') };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: new Error('Email invalide') };
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('workspace_id', currentWorkspace.id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existing) {
      return { error: new Error('Une invitation est déjà en attente pour cet email') };
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('user_roles')
      .select('id')
      .eq('workspace_id', currentWorkspace.id)
      .single();

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        workspace_id: currentWorkspace.id,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[TeamInvitations] Send error:', error);
      return { error: error as Error };
    }

    // Log the invitation
    await supabase.from('action_log').insert({
      workspace_id: currentWorkspace.id,
      action_type: 'team_invite_sent',
      actor_type: 'user',
      actor_id: user.id,
      description: `Invitation sent to ${email} with role ${role}`,
      is_automated: false,
    });

    await fetchInvitations();
    return { data, error: null };
  }, [currentWorkspace?.id, user?.id, fetchInvitations]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    const { error } = await supabase
      .from('team_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (!error) {
      await fetchInvitations();
    }
    return { error: error as Error | null };
  }, [fetchInvitations]);

  const resendInvitation = useCallback(async (invitationId: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from('team_invitations')
      .update({ 
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .eq('id', invitationId);

    if (!error) {
      await fetchInvitations();
    }
    return { error: error as Error | null };
  }, [fetchInvitations]);

  const updateMemberRole = useCallback(async (userId: string, newRole: AppRole) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace selected') };
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('workspace_id', currentWorkspace.id)
      .eq('user_id', userId);

    if (!error) {
      await fetchInvitations();
    }
    return { error: error as Error | null };
  }, [currentWorkspace?.id, fetchInvitations]);

  const removeMember = useCallback(async (userId: string) => {
    if (!currentWorkspace?.id) {
      return { error: new Error('No workspace selected') };
    }

    // Prevent removing workspace owner
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', currentWorkspace.id)
      .single();

    if (workspace?.owner_id === userId) {
      return { error: new Error('Impossible de supprimer le propriétaire du workspace') };
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('workspace_id', currentWorkspace.id)
      .eq('user_id', userId);

    if (!error) {
      await fetchInvitations();
    }
    return { error: error as Error | null };
  }, [currentWorkspace?.id, fetchInvitations]);

  return {
    invitations,
    members,
    loading,
    fetchInvitations,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
  };
}
