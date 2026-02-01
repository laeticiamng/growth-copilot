/**
 * OpenAPI 3.0 Documentation for Growth OS Edge Functions
 * 
 * This file provides OpenAPI specification for all edge functions.
 * Can be served at /api/docs for API documentation.
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Growth OS API",
    description: "Backend API for Growth OS Marketing Platform",
    version: "2.0.0",
    contact: {
      name: "Growth OS Support",
      email: "support@growthwizard.io"
    }
  },
  servers: [
    {
      url: "https://goiklfzouhshghsvpxjo.supabase.co/functions/v1",
      description: "Production"
    }
  ],
  security: [
    { bearerAuth: [] }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase JWT token from authentication"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          code: { type: "string" },
          details: { type: "string" }
        },
        required: ["error"]
      },
      WorkspaceId: {
        type: "object",
        properties: {
          workspace_id: { 
            type: "string", 
            format: "uuid",
            description: "UUID of the workspace"
          }
        },
        required: ["workspace_id"]
      },
      CrawlRequest: {
        type: "object",
        properties: {
          workspace_id: { type: "string", format: "uuid" },
          site_id: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri" },
          max_pages: { type: "integer", minimum: 1, maximum: 500, default: 100 },
          follow_external: { type: "boolean", default: false }
        },
        required: ["workspace_id", "site_id", "url"]
      },
      CrawlResult: {
        type: "object",
        properties: {
          crawl_id: { type: "string", format: "uuid" },
          status: { type: "string", enum: ["pending", "running", "completed", "failed"] },
          pages_crawled: { type: "integer" },
          issues_found: { type: "integer" },
          started_at: { type: "string", format: "date-time" },
          completed_at: { type: "string", format: "date-time" }
        }
      },
      GDPRExportData: {
        type: "object",
        properties: {
          workspace: { type: "object" },
          sites: { type: "array", items: { type: "object" } },
          leads: { type: "array", items: { type: "object" } },
          exported_at: { type: "string", format: "date-time" },
          format_version: { type: "string" },
          gdpr_compliance: {
            type: "object",
            properties: {
              right_to_access: { type: "boolean" },
              data_portability: { type: "boolean" },
              export_format: { type: "string" }
            }
          }
        }
      },
      ReportRequest: {
        type: "object",
        properties: {
          workspace_id: { type: "string", format: "uuid" },
          site_id: { type: "string", format: "uuid" },
          report_type: { 
            type: "string", 
            enum: ["seo_audit", "performance", "monthly_summary", "competitor_analysis"] 
          },
          date_range: {
            type: "object",
            properties: {
              start: { type: "string", format: "date" },
              end: { type: "string", format: "date" }
            }
          },
          format: { type: "string", enum: ["pdf", "json"], default: "pdf" }
        },
        required: ["workspace_id", "site_id", "report_type"]
      },
      OAuthInitRequest: {
        type: "object",
        properties: {
          provider: { 
            type: "string", 
            enum: ["google", "meta", "youtube"] 
          },
          workspace_id: { type: "string", format: "uuid" },
          scopes: { 
            type: "array", 
            items: { type: "string" },
            description: "OAuth scopes to request"
          }
        },
        required: ["provider", "workspace_id"]
      },
      AIAssistantRequest: {
        type: "object",
        properties: {
          workspace_id: { type: "string", format: "uuid" },
          message: { type: "string", minLength: 1 },
          conversation_id: { type: "string", format: "uuid" },
          context: { type: "object" }
        },
        required: ["workspace_id", "message"]
      }
    }
  },
  paths: {
    "/seo-crawler": {
      post: {
        summary: "Start SEO Crawl",
        description: "Initiates an SEO crawl for a website. Returns crawl ID to track progress.",
        operationId: "startCrawl",
        tags: ["SEO"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CrawlRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Crawl started successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CrawlResult" }
              }
            }
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          },
          "403": {
            description: "Access denied to workspace",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/gdpr-export": {
      post: {
        summary: "GDPR Data Export",
        description: "Exports all user data for GDPR compliance (Right to Access, Data Portability)",
        operationId: "exportGDPRData",
        tags: ["Privacy"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WorkspaceId" }
            }
          }
        },
        responses: {
          "200": {
            description: "Export completed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GDPRExportData" }
              }
            }
          },
          "401": { description: "Unauthorized" },
          "403": { description: "Access denied" }
        }
      }
    },
    "/generate-report": {
      post: {
        summary: "Generate Report",
        description: "Generates PDF or JSON reports for SEO, performance, or analytics data",
        operationId: "generateReport",
        tags: ["Reports"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Report generated",
            content: {
              "application/pdf": {
                schema: { type: "string", format: "binary" }
              },
              "application/json": {
                schema: { type: "object" }
              }
            }
          }
        }
      }
    },
    "/oauth-init": {
      post: {
        summary: "Initialize OAuth Flow",
        description: "Starts OAuth authentication for third-party integrations",
        operationId: "initOAuth",
        tags: ["Integrations"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OAuthInitRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "OAuth URL generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    auth_url: { type: "string", format: "uri" },
                    state: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/ai-assistant": {
      post: {
        summary: "AI Assistant Chat",
        description: "Send a message to the AI assistant for marketing insights and recommendations",
        operationId: "chatWithAI",
        tags: ["AI"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AIAssistantRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "AI response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    response: { type: "string" },
                    conversation_id: { type: "string", format: "uuid" },
                    tokens_used: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/ai-gateway": {
      post: {
        summary: "AI Gateway",
        description: "Unified gateway for AI model calls with rate limiting and cost tracking",
        operationId: "aiGateway",
        tags: ["AI"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  workspace_id: { type: "string", format: "uuid" },
                  agent_name: { type: "string" },
                  prompt: { type: "string" },
                  model: { type: "string", default: "gpt-4" },
                  max_tokens: { type: "integer", default: 1000 }
                },
                required: ["workspace_id", "agent_name", "prompt"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "AI response with usage stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    usage: {
                      type: "object",
                      properties: {
                        prompt_tokens: { type: "integer" },
                        completion_tokens: { type: "integer" },
                        total_tokens: { type: "integer" }
                      }
                    },
                    cost_estimate: { type: "number" }
                  }
                }
              }
            }
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/webhooks": {
      post: {
        summary: "Webhook Receiver",
        description: "Receives webhooks from external services (Stripe, Meta, Google, etc.)",
        operationId: "receiveWebhook",
        tags: ["Webhooks"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" }
            }
          }
        },
        responses: {
          "200": { description: "Webhook processed" },
          "400": { description: "Invalid webhook payload" }
        }
      }
    },
    "/sync-gsc": {
      post: {
        summary: "Sync Google Search Console",
        description: "Syncs search performance data from Google Search Console",
        operationId: "syncGSC",
        tags: ["Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  workspace_id: { type: "string", format: "uuid" },
                  site_id: { type: "string", format: "uuid" },
                  date_range_days: { type: "integer", default: 28 }
                },
                required: ["workspace_id", "site_id"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Sync completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    rows_synced: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/sync-ga4": {
      post: {
        summary: "Sync Google Analytics 4",
        description: "Syncs analytics data from Google Analytics 4",
        operationId: "syncGA4",
        tags: ["Sync"]
      }
    },
    "/sync-meta-ads": {
      post: {
        summary: "Sync Meta Ads",
        description: "Syncs campaign data from Meta Ads (Facebook/Instagram)",
        operationId: "syncMetaAds",
        tags: ["Sync"]
      }
    },
    "/creative-init": {
      post: {
        summary: "Initialize Creative Job",
        description: "Starts a new creative generation job for ads or social content",
        operationId: "initCreative",
        tags: ["Creatives"]
      }
    },
    "/creative-render": {
      post: {
        summary: "Render Creative",
        description: "Renders creative assets using Creatomate",
        operationId: "renderCreative",
        tags: ["Creatives"]
      }
    },
    "/smart-link": {
      get: {
        summary: "Smart Link Redirect",
        description: "Handles smart link redirects with tracking",
        operationId: "smartLinkRedirect",
        tags: ["Links"],
        security: [],
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "302": { description: "Redirect to destination URL" },
          "404": { description: "Link not found" }
        }
      }
    }
  },
  tags: [
    { name: "SEO", description: "SEO crawling and analysis" },
    { name: "Privacy", description: "GDPR and privacy operations" },
    { name: "Reports", description: "Report generation" },
    { name: "Integrations", description: "Third-party integrations" },
    { name: "AI", description: "AI assistant and gateway" },
    { name: "Webhooks", description: "Webhook handling" },
    { name: "Sync", description: "Data synchronization" },
    { name: "Creatives", description: "Creative asset generation" },
    { name: "Links", description: "Smart link management" }
  ]
};

export function getOpenApiSpec(): typeof openApiSpec {
  return openApiSpec;
}
