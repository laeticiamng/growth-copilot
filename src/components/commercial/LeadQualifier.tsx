/**
 * Lead Qualifier Component
 * Agent: Alexandre Petit (Commercial Lead Qualifier)
 * Generates: BANT score, next steps, personalized email templates
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Copy, 
  Loader2, 
  CheckCircle,
  User,
  Building,
  Mail,
  Target,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSites } from "@/hooks/useSites";
import { useTranslation } from "react-i18next";

interface LeadQualificationResult {
  score: number;
  bant: {
    budget: { score: number; reasoning: string };
    authority: { score: number; reasoning: string };
    need: { score: number; reasoning: string };
    timeline: { score: number; reasoning: string };
  };
  next_step: {
    action: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
  };
  email_template: {
    subject: string;
    body: string;
  };
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  notes: string;
  score?: number;
  status: string;
  created_at: string;
}

export function LeadQualifier() {
  const { t } = useTranslation();
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();

  const sources = [
    { value: "web", label: t("components.leadQualifier.sourceWeb") },
    { value: "referral", label: t("components.leadQualifier.sourceReferral") },
    { value: "event", label: t("components.leadQualifier.sourceEvent") },
    { value: "cold", label: t("components.leadQualifier.sourceCold") },
    { value: "linkedin", label: "LinkedIn" },
  ];

  const pipelineStages = [
    { id: "new", label: t("components.leadQualifier.stageNew"), color: "bg-blue-500" },
    { id: "qualified", label: t("components.leadQualifier.stageQualified"), color: "bg-purple-500" },
    { id: "meeting", label: t("components.leadQualifier.stageMeeting"), color: "bg-yellow-500" },
    { id: "proposal", label: t("components.leadQualifier.stageProposal"), color: "bg-orange-500" },
    { id: "won", label: t("components.leadQualifier.stageWon"), color: "bg-primary" },
    { id: "lost", label: t("components.leadQualifier.stageLost"), color: "bg-destructive" },
  ];

  const [activeTab, setActiveTab] = useState("form");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    source: "web",
    notes: ""
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<LeadQualificationResult | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [copied, setCopied] = useState(false);

  const handleQualify = async () => {
    if (!formData.name.trim() || !formData.company.trim()) {
      toast.error(t("components.leadQualifier.nameCompanyRequired"));
      return;
    }

    if (!currentWorkspace) {
      toast.error(t("components.leadQualifier.noWorkspace"));
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("components.leadQualifier.pleaseLogin"));
        setGenerating(false);
        return;
      }

      const systemPrompt = `Tu es Alexandre Petit, expert commercial avec 10 ans d'expérience en qualification de leads B2B. Tu utilises la méthode BANT (Budget, Authority, Need, Timeline) avec rigueur.

MISSION : Qualifier un lead et proposer les prochaines étapes.

Tu dois retourner un JSON avec cette structure exacte :
{
  "summary": "Résumé de la qualification",
  "actions": [],
  "risks": [],
  "dependencies": [],
  "metrics_to_watch": ["conversion_rate", "response_rate"],
  "requires_approval": false,
  "lead_qualification": {
    "score": 75,
    "bant": {
      "budget": {"score": 80, "reasoning": "Explication"},
      "authority": {"score": 70, "reasoning": "Explication"},
      "need": {"score": 85, "reasoning": "Explication"},
      "timeline": {"score": 65, "reasoning": "Explication"}
    },
    "next_step": {
      "action": "Planifier un appel découverte",
      "priority": "high",
      "reasoning": "Justification"
    },
    "email_template": {
      "subject": "Objet de l'email",
      "body": "Corps de l'email personnalisé"
    }
  }
}

RÈGLES :
- Le score global est la moyenne des 4 critères BANT
- Score > 70 = Lead qualifié
- Score 40-70 = À nurture
- Score < 40 = Disqualifier
- L'email doit être personnalisé avec le nom et l'entreprise
- Le next step doit être actionnable et précis`;

      const userPrompt = `Qualifie ce lead :

Nom : ${formData.name}
Entreprise : ${formData.company}
Email : ${formData.email || "Non fourni"}
Source : ${sources.find(s => s.value === formData.source)?.label}
Notes : ${formData.notes || "Aucune note"}

${currentSite ? `Contexte : Notre produit est Growth OS, une plateforme d'agents IA pour automatiser la croissance des entreprises.` : ""}

Génère :
1. Un score de qualification /100 basé sur BANT
2. Une recommandation de next step
3. Un template d'email personnalisé pour le premier contact`;

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace.id,
          agent_name: "lead_qualifier",
          purpose: "analysis",
          input: {
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            context: {
              lead: formData,
              site_name: currentSite?.name,
            }
          }
        }
      });

      if (error) throw error;

      if (data?.success && data?.artifact?.lead_qualification) {
        const qualification = data.artifact.lead_qualification as LeadQualificationResult;
        setResult(qualification);
        
        const newLead: Lead = {
          id: crypto.randomUUID(),
          name: formData.name,
          company: formData.company,
          email: formData.email,
          source: formData.source,
          notes: formData.notes,
          score: qualification.score,
          status: qualification.score >= 70 ? "qualified" : qualification.score >= 40 ? "new" : "lost",
          created_at: new Date().toISOString(),
        };
        
        setLeads(prev => [newLead, ...prev]);
        
        await supabase.from("leads").insert([{
          workspace_id: currentWorkspace.id,
          name: formData.name,
          company: formData.company,
          email: formData.email,
          source: formData.source,
          notes: formData.notes,
          status: newLead.status as "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost",
        }]);
        
        toast.success(t("components.leadQualifier.qualifiedSuccess"));
      } else {
        throw new Error(data?.error || t("components.leadQualifier.qualificationError"));
      }
    } catch (err) {
      console.error("Lead qualification error:", err);
      toast.error(t("components.leadQualifier.qualificationError"));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (!result?.email_template) return;
    const fullEmail = `Objet: ${result.email_template.subject}\n\n${result.email_template.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast.success(t("components.leadQualifier.emailCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { variant: "gradient" as const, label: t("components.leadQualifier.qualified") };
    if (score >= 40) return { variant: "secondary" as const, label: t("components.leadQualifier.toNurture") };
    return { variant: "destructive" as const, label: t("components.leadQualifier.disqualified") };
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t("components.leadQualifier.title")}</CardTitle>
            <CardDescription>
              Agent Alexandre Petit — Commercial Lead Qualifier
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">{t("components.leadQualifier.newLead")}</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline ({leads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("components.leadQualifier.fullName")} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">{t("components.leadQualifier.company")} *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <select
                  id="source"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                >
                  {sources.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder={t("components.leadQualifier.notesPlaceholder")}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Button 
              variant="hero" 
              onClick={handleQualify} 
              disabled={generating || !formData.name.trim() || !formData.company.trim()}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("components.leadQualifier.qualifying")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("components.leadQualifier.qualifyLead")}
                </>
              )}
            </Button>

            {result && !generating && (
              <div className="space-y-6 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("components.leadQualifier.qualificationScore")}</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <Badge {...getScoreBadge(result.score)} className="mt-2">
                    {getScoreBadge(result.score).label}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(result.bant).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{key}</span>
                        <span className={`font-bold ${getScoreColor(value.score)}`}>{value.score}/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{value.reasoning}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t("components.leadQualifier.nextStep")}</span>
                    <Badge variant={result.next_step.priority === "high" ? "destructive" : "secondary"}>
                      {result.next_step.priority === "high" ? t("components.leadQualifier.priority") : t("components.leadQualifier.normal")}
                    </Badge>
                  </div>
                  <p className="font-medium">{result.next_step.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.next_step.reasoning}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("components.leadQualifier.personalizedEmail")}
                    </h4>
                    <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">{t("components.leadQualifier.subject")} :</span> {result.email_template.subject}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{result.email_template.body}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {pipelineStages.map(stage => {
                const stageLeads = leads.filter(l => l.status === stage.id);
                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-sm font-medium">{stage.label}</span>
                      <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                    </div>
                    <div className="space-y-2 min-h-[100px] p-2 rounded-lg bg-secondary/30">
                      {stageLeads.map(lead => (
                        <Card key={lead.id} className="p-2 text-xs">
                          <p className="font-medium truncate">{lead.name}</p>
                          <p className="text-muted-foreground truncate">{lead.company}</p>
                          {lead.score && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {lead.score}/100
                            </Badge>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {leads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("components.leadQualifier.noLeads")}</p>
                <p className="text-sm">{t("components.leadQualifier.noLeadsDesc")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
