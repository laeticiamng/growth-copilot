/**
 * CMS Dashboard - Pages, Media Library, and Workflow
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Image, GitBranch, Plus, Search,
  MoreHorizontal, Trash2, Eye, Edit, Send,
  CheckCircle, XCircle, Clock, Filter,
  FolderOpen, Upload, Tag, Download, Save, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCMS, type CMSPage, type CMSMedia, type PageStatus, type PageType } from '@/hooks/useCMS';

const STATUS_CONFIG: Record<PageStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Brouillon', color: 'bg-muted text-muted-foreground', icon: <Edit className="h-3 w-3" /> },
  in_review: { label: 'En révision', color: 'bg-yellow-500/20 text-yellow-600', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approuvé', color: 'bg-blue-500/20 text-blue-600', icon: <CheckCircle className="h-3 w-3" /> },
  published: { label: 'Publié', color: 'bg-green-500/20 text-green-600', icon: <CheckCircle className="h-3 w-3" /> },
  archived: { label: 'Archivé', color: 'bg-gray-500/20 text-gray-600', icon: <XCircle className="h-3 w-3" /> },
};

const PAGE_TYPES: Record<PageType, string> = {
  page: 'Page',
  landing: 'Landing Page',
  article: 'Article',
  template: 'Template',
};

export default function CMS() {
  const { t } = useTranslation();
  const {
    pages, pagesLoading, createPage, updatePage, deletePage, publishPage, submitForReview,
    media, mediaLoading, uploadMedia, deleteMedia, updateMedia, selectedFolder, setSelectedFolder,
    reviews, reviewsLoading, approveReview, rejectReview,
  } = useCMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [newPage, setNewPage] = useState({ title: '', slug: '', page_type: 'page' as PageType });
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, selectedFolder);
      }
      setIsUploadDialogOpen(false);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle page creation
  const handleCreatePage = async () => {
    await createPage.mutateAsync({
      title: newPage.title,
      slug: newPage.slug || undefined,
      page_type: newPage.page_type,
    });
    setNewPage({ title: '', slug: '', page_type: 'page' });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CMS</h1>
          <p className="text-muted-foreground">Gérez vos pages, médias et workflow de publication</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages ({pages.length})
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <Image className="h-4 w-4" />
            Médias ({media.length})
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Workflow ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* PAGES TAB */}
        <TabsContent value="pages" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PageStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une page</DialogTitle>
                  <DialogDescription>Ajoutez une nouvelle page à votre CMS</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input
                      value={newPage.title}
                      onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                      placeholder="Ma nouvelle page"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (optionnel)</Label>
                    <Input
                      value={newPage.slug}
                      onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                      placeholder="ma-nouvelle-page"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newPage.page_type} onValueChange={(v) => setNewPage({ ...newPage, page_type: v as PageType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAGE_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                  <Button onClick={handleCreatePage} disabled={!newPage.title || createPage.isPending}>
                    {createPage.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pages Grid */}
          {pagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucune page</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ? 'Aucune page ne correspond à votre recherche' : 'Créez votre première page'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une page
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  onEdit={() => setEditingPage(page)}
                  onDelete={() => deletePage.mutate(page.id)}
                  onPublish={() => publishPage.mutate(page.id)}
                  onSubmitReview={() => submitForReview.mutate(page.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* MEDIA TAB */}
        <TabsContent value="media" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un fichier..." className="pl-9" />
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Uploader des fichiers</DialogTitle>
                  <DialogDescription>Glissez-déposez ou sélectionnez des fichiers</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Images, PDF, vidéos (max 10MB)
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/mp4,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Media Grid */}
          {mediaLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Aucun média</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Uploadez des images, vidéos ou documents
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onDelete={() => deleteMedia.mutate(item)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* WORKFLOW TAB */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Révisions en attente</CardTitle>
              <CardDescription>Pages en attente d'approbation</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Aucune révision en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const page = pages.find(p => p.id === review.page_id);
                    if (!page) return null;
                    
                    return (
                      <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{page.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Soumis le {new Date(review.submitted_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectReview.mutate({ reviewId: review.id, pageId: page.id })}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveReview.mutate({ reviewId: review.id, pageId: page.id })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page Editor Dialog */}
      {editingPage && (
        <PageEditorDialog
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={async (updates) => {
            await updatePage.mutateAsync({ id: editingPage.id, ...updates });
            setEditingPage(null);
          }}
          isSaving={updatePage.isPending}
        />
      )}
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function PageCard({ 
  page, 
  onEdit, 
  onDelete, 
  onPublish,
  onSubmitReview 
}: { 
  page: CMSPage; 
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onSubmitReview: () => void;
}) {
  const status = STATUS_CONFIG[page.status];
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base truncate">{page.title}</CardTitle>
            <p className="text-xs text-muted-foreground truncate">/{page.slug}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {page.status === 'draft' && (
                <DropdownMenuItem onClick={onSubmitReview}>
                  <Send className="h-4 w-4 mr-2" />
                  Soumettre pour révision
                </DropdownMenuItem>
              )}
              {(page.status === 'approved' || page.status === 'draft') && (
                <DropdownMenuItem onClick={onPublish}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publier
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge className={status.color} variant="secondary">
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {PAGE_TYPES[page.page_type]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Modifié le {new Date(page.updated_at).toLocaleDateString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  );
}

function PageEditorDialog({
  page,
  onClose,
  onSave,
  isSaving,
}: {
  page: CMSPage;
  onClose: () => void;
  onSave: (updates: Partial<CMSPage>) => Promise<void>;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [excerpt, setExcerpt] = useState(page.excerpt || '');
  const [metaTitle, setMetaTitle] = useState(page.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(page.meta_description || '');
  const [bodyContent, setBodyContent] = useState(
    Array.isArray(page.content) && page.content.length > 0
      ? page.content.map((b: any) => b.text || '').join('\n\n')
      : ''
  );

  const handleSave = async () => {
    const contentBlocks = bodyContent
      .split('\n\n')
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', text }));

    await onSave({
      title,
      slug,
      excerpt: excerpt || undefined,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      content: contentBlocks,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la page</DialogTitle>
          <DialogDescription>
            Modifiez le contenu et les métadonnées de votre page
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la page" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-de-la-page" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Extrait</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Résumé court de la page..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Contenu</Label>
            <Textarea
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
              placeholder="Rédigez le contenu de votre page... (séparez les paragraphes par une ligne vide)"
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">SEO & Métadonnées</h4>
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Titre pour les moteurs de recherche" />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Description pour les moteurs de recherche (max 160 caractères)"
                rows={2}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={!title || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({ media, onDelete }: { media: CMSMedia; onDelete: () => void }) {
  const isImage = media.mime_type.startsWith('image/');
  const isVideo = media.mime_type.startsWith('video/');
  const isPdf = media.mime_type === 'application/pdf';
  
  return (
    <div className="group relative aspect-square bg-muted rounded-lg overflow-hidden">
      {isImage ? (
        <img
          src={media.file_url}
          alt={media.alt_text || media.original_filename}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isVideo ? (
            <FileText className="h-8 w-8 text-muted-foreground" />
          ) : isPdf ? (
            <FileText className="h-8 w-8 text-destructive" />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button size="icon" variant="secondary" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Filename */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
        <p className="text-xs text-white truncate">{media.original_filename}</p>
      </div>
    </div>
  );
}
