import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  useAccessReview, 
  RISK_CONFIG, 
  AccessReview as AccessReviewType,
  AccessEntry,
  Finding 
} from "@/hooks/useAccessReview";
import { 
  Shield, Users, AlertTriangle, CheckCircle2, Play, RefreshCw,
  Eye, Calendar, Clock, UserX, Key, Lock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { getDateLocale } from "@/lib/date-locale";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FINDING_ICONS: Record<string, React.ElementType> = {
  inactive_user: UserX, excessive_permissions: Key, stale_token: Lock,
  orphan_access: Users, missing_2fa: Shield,
};

export default function AccessReview() {
  const { t, i18n } = useTranslation();
  const { reviews, latestReview, loading, stats, startReview, isStarting, fetchReviewEntries } = useAccessReview();
  const [selectedReview, setSelectedReview] = useState<AccessReviewType | null>(null);
  const [reviewEntries, setReviewEntries] = useState<AccessEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const handleViewReview = async (review: AccessReviewType) => {
    setSelectedReview(review);
    setLoadingEntries(true);
    try { const entries = await fetchReviewEntries(review.id); setReviewEntries(entries); }
    catch (error) { console.error('Error loading entries:', error); }
    finally { setLoadingEntries(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-32" />))}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" />{t("accessReviewPage.title")}</h1>
          <p className="text-muted-foreground">{t("accessReviewPage.subtitle")}</p>
        </div>
        <Button onClick={() => startReview()} disabled={isStarting}>
          {isStarting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {t("accessReviewPage.newReview")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("accessReviewPage.lastReview")}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastReviewDate ? format(new Date(stats.lastReviewDate), 'dd MMM', { locale: getDateLocale(i18n.language) }) : '-'}</div>
            <p className="text-xs text-muted-foreground">{stats.lastReviewDate ? formatDistanceToNow(new Date(stats.lastReviewDate), { addSuffix: true, locale: getDateLocale(i18n.language) }) : t("accessReviewPage.noReview")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("accessReviewPage.users")}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{latestReview?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">{t("accessReviewPage.withAccess")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("accessReviewPage.detectedIssues")}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className={stats.totalIssues > 0 ? "w-5 h-5 text-orange-500" : "w-5 h-5 text-green-500"} />{stats.totalIssues}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalIssues > 0 && `${stats.criticalIssues} ${t("accessReviewPage.criticalIssues")}, `}
              {stats.highIssues > 0 && `${stats.highIssues} ${t("accessReviewPage.highIssues")}`}
              {stats.criticalIssues === 0 && stats.highIssues === 0 && t("accessReviewPage.noMajorRisk")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t("accessReviewPage.integrations")}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2"><Key className="w-5 h-5 text-primary" />{latestReview?.total_integrations || 0}</div>
            <p className="text-xs text-muted-foreground">{t("accessReviewPage.activeTokens")}</p>
          </CardContent>
        </Card>
      </div>

      {latestReview && latestReview.findings.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />{t("accessReviewPage.issuesToResolve")}</CardTitle>
            <CardDescription>{t("accessReviewPage.detectedDuringReview")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(latestReview.findings as Finding[]).slice(0, 5).map((finding, i) => {
                const Icon = FINDING_ICONS[finding.type] || AlertTriangle;
                const riskConfig = RISK_CONFIG[finding.severity];
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${riskConfig.bgColor}`}>
                    <Icon className={`w-5 h-5 mt-0.5 ${riskConfig.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{finding.description}</p>
                      <p className="text-xs text-muted-foreground">{finding.recommendation}</p>
                    </div>
                    <Badge variant="outline" className={riskConfig.color}>{riskConfig.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("accessReviewPage.reviewHistory")}</CardTitle>
          <CardDescription>{t("accessReviewPage.allReviews")}</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("accessReviewPage.noReviews")}</p>
              <Button onClick={() => startReview()} variant="outline" className="mt-4">{t("accessReviewPage.launchFirst")}</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accessReviewPage.date")}</TableHead>
                  <TableHead>{t("accessReviewPage.users")}</TableHead>
                  <TableHead>{t("accessReviewPage.integrations")}</TableHead>
                  <TableHead>{t("accessReviewPage.issuesFound")}</TableHead>
                  <TableHead>{t("accessReviewPage.status")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{format(new Date(review.review_date), 'dd MMM yyyy', { locale: getDateLocale(i18n.language) })}</div></TableCell>
                    <TableCell>{review.total_users}</TableCell>
                    <TableCell>{review.total_integrations}</TableCell>
                    <TableCell><Badge variant={review.issues_found > 0 ? "destructive" : "success"}>{review.issues_found}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={review.status === 'completed' ? "success" : "secondary"}>
                        {review.status === 'completed' ? <><CheckCircle2 className="w-3 h-3 mr-1" /> {t("accessReviewPage.completed")}</> : <><Clock className="w-3 h-3 mr-1" /> {review.status}</>}
                      </Badge>
                    </TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => handleViewReview(review)}><Eye className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReview && t("accessReviewPage.reviewOf", { date: format(new Date(selectedReview.review_date), 'dd MMMM yyyy', { locale: getDateLocale(i18n.language) }) })}</DialogTitle>
          </DialogHeader>
          {loadingEntries ? (
            <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
          ) : (
            <Tabs defaultValue="entries">
              <TabsList>
                <TabsTrigger value="entries">{t("accessReviewPage.usersTab")} ({reviewEntries.length})</TabsTrigger>
                <TabsTrigger value="findings">{t("accessReviewPage.findingsTab")} ({selectedReview?.issues_found || 0})</TabsTrigger>
              </TabsList>
              <TabsContent value="entries" className="mt-4">
                <Table>
                  <TableHeader><TableRow><TableHead>{t("accessReviewPage.user")}</TableHead><TableHead>{t("accessReviewPage.role")}</TableHead><TableHead>{t("accessReviewPage.lastAction")}</TableHead><TableHead>{t("accessReviewPage.risk")}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {reviewEntries.map((entry) => {
                      const riskConfig = RISK_CONFIG[entry.risk_level];
                      return (
                        <TableRow key={entry.id}>
                          <TableCell><div className="flex items-center gap-2">{entry.is_inactive && <UserX className="w-4 h-4 text-orange-500" />}<span className="font-medium">{entry.user_email || entry.user_id}</span></div></TableCell>
                          <TableCell><Badge variant="outline">{entry.role}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{entry.last_action_at ? formatDistanceToNow(new Date(entry.last_action_at), { addSuffix: true, locale: getDateLocale(i18n.language) }) : t("accessReviewPage.never")}</TableCell>
                          <TableCell><Badge className={`${riskConfig.bgColor} ${riskConfig.color} border-0`}>{riskConfig.label}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="findings" className="mt-4 space-y-3">
                {(selectedReview?.findings || []).map((finding: Finding, i: number) => {
                  const Icon = FINDING_ICONS[finding.type] || AlertTriangle;
                  const riskConfig = RISK_CONFIG[finding.severity];
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${riskConfig.bgColor}`}>
                      <Icon className={`w-5 h-5 mt-0.5 ${riskConfig.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{finding.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">💡 {finding.recommendation}</p>
                      </div>
                    </div>
                  );
                })}
                {(!selectedReview?.findings || selectedReview.findings.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" /><p>{t("accessReviewPage.noIssuesDetected")}</p></div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
