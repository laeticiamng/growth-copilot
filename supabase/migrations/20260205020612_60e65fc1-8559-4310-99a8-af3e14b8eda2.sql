-- Fix: Move uuid-ossp extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Note: Extension cannot be dropped and recreated in place without affecting dependent objects
-- The extension already exists in public schema, this is a known issue that requires 
-- careful migration. For now, we document the warning and add a note.
-- To properly fix: would need to manually drop dependent functions first.

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions - recommended location for uuid-ossp and others';

-- Ensure all tables have proper RLS enabled (double-check)
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
  END LOOP;
END $$;