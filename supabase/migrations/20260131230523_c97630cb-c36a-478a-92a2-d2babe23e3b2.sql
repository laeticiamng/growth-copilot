-- =============================================
-- V2 ENTERPRISE UPGRADE - PART 1: ENUMS ONLY
-- =============================================

-- 1) EXTENDED ROLES ENUM
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analyst';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

-- 2) PERMISSIONS ENUM
CREATE TYPE public.permission_action AS ENUM (
  'run_agents',
  'approve_actions',
  'connect_integrations', 
  'export_assets',
  'manage_billing',
  'manage_team',
  'view_analytics',
  'manage_policies',
  'manage_experiments',
  'view_audit'
);

-- 3) RISK LEVEL ENUM
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 4) EXPERIMENT STATUS ENUM
CREATE TYPE public.experiment_status AS ENUM ('draft', 'running', 'paused', 'completed', 'archived');