import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EvidenceBundleCard } from "./EvidenceBundleCard";
import { useEvidenceBundles, EvidenceBundle } from "@/hooks/useEvidenceBundles";
import { FileText, RefreshCw, Shield } from "lucide-react";

interface EvidenceBundleViewerProps {
  executiveRunId?: string;
  agentRunId?: string;
  approvalId?: string;
  title?: string;
  defaultExpanded?: boolean;
}

export function EvidenceBundleViewer({
  executiveRunId,
  agentRunId,
  approvalId,
  title = "Evidence Bundle",
  defaultExpanded = false,
}: EvidenceBundleViewerProps) {
  const { fetchBundleWithDetails, getBundleForRun } = useEvidenceBundles();
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBundle = async () => {
    setLoading(true);
    setError(null);

    try {
      let result: EvidenceBundle | null = null;

      if (executiveRunId) {
        result = await getBundleForRun(executiveRunId, 'executive');
      } else if (agentRunId) {
        result = await getBundleForRun(agentRunId, 'agent');
      }

      setBundle(result);
    } catch (err) {
      console.error('Error loading evidence bundle:', err);
      setError('Erreur lors du chargement des preuves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (executiveRunId || agentRunId) {
      loadBundle();
    } else {
      setLoading(false);
    }
  }, [executiveRunId, agentRunId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadBundle} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bundle) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucun Evidence Bundle</p>
            <p className="text-sm mt-1">
              Les preuves et justifications seront ajoutées lors de l'exécution
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <EvidenceBundleCard bundle={bundle} defaultExpanded={defaultExpanded} />;
}

// List view for multiple bundles
interface EvidenceBundleListProps {
  bundles: EvidenceBundle[];
  loading?: boolean;
  emptyMessage?: string;
}

export function EvidenceBundleList({ 
  bundles, 
  loading = false,
  emptyMessage = "Aucun Evidence Bundle disponible"
}: EvidenceBundleListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bundles.map((bundle) => (
        <EvidenceBundleCard key={bundle.id} bundle={bundle} />
      ))}
    </div>
  );
}
