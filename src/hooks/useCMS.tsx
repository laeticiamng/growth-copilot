/**
 * CMS Hook - Pages, Media, and Publication Workflow
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

// ===== TYPES =====
export type PageStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type PageType = 'page' | 'landing' | 'article' | 'template';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface CMSPage {
  id: string;
  workspace_id: string;
  site_id?: string;
  title: string;
  slug: string;
  content: any[];
  excerpt?: string;
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  status: PageStatus;
  published_at?: string;
  published_by?: string;
  version: number;
  parent_version_id?: string;
  page_type: PageType;
  template_id?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CMSMedia {
  id: string;
  workspace_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  folder: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  uploaded_by?: string;
}

export interface CMSReview {
  id: string;
  workspace_id: string;
  page_id: string;
  status: ReviewStatus;
  reviewer_id?: string;
  comment?: string;
  changes_requested: any[];
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
}

// ===== HOOK =====
export function useCMS() {
  const { currentWorkspace: workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState('/');

  // ========== PAGES ==========
  
  const { data: pages = [], isLoading: pagesLoading, refetch: refetchPages } = useQuery({
    queryKey: ['cms-pages', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as CMSPage[];
    },
    enabled: !!workspace?.id,
  });

  const createPage = useMutation({
    mutationFn: async (page: Partial<CMSPage>) => {
      if (!workspace?.id) throw new Error('No workspace');
      
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          workspace_id: workspace.id,
          title: page.title || 'Nouvelle page',
          slug: page.slug || generateSlug(page.title || 'nouvelle-page'),
          content: page.content || [],
          page_type: page.page_type || 'page',
          status: 'draft',
          created_by: user.user?.id,
          ...page,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      toast.success('Page créée');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CMSPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      toast.success('Page mise à jour');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      toast.success('Page supprimée');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const publishPage = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('cms_pages')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user.user?.id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      toast.success('Page publiée');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const submitForReview = useMutation({
    mutationFn: async (pageId: string) => {
      if (!workspace?.id) throw new Error('No workspace');
      
      // Update page status
      await supabase
        .from('cms_pages')
        .update({ status: 'in_review' })
        .eq('id', pageId);
      
      // Create review record
      const { data, error } = await supabase
        .from('cms_reviews')
        .insert({
          workspace_id: workspace.id,
          page_id: pageId,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-reviews'] });
      toast.success('Page soumise pour révision');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  // ========== MEDIA ==========
  
  const { data: media = [], isLoading: mediaLoading, refetch: refetchMedia } = useQuery({
    queryKey: ['cms-media', workspace?.id, selectedFolder],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      let query = supabase
        .from('cms_media')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (selectedFolder !== '/') {
        query = query.eq('folder', selectedFolder);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CMSMedia[];
    },
    enabled: !!workspace?.id,
  });

  const uploadMedia = useCallback(async (file: File, folder = '/') => {
    if (!workspace?.id) throw new Error('No workspace');
    
    const { data: user } = await supabase.auth.getUser();
    
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${workspace.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('cms-media')
      .upload(filename, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cms-media')
      .getPublicUrl(filename);
    
    // Get image dimensions if image
    let width, height;
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(file);
      });
      width = dimensions.width;
      height = dimensions.height;
    }
    
    // Save to database
    const { data, error } = await supabase
      .from('cms_media')
      .insert({
        workspace_id: workspace.id,
        filename,
        original_filename: file.name,
        file_path: filename,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        folder,
        uploaded_by: user.user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['cms-media'] });
    toast.success('Fichier uploadé');
    
    return data as CMSMedia;
  }, [workspace?.id, queryClient]);

  const deleteMedia = useMutation({
    mutationFn: async (media: CMSMedia) => {
      // Delete from storage
      await supabase.storage
        .from('cms-media')
        .remove([media.file_path]);
      
      // Delete from database
      const { error } = await supabase
        .from('cms_media')
        .delete()
        .eq('id', media.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
      toast.success('Fichier supprimé');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const updateMedia = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CMSMedia> & { id: string }) => {
      const { data, error } = await supabase
        .from('cms_media')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
      toast.success('Média mis à jour');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  // ========== REVIEWS (Workflow) ==========
  
  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['cms-reviews', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('cms_reviews')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as CMSReview[];
    },
    enabled: !!workspace?.id,
  });

  const approveReview = useMutation({
    mutationFn: async ({ reviewId, pageId }: { reviewId: string; pageId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Update review
      await supabase
        .from('cms_reviews')
        .update({
          status: 'approved',
          reviewer_id: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reviewId);
      
      // Update page status
      const { data, error } = await supabase
        .from('cms_pages')
        .update({ status: 'approved' })
        .eq('id', pageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-reviews'] });
      toast.success('Révision approuvée');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const rejectReview = useMutation({
    mutationFn: async ({ reviewId, pageId, comment }: { reviewId: string; pageId: string; comment?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Update review
      await supabase
        .from('cms_reviews')
        .update({
          status: 'rejected',
          reviewer_id: user.user?.id,
          reviewed_at: new Date().toISOString(),
          comment,
        })
        .eq('id', reviewId);
      
      // Update page status back to draft
      const { data, error } = await supabase
        .from('cms_pages')
        .update({ status: 'draft' })
        .eq('id', pageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['cms-reviews'] });
      toast.success('Révision rejetée');
    },
    onError: (err: Error) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  return {
    // Pages
    pages,
    pagesLoading,
    refetchPages,
    createPage,
    updatePage,
    deletePage,
    publishPage,
    submitForReview,
    
    // Media
    media,
    mediaLoading,
    refetchMedia,
    uploadMedia,
    deleteMedia,
    updateMedia,
    selectedFolder,
    setSelectedFolder,
    
    // Reviews
    reviews,
    reviewsLoading,
    refetchReviews,
    approveReview,
    rejectReview,
  };
}

// ===== HELPERS =====
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}
