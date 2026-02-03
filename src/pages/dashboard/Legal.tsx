import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContracts, CreateContractInput, ContractStatus } from "@/hooks/useContracts";
import { useCompliance } from "@/hooks/useCompliance";
import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Euro,
  FileCheck
} from "lucide-react";

const CONTRACT_STATUS_LABELS: Record<ContractStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  pending_signature: { label: "En attente de signature", variant: "outline" },
  active: { label: "Actif", variant: "default" },
  expired: { label: "Expiré", variant: "destructive" },
  terminated: { label: "Résilié", variant: "destructive" },
};

const CONTRACT_TYPES = [
  { value: "employment", label: "Contrat de travail" },
  { value: "nda", label: "NDA" },
  { value: "service", label: "Prestation de service" },
  { value: "license", label: "Licence" },
  { value: "partnership", label: "Partenariat" },
  { value: "other", label: "Autre" },
];

export default function Legal() {
  const { contracts, loading: loadingContracts, stats: contractStats, expiringContracts, createContract, isCreating } = useContracts();
  const { complianceItems, gdprRequests, loading: loadingCompliance, complianceStats, gdprStats } = useCompliance();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<CreateContractInput>({
    title: "",
    contract_type: "service",
    counterparty_name: "",
    description: "",
  });

  const loading = loadingContracts || loadingCompliance;

  const filteredContracts = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newContract.title || !newContract.contract_type) return;
    await createContract(newContract);
    setIsDialogOpen(false);
    setNewContract({
      title: "",
      contract_type: "service",
      counterparty_name: "",
      description: "",
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
          <h1 className="text-3xl font-bold">Juridique & Conformité</h1>
          <p className="text-muted-foreground">
            Gestion des contrats, conformité RGPD et obligations légales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contrat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un contrat</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau contrat à suivre
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du contrat</Label>
                <Input
                  id="title"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_type">Type</Label>
                <Select
                  value={newContract.contract_type}
                  onValueChange={(value) => setNewContract({ ...newContract, contract_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="counterparty">Contrepartie</Label>
                <Input
                  id="counterparty"
                  placeholder="Nom de l'entreprise ou personne"
                  value={newContract.counterparty_name}
                  onChange={(e) => setNewContract({ ...newContract, counterparty_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newContract.description}
                  onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                />
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
                <p className="text-sm text-muted-foreground">Contrats actifs</p>
                <p className="text-2xl font-bold">{contractStats.active}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirent bientôt</p>
                <p className="text-2xl font-bold text-orange-600">{contractStats.expiringSoon}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de conformité</p>
                <p className="text-2xl font-bold text-green-600">{complianceStats.complianceRate}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requêtes RGPD</p>
                <p className="text-2xl font-bold">{gdprStats.pending}</p>
                <p className="text-xs text-muted-foreground">en attente</p>
              </div>
              <Scale className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(contractStats.expiringSoon > 0 || gdprStats.overdue > 0) && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">Alertes juridiques</h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {contractStats.expiringSoon > 0 && (
                    <li>• {contractStats.expiringSoon} contrat(s) expire(nt) dans les 30 prochains jours</li>
                  )}
                  {gdprStats.overdue > 0 && (
                    <li>• {gdprStats.overdue} requête(s) RGPD en retard de traitement</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="gdpr">RGPD</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un contrat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestion des contrats</CardTitle>
              <CardDescription>
                {filteredContracts.length} contrat{filteredContracts.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun contrat trouvé</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="py-4 flex items-center justify-between hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.counterparty_name || "Non spécifié"}
                            {contract.expiry_date && ` • Expire le ${new Date(contract.expiry_date).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {contract.value_amount && (
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: contract.value_currency }).format(contract.value_amount)}
                          </span>
                        )}
                        <Badge variant={CONTRACT_STATUS_LABELS[contract.status].variant}>
                          {CONTRACT_STATUS_LABELS[contract.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de conformité</CardTitle>
              <CardDescription>
                Suivez vos obligations réglementaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Conformes</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.compliant} éléments</p>
                    </div>
                  </div>
                  <Progress value={(complianceStats.compliant / Math.max(complianceStats.total, 1)) * 100} className="w-32" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">À revoir</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.reviewNeeded} éléments</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Non conformes</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.nonCompliant} éléments</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr">
          <Card>
            <CardHeader>
              <CardTitle>Requêtes RGPD</CardTitle>
              <CardDescription>
                Droits d'accès, rectification, suppression, portabilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gdprRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune requête RGPD</p>
                </div>
              ) : (
                <div className="divide-y">
                  {gdprRequests.map((request) => (
                    <div key={request.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{request.requester_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.request_type} • {request.requester_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={request.status === 'completed' ? 'default' : 'outline'}>
                            {request.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Échéance: {new Date(request.response_deadline).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates juridiques</CardTitle>
              <CardDescription>
                CGU, CGV, NDA, contrats types
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Module de templates en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
