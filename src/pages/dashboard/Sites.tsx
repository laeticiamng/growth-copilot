import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Globe, 
  Plus, 
  Pencil, 
  Trash2, 
  Check,
  MapPin,
  Target,
  Loader2,
} from "lucide-react";
import { useSites, Site } from "@/hooks/useSites";
import { toast } from "sonner";

const sectors = [
  "E-commerce", "SaaS / Tech", "Agence / Services", "Restaurant / Local",
  "Immobilier", "Santé", "Formation", "Autre"
];

const Sites = () => {
  const { t } = useTranslation();
  const { sites, currentSite, setCurrentSite, createSite, updateSite, deleteSite, loading } = useSites();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    name: "",
    sector: "",
    geographic_zone: "",
    language: "fr",
    business_type: "",
  });

  const resetForm = () => {
    setFormData({
      url: "",
      name: "",
      sector: "",
      geographic_zone: "",
      language: "fr",
      business_type: "",
    });
  };

  // Normalize URL to ensure it has a protocol
  const normalizeUrl = (url: string): string => {
    url = url.trim();
    if (!url) return url;
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleCreate = async () => {
    if (!formData.url) {
      toast.error(t("common.error"), { description: "URL requise" });
      return;
    }

    const normalizedUrl = normalizeUrl(formData.url);
    
    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      toast.error(t("common.error"), { description: "URL invalide" });
      return;
    }

    setIsSubmitting(true);
    const { error, site } = await createSite({ ...formData, url: normalizedUrl });
    setIsSubmitting(false);

    if (error) {
      toast.error(t("common.error"), { description: error.message });
    } else {
      toast.success(t("dashboard.sites.title"), { description: `${site?.name || site?.url} ajouté avec succès.` });
      setIsCreateOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!editingSite) return;

    setIsSubmitting(true);
    const { error } = await updateSite(editingSite.id, formData);
    setIsSubmitting(false);

    if (error) {
      toast.error(t("common.error"), { description: error.message });
    } else {
      toast.success(t("common.save"));
      setIsEditOpen(false);
      setEditingSite(null);
      resetForm();
    }
  };

  const handleDelete = async (siteId: string) => {
    const { error } = await deleteSite(siteId);
    if (error) {
      toast.error(t("common.error"), { description: error.message });
    } else {
      toast.success(t("common.delete"));
    }
  };

  const openEditDialog = (site: Site) => {
    setEditingSite(site);
    setFormData({
      url: site.url,
      name: site.name || "",
      sector: site.sector || "",
      geographic_zone: site.geographic_zone || "",
      language: site.language || "fr",
      business_type: site.business_type || "",
    });
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.sites.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.sites.addSite")}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un site</DialogTitle>
              <DialogDescription>
                Entrez les informations de votre site pour commencer l'optimisation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">URL du site *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du site</Label>
                <Input
                  id="name"
                  placeholder="Mon Site"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sector">Secteur</Label>
                  <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="business_type">Type</Label>
                  <Select value={formData.business_type} onValueChange={(v) => setFormData({ ...formData, business_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="geographic_zone">Zone géographique</Label>
                  <Input
                    id="geographic_zone"
                    placeholder="France, Paris..."
                    value={formData.geographic_zone}
                    onChange={(e) => setFormData({ ...formData, geographic_zone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                      <SelectItem value="de">Allemand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
              <Button type="button" onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <Card variant="elevated" className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun site</h3>
            <p className="text-muted-foreground mb-4">
              Ajoutez votre premier site pour commencer l'optimisation.
            </p>
            <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card 
              key={site.id} 
              variant={currentSite?.id === site.id ? "gradient" : "feature"}
              className="cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => setCurrentSite(site)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentSite?.id === site.id ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {site.name || (() => {
                          try { return new URL(site.url).hostname; } 
                          catch { return site.url; }
                        })()}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{site.url}</p>
                    </div>
                  </div>
                  {currentSite?.id === site.id && (
                    <Badge variant="success" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Actif
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {site.sector && <Badge variant="secondary">{site.sector}</Badge>}
                  {site.geographic_zone && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {site.geographic_zone}
                    </Badge>
                  )}
                  {site.business_type && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-3 h-3 mr-1" />
                      {site.business_type}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(site)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce site ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Toutes les données associées seront supprimées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(site.id)} className="bg-destructive text-destructive-foreground">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le site</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-url">URL du site</Label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom du site</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Secteur</Label>
                <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={formData.business_type} onValueChange={(v) => setFormData({ ...formData, business_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Zone géographique</Label>
                <Input
                  value={formData.geographic_zone}
                  onChange={(e) => setFormData({ ...formData, geographic_zone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Langue</Label>
                <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="es">Espagnol</SelectItem>
                    <SelectItem value="de">Allemand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
            <Button type="button" onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sites;
