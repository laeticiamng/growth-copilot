 import { User, Shield, Server, Database } from "lucide-react";
 
 interface ContextInfoGridProps {
   userId: string | null;
   sessionValid: boolean;
   environment: "development" | "production";
   workspaceId: string | null;
 }
 
 export function ContextInfoGrid({ 
   userId, 
   sessionValid, 
   environment, 
   workspaceId 
 }: ContextInfoGridProps) {
   return (
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       <div className="p-3 rounded-lg bg-secondary/30">
         <div className="flex items-center gap-2 mb-1">
           <User className="w-4 h-4 text-muted-foreground" />
           <span className="text-xs text-muted-foreground">User ID</span>
         </div>
         <p className="text-sm font-mono truncate">
           {userId?.slice(0, 8) || "—"}...
         </p>
       </div>
       <div className="p-3 rounded-lg bg-secondary/30">
         <div className="flex items-center gap-2 mb-1">
           <Shield className="w-4 h-4 text-muted-foreground" />
           <span className="text-xs text-muted-foreground">Session</span>
         </div>
         <p className="text-sm">
           {sessionValid ? "✓ Valide" : "✗ Invalide"}
         </p>
       </div>
       <div className="p-3 rounded-lg bg-secondary/30">
         <div className="flex items-center gap-2 mb-1">
           <Server className="w-4 h-4 text-muted-foreground" />
           <span className="text-xs text-muted-foreground">Environnement</span>
         </div>
         <p className="text-sm capitalize">{environment || "—"}</p>
       </div>
       <div className="p-3 rounded-lg bg-secondary/30">
         <div className="flex items-center gap-2 mb-1">
           <Database className="w-4 h-4 text-muted-foreground" />
           <span className="text-xs text-muted-foreground">Workspace</span>
         </div>
         <p className="text-sm font-mono truncate">
           {workspaceId?.slice(0, 8) || "—"}...
         </p>
       </div>
     </div>
   );
 }