import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Trash2, Clock, CheckCircle, XCircle, ExternalLink, Timer,
} from "lucide-react";
import { useCronJobs, useRequestMethodLabel, type CronJob, type CreateCronJobInput } from "@/hooks/useCronJobs";

const EDGE_FUNCTIONS = [
  { label: "Run Executor (Daily Brief)", value: "run-executor" },
  { label: "KPI Sync", value: "kpi-sync" },
  { label: "SEO Crawler", value: "seo-crawler" },
  { label: "Sync GA4", value: "sync-ga4" },
  { label: "Sync GSC", value: "sync-gsc" },
  { label: "Analytics Guardian", value: "analytics-guardian" },
  { label: "Generate Report", value: "generate-report" },
  { label: "Monitoring Metrics", value: "monitoring-metrics" },
  { label: "Sync Meta Ads", value: "sync-meta-ads" },
  { label: "Sync GBP", value: "sync-gbp" },
  { label: "YouTube Sync", value: "youtube-sync" },
  { label: "Custom URL", value: "__custom__" },
];

const SCHEDULE_PRESETS = [
  { label: "Toutes les minutes", value: "every_minute", hours: [-1], minutes: [-1], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Toutes les 5 minutes", value: "every_5min", hours: [-1], minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Toutes les 15 minutes", value: "every_15min", hours: [-1], minutes: [0, 15, 30, 45], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Toutes les heures", value: "hourly", hours: [-1], minutes: [0], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Tous les jours à 5h", value: "daily_5am", hours: [5], minutes: [0], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Tous les jours à 8h", value: "daily_8am", hours: [8], minutes: [0], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Tous les jours à 9h", value: "daily_9am", hours: [9], minutes: [0], mdays: [-1], months: [-1], wdays: [-1] },
  { label: "Lundi à 9h", value: "weekly_monday", hours: [9], minutes: [0], mdays: [-1], months: [-1], wdays: [1] },
  { label: "1er du mois à 8h", value: "monthly", hours: [8], minutes: [0], mdays: [1], months: [-1], wdays: [-1] },
];

export function CronJobsTab() {
  const { t } = useTranslation();
  const { jobs, loading, fetchJobs, createJob, toggleJob, deleteJob } = useCronJobs();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cron Jobs Externes</h2>
          <p className="text-sm text-muted-foreground">
            Planifiez des appels HTTP récurrents via cron-job.org pour déclencher vos fonctions backend.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nouveau cron job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateCronJobDialog
              onClose={() => setDialogOpen(false)}
              onCreate={async (job) => { await createJob(job); setDialogOpen(false); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Aucun cron job externe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez des cron jobs pour appeler automatiquement vos fonctions backend à intervalles réguliers.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Créer un cron job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <CronJobCard
              key={job.jobId}
              job={job}
              onToggle={(enabled) => toggleJob(job.jobId, enabled)}
              onDelete={() => deleteJob(job.jobId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CronJobCard({ job, onToggle, onDelete }: { job: CronJob; onToggle: (enabled: boolean) => void; onDelete: () => void }) {
  const methodLabel = useRequestMethodLabel(job.requestMethod);
  const lastExec = job.lastExecution > 0 ? new Date(job.lastExecution * 1000).toLocaleString() : "—";
  const nextExec = job.nextExecution > 0 ? new Date(job.nextExecution * 1000).toLocaleString() : "—";
  const statusOk = job.lastStatus >= 200 && job.lastStatus < 300;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{job.title}</h3>
                <Badge variant={job.enabled ? "default" : "secondary"}>
                  {job.enabled ? "Actif" : "Inactif"}
                </Badge>
                {job.lastStatus > 0 && (
                  <Badge variant={statusOk ? "outline" : "destructive"} className="gap-1">
                    {statusOk ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {job.lastStatus}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                <Badge variant="outline" className="mr-2 text-xs">{methodLabel}</Badge>
                {job.url}
              </p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>Dernier: {lastExec}</span>
                <span>Prochain: {nextExec}</span>
                {job.lastDuration > 0 && <span>{job.lastDuration}ms</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch checked={job.enabled} onCheckedChange={onToggle} />
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCronJobDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (job: CreateCronJobInput) => Promise<void> }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [schedulePreset, setSchedulePreset] = useState("daily_8am");
  const [requestMethod, setRequestMethod] = useState(1); // POST
  const [loading, setLoading] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const effectiveUrl = selectedFunction === "__custom__"
    ? customUrl
    : `${supabaseUrl}/functions/v1/${selectedFunction}`;

  const handleSubmit = async () => {
    if (!title.trim() || !effectiveUrl) return;
    const preset = SCHEDULE_PRESETS.find((p) => p.value === schedulePreset) || SCHEDULE_PRESETS[5];
    setLoading(true);
    await onCreate({
      title,
      url: effectiveUrl,
      enabled: true,
      requestMethod,
      schedule: {
        timezone: "Europe/Paris",
        hours: preset.hours,
        mdays: preset.mdays,
        minutes: preset.minutes,
        months: preset.months,
        wdays: preset.wdays,
      },
      extendedData: requestMethod === 1 ? {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      } : {
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      },
      notification: {
        onFailure: true,
        onSuccess: false,
        onDisable: true,
      },
    });
    setLoading(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nouveau cron job externe</DialogTitle>
        <DialogDescription>
          Planifiez un appel HTTP récurrent via cron-job.org pour déclencher vos fonctions backend automatiquement.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Nom du cron job</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Daily KPI Sync" />
        </div>

        <div className="space-y-2">
          <Label>Fonction cible</Label>
          <Select value={selectedFunction} onValueChange={setSelectedFunction}>
            <SelectTrigger><SelectValue placeholder="Sélectionner une fonction..." /></SelectTrigger>
            <SelectContent>
              {EDGE_FUNCTIONS.map((fn) => (
                <SelectItem key={fn.value} value={fn.value}>{fn.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFunction === "__custom__" && (
          <div className="space-y-2">
            <Label>URL personnalisée</Label>
            <Input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://..." type="url" />
          </div>
        )}

        {selectedFunction && selectedFunction !== "__custom__" && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {effectiveUrl}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fréquence</Label>
            <Select value={schedulePreset} onValueChange={setSchedulePreset}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCHEDULE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Méthode HTTP</Label>
            <Select value={String(requestMethod)} onValueChange={(v) => setRequestMethod(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">GET</SelectItem>
                <SelectItem value="1">POST</SelectItem>
                <SelectItem value="4">PUT</SelectItem>
                <SelectItem value="8">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={handleSubmit} disabled={!title.trim() || !selectedFunction || loading}>
          {loading ? "Création..." : "Créer le cron job"}
        </Button>
      </DialogFooter>
    </>
  );
}
