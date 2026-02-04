-- Ajouter le tier "founder" pour les propriétaires de la plateforme
ALTER TABLE workspace_quotas DROP CONSTRAINT workspace_quotas_plan_tier_check;
ALTER TABLE workspace_quotas ADD CONSTRAINT workspace_quotas_plan_tier_check 
  CHECK (plan_tier IN ('free', 'starter', 'growth', 'agency', 'founder', 'full_company'));

-- Ajouter le tier "full_company" au plan_limits dans ai-gateway
-- Note: Cette contrainte permet les 3 abonnements + founder

-- Créer la table de mapping des abonnements Stripe si elle n'existe pas déjà avec les bonnes colonnes
-- (workspace_subscriptions existe déjà d'après le schéma)