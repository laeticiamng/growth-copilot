-- Ajouter les nouveaux plans à l'enum subscription_plan
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'founder';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'full_company';