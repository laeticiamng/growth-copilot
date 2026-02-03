import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuditLog } from '@/hooks/useAuditLog';
import { usePagination, getPaginationProps } from '@/hooks/usePagination';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function AuditLogPage() {
  const { 
    entries, 
    incidents, 
    loading, 
    filters, 
    setFilters, 
    fetchMore, 
    hasMore,
    resolveIncident,
    exportAuditPack,
    refetch 
  } = useAuditLog();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<typeof entries[0] | null>(null);

  // Get unique entity types and actions for filters
  const entityTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.entity_type));
    return Array.from(types).sort();
  }, [entries]);

  const actionTypes = useMemo(() => {
    const actions = new Set(entries.map(e => e.action));
    return Array.from(actions).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.entity_id && entry.entity_id.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEntityType = entityTypeFilter === 'all' || entry.entity_type === entityTypeFilter;
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
      
      return matchesSearch && matchesEntityType && matchesAction;
    });
  }, [entries, searchTerm, entityTypeFilter, actionFilter]);

  // Pagination
  const pagination = usePagination(filteredEntries, { initialPageSize: 25 });

  // Export to JSON
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await exportAuditPack(
        entityTypeFilter !== 'all' ? entityTypeFilter : undefined
      );
      
      if (error || !data) {
        console.error('Export failed:', error);
        return;
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Get badge for action type
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Création</Badge>;
      case 'update':
        return <Badge variant="secondary" className="gap-1"><RefreshCw className="w-3 h-3" />Modification</Badge>;
      case 'delete':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Suppression</Badge>;
      case 'approve':
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Approbation</Badge>;
      case 'reject':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejet</Badge>;
      case 'login':
        return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" />Connexion</Badge>;
      case 'logout':
        return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" />Déconnexion</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Get icon for actor type
  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'agent':
        return <Bot className="w-4 h-4 text-primary" aria-label="Agent IA" />;
      case 'system':
        return <Shield className="w-4 h-4 text-muted-foreground" aria-label="Système" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" aria-label="Utilisateur" />;
    }
  };

  // Count stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEntries = entries.filter(e => new Date(e.created_at) >= today);
    const agentActions = entries.filter(e => e.actor_type === 'agent');
    const userActions = entries.filter(e => e.actor_type === 'user');
    
    return {
      total: entries.length,
      today: todayEntries.length,
      byAgent: agentActions.length,
      byUser: userActions.length,
      unresolvedIncidents: incidents.filter(i => !i.is_resolved).length,
    };
  }, [entries, incidents]);

  return (
    <PermissionGuard 
      permission="view_audit" 
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Accès réservé aux gestionnaires et administrateurs
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Journal d'Audit
            </h1>
            <p className="text-muted-foreground">
              Historique immuable de toutes les actions sur la plateforme
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={loading}
              aria-label="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleExport}
              disabled={exporting || entries.length === 0}
              aria-label="Exporter en JSON"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Entrées totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Clock className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Bot className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byAgent}</p>
                  <p className="text-xs text-muted-foreground">Par agents IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.byUser}</p>
                  <p className="text-xs text-muted-foreground">Par utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stats.unresolvedIncidents > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                  <AlertTriangle className={`w-5 h-5 ${stats.unresolvedIncidents > 0 ? 'text-destructive' : 'text-success'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unresolvedIncidents}</p>
                  <p className="text-xs text-muted-foreground">Incidents ouverts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4" role="search" aria-label="Filtres du journal d'audit">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Recherche dans le journal"
                  />
                </div>
              </div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-[180px]" aria-label="Filtrer par type d'entité">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type d'entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]" aria-label="Filtrer par action">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Entrées d'audit
            </CardTitle>
            <CardDescription>
              {filteredEntries.length} entrée(s) correspondant aux critères
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune entrée d'audit trouvée</p>
                <p className="text-sm">Les actions seront enregistrées ici automatiquement</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ScrollArea className="h-[500px]">
                  <table className="w-full" role="table" aria-label="Journal d'audit">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr>
                        <th className="text-left p-3 font-medium" scope="col">Date</th>
                        <th className="text-left p-3 font-medium" scope="col">Acteur</th>
                        <th className="text-left p-3 font-medium" scope="col">Entité</th>
                        <th className="text-left p-3 font-medium" scope="col">Action</th>
                        <th className="text-left p-3 font-medium" scope="col">Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagination.paginatedData.map((entry) => (
                        <tr 
                          key={entry.id} 
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 text-sm">
                            <div className="flex flex-col">
                              <span>{format(new Date(entry.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.created_at), 'HH:mm:ss')}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getActorIcon(entry.actor_type)}
                              <span className="text-sm capitalize">{entry.actor_type}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <Badge variant="outline" className="w-fit">{entry.entity_type}</Badge>
                              {entry.entity_id && (
                                <span className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-[150px]">
                                  {entry.entity_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {getActionBadge(entry.action)}
                          </td>
                          <td className="p-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedEntry(entry)}
                                  aria-label="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Détails de l'entrée d'audit
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedEntry && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">ID</p>
                                        <p className="font-mono text-sm">{selectedEntry.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                                        <p>{format(new Date(selectedEntry.created_at), 'dd MMM yyyy HH:mm:ss', { locale: fr })}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Acteur</p>
                                        <div className="flex items-center gap-2">
                                          {getActorIcon(selectedEntry.actor_type)}
                                          <span className="capitalize">{selectedEntry.actor_type}</span>
                                          {selectedEntry.actor_id && (
                                            <span className="text-xs text-muted-foreground font-mono">
                                              ({selectedEntry.actor_id.slice(0, 8)}...)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Action</p>
                                        {getActionBadge(selectedEntry.action)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Type d'entité</p>
                                        <Badge variant="outline">{selectedEntry.entity_type}</Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">ID Entité</p>
                                        <p className="font-mono text-sm">{selectedEntry.entity_id || '-'}</p>
                                      </div>
                                      {selectedEntry.ip_address && (
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Adresse IP</p>
                                          <p className="font-mono text-sm">{selectedEntry.ip_address}</p>
                                        </div>
                                      )}
                                      {selectedEntry.user_agent && (
                                        <div className="col-span-2">
                                          <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                                          <p className="text-xs text-muted-foreground truncate">{selectedEntry.user_agent}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {Object.keys(selectedEntry.changes || {}).length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Changements</p>
                                        <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-[200px]">
                                          {JSON.stringify(selectedEntry.changes, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    
                                    {Object.keys(selectedEntry.context || {}).length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Contexte</p>
                                        <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-[200px]">
                                          {JSON.stringify(selectedEntry.context, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
                
                <div className="flex items-center justify-between">
                  <DataTablePagination
                    {...getPaginationProps(pagination)}
                    pageSize={pagination.pageSize}
                    onPageSizeChange={pagination.setPageSize}
                  />
                  {hasMore && (
                    <Button variant="outline" onClick={fetchMore} disabled={loading}>
                      Charger plus
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incidents Section */}
        {incidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Incidents liés
              </CardTitle>
              <CardDescription>
                Problèmes détectés nécessitant une attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {incidents.map(incident => (
                    <div 
                      key={incident.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        incident.is_resolved ? 'bg-muted/50' : 'bg-destructive/5 border-destructive/20'
                      }`}
                    >
                      {incident.is_resolved ? (
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          incident.severity === 'critical' ? 'text-destructive' :
                          incident.severity === 'high' ? 'text-destructive/80' :
                          'text-warning'
                        }`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            incident.severity === 'critical' ? 'destructive' :
                            incident.severity === 'high' ? 'destructive' :
                            'secondary'
                          }>
                            {incident.severity}
                          </Badge>
                          <span className="text-sm font-medium">{incident.step}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{incident.reason}</p>
                        {incident.suggested_fix && (
                          <p className="text-xs text-primary mt-1">💡 {incident.suggested_fix}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </p>
                      </div>
                      {!incident.is_resolved && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resolveIncident(incident.id)}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
}
