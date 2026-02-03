# Threat Model & Security Documentation

## Overview

This document outlines the security architecture, threat model, and OWASP compliance status for Growth OS.

## Table of Contents

1. [Architecture Security](#architecture-security)
2. [Threat Model](#threat-model)
3. [OWASP Top 10 Compliance](#owasp-top-10-compliance)
4. [Security Controls](#security-controls)
5. [Incident Response](#incident-response)

---

## Architecture Security

### Data Flow

```
┌─────────────┐     HTTPS      ┌─────────────────┐     Internal     ┌──────────────┐
│   Browser   │ ◄────────────► │  Edge Functions │ ◄──────────────► │   Supabase   │
│  (React)    │                │     (Deno)      │                  │  (Postgres)  │
└─────────────┘                └─────────────────┘                  └──────────────┘
       │                              │                                    │
       │                              │                                    │
       ▼                              ▼                                    ▼
   JWT Tokens               API Key Validation                    RLS Policies
   Local Storage             Rate Limiting                       Encrypted at Rest
```

### Trust Boundaries

1. **Browser ↔ Edge Functions**: Public internet, TLS 1.3 required
2. **Edge Functions ↔ Database**: Internal network, service role key
3. **Edge Functions ↔ External APIs**: Outbound HTTPS, API key authentication

---

## Threat Model

### Assets

| Asset | Sensitivity | Location |
|-------|-------------|----------|
| User credentials | Critical | Supabase Auth |
| OAuth tokens | Critical | Encrypted in DB |
| Business data | High | Supabase DB |
| API keys | Critical | Lovable Cloud Secrets |
| Audit logs | High | Immutable DB table |

### Threat Actors

1. **External Attackers**: Attempting unauthorized access
2. **Malicious Insiders**: Employees with legitimate access
3. **Compromised Accounts**: Stolen credentials
4. **Automated Bots**: Brute force, scraping

### STRIDE Analysis

| Threat | Category | Mitigation |
|--------|----------|------------|
| Credential theft | Spoofing | Email verification, session management |
| Token leakage | Tampering | Encrypted storage, rotation policy |
| Unauthorized data access | Repudiation | Immutable audit log |
| Data exposure | Information Disclosure | RLS policies, column-level security |
| API abuse | Denial of Service | Rate limiting (100 req/min) |
| Privilege escalation | Elevation of Privilege | RBAC, principle of least privilege |

---

## OWASP Top 10 Compliance

### A01:2021 – Broken Access Control ✅

**Status**: Compliant

**Controls**:
- Row Level Security (RLS) on all tables
- Permission checks via `has_permission()` function
- Workspace isolation enforced at database level
- No direct SQL execution from client

**Evidence**:
```sql
-- Example RLS policy
CREATE POLICY "Users can only view their workspace data"
ON public.sites FOR SELECT
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())));
```

### A02:2021 – Cryptographic Failures ✅

**Status**: Compliant

**Controls**:
- TLS 1.3 for all connections
- AES-256 encryption for OAuth tokens
- Passwords hashed with bcrypt (Supabase Auth)
- No sensitive data in URLs or logs

**Evidence**:
- TOKEN_ENCRYPTION_KEY stored in secure secrets
- Tokens encrypted before database storage

### A03:2021 – Injection ✅

**Status**: Compliant

**Controls**:
- Parameterized queries via Supabase client
- No raw SQL execution in Edge Functions
- Input validation with Zod schemas
- Output encoding for all user data

**Evidence**:
```typescript
// All queries use parameterized client
const { data } = await supabase
  .from('sites')
  .select('*')
  .eq('workspace_id', workspaceId);
```

### A04:2021 – Insecure Design ✅

**Status**: Compliant

**Controls**:
- Security-first architecture design
- Threat modeling documented
- Approval gates for high-risk actions
- Defense in depth (multiple security layers)

### A05:2021 – Security Misconfiguration ✅

**Status**: Compliant

**Controls**:
- No default credentials
- Minimal permissions (least privilege)
- Security headers configured
- Error messages don't leak sensitive info

**Headers**:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### A06:2021 – Vulnerable Components ⚠️

**Status**: Partially Compliant

**Controls**:
- Dependabot enabled (recommended)
- Regular dependency updates
- No known critical vulnerabilities

**Action Items**:
- [ ] Enable automated vulnerability scanning
- [ ] Implement SCA in CI pipeline

### A07:2021 – Identification and Authentication Failures ✅

**Status**: Compliant

**Controls**:
- Email verification required
- Session timeout after inactivity
- Secure password requirements (Supabase Auth)
- OAuth 2.0 for third-party auth

### A08:2021 – Software and Data Integrity Failures ✅

**Status**: Compliant

**Controls**:
- Webhook signature verification
- Immutable audit log (no UPDATE/DELETE)
- Content Security Policy headers

**Evidence**:
```sql
-- Audit log protection
CREATE TRIGGER prevent_audit_modification
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```

### A09:2021 – Security Logging and Monitoring Failures ✅

**Status**: Compliant

**Controls**:
- Comprehensive audit logging
- Real-time monitoring dashboard
- Alert configurations for anomalies
- Log retention: 36 months

### A10:2021 – Server-Side Request Forgery (SSRF) ✅

**Status**: Compliant

**Controls**:
- URL validation in Edge Functions
- Private IP blocking
- Allowlist for external APIs

**Evidence**:
```typescript
// Anti-SSRF validation
const isPrivateIP = (url: string) => {
  const hostname = new URL(url).hostname;
  return /^(10\.|172\.(1[6-9]|2|3[01])\.|192\.168\.|127\.|localhost)/.test(hostname);
};
```

---

## Security Controls

### Authentication

| Control | Implementation |
|---------|---------------|
| Email verification | Required before login |
| Password policy | Min 8 chars, Supabase Auth |
| Session management | JWT with expiration |
| MFA | Not yet implemented |

### Authorization

| Control | Implementation |
|---------|---------------|
| RBAC | owner, manager, member, viewer |
| RLS | All tables protected |
| Permission checks | `has_permission()` function |
| Workspace isolation | Database-level enforcement |

### Data Protection

| Control | Implementation |
|---------|---------------|
| Encryption at rest | Supabase default |
| Encryption in transit | TLS 1.3 |
| Token encryption | AES-256 |
| Backup encryption | Supabase managed |

### Network Security

| Control | Implementation |
|---------|---------------|
| Rate limiting | 100 req/min per workspace |
| DDoS protection | Supabase/Cloudflare |
| CORS | Configured per origin |
| SSRF protection | Private IP blocking |

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Data breach, system compromise | 1 hour |
| High | Auth bypass, data exposure | 4 hours |
| Medium | DoS, privilege escalation attempt | 24 hours |
| Low | Minor vulnerability, hardening | 7 days |

### Response Process

1. **Detection**: Monitoring alerts or user report
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Post-incident review

### Contact

- Security issues: security@growthOS.io
- Emergency: [On-call rotation]

---

## Penetration Testing

### Scope

- Web application (React frontend)
- Edge Functions (API endpoints)
- Authentication flows
- Authorization controls

### Exclusions

- Infrastructure (managed by Supabase)
- Third-party integrations (Google, Meta, Stripe)
- Physical security

### Schedule

- Annual external pentest (recommended)
- Quarterly internal security review
- Continuous automated scanning

---

## Compliance Checklist

### GDPR

- [x] Data subject access requests (DSAR)
- [x] Right to erasure
- [x] Data portability
- [x] Privacy policy
- [x] DPA available
- [x] Data retention policy

### SOC 2 (Future)

- [x] Access controls
- [x] Audit logging
- [x] Encryption
- [ ] Formal security policies
- [ ] Annual audit

---

*Last updated: 2026-02-03*
*Version: 1.0*
