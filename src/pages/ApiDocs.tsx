import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, CheckCircle, ArrowRight, Lock, Zap, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/agents",
    descFr: "Liste tous les agents disponibles",
    descEn: "List all available agents",
    response: `{
  "agents": [
    {
      "type": "tech_auditor",
      "name": "Tech SEO Auditor",
      "department": "Marketing",
      "status": "available",
      "capabilities": ["seo_audit"]
    }
  ],
  "total": 39
}`,
  },
  {
    method: "POST",
    path: "/api/v1/agents/:type/run",
    descFr: "Lancer l'exécution d'un agent",
    descEn: "Launch an agent run",
    response: `{
  "run_id": "run_abc123",
  "agent_type": "tech_auditor",
  "status": "pending",
  "created_at": "2025-12-15T10:30:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/runs/:id",
    descFr: "Obtenir le statut d'une exécution",
    descEn: "Get run status",
    response: `{
  "run_id": "run_abc123",
  "status": "completed",
  "artifact": {
    "summary": "15 issues found",
    "actions": [...],
    "risks": [...]
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/departments",
    descFr: "Liste tous les départements",
    descEn: "List all departments",
    response: `{
  "departments": [
    {
      "slug": "marketing",
      "name": "Marketing",
      "agent_count": 5,
      "status": "active"
    }
  ],
  "total": 11
}`,
  },
  {
    method: "GET",
    path: "/api/v1/kpis",
    descFr: "Obtenir les KPIs agrégés",
    descEn: "Get aggregated KPIs",
    response: `{
  "period": "last_30_days",
  "organic_clicks": 12450,
  "conversions": 342,
  "avg_position": 8.3
}`,
  },
  {
    method: "POST",
    path: "/api/v1/approvals/:id/approve",
    descFr: "Approuver une action en attente",
    descEn: "Approve a pending action",
    response: `{
  "approval_id": "apr_xyz789",
  "status": "approved",
  "approved_at": "2025-12-15T14:20:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/sites",
    descFr: "Liste les sites connectés",
    descEn: "List connected sites",
    response: `{
  "sites": [
    {
      "id": "site_001",
      "name": "example.com",
      "status": "active",
      "integrations": ["gsc", "ga4"]
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/v1/webhooks",
    descFr: "Enregistrer un webhook",
    descEn: "Register a webhook",
    response: `{
  "webhook_id": "wh_def456",
  "url": "https://...",
  "events": ["run.completed", "approval.required"],
  "active": true
}`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500/10 text-green-600 dark:text-green-400",
  POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PUT: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function ApiDocs() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("fr") ? "fr" : "en";
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success(lang === "fr" ? "Copié !" : "Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: lang === "fr" ? "Documentation API - Growth OS" : "API Documentation - Growth OS",
    description: lang === "fr"
      ? "Documentation complète de l'API Growth OS pour les intégrations."
      : "Complete Growth OS API documentation for integrations.",
  };

  return (
    <>
      <SEOHead
        title={lang === "fr" ? "Documentation API" : "API Documentation"}
        description={
          lang === "fr"
            ? "Documentation complète de l'API Growth OS pour les intégrations."
            : "Complete Growth OS API documentation for integrations."
        }
        canonical="/api-docs"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative text-center">
            <Badge variant="agent" className="mb-4">
              <Code className="w-3 h-3 mr-1" />
              API
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === "fr" ? "Documentation " : "API "}
              <span className="gradient-text">API</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {lang === "fr"
                ? "Intégrez Growth OS dans vos outils existants. API REST complète avec authentification JWT."
                : "Integrate Growth OS into your existing tools. Complete REST API with JWT authentication."}
            </p>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Card>
                <CardContent className="p-5 text-center">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-sm mb-1">{lang === "fr" ? "Authentification" : "Authentication"}</h3>
                  <p className="text-xs text-muted-foreground">Bearer token JWT</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-sm mb-1">Base URL</h3>
                  <p className="text-xs text-muted-foreground font-mono">api.growth-os.com/v1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-sm mb-1">Rate Limit</h3>
                  <p className="text-xs text-muted-foreground">1000 req/min</p>
                </CardContent>
              </Card>
            </div>

            {/* Auth Example */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Authentification" : "Authentication"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {lang === "fr"
                    ? "Incluez votre token d'accès dans le header Authorization de chaque requête :"
                    : "Include your access token in the Authorization header of each request:"}
                </p>
                <div className="bg-secondary rounded-lg p-4 font-mono text-sm relative">
                  <code>
                    curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                    &nbsp;&nbsp;https://api.growth-os.com/v1/agents
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('curl -H "Authorization: Bearer YOUR_API_KEY" https://api.growth-os.com/v1/agents', -1)}
                  >
                    {copiedIndex === -1 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints */}
            <h2 className="text-2xl font-bold mb-6">{lang === "fr" ? "Endpoints" : "Endpoints"}</h2>
            <div className="space-y-4">
              {API_ENDPOINTS.map((endpoint, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={cn("font-mono text-xs px-2", METHOD_COLORS[endpoint.method])}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono font-semibold">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lang === "fr" ? endpoint.descFr : endpoint.descEn}
                    </p>
                    <div className="bg-secondary rounded-lg p-4 font-mono text-xs relative overflow-auto">
                      <pre className="whitespace-pre">{endpoint.response}</pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(endpoint.response, index)}
                      >
                        {copiedIndex === index ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-secondary/30 mt-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {lang === "fr" ? "Prêt à intégrer Growth OS ?" : "Ready to integrate Growth OS?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "fr"
                ? "Créez votre compte et obtenez votre clé API en quelques minutes."
                : "Create your account and get your API key in minutes."}
            </p>
            <Button variant="hero" size="lg">
              {lang === "fr" ? "Obtenir ma clé API" : "Get my API key"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
