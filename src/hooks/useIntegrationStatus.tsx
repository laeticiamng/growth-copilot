 import { useMemo } from "react";
 
 interface IntegrationStatusResult {
   status: "connected" | "available" | "coming_soon";
   isConnected: boolean;
   isAvailable: boolean;
 }
 
 /**
  * Hook centralisé pour déterminer le statut de connexion des intégrations
  * Basé sur les connexions OAuth réelles en base de données
  */
 export function useIntegrationStatus(
   toolId: string,
   category: string,
   googleConnected: boolean,
   metaConnected: boolean,
   toolStatus?: "active" | "available" | "coming_soon"
 ): IntegrationStatusResult {
   return useMemo(() => {
     // Coming soon tools
     if (toolStatus === "coming_soon") {
       return { status: "coming_soon", isConnected: false, isAvailable: false };
     }
 
     // Google tools
     const googleTools = ["analytics", "search-console", "ads", "youtube", "business-profile", "looker"];
     if (googleTools.includes(toolId) || category === "analytics" || category === "seo") {
       if (googleConnected) {
         return { status: "connected", isConnected: true, isAvailable: false };
       }
       return { status: "available", isConnected: false, isAvailable: true };
     }
 
     // Meta tools
     const metaTools = ["meta-ads", "instagram", "messenger", "whatsapp", "capi"];
     if (metaTools.includes(toolId) || category === "social" || category === "ads") {
       if (metaConnected) {
         return { status: "connected", isConnected: true, isAvailable: false };
       }
       return { status: "available", isConnected: false, isAvailable: true };
     }
 
     // Default: available
     return { status: "available", isConnected: false, isAvailable: true };
   }, [toolId, category, googleConnected, metaConnected, toolStatus]);
 }
 
 /**
  * Compte les intégrations connectées et disponibles
  */
 export function useIntegrationCounts(
   tools: Array<{ id: string; category: string; status?: string }>,
   googleConnected: boolean,
   metaConnected: boolean
 ) {
   return useMemo(() => {
     let connected = 0;
     let available = 0;
     let comingSoon = 0;
 
     tools.forEach(tool => {
       const googleTools = ["analytics", "search-console", "ads", "youtube", "business-profile", "looker"];
       const metaTools = ["meta-ads", "instagram", "messenger", "whatsapp", "capi"];
 
       if (tool.status === "coming_soon") {
         comingSoon++;
       } else if (googleTools.includes(tool.id) && googleConnected) {
         connected++;
       } else if (metaTools.includes(tool.id) && metaConnected) {
         connected++;
       } else if (tool.status !== "coming_soon") {
         available++;
       }
     });
 
     return { connected, available, comingSoon };
   }, [tools, googleConnected, metaConnected]);
 }