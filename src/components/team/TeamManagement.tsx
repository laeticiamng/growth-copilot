import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  Mail, 
  MoreVertical, 
  Loader2,
  Clock,
  Check,
  X,
  RefreshCw,
  Shield,
  Crown,
  Eye,
  UserCog,
} from 'lucide-react';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { usePermissions, AppRole } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { LoadingState } from '@/components/ui/loading-state';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '@/lib/date-locale';

const roleLabels: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-500' },
  admin: { label: 'Admin', icon: Shield, color: 'text-primary' },
  manager: { label: 'Manager', icon: UserCog, color: 'text-blue-500' },
  analyst: { label: 'Analyste', icon: Eye, color: 'text-green-500' },
  viewer: { label: 'Lecteur', icon: Eye, color: 'text-muted-foreground' },
};

export function TeamManagement() {
  const { i18n } = useTranslation();
  const { 
    invitations, 
    members, 
    loading, 
    fetchInvitations, 
    sendInvitation, 
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
  } = useTeamInvitations();
  const { effectiveRole } = usePermissions();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('viewer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email requis');
      return;
    }

    setSubmitting(true);
    const { error } = await sendInvitation(inviteEmail.trim(), inviteRole);
    setSubmitting(false);

    if (error) {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } else {
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('viewer');
    }
  };

  const handleCancelInvitation = async (id: string) => {
    const { error } = await cancelInvitation(id);
    if (error) {
      toast.error('Erreur lors de l\'annulation');
    } else {
      toast.success('Invitation annulée');
    }
  };

  const handleResendInvitation = async (id: string, email: string) => {
    const { error } = await resendInvitation(id);
    if (error) {
      toast.error('Erreur lors du renvoi');
    } else {
      toast.success(`Invitation renvoyée à ${email}`);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await updateMemberRole(userId, newRole);
    if (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } else {
      toast.success('Rôle mis à jour');
    }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!confirm(`Retirer ${email} de l'équipe ?`)) return;
    
    const { error } = await removeMember(userId);
    if (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } else {
      toast.success('Membre retiré');
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  return (
    <PermissionGuard permission="manage_team">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Gestion d'équipe</h2>
            <p className="text-sm text-muted-foreground">
              Invitez des membres et gérez leurs permissions
            </p>
          </div>
          <Button variant="hero" onClick={() => setShowInviteDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
        </div>

        {loading ? (
          <LoadingState message="Chargement de l'équipe..." />
        ) : (
          <>
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    Invitations en attente ({pendingInvitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingInvitations.map((inv) => (
                    <div 
                      key={inv.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{inv.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Expire le {new Date(inv.expires_at).toLocaleDateString(getIntlLocale(i18n.language))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{roleLabels[inv.role].label}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleResendInvitation(inv.id, inv.email)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Renvoyer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCancelInvitation(inv.id)}
                              className="text-destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Membres ({members.length})
                </CardTitle>
                <CardDescription>
                  Tous les membres ayant accès à ce workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun membre pour l'instant</p>
                  </div>
                ) : (
                  members.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    const RoleIcon = roleInfo.icon;
                    
                    return (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium">
                            {member.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{member.email || 'Utilisateur'}</p>
                            <p className="text-xs text-muted-foreground">
                              Membre depuis {new Date(member.joined_at).toLocaleDateString(getIntlLocale(i18n.language))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                            {roleInfo.label}
                          </Badge>
                          {member.role !== 'owner' && effectiveRole === 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'admin')}>
                                  Promouvoir Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'manager')}>
                                  Promouvoir Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'viewer')}>
                                  Rétrograder Lecteur
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveMember(member.user_id, member.email)}
                                  className="text-destructive"
                                >
                                  Retirer de l'équipe
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un membre</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email pour rejoindre votre workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="membre@entreprise.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle</label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Lecteur - Consultation uniquement</SelectItem>
                    <SelectItem value="analyst">Analyste - Consultation + rapports</SelectItem>
                    <SelectItem value="manager">Manager - Gestion du contenu</SelectItem>
                    <SelectItem value="admin">Admin - Accès complet (sauf facturation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSendInvitation} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Envoyer l'invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
