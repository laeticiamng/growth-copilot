import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Download, RefreshCw, CheckCircle2, Loader2, Phone, Mail, MessageSquare, Target, Shield, Zap } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getIntlLocale } from "@/lib/date-locale";

interface SalesScript {
  id: string;
  type: "discovery" | "closing" | "objection" | "followup";
  title: string;
  content: string;
  objections: ObjectionHandler[];
  createdAt: string;
}

interface ObjectionHandler {
  objection: string;
  response: string;
  technique: string;
}

// Business content – kept in French as domain-specific training data
const COMMON_OBJECTIONS = [
  "C'est trop cher",
  "Je dois réfléchir",
  "Je n'ai pas le temps",
  "J'ai déjà un prestataire",
  "Envoyez-moi une doc",
  "Ce n'est pas le bon moment",
  "Je dois en parler à mon associé",
  "Rappelez-moi plus tard",
];

export function SalesScriptGenerator() {
  const { t, i18n } = useTranslation();
  const { currentWorkspace } = useWorkspace();

  const SCRIPT_TYPES = [
    { value: "discovery", label: t("components.salesScript.typeDiscovery"), icon: Target, description: t("components.salesScript.typeDiscoveryDesc") },
    { value: "closing", label: t("components.salesScript.typeClosing"), icon: Zap, description: t("components.salesScript.typeClosingDesc") },
    { value: "objection", label: t("components.salesScript.typeObjection"), icon: Shield, description: t("components.salesScript.typeObjectionDesc") },
    { value: "followup", label: t("components.salesScript.typeFollowup"), icon: Mail, description: t("components.salesScript.typeFollowupDesc") },
  ] as const;

  const [selectedType, setSelectedType] = useState<string>("discovery");
  const [context, setContext] = useState("");
  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<SalesScript | null>(null);
  const [savedScripts, setSavedScripts] = useState<SalesScript[]>([]);

  const handleGenerate = async () => {
    if (!product) {
      toast.error(t("components.salesScript.specifyProduct"));
      return;
    }

    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          workspace_id: currentWorkspace?.id,
          agent_name: "sales_script_generator",
          purpose: "copywriting",
          input: {
            system_prompt: `Tu es un expert en vente B2B et copywriting de scripts commerciaux. Tu génères des scripts de vente persuasifs et éthiques en français.

Règles:
- Ton naturel et conversationnel
- Questions ouvertes pour la découverte
- Techniques de closing non agressives
- Réponses empathiques aux objections
- Structure claire et actionnable`,
            user_prompt: `Génère un script de vente de type "${selectedType}" pour:
- Produit/Service: ${product}
- Cible: ${targetAudience || "PME et ETI"}
- Contexte: ${context || "Premier contact téléphonique"}

Retourne un JSON avec:
{
  "title": "titre du script",
  "content": "le script complet avec les étapes",
  "objections": [
    {"objection": "...", "response": "...", "technique": "nom de la technique utilisée"}
  ]
}`,
            context: { type: selectedType, product, targetAudience, context },
          },
        },
      });

      if (error) throw error;

      const artifact = data?.artifact;
      if (artifact) {
        const scriptData = typeof artifact === 'string' ? JSON.parse(artifact) : artifact;
        
        const newScript: SalesScript = {
          id: crypto.randomUUID(),
          type: selectedType as SalesScript["type"],
          title: scriptData.title || `Script ${selectedType}`,
          content: scriptData.content || scriptData.summary || "",
          objections: scriptData.objections || [],
          createdAt: new Date().toISOString(),
        };
        
        setGeneratedScript(newScript);
        toast.success(t("components.salesScript.generated"));
      }
    } catch (error) {
      console.error("[SalesScript] Generation error:", error);
      toast.error(t("components.salesScript.generationError"));
      
      const fallbackScript: SalesScript = {
        id: crypto.randomUUID(),
        type: selectedType as SalesScript["type"],
        title: `Script ${SCRIPT_TYPES.find(t => t.value === selectedType)?.label}`,
        content: generateFallbackScript(selectedType, product, targetAudience),
        objections: generateFallbackObjections(),
        createdAt: new Date().toISOString(),
      };
      setGeneratedScript(fallbackScript);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedScript) {
      const fullText = `${generatedScript.title}\n\n${generatedScript.content}\n\n--- OBJECTIONS ---\n${generatedScript.objections.map(o => `Q: ${o.objection}\nR: ${o.response}\nTechnique: ${o.technique}`).join('\n\n')}`;
      navigator.clipboard.writeText(fullText);
      toast.success(t("components.salesScript.copied"));
    }
  };

  const handleSave = () => {
    if (generatedScript) {
      setSavedScripts(prev => [generatedScript, ...prev]);
      toast.success(t("components.salesScript.saved"));
    }
  };

  const handleExport = () => {
    if (!generatedScript) return;
    
    const content = `# ${generatedScript.title}
Type: ${generatedScript.type}
Généré le: ${new Date(generatedScript.createdAt).toLocaleDateString(getIntlLocale(i18n.language))}

## Script

${generatedScript.content}

## Gestion des objections

${generatedScript.objections.map(o => `### "${o.objection}"
**Réponse:** ${o.response}
**Technique:** ${o.technique}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${generatedScript.type}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("components.salesScript.exported"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("components.salesScript.title")}
          </CardTitle>
          <CardDescription>
            {t("components.salesScript.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCRIPT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selectedType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("components.salesScript.product")} *</label>
              <Input
                placeholder={t("components.salesScript.productPlaceholder")}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("components.salesScript.target")}</label>
              <Input
                placeholder={t("components.salesScript.targetPlaceholder")}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t("components.salesScript.context")}</label>
            <Textarea
              placeholder={t("components.salesScript.contextPlaceholder")}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={generating || !product} className="w-full">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("components.salesScript.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("components.salesScript.generate")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedScript && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{generatedScript.title}</CardTitle>
                <CardDescription>
                  Script {SCRIPT_TYPES.find(t => t.value === generatedScript.type)?.label} — {new Date(generatedScript.createdAt).toLocaleString(getIntlLocale(i18n.language))}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t("components.salesScript.copy")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  {t("common.export")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="script">
              <TabsList>
                <TabsTrigger value="script">Script</TabsTrigger>
                <TabsTrigger value="objections">
                  {t("components.salesScript.typeObjection")} ({generatedScript.objections.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="script" className="mt-4">
                <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                  {generatedScript.content}
                </div>
              </TabsContent>

              <TabsContent value="objections" className="mt-4 space-y-4">
                {generatedScript.objections.map((obj, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-destructive">"{obj.objection}"</p>
                        <p className="mt-2 text-sm">{obj.response}</p>
                        <Badge variant="outline" className="mt-2">
                          {obj.technique}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {savedScripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("components.salesScript.savedScripts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedScripts.map((script) => (
              <div key={script.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">{script.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {SCRIPT_TYPES.find(t => t.value === script.type)?.label} •{" "}
                    {new Date(script.createdAt).toLocaleDateString(getIntlLocale(i18n.language))}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setGeneratedScript(script)}>
                  {t("common.view")}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Fallback script templates – business content, kept in French
function generateFallbackScript(type: string, product: string, target: string): string {
  const templates: Record<string, string> = {
    discovery: `## Introduction
"Bonjour [Prénom], c'est [Votre nom] de [Entreprise]. 
J'espère que je ne vous dérange pas ? [Pause]"

## Accroche
"Je vous appelle car nous accompagnons des ${target || 'entreprises comme la vôtre'} sur ${product}. 
Avant de vous en dire plus, j'aimerais comprendre votre situation actuelle."

## Questions de découverte
1. "Comment gérez-vous actuellement [problème lié au produit] ?"
2. "Quels sont les principaux défis que vous rencontrez ?"
3. "Quel impact cela a sur votre activité ?"
4. "Dans un monde idéal, à quoi ressemblerait la solution parfaite ?"
5. "Avez-vous déjà essayé de résoudre ce problème ? Comment ?"

## Transition
"Merci pour ces informations précieuses. Ce que vous décrivez est exactement ce que ${product} permet de résoudre..."`,
    
    closing: `## Récapitulatif
"Si j'ai bien compris, vous avez besoin de [résumer les besoins].
${product} répond exactement à ces problématiques."

## Présentation de l'offre
"Voici ce que je vous propose :
- [Avantage 1]
- [Avantage 2]
- [Avantage 3]"

## Urgence légitime
"Nous avons actuellement [offre spéciale/disponibilité limitée]."

## Call-to-action
"Pour démarrer, il me faut simplement [action simple].
On commence quand vous êtes prêt ?"`,

    objection: `## Framework LAER pour les objections

**L - Listen (Écouter)**
Laissez le prospect exprimer son objection complètement.

**A - Acknowledge (Reconnaître)**
"Je comprends parfaitement votre préoccupation..."

**E - Explore (Explorer)**
"Pouvez-vous m'en dire plus sur ce qui vous fait dire cela ?"

**R - Respond (Répondre)**
Apportez une réponse adaptée basée sur leurs besoins réels.`,

    followup: `## Email de relance

**Objet:** Suite à notre échange sur ${product}

Bonjour [Prénom],

Je fais suite à notre conversation du [date].

Vous m'aviez mentionné [problème/besoin spécifique].

J'ai pensé à vous car [raison pertinente de reprendre contact].

Seriez-vous disponible [proposition de date] pour en discuter ?

Bien cordialement,
[Signature]`,
  };

  return templates[type] || templates.discovery;
}

function generateFallbackObjections(): ObjectionHandler[] {
  return [
    {
      objection: "C'est trop cher",
      response: "Je comprends que l'investissement soit un point important. Permettez-moi de vous poser une question : quel est le coût actuel de [problème] pour votre entreprise ? Souvent, nos clients réalisent que le coût de l'inaction est bien supérieur à l'investissement.",
      technique: "Retournement de perspective"
    },
    {
      objection: "Je dois réfléchir",
      response: "Bien sûr, c'est une décision importante. Pour vous aider dans votre réflexion, quels sont les points précis sur lesquels vous aimeriez avoir plus de clarté ?",
      technique: "Clarification des freins"
    },
    {
      objection: "J'ai déjà un prestataire",
      response: "C'est très bien d'avoir déjà quelqu'un. Comment évaluez-vous votre satisfaction actuelle sur une échelle de 1 à 10 ? [Si < 8] Qu'est-ce qui vous manque pour atteindre un 10 ?",
      technique: "Échelle de satisfaction"
    },
  ];
}

export default SalesScriptGenerator;
