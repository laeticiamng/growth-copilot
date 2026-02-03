# Self-Hosting Guide

This document describes how to deploy Growth OS outside of Lovable Cloud.

## Architecture Overview

Growth OS is built on:
- **Frontend**: React 18 + Vite + TailwindCSS + TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **AI Gateway**: Proxied through Lovable AI (requires migration for self-hosting)

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase CLI
- A Supabase project (self-hosted or cloud)
- API keys for integrations (Stripe, Meta, Google, etc.)

## Option 1: Supabase Cloud + Custom Frontend Host

### 1. Export the Database Schema

```bash
# From Lovable, export the current schema
supabase db dump --schema public > schema.sql
```

### 2. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Run the schema migration:

```bash
supabase db push
```

### 3. Deploy Edge Functions

```bash
cd supabase/functions
supabase functions deploy --project-ref YOUR_PROJECT_REF
```

### 4. Configure Secrets

In Supabase Dashboard → Settings → Edge Functions → Secrets:

```
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
META_APP_ID=...
META_APP_SECRET=...
OAUTH_STATE_SECRET=...
TOKEN_ENCRYPTION_KEY=...
ELEVENLABS_API_KEY=...
PERPLEXITY_API_KEY=...
FIRECRAWL_API_KEY=...
CREATOMATE_API_KEY=...
```

### 5. Build and Deploy Frontend

```bash
# Install dependencies
bun install

# Build for production
bun run build

# Deploy to your hosting provider (Vercel, Netlify, etc.)
```

Update environment variables in your hosting provider:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

## Option 2: Fully Self-Hosted Supabase

### 1. Deploy Supabase Self-Hosted

Follow the official guide: [Self-Hosting Supabase](https://supabase.com/docs/guides/self-hosting)

```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase

# Start with Docker
cd supabase/docker
cp .env.example .env
docker compose up -d
```

### 2. Configure for Growth OS

Update `.env` with your domain and keys:
```
SITE_URL=https://your-domain.com
JWT_SECRET=your-super-secret-jwt-key
ANON_KEY=...
SERVICE_ROLE_KEY=...
```

### 3. Apply Schema

```bash
# Run migrations
supabase db push --db-url postgresql://postgres:your-password@localhost:54322/postgres
```

### 4. Deploy Edge Functions

Edge Functions in self-hosted Supabase require Deno Deploy or a custom Deno server:

```bash
# Option A: Use Deno Deploy
deno deploy --project=your-project supabase/functions/*/index.ts

# Option B: Run locally with Deno
deno run --allow-net --allow-env supabase/functions/ai-gateway/index.ts
```

## AI Gateway Migration

The AI Gateway currently uses Lovable AI. For self-hosting, you need to:

### Option A: Use OpenAI/Anthropic Directly

1. Get API keys from OpenAI and/or Anthropic
2. Update `supabase/functions/ai-gateway/index.ts`:

```typescript
// Replace Lovable AI calls with direct API calls
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [...],
  })
});
```

### Option B: Use OpenRouter

OpenRouter provides access to multiple models with a single API:

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [...],
  })
});
```

## Docker Compose (Full Stack)

For a complete self-hosted deployment:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=http://supabase:8000
      - VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY}

  supabase:
    image: supabase/supabase
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - supabase-data:/var/lib/postgresql/data

  edge-functions:
    image: denoland/deno:1.40.0
    command: run --allow-all /app/index.ts
    volumes:
      - ./supabase/functions:/app
    environment:
      - SUPABASE_URL=http://supabase:8000
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

volumes:
  supabase-data:
```

## Caveats & Limitations

1. **Lovable AI**: Not available outside Lovable Cloud. Must migrate to direct OpenAI/Anthropic/OpenRouter.

2. **ElevenLabs Voice**: Requires your own ElevenLabs account and agent configuration.

3. **Stripe Integration**: Works identically, just update webhook endpoints.

4. **OAuth Flows**: Update redirect URLs in Google/Meta developer consoles.

5. **Storage**: Ensure your Supabase storage buckets are properly configured with RLS policies.

## Support

For self-hosting questions:
- Check [Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting)
- Join [Supabase Discord](https://discord.supabase.com)
- Open an issue on GitHub

## Security Considerations

When self-hosting:
- Use HTTPS everywhere
- Rotate secrets regularly
- Enable database backups
- Monitor Edge Function logs
- Set up error alerting (Sentry, etc.)
- Configure proper CORS policies
