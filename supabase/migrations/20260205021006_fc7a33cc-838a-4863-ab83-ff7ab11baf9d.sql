-- Move uuid-ossp extension to dedicated extensions schema
-- This fixes security warning: extension_in_public

-- First ensure extensions schema exists (already created in previous migration)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to appropriate roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop and recreate uuid-ossp in extensions schema
-- Note: This is safe as gen_random_uuid() is the preferred function and it's built into Postgres
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Verify all tables use gen_random_uuid() (native) instead of uuid_generate_v4()
-- This is already the case in our schema, so no changes needed