import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Send, ThumbsUp, AlertTriangle } from "lucide-react";

export default function Reputation() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Réputation</h1>
          <p className="text-muted-foreground">Avis clients et preuve sociale</p>
        </div>
        <Button variant="hero"><Send className="w-4 h-4 mr-2" />Demander un avis</Button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Note moyenne</p><p className="text-3xl font-bold flex items-center gap-2">4.8 <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" /></p></CardContent></Card>
        <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total avis</p><p className="text-3xl font-bold">127</p></CardContent></Card>
        <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Taux réponse</p><p className="text-3xl font-bold">94%</p></CardContent></Card>
        <Card variant="kpi"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Ce mois</p><p className="text-3xl font-bold text-green-500">+12</p></CardContent></Card>
      </div>

      <Card variant="feature">
        <CardHeader><CardTitle>Avis récents</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{author:"Marie D.",rating:5,text:"Excellent service !",replied:true},{author:"Pierre L.",rating:4,text:"Bon travail.",replied:false},{author:"Sophie M.",rating:2,text:"Déçue.",replied:false,urgent:true}].map((r,i)=>(
            <div key={i} className={`p-4 rounded-lg ${r.urgent?"bg-destructive/10 border border-destructive/30":"bg-secondary/50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.author}</span>
                  <div className="flex">{[...Array(5)].map((_,j)=><Star key={j} className={`w-4 h-4 ${j<r.rating?"fill-yellow-500 text-yellow-500":"text-muted-foreground"}`}/>)}</div>
                </div>
                {r.replied?<Badge variant="secondary"><ThumbsUp className="w-3 h-3 mr-1"/>Répondu</Badge>:r.urgent?<Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1"/>Urgent</Badge>:null}
              </div>
              <p className="text-sm">{r.text}</p>
              {!r.replied&&<Button variant="ghost" size="sm" className="mt-2"><MessageSquare className="w-4 h-4 mr-2"/>Répondre</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
