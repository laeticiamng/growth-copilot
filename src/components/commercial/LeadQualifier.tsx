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

const sources = [
  { value: "web", label: "Site web" },
  { value: "referral", label: "Recommandation" },
  { value: "event", label: "Salon / Événement" },
  { value: "cold", label: "Prospection froide" },
  { value: "linkedin", label: "LinkedIn" },
];

const pipelineStages = [
  { id: "new", label: "Nouveau", color: "bg-blue-500" },
  { id: "qualified", label: "Qualifié", color: "bg-purple-500" },
  { id: "meeting", label: "En discussion", color: "bg-yellow-500" },
  { id: "proposal", label: "Proposé", color: "bg-orange-500" },
  { id: "won", label: "Gagné", color: "bg-primary" },
  { id: "lost", label: "Perdu", color: "bg-destructive" },
];

export function LeadQualifier() {
  const { currentWorkspace } = useWorkspace();
  const { currentSite } = useSites();
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
      toast.error("Nom et entreprise requis");
      return;
    }

    if (!currentWorkspace) {
      toast.error("Aucun workspace sélectionné");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter");
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
        
        // Save to leads table
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
        
        // Save to Supabase
        await supabase.from("leads").insert([{
          workspace_id: currentWorkspace.id,
          name: formData.name,
          company: formData.company,
          email: formData.email,
          source: formData.source,
          notes: formData.notes,
          status: newLead.status as "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost",
        }]);
        
        toast.success("Lead qualifié avec succès !");
      } else {
        throw new Error(data?.error || "Erreur lors de la qualification");
      }
    } catch (err) {
      console.error("Lead qualification error:", err);
      toast.error("Erreur lors de la qualification");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (!result?.email_template) return;
    const fullEmail = `Objet: ${result.email_template.subject}\n\n${result.email_template.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast.success("Email copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { variant: "gradient" as const, label: "Qualifié" };
    if (score >= 40) return { variant: "secondary" as const, label: "À nurture" };
    return { variant: "destructive" as const, label: "Disqualifié" };
  };

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Qualification de Leads</CardTitle>
            <CardDescription>
              Agent Alexandre Petit — Commercial Lead Qualifier
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Nouveau Lead</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline ({leads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
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
                <Label htmlFor="company">Entreprise *</Label>
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
                placeholder="Informations complémentaires sur le lead..."
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
                  Qualification en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Qualifier ce lead
                </>
              )}
            </Button>

            {/* Results */}
            {result && !generating && (
              <div className="space-y-6 pt-4 border-t">
                {/* Score */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Score de qualification</p>
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

                {/* BANT Breakdown */}
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

                {/* Next Step */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Prochaine étape</span>
                    <Badge variant={result.next_step.priority === "high" ? "destructive" : "secondary"}>
                      {result.next_step.priority === "high" ? "Prioritaire" : "Normal"}
                    </Badge>
                  </div>
                  <p className="font-medium">{result.next_step.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.next_step.reasoning}</p>
                </div>

                {/* Email Template */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email personnalisé
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
                      <span className="font-medium">Objet :</span> {result.email_template.subject}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{result.email_template.body}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            {/* Pipeline Kanban */}
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
                <p>Aucun lead qualifié</p>
                <p className="text-sm">Utilisez le formulaire pour qualifier votre premier lead</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
