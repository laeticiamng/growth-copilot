import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Plus, Mail, MoreVertical, Loader2, Clock, Check, X, RefreshCw, Shield, Crown, Eye, UserCog } from 'lucide-react';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { usePermissions, AppRole } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { LoadingState } from '@/components/ui/loading-state';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getIntlLocale } from '@/lib/date-locale';

export function TeamManagement() {
  const { t, i18n } = useTranslation();

  const roleLabels: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
    owner: { label: t("components.team.roleOwner"), icon: Crown, color: 'text-yellow-500' },
    admin: { label: 'Admin', icon: Shield, color: 'text-primary' },
    manager: { label: 'Manager', icon: UserCog, color: 'text-blue-500' },
    analyst: { label: t("components.team.roleAnalyst"), icon: Eye, color: 'text-green-500' },
    viewer: { label: t("components.team.roleViewer"), icon: Eye, color: 'text-muted-foreground' },
  };

  const { invitations, members, loading, fetchInvitations, sendInvitation, cancelInvitation, resendInvitation, updateMemberRole, removeMember } = useTeamInvitations();
  const { effectiveRole } = usePermissions();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('viewer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) { toast.error(t("components.team.emailRequired")); return; }
    setSubmitting(true);
    const { error } = await sendInvitation(inviteEmail.trim(), inviteRole);
    setSubmitting(false);
    if (error) { toast.error(error.message || t("components.team.sendError")); }
    else { toast.success(t("components.team.invitationSent", { email: inviteEmail })); setShowInviteDialog(false); setInviteEmail(''); setInviteRole('viewer'); }
  };

  const handleCancelInvitation = async (id: string) => {
    const { error } = await cancelInvitation(id);
    if (error) { toast.error(t("components.team.cancelError")); } else { toast.success(t("components.team.invitationCancelled")); }
  };

  const handleResendInvitation = async (id: string, email: string) => {
    const { error } = await resendInvitation(id);
    if (error) { toast.error(t("components.team.resendError")); } else { toast.success(t("components.team.invitationResent", { email })); }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await updateMemberRole(userId, newRole);
    if (error) { toast.error(t("components.team.roleUpdateError")); } else { toast.success(t("components.team.roleUpdated")); }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!confirm(t("components.team.removeMemberConfirm", { email }))) return;
    const { error } = await removeMember(userId);
    if (error) { toast.error(error.message || t("components.team.removeError")); } else { toast.success(t("components.team.memberRemoved")); }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  return (
    <PermissionGuard permission="manage_team">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t("components.team.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("components.team.subtitle")}</p>
          </div>
          <Button variant="hero" onClick={() => setShowInviteDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />{t("components.team.invite")}
          </Button>
        </div>

        {loading ? (
          <LoadingState message={t("components.team.loading")} />
        ) : (
          <>
            {pendingInvitations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    {t("components.team.pendingInvitations")} ({pendingInvitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingInvitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Mail className="w-4 h-4 text-muted-foreground" /></div>
                        <div>
                          <p className="font-medium text-sm">{inv.email}</p>
                          <p className="text-xs text-muted-foreground">{t("components.team.expiresOn")} {new Date(inv.expires_at).toLocaleDateString(getIntlLocale(i18n.language))}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{roleLabels[inv.role].label}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleResendInvitation(inv.id, inv.email)}><RefreshCw className="w-4 h-4 mr-2" />{t("components.team.resend")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancelInvitation(inv.id)} className="text-destructive"><X className="w-4 h-4 mr-2" />{t("common.cancel")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{t("components.team.members")} ({members.length})</CardTitle>
                <CardDescription>{t("components.team.membersDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("components.team.noMembers")}</p>
                  </div>
                ) : (
                  members.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    const RoleIcon = roleInfo.icon;
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium">{member.email?.[0]?.toUpperCase() || 'U'}</div>
                          <div>
                            <p className="font-medium">{member.email || t("components.team.user")}</p>
                            <p className="text-xs text-muted-foreground">{t("components.team.memberSince")} {new Date(member.joined_at).toLocaleDateString(getIntlLocale(i18n.language))}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1"><RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />{roleInfo.label}</Badge>
                          {member.role !== 'owner' && effectiveRole === 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'admin')}>{t("components.team.promoteAdmin")}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'manager')}>{t("components.team.promoteManager")}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, 'viewer')}>{t("components.team.demoteViewer")}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRemoveMember(member.user_id, member.email)} className="text-destructive">{t("components.team.removeFromTeam")}</DropdownMenuItem>
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

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("components.team.inviteMember")}</DialogTitle>
              <DialogDescription>{t("components.team.inviteDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="membre@entreprise.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("components.team.role")}</label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">{t("components.team.roleViewerDesc")}</SelectItem>
                    <SelectItem value="analyst">{t("components.team.roleAnalystDesc")}</SelectItem>
                    <SelectItem value="manager">{t("components.team.roleManagerDesc")}</SelectItem>
                    <SelectItem value="admin">{t("components.team.roleAdminDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSendInvitation} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                {t("components.team.sendInvitation")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
