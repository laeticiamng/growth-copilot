import { useState } from "react";
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
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_LABELS: Record<EmployeeStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-500" },
  onboarding: { label: "Onboarding", color: "bg-blue-500" },
  offboarding: { label: "Offboarding", color: "bg-orange-500" },
  on_leave: { label: "En congé", color: "bg-yellow-500" },
  terminated: { label: "Terminé", color: "bg-red-500" },
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance",
  internship: "Stage",
  apprenticeship: "Alternance",
};

const TIME_OFF_LABELS: Record<TimeOffType, string> = {
  vacation: "Congés payés",
  sick: "Maladie",
  personal: "Personnel",
  parental: "Parental",
  other: "Autre",
};

export default function HR() {
  const { employees, loading: loadingEmployees, stats, createEmployee, isCreating, deleteEmployee } = useEmployees();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
          <p className="text-muted-foreground">
            Gestion des employés, onboarding et performance
          </p>
        </div>
        <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel employé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un employé</DialogTitle>
              <DialogDescription>
                Créez une fiche pour un nouvel employé
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Poste</Label>
                <Input
                  id="job_title"
                  value={newEmployee.job_title}
                  onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Type de contrat</Label>
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
                Annuler
              </Button>
              <Button onClick={handleCreateEmployee} disabled={isCreating}>
                {isCreating ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total employés</p>
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
                <p className="text-sm text-muted-foreground">Actifs</p>
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
                <p className="text-sm text-muted-foreground">Évaluations en attente</p>
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
                <p className="text-sm text-muted-foreground">Congés en attente</p>
                <p className="text-2xl font-bold status-warning">{timeOffStats.pending}</p>
              </div>
              <Calendar className="w-8 h-8 status-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Annuaire</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timeoff">Congés</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Annuaire des employés</CardTitle>
              <CardDescription>
                {filteredEmployees.length} employé{filteredEmployees.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun employé trouvé</p>
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
              <CardTitle>Onboarding en cours</CardTitle>
              <CardDescription>
                Suivez l'intégration des nouveaux employés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employees.filter(e => e.status === 'onboarding').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun onboarding en cours</p>
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
                          Début: {new Date(emp.hire_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Évaluations de performance</CardTitle>
                  <CardDescription>
                    {reviewStats.total} évaluations • Score moyen: {reviewStats.averageScore.toFixed(1)}/5
                  </CardDescription>
                </div>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle évaluation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle évaluation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Employé</Label>
                        <Select
                          value={newReview.employee_id}
                          onValueChange={(value) => setNewReview({ ...newReview, employee_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un employé" />
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
                          <Label>Début période</Label>
                          <Input
                            type="date"
                            value={newReview.review_period_start}
                            onChange={(e) => setNewReview({ ...newReview, review_period_start: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fin période</Label>
                          <Input
                            type="date"
                            value={newReview.review_period_end}
                            onChange={(e) => setNewReview({ ...newReview, review_period_end: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Score global (1-5)</Label>
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
                        <Label>Commentaires</Label>
                        <Textarea
                          value={newReview.comments || ""}
                          onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
                          placeholder="Points forts, axes d'amélioration..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreateReview}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune évaluation</p>
                  <p className="text-sm">Créez votre première évaluation de performance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const emp = employees.find(e => e.id === review.employee_id);
                    return (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : 'Employé'}</p>
                            <p className="text-sm text-muted-foreground">
                              Période: {format(new Date(review.review_period_start), 'MMM yyyy', { locale: fr })} - {format(new Date(review.review_period_end), 'MMM yyyy', { locale: fr })}
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
                              {review.status === 'draft' ? 'Brouillon' : review.status === 'submitted' ? 'Soumis' : review.status === 'completed' ? 'Terminé' : review.status}
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
                  <CardTitle>Demandes de congés</CardTitle>
                  <CardDescription>
                    {timeOffStats.pending} demande(s) en attente • {timeOffStats.totalDaysApproved} jours approuvés
                  </CardDescription>
                </div>
                <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle demande
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Demande de congé</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Employé</Label>
                        <Select
                          value={newTimeOff.employee_id}
                          onValueChange={(value) => setNewTimeOff({ ...newTimeOff, employee_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un employé" />
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
                        <Label>Type de congé</Label>
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
                          <Label>Date début</Label>
                          <Input
                            type="date"
                            value={newTimeOff.start_date}
                            onChange={(e) => setNewTimeOff({ ...newTimeOff, start_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date fin</Label>
                          <Input
                            type="date"
                            value={newTimeOff.end_date}
                            onChange={(e) => setNewTimeOff({ ...newTimeOff, end_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre de jours</Label>
                        <Input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={newTimeOff.total_days}
                          onChange={(e) => setNewTimeOff({ ...newTimeOff, total_days: parseFloat(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Motif (optionnel)</Label>
                        <Textarea
                          value={newTimeOff.reason || ""}
                          onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTimeOffDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreateTimeOff}>Soumettre</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {timeOffRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande de congé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeOffRequests.map((request) => {
                    const emp = employees.find(e => e.id === request.employee_id);
                    return (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : 'Employé'}</p>
                            <p className="text-sm text-muted-foreground">
                              {TIME_OFF_LABELS[request.request_type]} • {request.total_days} jour(s)
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(request.start_date), 'dd MMM', { locale: fr })} - {format(new Date(request.end_date), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => rejectRequest({ id: request.id })}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Refuser
                                </Button>
                                <Button size="sm" onClick={() => approveRequest(request.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approuver
                                </Button>
                              </>
                            ) : (
                              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'outline'}>
                                {request.status === 'approved' ? 'Approuvé' : request.status === 'rejected' ? 'Refusé' : request.status === 'cancelled' ? 'Annulé' : request.status}
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
