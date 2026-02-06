import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";
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
import { useLegalTemplates, TemplateType, CreateTemplateInput } from "@/hooks/useLegalTemplates";
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
 import { useWorkspace } from "@/hooks/useWorkspace";
 import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const getContractStatusLabels = (t: any): Record<ContractStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> => ({
  draft: { label: t("legalPage.statusDraft"), variant: "secondary" },
  pending_signature: { label: t("legalPage.statusPendingSig"), variant: "outline" },
  active: { label: t("legalPage.statusActive"), variant: "default" },
  expired: { label: t("legalPage.statusExpired"), variant: "destructive" },
  terminated: { label: t("legalPage.statusTerminated"), variant: "destructive" },
});

const getContractTypes = (t: any) => [
  { value: "employment", label: t("legalPage.contractEmployment") },
  { value: "nda", label: "NDA" },
  { value: "service", label: t("legalPage.contractService") },
  { value: "license", label: t("legalPage.contractLicense") },
  { value: "partnership", label: t("legalPage.contractPartnership") },
  { value: "other", label: t("legalPage.contractOther") },
];

export default function Legal() {
  const { t, i18n } = useTranslation();
  const locale = getIntlLocale(i18n.language);
  const CONTRACT_STATUS_LABELS = getContractStatusLabels(t);
  const CONTRACT_TYPES = getContractTypes(t);
  const { contracts, loading: loadingContracts, stats: contractStats, expiringContracts, createContract, isCreating } = useContracts();
  const { complianceItems, gdprRequests, loading: loadingCompliance, complianceStats, gdprStats } = useCompliance();
   const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<CreateContractInput>({
    title: "",
    contract_type: "service",
    counterparty_name: "",
    description: "",
  });

  const loading = loadingContracts || loadingCompliance;
 
   // Real-time subscriptions
   useRealtimeSubscription(
     `legal-contracts-${currentWorkspace?.id}`,
     {
       table: 'contracts',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => {},
     !!currentWorkspace?.id
   );
 
   useRealtimeSubscription(
     `legal-gdpr-${currentWorkspace?.id}`,
     {
       table: 'gdpr_requests',
       filter: currentWorkspace?.id ? `workspace_id=eq.${currentWorkspace.id}` : undefined,
     },
     () => {},
     !!currentWorkspace?.id
   );

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
          <h1 className="text-3xl font-bold">{t("legalPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("legalPage.subtitle")}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("legalPage.newContract")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("legalPage.createContract")}</DialogTitle>
              <DialogDescription>
                {t("legalPage.createContractDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("legalPage.contractTitle")}</Label>
                <Input
                  id="title"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_type">{t("legalPage.type")}</Label>
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
                <Label htmlFor="counterparty">{t("legalPage.counterparty")}</Label>
                <Input
                  id="counterparty"
                  placeholder={t("legalPage.counterpartyPlaceholder")}
                  value={newContract.counterparty_name}
                  onChange={(e) => setNewContract({ ...newContract, counterparty_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("legalPage.description")}</Label>
                <Textarea
                  id="description"
                  value={newContract.description}
                  onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? t("legalPage.creating") : t("common.create")}
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
                <p className="text-sm text-muted-foreground">{t("legalPage.activeContracts")}</p>
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
                <p className="text-sm text-muted-foreground">{t("legalPage.expiringSoon")}</p>
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
                <p className="text-sm text-muted-foreground">{t("legalPage.complianceRate")}</p>
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
                <p className="text-sm text-muted-foreground">{t("legalPage.gdprRequestsLabel")}</p>
                <p className="text-2xl font-bold">{gdprStats.pending}</p>
                <p className="text-xs text-muted-foreground">{t("legalPage.pending")}</p>
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
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">{t("legalPage.legalAlerts")}</h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {contractStats.expiringSoon > 0 && (
                    <li>• {t("legalPage.contractsExpiring", { count: contractStats.expiringSoon })}</li>
                  )}
                  {gdprStats.overdue > 0 && (
                    <li>• {t("legalPage.gdprOverdue", { count: gdprStats.overdue })}</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="contracts">{t("legalPage.contracts")}</TabsTrigger>
          <TabsTrigger value="compliance">{t("legalPage.compliance")}</TabsTrigger>
          <TabsTrigger value="gdpr">{t("legalPage.gdpr")}</TabsTrigger>
          <TabsTrigger value="templates">{t("legalPage.templatesTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("legalPage.searchContract")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("legalPage.contractManagement")}</CardTitle>
              <CardDescription>
                {t("legalPage.contractCount", { count: filteredContracts.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("legalPage.noContract")}</p>
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
                            {contract.counterparty_name || t("legalPage.notSpecified")}
                            {contract.expiry_date && ` • ${t("legalPage.expiresOn", { date: new Date(contract.expiry_date).toLocaleDateString(locale) })}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {contract.value_amount && (
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat(locale, { style: 'currency', currency: contract.value_currency }).format(contract.value_amount)}
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
              <CardTitle>{t("legalPage.complianceBoard")}</CardTitle>
              <CardDescription>
                {t("legalPage.trackObligations")}
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
                      <p className="font-medium">{t("legalPage.compliant")}</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.compliant} {t("legalPage.items")}</p>
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
                      <p className="font-medium">{t("legalPage.toReview")}</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.reviewNeeded} {t("legalPage.items")}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{t("legalPage.nonCompliant")}</p>
                      <p className="text-sm text-muted-foreground">{complianceStats.nonCompliant} {t("legalPage.items")}</p>
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
              <CardTitle>{t("legalPage.gdprTitle")}</CardTitle>
              <CardDescription>
                {t("legalPage.gdprDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gdprRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t("legalPage.noGdprRequests")}</p>
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
                            {t("legalPage.deadline")}: {new Date(request.response_deadline).toLocaleDateString(locale)}
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
          <LegalTemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Legal Templates Tab Component =====
function LegalTemplatesTab() {
  const { t } = useTranslation();
  const { 
    templates, 
    loading, 
    statsByType, 
    TEMPLATE_TYPE_LABELS,
    createTemplate, 
    deleteTemplate,
    duplicateTemplate,
    isCreating 
  } = useLegalTemplates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<CreateTemplateInput>({
    name: "",
    template_type: "nda",
    description: "",
    content: "",
    variables: [],
    is_default: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTemplates = templates.filter(tmpl => {
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tmpl.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tmpl.template_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.content) return;
    await createTemplate(newTemplate);
    setIsDialogOpen(false);
    setNewTemplate({
      name: "",
      template_type: "nda",
      description: "",
      content: "",
      variables: [],
      is_default: false,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats by type */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {statsByType.filter(s => s.count > 0 || ["nda", "cgu", "cgv", "privacy"].includes(s.type)).slice(0, 4).map((stat) => (
          <Card key={stat.type} className="cursor-pointer hover:border-primary/50" onClick={() => setTypeFilter(stat.type)}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("legalPage.searchTemplate")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("legalPage.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("legalPage.allTypes")}</SelectItem>
            {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("legalPage.newTemplate")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("legalPage.createLegalTemplate")}</DialogTitle>
              <DialogDescription>
                {t("legalPage.createReusableDoc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">{t("legalPage.templateName")}</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="NDA Standard"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">{t("legalPage.type")}</Label>
                  <Select
                    value={newTemplate.template_type}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value as TemplateType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-desc">{t("legalPage.templateDesc")}</Label>
                <Input
                  id="template-desc"
                  value={newTemplate.description || ""}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">{t("legalPage.content")}</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder={t("legalPage.contentPlaceholder")}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t("legalPage.dynamicFields")}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreate} disabled={isCreating || !newTemplate.name || !newTemplate.content}>
                {isCreating ? t("legalPage.creating") : t("common.create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            {t("legalPage.legalTemplates")}
          </CardTitle>
          <CardDescription>{t("legalPage.templateCount", { count: filteredTemplates.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t("legalPage.noTemplate")}</p>
              <p className="text-sm mt-1">{t("legalPage.createFirstDoc")}</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("legalPage.newTemplate")}
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="py-4 flex items-center justify-between hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">{t("legalPage.defaultLabel")}</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {TEMPLATE_TYPE_LABELS[template.template_type]} • v{template.version}
                        {template.description && ` • ${template.description.slice(0, 40)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(template.id)}>
                      {t("legalPage.duplicate")}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTemplate(template.id)}>
                      {t("legalPage.deleteBtn")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
