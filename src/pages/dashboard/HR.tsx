import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees, CreateEmployeeInput, EmployeeStatus, ContractType } from "@/hooks/useEmployees";
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
  AlertCircle
} from "lucide-react";

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

export default function HR() {
  const { employees, loading, stats, createEmployee, isCreating } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeInput>({
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    department: "",
    contract_type: "cdi",
  });

  const filteredEmployees = employees.filter(
    (e) =>
      e.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.job_title) {
      return;
    }
    await createEmployee(newEmployee);
    setIsDialogOpen(false);
    setNewEmployee({
      first_name: "",
      last_name: "",
      email: "",
      job_title: "",
      department: "",
      contract_type: "cdi",
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Création..." : "Créer"}
              </Button>
            </div>
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
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En onboarding</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onboarding}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En congé</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-500 opacity-80" />
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Employee list */}
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
              <CardTitle>Évaluations de performance</CardTitle>
              <CardDescription>
                Gérez les revues et objectifs des employés
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Module de performance en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de congés</CardTitle>
              <CardDescription>
                Validez et suivez les absences
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Module de congés en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
