import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Calendar, FileText, TrendingUp, Bot } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Audit trail et rapports mensuels</p>
        </div>
        <Button variant="hero"><Download className="w-4 h-4 mr-2"/>Générer rapport PDF</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="feature" className="lg:col-span-2">
          <CardHeader><CardTitle>Rapports mensuels</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[{month:"Janvier 2026",status:"ready"},{month:"Décembre 2025",status:"ready"},{month:"Novembre 2025",status:"ready"}].map((r,i)=>(
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-primary"/><span className="font-medium">{r.month}</span></div>
                <div className="flex items-center gap-2">
                  <Badge variant="gradient">Prêt</Badge>
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4"/></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5"/>Audit Trail</CardTitle><CardDescription>Dernières actions</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {[{action:"Crawl SEO terminé",agent:"Tech Auditor",time:"Il y a 2h"},{action:"Brief généré",agent:"Content Builder",time:"Il y a 4h"},{action:"Alerte CPA envoyée",agent:"Ads Manager",time:"Il y a 6h"}].map((a,i)=>(
              <div key={i} className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm font-medium">{a.action}</p>
                <p className="text-xs text-muted-foreground">{a.agent} • {a.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card variant="gradient">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8"/>
            <div>
              <p className="font-bold text-lg">+24% de conversions ce mois</p>
              <p className="text-sm opacity-80">Comparé au mois précédent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
