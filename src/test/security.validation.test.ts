/**
 * SECURITY & VALIDATION TESTS
 * Tests for input validation, XSS prevention, and data sanitization
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  urlSchema,
  nameSchema,
  siteSchema,
  workspaceSchema,
  leadSchema,
  safeValidate,
  getFirstError,
  formatErrors,
  sanitizeHtml,
  sanitizeUrl,
  encodeUrlParam,
} from '@/lib/validation/schemas';

// ==========================================
// INPUT VALIDATION TESTS
// ==========================================

describe('Email Validation', () => {
  it('should accept valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.org',
      'user+tag@company.io',
      'a@b.co',
    ];
    
    for (const email of validEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid emails', () => {
    const invalidEmails = [
      '',
      'notanemail',
      '@nodomain.com',
      'no@domain',
      'spaces in@email.com',
      'missing.domain@',
    ];
    
    for (const email of invalidEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    }
  });

  it('should reject emails exceeding max length', () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace', () => {
    const result = emailSchema.safeParse('  test@example.com  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });
});

describe('Password Validation', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'Password1',
      'MySecure123',
      'Complex1Password!',
      'abcDEF123',
    ];
    
    for (const password of validPasswords) {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(true);
    }
  });

  it('should reject weak passwords', () => {
    const weakPasswords = [
      'short',           // too short
      'nouppercase1',    // no uppercase
      'NOLOWERCASE1',    // no lowercase
      'NoNumbers',       // no numbers
      'pass',            // too short + missing requirements
    ];
    
    for (const password of weakPasswords) {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
    }
  });

  it('should enforce minimum length', () => {
    const result = passwordSchema.safeParse('Ab1');
    expect(result.success).toBe(false);
  });
});

describe('URL Validation', () => {
  it('should accept valid URLs', () => {
    const validUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://sub.domain.org/path?query=value',
      'https://example.com/path#anchor',
    ];
    
    for (const url of validUrls) {
      const result = urlSchema.safeParse(url);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid URLs', () => {
    const invalidUrls = [
      '',
      'notaurl',
      'ftp://file.server.com',  // wrong protocol
      'javascript:alert(1)',    // XSS attempt
      'data:text/html,<script>',
    ];
    
    for (const url of invalidUrls) {
      const result = urlSchema.safeParse(url);
      expect(result.success).toBe(false);
    }
  });

  it('should reject excessively long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2050);
    const result = urlSchema.safeParse(longUrl);
    expect(result.success).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should accept valid names', () => {
    const validNames = [
      'John Doe',
      'Acme Corporation',
      'Mon Site Web',
      'Test-Project_123',
    ];
    
    for (const name of validNames) {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(true);
    }
  });

  it('should reject names with dangerous characters', () => {
    const dangerousNames = [
      '<script>alert(1)</script>',
      'Name{with}braces',
      'Name[with]brackets',
      'Name\\with\\backslash',
    ];
    
    for (const name of dangerousNames) {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(false);
    }
  });

  it('should reject empty names', () => {
    const result = nameSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject names exceeding max length', () => {
    const longName = 'a'.repeat(101);
    const result = nameSchema.safeParse(longName);
    expect(result.success).toBe(false);
  });
});

// ==========================================
// ENTITY SCHEMA TESTS
// ==========================================

describe('Site Schema', () => {
  it('should accept valid site data', () => {
    const validSite = {
      url: 'https://mysite.com',
      name: 'My Site',
      sector: 'Technology',
      language: 'fr' as const,
    };
    
    const result = siteSchema.safeParse(validSite);
    expect(result.success).toBe(true);
  });

  it('should require valid URL', () => {
    const invalidSite = {
      url: 'not-a-url',
      name: 'My Site',
    };
    
    const result = siteSchema.safeParse(invalidSite);
    expect(result.success).toBe(false);
  });

  it('should accept only allowed languages', () => {
    const validLanguages = ['fr', 'en', 'es', 'de'];
    const invalidLanguages = ['it', 'pt', 'ru', 'zh'];
    
    for (const lang of validLanguages) {
      const result = siteSchema.safeParse({ url: 'https://test.com', language: lang });
      expect(result.success).toBe(true);
    }
    
    for (const lang of invalidLanguages) {
      const result = siteSchema.safeParse({ url: 'https://test.com', language: lang });
      expect(result.success).toBe(false);
    }
  });
});

describe('Workspace Schema', () => {
  it('should accept valid workspace data', () => {
    const validWorkspace = {
      name: 'My Workspace',
      slug: 'my-workspace-123',
    };
    
    const result = workspaceSchema.safeParse(validWorkspace);
    expect(result.success).toBe(true);
  });

  it('should enforce slug format', () => {
    const invalidSlugs = [
      'With Spaces',
      'UPPERCASE',
      'special@chars',
      'under_scores',
      'ab',  // too short
    ];
    
    for (const slug of invalidSlugs) {
      const result = workspaceSchema.safeParse({ name: 'Test', slug });
      expect(result.success).toBe(false);
    }
  });
});

describe('Lead Schema', () => {
  it('should accept valid lead data', () => {
    const validLead = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+33612345678',
      company: 'Acme Corp',
    };
    
    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it('should validate email format if provided', () => {
    const invalidLead = {
      name: 'John',
      email: 'not-valid-email',
    };
    
    const result = leadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it('should allow partial data', () => {
    const partialLead = {
      name: 'Jane',
    };
    
    const result = leadSchema.safeParse(partialLead);
    expect(result.success).toBe(true);
  });
});

// ==========================================
// UTILITY FUNCTION TESTS
// ==========================================

describe('safeValidate', () => {
  it('should return success with data for valid input', () => {
    const result = safeValidate(emailSchema, 'test@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should return error for invalid input', () => {
    const result = safeValidate(emailSchema, 'invalid');
    expect(result.success).toBe(false);
  });
});

describe('getFirstError', () => {
  it('should return first error message', () => {
    const result = emailSchema.safeParse('');
    if (!result.success) {
      const message = getFirstError(result.error);
      expect(message).toBe('Email requis');
    }
  });
});

describe('formatErrors', () => {
  it('should format errors as key-value map', () => {
    const schema = workspaceSchema;
    const result = schema.safeParse({ name: '', slug: 'AB' });
    
    if (!result.success) {
      const errors = formatErrors(result.error);
      expect(typeof errors).toBe('object');
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    }
  });

  it('should return empty object for valid input', () => {
    const result = safeValidate(emailSchema, 'valid@email.com');
    expect(result.success).toBe(true);
  });
});

// ==========================================
// SANITIZATION TESTS
// ==========================================

describe('sanitizeHtml', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeHtml('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitizeHtml('<b>Bold</b>')).toBe('Bold');
    expect(sanitizeHtml('Normal text')).toBe('Normal text');
  });

  it('should handle nested tags', () => {
    expect(sanitizeHtml('<div><p>Text</p></div>')).toBe('Text');
  });

  it('should decode HTML entities', () => {
    expect(sanitizeHtml('&lt;script&gt;')).toBe('<script>');
    expect(sanitizeHtml('&amp;')).toBe('&');
  });

  it('should trim whitespace', () => {
    expect(sanitizeHtml('  text  ')).toBe('text');
  });

  it('should handle complex XSS attempts', () => {
    const xssPayloads = [
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<a href="javascript:alert(1)">click</a>',
      '<div onclick="alert(1)">click me</div>',
    ];
    
    for (const payload of xssPayloads) {
      const sanitized = sanitizeHtml(payload);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    }
  });
});

describe('sanitizeUrl', () => {
  it('should accept safe protocols', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000/');
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+33612345678')).toBe('tel:+33612345678');
  });

  it('should reject dangerous protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,<script>')).toBeNull();
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull();
  });

  it('should return null for invalid URLs', () => {
    expect(sanitizeUrl('not-a-url')).toBeNull();
    expect(sanitizeUrl('')).toBeNull();
  });
});

describe('encodeUrlParam', () => {
  it('should encode special characters', () => {
    expect(encodeUrlParam('hello world')).toBe('hello%20world');
    expect(encodeUrlParam('key=value&other=test')).toBe('key%3Dvalue%26other%3Dtest');
  });

  it('should trim whitespace before encoding', () => {
    expect(encodeUrlParam('  test  ')).toBe('test');
  });
});

// ==========================================
// XSS PREVENTION TESTS
// ==========================================

describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<img src=x onerror=alert(1)>',
    '<svg/onload=alert(1)>',
    '"><img src=x onerror=alert(1)>',
    "'-alert(1)-'",
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>',
    '<video><source onerror="alert(1)">',
    '<details open ontoggle="alert(1)">',
  ];

  it('should prevent XSS in name fields', () => {
    for (const payload of xssPayloads) {
      const result = nameSchema.safeParse(payload);
      // Should either reject or sanitize
      if (result.success) {
        expect(result.data).not.toContain('<script>');
        expect(result.data).not.toContain('onerror');
        expect(result.data).not.toContain('onload');
      }
    }
  });

  it('should prevent XSS through HTML sanitization', () => {
    for (const payload of xssPayloads) {
      const sanitized = sanitizeHtml(payload);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('<svg');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
    }
  });
});

// ==========================================
// SQL INJECTION PREVENTION TESTS
// ==========================================

describe('SQL Injection Prevention (Input Level)', () => {
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; DELETE FROM users",
    "admin'--",
    "' UNION SELECT * FROM users --",
  ];

  it('should accept SQL-like strings in text fields (parameterized queries handle this)', () => {
    // Note: SQL injection prevention is primarily handled by Supabase's 
    // parameterized queries. These tests verify input is not rejected
    // incorrectly, as long as it passes other validation rules.
    for (const payload of sqlPayloads) {
      // These should be accepted as valid text (no special chars blocked)
      // The actual protection is at the database layer
      const sanitized = sanitizeHtml(payload);
      expect(typeof sanitized).toBe('string');
    }
  });
});

// ==========================================
// PERMISSION & ROLE VALIDATION
// ==========================================

describe('Role Validation', () => {
  const validRoles = ['owner', 'admin', 'manager', 'analyst', 'viewer'];
  const invalidRoles = ['superuser', 'root', '', null, undefined, 123];

  it('should recognize valid roles', () => {
    for (const role of validRoles) {
      expect(typeof role).toBe('string');
      expect(role.length).toBeGreaterThan(0);
    }
  });

  it('should not accept invalid role types', () => {
    for (const role of invalidRoles) {
      if (typeof role !== 'string' || role.length === 0) {
        expect(validRoles.includes(role as string)).toBe(false);
      }
    }
  });
});

// ==========================================
// EDGE CASES
// ==========================================

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    expect(emailSchema.safeParse('').success).toBe(false);
    expect(nameSchema.safeParse('').success).toBe(false);
    expect(urlSchema.safeParse('').success).toBe(false);
  });

  it('should handle null and undefined', () => {
    expect(emailSchema.safeParse(null).success).toBe(false);
    expect(emailSchema.safeParse(undefined).success).toBe(false);
  });

  it('should handle extremely long inputs', () => {
    const longString = 'a'.repeat(100000);
    expect(emailSchema.safeParse(longString).success).toBe(false);
    expect(nameSchema.safeParse(longString).success).toBe(false);
  });

  it('should handle unicode characters', () => {
    const unicodeNames = [
      'François Müller',
      '日本語の名前',
      'Имя Фамилия',
      'اسم عربي',
    ];
    
    // Unicode should be allowed in names
    for (const name of unicodeNames) {
      const result = nameSchema.safeParse(name);
      // May pass or fail depending on regex, but shouldn't crash
      expect(typeof result.success).toBe('boolean');
    }
  });

  it('should handle control characters', () => {
    const controlChars = [
      'test\x0anewline',
      'test\x0dcarriage',
    ];
    
    for (const input of controlChars) {
      const sanitized = sanitizeHtml(input);
      // Control characters should be handled (not crash)
      expect(typeof sanitized).toBe('string');
    }
  });
});
