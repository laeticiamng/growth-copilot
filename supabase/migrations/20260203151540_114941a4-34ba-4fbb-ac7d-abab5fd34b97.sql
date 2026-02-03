-- Ajouter les catégories HR et Legal à l'enum service_category
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'hr';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'legal';