import { SmartResearchHub } from "@/components/research/SmartResearchHub";

export default function Research() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Marché</h1>
        <p className="text-muted-foreground">
          Recherche IA en temps réel pour la veille concurrentielle et l'analyse de marché
        </p>
      </div>
      
      <SmartResearchHub />
    </div>
  );
}
