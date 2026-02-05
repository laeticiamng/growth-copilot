 import { CheckCircle2, AlertTriangle } from "lucide-react";
 
 interface OverallHealthStatusProps {
   overallHealth: "ok" | "warning" | "error";
   avgLatency: number;
 }
 
 export function OverallHealthStatus({ overallHealth, avgLatency }: OverallHealthStatusProps) {
   return (
     <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
       <div className={`p-3 rounded-full ${
         overallHealth === "ok" ? "bg-success/20" :
         overallHealth === "error" ? "bg-destructive/20" : "bg-warning/20"
       }`}>
         {overallHealth === "ok" ? (
           <CheckCircle2 className="w-6 h-6 status-success" />
         ) : overallHealth === "error" ? (
           <AlertTriangle className="w-6 h-6 text-destructive" />
         ) : (
           <AlertTriangle className="w-6 h-6 status-warning" />
         )}
       </div>
       <div>
         <p className="font-medium">
           {overallHealth === "ok" ? "Tous les systèmes opérationnels" :
            overallHealth === "error" ? "Problèmes détectés" :
            "Fonctionnement dégradé"}
         </p>
         <p className="text-sm text-muted-foreground">
           Latence moyenne : {avgLatency || 0}ms
         </p>
       </div>
     </div>
   );
 }