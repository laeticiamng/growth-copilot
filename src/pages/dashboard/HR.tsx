import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useEmployees, CreateEmployeeInput, EmployeeStatus, ContractType } from "@/hooks/useEmployees";
import { usePerformanceReviews, CreateReviewInput } from "@/hooks/usePerformanceReviews";
import { useTimeOffRequests, CreateTimeOffInput, TimeOffType } from "@/hooks/useTimeOffRequests";
import { OrgChart } from "@/components/hr/OrgChart";
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  Search,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  XCircle,
  Plus,
  Network,
} from "lucide-react";
import { format } from "date-fns";
import { getDateLocale, getIntlLocale } from "@/lib/date-locale";
import { useTranslation } from "react-i18next";
 import { useWorkspace } from "@/hooks/useWorkspace";
 import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const getStatusLabels = (t: any): Record<EmployeeStatus, { label: string; color: string }> => ({
  active: { label: t("hrPage.statusActive"), color: "bg-green-500" },
  onboarding: { label: t("hrPage.statusOnboarding"), color: "bg-blue-500" },
  offboarding: { label: t("hrPage.statusOffboarding"), color: "bg-orange-500" },
  on_leave: { label: t("hrPage.statusOnLeave"), color: "bg-yellow-500" },
  terminated: { label: t("hrPage.statusTerminated"), color: "bg-red-500" },
});

const getContractLabels = (t: any): Record<ContractType, string> => ({
  cdi: t("hrPage.cdi"), cdd: t("hrPage.cdd"), freelance: t("hrPage.freelance"),
  internship: t("hrPage.internship"), apprenticeship: t("hrPage.apprenticeship"),
});

const getTimeOffLabels = (t: any): Record<TimeOffType, string> => ({
  vacation: t("hrPage.vacation"), sick: t("hrPage.sick"), personal: t("hrPage.personal"),
  parental: t("hrPage.parental"), other: t("hrPage.other"),
});

