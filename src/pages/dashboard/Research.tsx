import { SmartResearchHub } from "@/components/research/SmartResearchHub";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Globe, TrendingUp } from "lucide-react";

export default function Research() {
  return (
    <div className="space-y-6">
      {/* Header - Apple-like clarity */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔍</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
          <p className="text-muted-foreground">
            Recherche IA en temps réel pour comprendre votre marché et vos concurrents
          </p>
        </div>
      </div>
      
      {/* Quick Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Veille concurrentielle</p>
                <p className="text-xs text-muted-foreground">Analysez vos concurrents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tendances marché</p>
                <p className="text-xs text-muted-foreground">Identifiez les opportunités</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sources vérifiées</p>
                <p className="text-xs text-muted-foreground">Données fiables & récentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SmartResearchHub />
    </div>
  );
}
