# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Growth OS, please send an email to security@growthOS.io. All security vulnerabilities will be promptly addressed.

**Please do NOT create public GitHub issues for security vulnerabilities.**

## Security Best Practices

### Environment Variables & Secrets

This project follows industry best practices for secret management:

1. **No Private Keys in Code**: All private API keys and secrets are stored securely in Lovable Cloud's encrypted secret store, NOT in the codebase.

2. **`.env` Contains Only Public Keys**: The `.env` file only contains publishable keys that are safe to expose:
   - `VITE_SUPABASE_URL` - Public Supabase endpoint
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key (designed to be public)
   - `VITE_SUPABASE_PROJECT_ID` - Project identifier

3. **Secret Storage**: Private secrets are stored in Lovable Cloud and accessed only by Edge Functions:
   - Stripe API keys
   - Google OAuth credentials
   - Meta API credentials
   - ElevenLabs API keys
   - Perplexity API keys
   - Token encryption keys

### Edge Function Security

All Edge Functions implement:
- JWT validation for authenticated endpoints
- CORS headers for web app access
- Input sanitization and validation
- Error handling without leaking sensitive information

### Database Security

- Row Level Security (RLS) is enabled on all tables
- Policies enforce workspace isolation
- Audit logging tracks all data modifications
- No raw SQL execution from Edge Functions

### Authentication

- Email verification required (no auto-confirm)
- Session management with secure tokens
- OAuth 2.0 for third-party integrations
- Permission-based access control (RBAC)

## Deployment Security Checklist

Before deploying to production:

- [ ] Verify all secrets are stored in Lovable Cloud, not in code
- [ ] Run the Lovable security scan (`security--run_security_scan`)
- [ ] Review RLS policies for all tables
- [ ] Test authentication flows
- [ ] Verify Edge Function permissions
- [ ] Enable audit logging
- [ ] Configure webhook signature verification

## Data Protection

- All data is encrypted at rest and in transit
- GDPR-compliant data export available (`/dashboard/gdpr-export`)
- Data retention policies configurable per workspace
- Consent management for third-party integrations

## Contact

For security concerns: security@growthOS.io
For general support: support@growthOS.io
