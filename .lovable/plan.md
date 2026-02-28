

# Fix permissive RLS policy warning on contact_submissions

## Problem

The database linter flags one policy: `contact_submissions_public_insert` uses `WITH CHECK (true)`, allowing anonymous users to set ANY column value on insert -- including `status`, `resend_id`, and `replied_at` which should be server-controlled.

## Current state

- Table: `contact_submissions` (public contact form)
- Policy: `contact_submissions_public_insert` grants INSERT to `anon,authenticated` with no restrictions
- Rate limiting: A trigger (`check_contact_submission_rate_limit`) already limits 3 submissions/hour/email
- Other policies (SELECT, UPDATE, DELETE) are properly restricted to owner/admin roles

## Root cause

The `WITH CHECK (true)` is overly broad. While public INSERT is correct for a contact form, the check should enforce that submitters can only set user-facing fields and cannot manipulate internal fields.

## Fix

Replace the `WITH CHECK (true)` policy with a stricter one that validates:
- `status` must be `'new'` (prevent setting to 'replied' or other admin states)
- `resend_id` must be `NULL` (server-set after email dispatch)
- `replied_at` must be `NULL` (server-set when admin replies)

### SQL Migration

```sql
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "contact_submissions_public_insert" ON public.contact_submissions;

-- Create a tightened policy that restricts internal fields
CREATE POLICY "contact_submissions_public_insert"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND resend_id IS NULL
    AND replied_at IS NULL
  );
```

## Impact

- Public users can still submit contact forms normally (name, email, subject, message)
- They cannot manipulate server-controlled fields (status, resend_id, replied_at)
- The existing rate-limit trigger continues to work alongside this policy
- The linter warning will be resolved (no more `WITH CHECK (true)`)

## Non-regression

- Contact form submission still works for anonymous visitors
- Admin read/update/delete policies are unchanged
- Rate limiting trigger remains active
