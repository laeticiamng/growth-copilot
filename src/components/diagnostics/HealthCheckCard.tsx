 import { Badge } from "@/components/ui/badge";
 import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
 
 export interface HealthCheck {
   name: string;
   status: "ok" | "warning" | "error" | "pending";
   latency?: number;
   message?: string;
 }
 
 interface HealthCheckCardProps {
   check: HealthCheck;
 }
 
 export function HealthCheckCard({ check }: HealthCheckCardProps) {
   const getStatusIcon = (status: HealthCheck["status"]) => {
     switch (status) {
       case "ok":
         return <CheckCircle2 className="w-4 h-4 status-success" />;
       case "warning":
         return <AlertTriangle className="w-4 h-4 status-warning" />;
       case "error":
         return <AlertTriangle className="w-4 h-4 text-destructive" />;
       default:
         return <Clock className="w-4 h-4 text-muted-foreground" />;
     }
   };
 
   const getStatusColor = (status: HealthCheck["status"]) => {
     switch (status) {
       case "ok": return "success";
       case "warning": return "secondary";
       case "error": return "destructive";
       default: return "outline";
     }
   };
 
   return (
     <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
       <div className="flex items-center gap-3">
         {getStatusIcon(check.status)}
         <span className="font-medium">{check.name}</span>
       </div>
       <div className="flex items-center gap-3">
         <span className="text-sm text-muted-foreground">{check.message}</span>
         {check.latency && (
           <Badge variant="outline" className="text-xs">
             {check.latency}ms
           </Badge>
         )}
         <Badge variant={getStatusColor(check.status) as any} className="text-xs capitalize">
           {check.status}
         </Badge>
       </div>
     </div>
   );
 }