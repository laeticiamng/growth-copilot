import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  Plus, 
  Calendar, 
  Trash2, 
  Settings2,
  Loader2,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { useScheduledRuns, parseCronToHuman, generateCron, ScheduledRun } from "@/hooks/useScheduledRuns";
import { RUN_TYPE_LABELS, RunType } from "@/hooks/useExecutiveRuns";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

const SCHEDULABLE_RUNS: { value: RunType; label: string }[] = [
  { value: 'DAILY_EXECUTIVE_BRIEF', label: 'Brief quotidien' },
  { value: 'WEEKLY_EXECUTIVE_REVIEW', label: 'Revue hebdomadaire' },
  { value: 'MARKETING_WEEK_PLAN', label: 'Plan marketing' },
  { value: 'SEO_AUDIT_REPORT', label: 'Audit SEO' },
];

interface ScheduleFormState {
  runType: RunType;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: string;
  dayOfWeek: string;
  dayOfMonth: string;
  sendEmail: boolean;
}

export function ReportScheduler() {
  const { i18n } = useTranslation();
  const { scheduledRuns, loading, createSchedule, deleteSchedule, toggleEnabled, isCreating } = useScheduledRuns();
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<ScheduleFormState>({
    runType: 'WEEKLY_EXECUTIVE_REVIEW',
    frequency: 'weekly',
    hour: '9',
    dayOfWeek: '1',
    dayOfMonth: '1',
    sendEmail: true,
  });

  const handleCreate = async () => {
    const cron = generateCron(
      form.frequency,
      parseInt(form.hour),
      parseInt(form.dayOfWeek),
      parseInt(form.dayOfMonth)
    );

    await createSchedule({
      run_type: form.runType,
      schedule_cron: cron,
      enabled: true,
      config: { send_email: form.sendEmail },
    });

    setShowDialog(false);
    setForm({
      runType: 'WEEKLY_EXECUTIVE_REVIEW',
      frequency: 'weekly',
      hour: '9',
      dayOfWeek: '1',
      dayOfMonth: '1',
      sendEmail: true,
    });
  };

  const formatNextRun = (nextRunAt: string | null) => {
    if (!nextRunAt) return 'Non planifié';
    const date = new Date(nextRunAt);
    return date.toLocaleDateString(getIntlLocale(i18n.language), { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastRun = (lastRunAt: string | null) => {
    if (!lastRunAt) return 'Jamais';
    const date = new Date(lastRunAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'une heure';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  // Filter to only show report-related schedules
  const reportSchedules = scheduledRuns.filter(s => 
    ['DAILY_EXECUTIVE_BRIEF', 'WEEKLY_EXECUTIVE_REVIEW', 'SEO_AUDIT_REPORT', 'MARKETING_WEEK_PLAN'].includes(s.run_type)
  );

  return (
    <>
      <Card variant="feature">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Rapports planifiés
              </CardTitle>
              <CardDescription>
                Automatisez la génération de vos rapports
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle planification
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : reportSchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucune planification</p>
              <p className="text-sm mt-1">Créez votre première planification automatique</p>
            </div>
          ) : (
            reportSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {RUN_TYPE_LABELS[schedule.run_type as RunType] || schedule.run_type}
                    </p>
                    <Badge variant={schedule.enabled ? "success" : "secondary"}>
                      {schedule.enabled ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</>
                      ) : (
                        'Désactivé'
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {parseCronToHuman(schedule.schedule_cron)} ({schedule.timezone})
                  </p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Dernier : {formatLastRun(schedule.last_run_at)}</span>
                    <span>Prochain : {formatNextRun(schedule.next_run_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(checked) => toggleEnabled(schedule.id, checked)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Planifier un rapport
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de rapport</Label>
              <Select 
                value={form.runType} 
                onValueChange={(v) => setForm(f => ({ ...f, runType: v as RunType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULABLE_RUNS.map(run => (
                    <SelectItem key={run.value} value={run.value}>
                      {run.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fréquence</Label>
              <Select 
                value={form.frequency} 
                onValueChange={(v) => setForm(f => ({ ...f, frequency: v as 'daily' | 'weekly' | 'monthly' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Jour de la semaine</Label>
                <Select 
                  value={form.dayOfWeek} 
                  onValueChange={(v) => setForm(f => ({ ...f, dayOfWeek: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Lundi</SelectItem>
                    <SelectItem value="2">Mardi</SelectItem>
                    <SelectItem value="3">Mercredi</SelectItem>
                    <SelectItem value="4">Jeudi</SelectItem>
                    <SelectItem value="5">Vendredi</SelectItem>
                    <SelectItem value="6">Samedi</SelectItem>
                    <SelectItem value="0">Dimanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Jour du mois</Label>
                <Select 
                  value={form.dayOfMonth} 
                  onValueChange={(v) => setForm(f => ({ ...f, dayOfMonth: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 5, 10, 15, 20, 25].map(d => (
                      <SelectItem key={d} value={d.toString()}>Le {d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Heure d'exécution</Label>
              <Select 
                value={form.hour} 
                onValueChange={(v) => setForm(f => ({ ...f, hour: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12, 14, 16, 18].map(h => (
                    <SelectItem key={h} value={h.toString()}>{h}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="send-email">Envoyer par email</Label>
              <Switch 
                id="send-email"
                checked={form.sendEmail}
                onCheckedChange={(checked) => setForm(f => ({ ...f, sendEmail: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Créer la planification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
