-- Add active to the integration_status enum
ALTER TYPE integration_status ADD VALUE IF NOT EXISTS 'active';