export default function HR() {
  const { t, i18n } = useTranslation();
  const STATUS_LABELS = getStatusLabels(t);
  const CONTRACT_LABELS = getContractLabels(t);
  const TIME_OFF_LABELS = getTimeOffLabels(t);
  const { employees, loading: loadingEmployees, stats, createEmployee, isCreating, deleteEmployee } = useEmployees();
   const { currentWorkspace } = useWorkspace();
  const { reviews, loading: loadingReviews, stats: reviewStats, createReview, submitReview } = usePerformanceReviews();
  const { requests: timeOffRequests, loading: loadingTimeOff, stats: timeOffStats, createRequest, approveRequest, rejectRequest } = useTimeOffRequests();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeInput>({
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    department: "",
    contract_type: "cdi",
  });

  const [newReview, setNewReview] = useState<CreateReviewInput>({
    employee_id: "",
    review_period_start: "",
    review_period_end: "",
    overall_score: 3,
    strengths: [],
    areas_for_improvement: [],
    comments: "",
  });

  const [newTimeOff, setNewTimeOff] = useState<CreateTimeOffInput>({
    employee_id: "",
    request_type: "vacation",
    start_date: "",
    end_date: "",
    total_days: 1,
    reason: "",
  });

  const loading = loadingEmployees || loadingReviews || loadingTimeOff;
 
   // Real-time subscriptions
   useRealtimeSubscription(
     `hr-employees-${currentWorkspace?.id}`,
     {
       table: 'employees',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => {},
     !!currentWorkspace?.id
   );
 
   useRealtimeSubscription(
     `hr-timeoff-${currentWorkspace?.id}`,
     {
       table: 'time_off_requests',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => {},
     !!currentWorkspace?.id
   );

  const filteredEmployees = employees.filter(
    (e) =>
      e.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.job_title) {
      return;
    }
    await createEmployee(newEmployee);
    setIsEmployeeDialogOpen(false);
    setNewEmployee({
      first_name: "",
      last_name: "",
      email: "",
      job_title: "",
      department: "",
      contract_type: "cdi",
    });
  };

  const handleCreateReview = async () => {
    if (!newReview.employee_id || !newReview.review_period_start || !newReview.review_period_end) return;
    await createReview(newReview);
    setIsReviewDialogOpen(false);
    setNewReview({
      employee_id: "",
      review_period_start: "",
      review_period_end: "",
      overall_score: 3,
      strengths: [],
      areas_for_improvement: [],
      comments: "",
    });
  };

  const handleCreateTimeOff = async () => {
    if (!newTimeOff.employee_id || !newTimeOff.start_date || !newTimeOff.end_date) return;
    await createRequest(newTimeOff);
    setIsTimeOffDialogOpen(false);
    setNewTimeOff({
      employee_id: "",
      request_type: "vacation",
      start_date: "",
      end_date: "",
      total_days: 1,
      reason: "",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("hrPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("hrPage.subtitle")}
          </p>
        </div>
        <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              {t("hrPage.newEmployee")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("hrPage.addEmployee")}</DialogTitle>
              <DialogDescription>
                {t("hrPage.addEmployeeDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t("hrPage.firstName")}</Label>
                  <Input
                    id="first_name"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t("hrPage.lastName")}</Label>
                  <Input
                    id="last_name"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("hrPage.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">{t("hrPage.jobTitle")}</Label>
                <Input
                  id="job_title"
                  value={newEmployee.job_title}
                  onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">{t("hrPage.department")}</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">{t("hrPage.contractType")}</Label>
                  <Select
                    value={newEmployee.contract_type}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, contract_type: value as ContractType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTRACT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreateEmployee} disabled={isCreating}>
                {isCreating ? t("common.creating") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("hrPage.totalEmployees")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("hrPage.activeEmployees")}</p>
                <p className="text-2xl font-bold status-success">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 status-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("hrPage.pendingReviews")}</p>
                <p className="text-2xl font-bold text-blue-600">{reviewStats.pending}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("hrPage.pendingTimeOff")}</p>
                <p className="text-2xl font-bold status-warning">{timeOffStats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 status-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="directory">{t("hrPage.directory")}</TabsTrigger>
          <TabsTrigger value="orgchart">{t("hrPage.orgChart")}</TabsTrigger>
          <TabsTrigger value="onboarding">{t("hrPage.onboarding")}</TabsTrigger>
          <TabsTrigger value="performance">{t("hrPage.performance")}</TabsTrigger>
          <TabsTrigger value="timeoff">{t("hrPage.timeOff")}</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("hrPage.searchEmployee")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("hrPage.employeeDirectory")}</CardTitle>
              <CardDescription>
                {filteredEmployees.length} {t("hrPage.employee")}{filteredEmployees.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("hrPage.noEmployeeFound")}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="py-4 flex items-center justify-between hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee.job_title}
                            {employee.department && ` • ${employee.department}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {CONTRACT_LABELS[employee.contract_type]}
                        </Badge>
                        <Badge
                          className={`${STATUS_LABELS[employee.status].color} text-white`}
                        >
                          {STATUS_LABELS[employee.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>{t("hrPage.onboardingInProgress")}</CardTitle>
              <CardDescription>
                {t("hrPage.onboardingDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employees.filter(e => e.status === 'onboarding').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("hrPage.noOnboarding")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.filter(e => e.status === 'onboarding').map((emp) => (
                    <div key={emp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                            <p className="text-sm text-muted-foreground">{emp.job_title}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("hrPage.start")} {new Date(emp.hire_date).toLocaleDateString(getIntlLocale(i18n.language))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgchart" className="space-y-4">
          <OrgChart employees={employees.map(e => ({
            id: e.id,
            first_name: e.first_name,
            last_name: e.last_name,
            role: e.job_title || '',
            department: e.department || t("hrPage.notDefined"),
            manager_id: e.manager_id,
            avatar_url: null,
            status: e.status,
          }))} />
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("hrPage.performanceReviews")}</CardTitle>
                  <CardDescription>
                    {reviewStats.total} {t("hrPage.performanceReviews").toLowerCase()} • {t("hrPage.globalScore")}: {reviewStats.averageScore.toFixed(1)}/5
                  </CardDescription>
                </div>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("hrPage.newReview")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("hrPage.newReview")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t("hrPage.employee")}</Label>
                        <Select
                          value={newReview.employee_id}
                          onValueChange={(value) => setNewReview({ ...newReview, employee_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("hrPage.selectEmployee")} />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("hrPage.periodStart")}</Label>
                          <Input
                            type="date"
                            value={newReview.review_period_start}
                            onChange={(e) => setNewReview({ ...newReview, review_period_start: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("hrPage.periodEnd")}</Label>
                          <Input
                            type="date"
                            value={newReview.review_period_end}
                            onChange={(e) => setNewReview({ ...newReview, review_period_end: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrPage.globalScore")}</Label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <Button
                              key={score}
                              type="button"
                              variant={newReview.overall_score === score ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewReview({ ...newReview, overall_score: score })}
                            >
                              {score}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrPage.comments")}</Label>
                        <Textarea
                          value={newReview.comments || ""}
                          onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
                          placeholder={t("hrPage.commentsPlaceholder")}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>{t("common.cancel")}</Button>
                      <Button onClick={handleCreateReview}>{t("common.create")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("hrPage.noReview")}</p>
                  <p className="text-sm">{t("hrPage.noReviewDesc")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const emp = employees.find(e => e.id === review.employee_id);
                    return (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : t("hrPage.employee")}</p>
                            <p className="text-sm text-muted-foreground">
                              {t("hrPage.period")} {format(new Date(review.review_period_start), 'MMM yyyy', { locale: getDateLocale(i18n.language) })} - {format(new Date(review.review_period_end), 'MMM yyyy', { locale: getDateLocale(i18n.language) })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {review.overall_score && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 status-warning fill-current" />
                                <span className="font-medium">{review.overall_score}/5</span>
                              </div>
                            )}
                            <Badge variant={review.status === 'completed' ? 'default' : 'outline'}>
                              {review.status === 'draft' ? t("hrPage.draft") : review.status === 'submitted' ? t("hrPage.submitted") : review.status === 'completed' ? t("hrPage.reviewCompleted") : review.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("hrPage.timeOffRequests")}</CardTitle>
                  <CardDescription>
                    {timeOffStats.pending} {t("hrPage.newRequest").toLowerCase()} • {timeOffStats.totalDaysApproved} {t("hrPage.approved").toLowerCase()}
                  </CardDescription>
                </div>
                <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("hrPage.newRequest")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("hrPage.timeOffRequest")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t("hrPage.employee")}</Label>
                        <Select
                          value={newTimeOff.employee_id}
                          onValueChange={(value) => setNewTimeOff({ ...newTimeOff, employee_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("hrPage.selectEmployee")} />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrPage.timeOffType")}</Label>
                        <Select
                          value={newTimeOff.request_type}
                          onValueChange={(value) => setNewTimeOff({ ...newTimeOff, request_type: value as TimeOffType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TIME_OFF_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("hrPage.startDate")}</Label>
                          <Input
                            type="date"
                            value={newTimeOff.start_date}
                            onChange={(e) => setNewTimeOff({ ...newTimeOff, start_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("hrPage.endDate")}</Label>
                          <Input
                            type="date"
                            value={newTimeOff.end_date}
                            onChange={(e) => setNewTimeOff({ ...newTimeOff, end_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrPage.numberOfDays")}</Label>
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={newTimeOff.total_days}
                          onChange={(e) => setNewTimeOff({ ...newTimeOff, total_days: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("hrPage.reason")}</Label>
                        <Textarea
                          value={newTimeOff.reason || ""}
                          onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTimeOffDialogOpen(false)}>{t("common.cancel")}</Button>
                      <Button onClick={handleCreateTimeOff}>{t("common.submit")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {timeOffRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("hrPage.noTimeOff")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeOffRequests.map((request) => {
                    const emp = employees.find(e => e.id === request.employee_id);
                    return (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : t("hrPage.employee")}</p>
                            <p className="text-sm text-muted-foreground">
                              {TIME_OFF_LABELS[request.request_type]} • {request.total_days} {t("hrPage.numberOfDays").toLowerCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(request.start_date), 'dd MMM', { locale: getDateLocale(i18n.language) })} - {format(new Date(request.end_date), 'dd MMM yyyy', { locale: getDateLocale(i18n.language) })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => rejectRequest({ id: request.id })}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  {t("hrPage.reject")}
                                </Button>
                                <Button size="sm" onClick={() => approveRequest(request.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  {t("hrPage.approve")}
                                </Button>
                              </>
                            ) : (
                              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'outline'}>
                                {request.status === 'approved' ? t("hrPage.approved") : request.status === 'rejected' ? t("hrPage.rejected") : request.status === 'cancelled' ? t("hrPage.cancelled") : request.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
