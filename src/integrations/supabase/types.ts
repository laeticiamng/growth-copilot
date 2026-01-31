export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_log: {
        Row: {
          action_category: string | null
          action_type: string
          actor_id: string | null
          actor_type: string
          created_at: string | null
          description: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_automated: boolean | null
          result: string | null
          site_id: string | null
          workspace_id: string
        }
        Insert: {
          action_category?: string | null
          action_type: string
          actor_id?: string | null
          actor_type: string
          created_at?: string | null
          description: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_automated?: boolean | null
          result?: string | null
          site_id?: string | null
          workspace_id: string
        }
        Update: {
          action_category?: string | null
          action_type?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string | null
          description?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_automated?: boolean | null
          result?: string | null
          site_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_log_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_type: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          description: string | null
          id: string
          lead_id: string | null
          scheduled_at: string | null
          subject: string | null
          workspace_id: string
        }
        Insert: {
          activity_type: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          subject?: string | null
          workspace_id: string
        }
        Update: {
          activity_type?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          subject?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      adgroups: {
        Row: {
          adgroup_id: string | null
          campaign_id: string
          created_at: string | null
          id: string
          name: string
          status: string | null
          workspace_id: string
        }
        Insert: {
          adgroup_id?: string | null
          campaign_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          workspace_id: string
        }
        Update: {
          adgroup_id?: string | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adgroups_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adgroups_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_id: string | null
          ad_type: string | null
          adgroup_id: string
          created_at: string | null
          descriptions: Json | null
          final_url: string | null
          headlines: Json | null
          id: string
          quality_score: number | null
          status: string | null
          workspace_id: string
        }
        Insert: {
          ad_id?: string | null
          ad_type?: string | null
          adgroup_id: string
          created_at?: string | null
          descriptions?: Json | null
          final_url?: string | null
          headlines?: Json | null
          id?: string
          quality_score?: number | null
          status?: string | null
          workspace_id: string
        }
        Update: {
          ad_id?: string | null
          ad_type?: string | null
          adgroup_id?: string
          created_at?: string | null
          descriptions?: Json | null
          final_url?: string | null
          headlines?: Json | null
          id?: string
          quality_score?: number | null
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "adgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_accounts: {
        Row: {
          account_id: string
          account_name: string | null
          budget_limit_daily: number | null
          budget_limit_monthly: number | null
          created_at: string | null
          currency: string | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          timezone: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          budget_limit_daily?: number | null
          budget_limit_monthly?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          budget_limit_daily?: number | null
          budget_limit_monthly?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_keywords: {
        Row: {
          adgroup_id: string
          created_at: string | null
          id: string
          keyword: string
          match_type: string | null
          max_cpc: number | null
          quality_score: number | null
          status: string | null
          workspace_id: string
        }
        Insert: {
          adgroup_id: string
          created_at?: string | null
          id?: string
          keyword: string
          match_type?: string | null
          max_cpc?: number | null
          quality_score?: number | null
          status?: string | null
          workspace_id: string
        }
        Update: {
          adgroup_id?: string
          created_at?: string | null
          id?: string
          keyword?: string
          match_type?: string | null
          max_cpc?: number | null
          quality_score?: number | null
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_keywords_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "adgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_keywords_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_negatives: {
        Row: {
          adgroup_id: string | null
          campaign_id: string | null
          created_at: string | null
          id: string
          keyword: string
          level: string | null
          match_type: string | null
          workspace_id: string
        }
        Insert: {
          adgroup_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword: string
          level?: string | null
          match_type?: string | null
          workspace_id: string
        }
        Update: {
          adgroup_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          keyword?: string
          level?: string | null
          match_type?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_negatives_adgroup_id_fkey"
            columns: ["adgroup_id"]
            isOneToOne: false
            referencedRelation: "adgroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_negatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_negatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_clients: {
        Row: {
          agency_role: Database["public"]["Enums"]["agency_role"] | null
          agency_workspace_id: string
          client_workspace_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          agency_role?: Database["public"]["Enums"]["agency_role"] | null
          agency_workspace_id: string
          client_workspace_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          agency_role?: Database["public"]["Enums"]["agency_role"] | null
          agency_workspace_id?: string
          client_workspace_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_clients_agency_workspace_id_fkey"
            columns: ["agency_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_clients_client_workspace_id_fkey"
            columns: ["client_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_runs: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          ai_request_id: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          cost_estimate: number | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          inputs: Json | null
          model_name: string | null
          outputs: Json | null
          parent_run_id: string | null
          provider_name: string | null
          requires_approval: boolean | null
          site_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["agent_run_status"] | null
          workspace_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          ai_request_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          inputs?: Json | null
          model_name?: string | null
          outputs?: Json | null
          parent_run_id?: string | null
          provider_name?: string | null
          requires_approval?: boolean | null
          site_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_run_status"] | null
          workspace_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          ai_request_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          inputs?: Json | null
          model_name?: string | null
          outputs?: Json | null
          parent_run_id?: string | null
          provider_name?: string | null
          requires_approval?: boolean | null
          site_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_run_status"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_ai_request_id_fkey"
            columns: ["ai_request_id"]
            isOneToOne: false
            referencedRelation: "ai_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          tokens_used: number | null
          tool_calls: Json | null
          workspace_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          tokens_used?: number | null
          tool_calls?: Json | null
          workspace_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          tokens_used?: number | null
          tool_calls?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          max_output_tokens: number | null
          model_name: string
          provider_id: string
          purpose: string
          temperature: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          max_output_tokens?: number | null
          model_name: string
          provider_id: string
          purpose: string
          temperature?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          max_output_tokens?: number | null
          model_name?: string
          provider_id?: string
          purpose?: string
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
        }
        Relationships: []
      }
      ai_requests: {
        Row: {
          agent_name: string
          cost_estimate: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          input_hash: string | null
          input_json: Json
          model_name: string
          output_json: Json | null
          provider_name: string
          purpose: string
          status: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          agent_name: string
          cost_estimate?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_hash?: string | null
          input_json?: Json
          model_name: string
          output_json?: Json | null
          provider_name: string
          purpose: string
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          agent_name?: string
          cost_estimate?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_hash?: string | null
          input_json?: Json
          model_name?: string
          output_json?: Json | null
          provider_name?: string
          purpose?: string
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_queue: {
        Row: {
          action_data: Json
          action_type: string
          agent_type: string
          approval_scope: string | null
          auto_approved: boolean | null
          created_at: string | null
          diff_summary: Json | null
          expires_at: string | null
          id: string
          partial_decisions: Json | null
          preview_urls: Json | null
          rejection_reason: string | null
          reminder_sent_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          site_id: string | null
          sla_hours: number | null
          status: string
          variant_id: string | null
          workspace_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          agent_type: string
          approval_scope?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          diff_summary?: Json | null
          expires_at?: string | null
          id?: string
          partial_decisions?: Json | null
          preview_urls?: Json | null
          rejection_reason?: string | null
          reminder_sent_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          site_id?: string | null
          sla_hours?: number | null
          status?: string
          variant_id?: string | null
          workspace_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          agent_type?: string
          approval_scope?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          diff_summary?: Json | null
          expires_at?: string | null
          id?: string
          partial_decisions?: Json | null
          preview_urls?: Json | null
          rejection_reason?: string | null
          reminder_sent_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          site_id?: string | null
          sla_hours?: number | null
          status?: string
          variant_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_queue_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_queue_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "experiment_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_queue_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          changes: Json | null
          context: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          changes?: Json | null
          context?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          changes?: Json | null
          context?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_run_status: string | null
          name: string
          run_count: number | null
          site_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name: string
          run_count?: number | null
          site_id?: string | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          name?: string
          run_count?: number | null
          site_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          actions_executed: Json | null
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          rule_id: string
          started_at: string | null
          status: string | null
          trigger_data: Json | null
          workspace_id: string
        }
        Insert: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          rule_id: string
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workspace_id: string
        }
        Update: {
          actions_executed?: Json | null
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          rule_id?: string
          started_at?: string | null
          status?: string | null
          trigger_data?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      autopilot_settings: {
        Row: {
          allowed_actions: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          max_actions_per_week: number | null
          max_daily_budget: number | null
          require_approval_above_risk: string | null
          site_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          allowed_actions?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_actions_per_week?: number | null
          max_daily_budget?: number | null
          require_approval_above_risk?: string | null
          site_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          allowed_actions?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_actions_per_week?: number | null
          max_daily_budget?: number | null
          require_approval_above_risk?: string | null
          site_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autopilot_settings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autopilot_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit: {
        Row: {
          allowed_claims: Json | null
          available_proofs: Json | null
          brand_colors: Json | null
          competitors: Json | null
          created_at: string | null
          forbidden_words: Json | null
          id: string
          logo_url: string | null
          site_id: string
          style_guidelines: string | null
          target_audience: string | null
          tone_of_voice: string | null
          updated_at: string | null
          usp: Json | null
          values: Json | null
          workspace_id: string
        }
        Insert: {
          allowed_claims?: Json | null
          available_proofs?: Json | null
          brand_colors?: Json | null
          competitors?: Json | null
          created_at?: string | null
          forbidden_words?: Json | null
          id?: string
          logo_url?: string | null
          site_id: string
          style_guidelines?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string | null
          usp?: Json | null
          values?: Json | null
          workspace_id: string
        }
        Update: {
          allowed_claims?: Json | null
          available_proofs?: Json | null
          brand_colors?: Json | null
          competitors?: Json | null
          created_at?: string | null
          forbidden_words?: Json | null
          id?: string
          logo_url?: string | null
          site_id?: string
          style_guidelines?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string | null
          usp?: Json | null
          values?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ads_account_id: string
          budget_daily: number | null
          campaign_id: string | null
          campaign_type: string | null
          clicks_30d: number | null
          conversions_30d: number | null
          cost_30d: number | null
          created_at: string | null
          id: string
          impressions_30d: number | null
          name: string
          status: string | null
          strategy: string | null
          target_cpa: number | null
          target_roas: number | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          ads_account_id: string
          budget_daily?: number | null
          campaign_id?: string | null
          campaign_type?: string | null
          clicks_30d?: number | null
          conversions_30d?: number | null
          cost_30d?: number | null
          created_at?: string | null
          id?: string
          impressions_30d?: number | null
          name: string
          status?: string | null
          strategy?: string | null
          target_cpa?: number | null
          target_roas?: number | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          ads_account_id?: string
          budget_daily?: number | null
          campaign_id?: string | null
          campaign_type?: string | null
          clicks_30d?: number | null
          conversions_30d?: number | null
          cost_30d?: number | null
          created_at?: string | null
          id?: string
          impressions_30d?: number | null
          name?: string
          status?: string | null
          strategy?: string | null
          target_cpa?: number | null
          target_roas?: number | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ads_account_id_fkey"
            columns: ["ads_account_id"]
            isOneToOne: false
            referencedRelation: "ads_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_decisions: {
        Row: {
          created_at: string
          creative_job_id: string | null
          decision: string
          evidence_source: string | null
          id: string
          original_claim: string
          reason: string | null
          rewritten_claim: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          creative_job_id?: string | null
          decision: string
          evidence_source?: string | null
          id?: string
          original_claim: string
          reason?: string | null
          rewritten_claim?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          creative_job_id?: string | null
          decision?: string
          evidence_source?: string | null
          id?: string
          original_claim?: string
          reason?: string | null
          rewritten_claim?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_decisions_creative_job_id_fkey"
            columns: ["creative_job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_decisions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analysis: {
        Row: {
          backlink_comparison: Json | null
          competitor_name: string | null
          competitor_url: string
          content_gaps: Json | null
          created_at: string | null
          id: string
          insights: Json | null
          keyword_gaps: Json | null
          last_analyzed_at: string | null
          site_id: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          backlink_comparison?: Json | null
          competitor_name?: string | null
          competitor_url: string
          content_gaps?: Json | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          keyword_gaps?: Json | null
          last_analyzed_at?: string | null
          site_id: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          backlink_comparison?: Json | null
          competitor_name?: string | null
          competitor_url?: string
          content_gaps?: Json | null
          created_at?: string | null
          id?: string
          insights?: Json | null
          keyword_gaps?: Json | null
          last_analyzed_at?: string | null
          site_id?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_analysis_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          assigned_to: string | null
          brief_content: Json | null
          cluster_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          site_id: string
          status: Database["public"]["Enums"]["content_status"] | null
          target_keyword: string | null
          title: string
          updated_at: string | null
          word_count_target: number | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          brief_content?: Json | null
          cluster_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          site_id: string
          status?: Database["public"]["Enums"]["content_status"] | null
          target_keyword?: string | null
          title: string
          updated_at?: string | null
          word_count_target?: number | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          brief_content?: Json | null
          cluster_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          site_id?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          target_keyword?: string | null
          title?: string
          updated_at?: string | null
          word_count_target?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_briefs_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "keyword_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_briefs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_briefs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      content_drafts: {
        Row: {
          ai_generated: boolean | null
          brief_id: string | null
          content: string | null
          created_at: string | null
          id: string
          internal_links: Json | null
          meta_description: string | null
          schema_markup: Json | null
          site_id: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
          version: number | null
          workspace_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          brief_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          internal_links?: Json | null
          meta_description?: string | null
          schema_markup?: Json | null
          site_id: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
          version?: number | null
          workspace_id: string
        }
        Update: {
          ai_generated?: boolean | null
          brief_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          internal_links?: Json | null
          meta_description?: string | null
          schema_markup?: Json | null
          site_id?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
          version?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_drafts_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "content_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_drafts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      crawls: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          issues_found: number | null
          pages_crawled: number | null
          pages_total: number | null
          site_id: string
          started_at: string | null
          status: string | null
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          issues_found?: number | null
          pages_crawled?: number | null
          pages_total?: number | null
          site_id: string
          started_at?: string | null
          status?: string | null
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          issues_found?: number | null
          pages_crawled?: number | null
          pages_total?: number | null
          site_id?: string
          started_at?: string | null
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawls_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          job_id: string
          meta_json: Json | null
          storage_path: string | null
          url: string | null
          workspace_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          job_id: string
          meta_json?: Json | null
          storage_path?: string | null
          url?: string | null
          workspace_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          job_id?: string
          meta_json?: Json | null
          storage_path?: string | null
          url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_blueprints: {
        Row: {
          blueprint_json: Json
          created_at: string
          id: string
          is_approved: boolean | null
          job_id: string
          qa_report_json: Json | null
          version: number
          workspace_id: string
        }
        Insert: {
          blueprint_json: Json
          created_at?: string
          id?: string
          is_approved?: boolean | null
          job_id: string
          qa_report_json?: Json | null
          version?: number
          workspace_id: string
        }
        Update: {
          blueprint_json?: Json
          created_at?: string
          id?: string
          is_approved?: boolean | null
          job_id?: string
          qa_report_json?: Json | null
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_blueprints_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_blueprints_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_jobs: {
        Row: {
          approval_id: string | null
          audit_manifest: Json | null
          cost_estimate: number | null
          created_at: string
          duration_ms: number | null
          duration_seconds: number | null
          error_message: string | null
          experiment_id: string | null
          geo: string | null
          id: string
          idempotency_key: string | null
          input_json: Json
          language: string
          objective: string
          output_json: Json | null
          provider: string
          qa_iterations: number | null
          render_completed_at: string | null
          render_started_at: string | null
          site_id: string | null
          status: string
          style: string | null
          updated_at: string
          variant_name: string | null
          workspace_id: string
        }
        Insert: {
          approval_id?: string | null
          audit_manifest?: Json | null
          cost_estimate?: number | null
          created_at?: string
          duration_ms?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          experiment_id?: string | null
          geo?: string | null
          id?: string
          idempotency_key?: string | null
          input_json?: Json
          language?: string
          objective: string
          output_json?: Json | null
          provider?: string
          qa_iterations?: number | null
          render_completed_at?: string | null
          render_started_at?: string | null
          site_id?: string | null
          status?: string
          style?: string | null
          updated_at?: string
          variant_name?: string | null
          workspace_id: string
        }
        Update: {
          approval_id?: string | null
          audit_manifest?: Json | null
          cost_estimate?: number | null
          created_at?: string
          duration_ms?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          experiment_id?: string | null
          geo?: string | null
          id?: string
          idempotency_key?: string | null
          input_json?: Json
          language?: string
          objective?: string
          output_json?: Json | null
          provider?: string
          qa_iterations?: number | null
          render_completed_at?: string | null
          render_started_at?: string | null
          site_id?: string | null
          status?: string
          style?: string | null
          updated_at?: string
          variant_name?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_jobs_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_jobs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cro_audits: {
        Row: {
          created_at: string | null
          findings: Json | null
          friction_score: number | null
          id: string
          page_id: string | null
          page_type: string | null
          recommendations: Json | null
          site_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          findings?: Json | null
          friction_score?: number | null
          id?: string
          page_id?: string | null
          page_type?: string | null
          recommendations?: Json | null
          site_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          findings?: Json | null
          friction_score?: number | null
          id?: string
          page_id?: string | null
          page_type?: string | null
          recommendations?: Json | null
          site_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cro_audits_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cro_audits_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cro_audits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cro_experiments: {
        Row: {
          created_at: string | null
          cro_audit_id: string | null
          element_type: string | null
          ended_at: string | null
          hypothesis: string | null
          id: string
          name: string
          page_url: string | null
          site_id: string
          started_at: string | null
          status: string | null
          test_type: string | null
          winner_variant_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          cro_audit_id?: string | null
          element_type?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name: string
          page_url?: string | null
          site_id: string
          started_at?: string | null
          status?: string | null
          test_type?: string | null
          winner_variant_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          cro_audit_id?: string | null
          element_type?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name?: string
          page_url?: string | null
          site_id?: string
          started_at?: string | null
          status?: string | null
          test_type?: string | null
          winner_variant_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cro_experiments_cro_audit_id_fkey"
            columns: ["cro_audit_id"]
            isOneToOne: false
            referencedRelation: "cro_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cro_experiments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cro_experiments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cro_variants: {
        Row: {
          changes: Json | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          experiment_id: string
          id: string
          is_control: boolean | null
          name: string
          visitors: number | null
          workspace_id: string
        }
        Insert: {
          changes?: Json | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          experiment_id: string
          id?: string
          is_control?: boolean | null
          name: string
          visitors?: number | null
          workspace_id: string
        }
        Update: {
          changes?: Json | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          experiment_id?: string
          id?: string
          is_control?: boolean | null
          name?: string
          visitors?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cro_variants_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "cro_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cro_variants_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_alerts: {
        Row: {
          actual_value: number | null
          alert_type: string
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          description: string | null
          expected_value: number | null
          id: string
          is_resolved: boolean | null
          metric_name: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          site_id: string
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          actual_value?: number | null
          alert_type: string
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          expected_value?: number | null
          id?: string
          is_resolved?: boolean | null
          metric_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          site_id: string
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          actual_value?: number | null
          alert_type?: string
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          description?: string | null
          expected_value?: number | null
          id?: string
          is_resolved?: boolean | null
          metric_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          site_id?: string
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_alerts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_alerts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string | null
          currency: string | null
          expected_close_date: string | null
          id: string
          lead_id: string
          probability: number | null
          stage_id: string | null
          title: string
          updated_at: string | null
          value: number | null
          won: boolean | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id: string
          probability?: number | null
          stage_id?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
          won?: boolean | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string
          probability?: number | null
          stage_id?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
          won?: boolean | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          subject: string
          text_content: string | null
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          subject: string
          text_content?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          subject?: string
          text_content?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_results: {
        Row: {
          clicks: number | null
          confidence_level: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          created_at: string
          ctr: number | null
          cvr: number | null
          data_source: string | null
          experiment_id: string
          id: string
          impressions: number | null
          is_significant: boolean | null
          revenue: number | null
          roas: number | null
          snapshot_date: string
          variant_id: string
          workspace_id: string
        }
        Insert: {
          clicks?: number | null
          confidence_level?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          ctr?: number | null
          cvr?: number | null
          data_source?: string | null
          experiment_id: string
          id?: string
          impressions?: number | null
          is_significant?: boolean | null
          revenue?: number | null
          roas?: number | null
          snapshot_date?: string
          variant_id: string
          workspace_id: string
        }
        Update: {
          clicks?: number | null
          confidence_level?: number | null
          conversions?: number | null
          cost?: number | null
          cpa?: number | null
          created_at?: string
          ctr?: number | null
          cvr?: number | null
          data_source?: string | null
          experiment_id?: string
          id?: string
          impressions?: number | null
          is_significant?: boolean | null
          revenue?: number | null
          roas?: number | null
          snapshot_date?: string
          variant_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "experiment_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_results_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_variants: {
        Row: {
          asset_ids: string[] | null
          created_at: string
          creative_job_id: string | null
          experiment_id: string
          id: string
          is_control: boolean
          name: string
          traffic_allocation: number
          utm_params: Json | null
          workspace_id: string
        }
        Insert: {
          asset_ids?: string[] | null
          created_at?: string
          creative_job_id?: string | null
          experiment_id: string
          id?: string
          is_control?: boolean
          name?: string
          traffic_allocation?: number
          utm_params?: Json | null
          workspace_id: string
        }
        Update: {
          asset_ids?: string[] | null
          created_at?: string
          creative_job_id?: string | null
          experiment_id?: string
          id?: string
          is_control?: boolean
          name?: string
          traffic_allocation?: number
          utm_params?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_variants_creative_job_id_fkey"
            columns: ["creative_job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_variants_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_variants_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          created_by: string | null
          ended_at: string | null
          hypothesis: string | null
          id: string
          name: string
          objective: string
          primary_metric: string
          site_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["experiment_status"]
          updated_at: string
          winner_variant_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name: string
          objective: string
          primary_metric?: string
          site_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          updated_at?: string
          winner_variant_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          hypothesis?: string | null
          id?: string
          name?: string
          objective?: string
          primary_metric?: string
          site_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          updated_at?: string
          winner_variant_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          flags: Json
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          flags?: Json
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          flags?: Json
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_posts: {
        Row: {
          content: string | null
          created_at: string | null
          cta_type: string | null
          cta_url: string | null
          gbp_post_id: string | null
          gbp_profile_id: string
          id: string
          image_url: string | null
          post_type: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          title: string | null
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          cta_type?: string | null
          cta_url?: string | null
          gbp_post_id?: string | null
          gbp_profile_id: string
          id?: string
          image_url?: string | null
          post_type?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string | null
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          cta_type?: string | null
          cta_url?: string | null
          gbp_post_id?: string | null
          gbp_profile_id?: string
          id?: string
          image_url?: string | null
          post_type?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gbp_posts_gbp_profile_id_fkey"
            columns: ["gbp_profile_id"]
            isOneToOne: false
            referencedRelation: "gbp_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gbp_profiles: {
        Row: {
          address: string | null
          attributes: Json | null
          audit_score: number | null
          categories: Json | null
          created_at: string | null
          description: string | null
          hours: Json | null
          id: string
          integration_id: string | null
          last_audit_at: string | null
          location_id: string | null
          name: string
          phone: string | null
          photos_count: number | null
          rating_avg: number | null
          reviews_count: number | null
          site_id: string | null
          updated_at: string | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          address?: string | null
          attributes?: Json | null
          audit_score?: number | null
          categories?: Json | null
          created_at?: string | null
          description?: string | null
          hours?: Json | null
          id?: string
          integration_id?: string | null
          last_audit_at?: string | null
          location_id?: string | null
          name: string
          phone?: string | null
          photos_count?: number | null
          rating_avg?: number | null
          reviews_count?: number | null
          site_id?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          address?: string | null
          attributes?: Json | null
          audit_score?: number | null
          categories?: Json | null
          created_at?: string | null
          description?: string | null
          hours?: Json | null
          id?: string
          integration_id?: string | null
          last_audit_at?: string | null
          location_id?: string | null
          name?: string
          phone?: string | null
          photos_count?: number | null
          rating_avg?: number | null
          reviews_count?: number | null
          site_id?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gbp_profiles_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gbp_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          agent_run_id: string | null
          created_at: string
          id: string
          is_resolved: boolean
          job_id: string | null
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          step: string
          suggested_fix: string | null
          workspace_id: string
        }
        Insert: {
          agent_run_id?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          job_id?: string | null
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          step: string
          suggested_fix?: string | null
          workspace_id: string
        }
        Update: {
          agent_run_id?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          job_id?: string | null
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          step?: string
          suggested_fix?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_token_audit: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          ip_address: unknown
          provider: string
          scopes: Json | null
          user_agent: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: unknown
          provider: string
          scopes?: Json | null
          user_agent?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: unknown
          provider?: string
          scopes?: Json | null
          user_agent?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_token_audit_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_token_audit_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          integration_id: string | null
          is_revoked: boolean
          last_refreshed_at: string | null
          last_used_at: string | null
          provider: string
          refresh_failures: number
          revoked_at: string | null
          revoked_reason: string | null
          scopes: string[] | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_id?: string | null
          is_revoked?: boolean
          last_refreshed_at?: string | null
          last_used_at?: string | null
          provider: string
          refresh_failures?: number
          revoked_at?: string | null
          revoked_reason?: string | null
          scopes?: string[] | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_id?: string | null
          is_revoked?: boolean
          last_refreshed_at?: string | null
          last_used_at?: string | null
          provider?: string
          refresh_failures?: number
          revoked_at?: string | null
          revoked_reason?: string | null
          scopes?: string[] | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_tokens_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_tokens_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token_ref: string | null
          account_id: string | null
          account_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_auth_failure_at: string | null
          last_sync_at: string | null
          metadata: Json | null
          provider: Database["public"]["Enums"]["integration_provider"]
          refresh_failure_count: number | null
          refresh_token_ref: string | null
          scopes: Json | null
          scopes_granted: Json | null
          site_id: string | null
          status: Database["public"]["Enums"]["integration_status"] | null
          token_expires_at: string | null
          token_refresh_at: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          access_token_ref?: string | null
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_auth_failure_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          provider: Database["public"]["Enums"]["integration_provider"]
          refresh_failure_count?: number | null
          refresh_token_ref?: string | null
          scopes?: Json | null
          scopes_granted?: Json | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          token_expires_at?: string | null
          token_refresh_at?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          access_token_ref?: string | null
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_auth_failure_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["integration_provider"]
          refresh_failure_count?: number | null
          refresh_token_ref?: string | null
          scopes?: Json | null
          scopes_granted?: Json | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          token_expires_at?: string | null
          token_refresh_at?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          auto_fixable: boolean | null
          category: string
          confidence_score: number | null
          crawl_id: string | null
          created_at: string | null
          description: string | null
          effort_score: number | null
          fix_instructions: string | null
          fixed_at: string | null
          fixed_by: string | null
          id: string
          impact_score: number | null
          issue_type: string
          page_id: string | null
          recommendation: string | null
          severity: Database["public"]["Enums"]["issue_severity"] | null
          site_id: string
          status: Database["public"]["Enums"]["issue_status"] | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          auto_fixable?: boolean | null
          category: string
          confidence_score?: number | null
          crawl_id?: string | null
          created_at?: string | null
          description?: string | null
          effort_score?: number | null
          fix_instructions?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          impact_score?: number | null
          issue_type: string
          page_id?: string | null
          recommendation?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"] | null
          site_id: string
          status?: Database["public"]["Enums"]["issue_status"] | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          auto_fixable?: boolean | null
          category?: string
          confidence_score?: number | null
          crawl_id?: string | null
          created_at?: string | null
          description?: string | null
          effort_score?: number | null
          fix_instructions?: string | null
          fixed_at?: string | null
          fixed_by?: string | null
          id?: string
          impact_score?: number | null
          issue_type?: string
          page_id?: string | null
          recommendation?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"] | null
          site_id?: string
          status?: Database["public"]["Enums"]["issue_status"] | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_crawl_id_fkey"
            columns: ["crawl_id"]
            isOneToOne: false
            referencedRelation: "crawls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_clusters: {
        Row: {
          created_at: string | null
          id: string
          keywords_count: number | null
          main_intent: string | null
          name: string
          site_id: string
          total_volume: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keywords_count?: number | null
          main_intent?: string | null
          name: string
          site_id: string
          total_volume?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keywords_count?: number | null
          main_intent?: string | null
          name?: string
          site_id?: string
          total_volume?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_clusters_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_clusters_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          clicks_30d: number | null
          cpc: number | null
          created_at: string | null
          ctr_30d: number | null
          difficulty: number | null
          id: string
          impressions_30d: number | null
          intent: string | null
          is_tracked: boolean | null
          keyword: string
          position_avg: number | null
          search_volume: number | null
          site_id: string
          source: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          clicks_30d?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr_30d?: number | null
          difficulty?: number | null
          id?: string
          impressions_30d?: number | null
          intent?: string | null
          is_tracked?: boolean | null
          keyword: string
          position_avg?: number | null
          search_volume?: number | null
          site_id: string
          source?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          clicks_30d?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr_30d?: number | null
          difficulty?: number | null
          id?: string
          impressions_30d?: number | null
          intent?: string | null
          is_tracked?: boolean | null
          keyword?: string
          position_avg?: number | null
          search_volume?: number | null
          site_id?: string
          source?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywords_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis_daily: {
        Row: {
          ads_clicks: number | null
          ads_conversions: number | null
          ads_cost: number | null
          ads_impressions: number | null
          avg_position: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          gbp_calls: number | null
          gbp_clicks: number | null
          gbp_directions: number | null
          gbp_views: number | null
          id: string
          indexed_pages: number | null
          metrics_json: Json | null
          organic_clicks: number | null
          organic_impressions: number | null
          organic_sessions: number | null
          revenue: number | null
          site_id: string
          source: string | null
          sync_id: string | null
          total_conversions: number | null
          total_leads: number | null
          workspace_id: string
        }
        Insert: {
          ads_clicks?: number | null
          ads_conversions?: number | null
          ads_cost?: number | null
          ads_impressions?: number | null
          avg_position?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          gbp_calls?: number | null
          gbp_clicks?: number | null
          gbp_directions?: number | null
          gbp_views?: number | null
          id?: string
          indexed_pages?: number | null
          metrics_json?: Json | null
          organic_clicks?: number | null
          organic_impressions?: number | null
          organic_sessions?: number | null
          revenue?: number | null
          site_id: string
          source?: string | null
          sync_id?: string | null
          total_conversions?: number | null
          total_leads?: number | null
          workspace_id: string
        }
        Update: {
          ads_clicks?: number | null
          ads_conversions?: number | null
          ads_cost?: number | null
          ads_impressions?: number | null
          avg_position?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          gbp_calls?: number | null
          gbp_clicks?: number | null
          gbp_directions?: number | null
          gbp_views?: number | null
          id?: string
          indexed_pages?: number | null
          metrics_json?: Json | null
          organic_clicks?: number | null
          organic_impressions?: number | null
          organic_sessions?: number | null
          revenue?: number | null
          site_id?: string
          source?: string | null
          sync_id?: string | null
          total_conversions?: number | null
          total_leads?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpis_daily_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_activity_at: string | null
          name: string | null
          phone: string | null
          score: number | null
          site_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string | null
          phone?: string | null
          score?: number | null
          site_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string | null
          phone?: string | null
          score?: number | null
          site_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          artist_name: string | null
          created_at: string | null
          description: string | null
          embed_html: string | null
          genre: string | null
          id: string
          language: string | null
          metadata_json: Json | null
          platform: Database["public"]["Enums"]["media_platform"]
          platform_id: string | null
          release_date: string | null
          site_id: string | null
          smart_link_config: Json | null
          smart_link_slug: string | null
          status: Database["public"]["Enums"]["media_asset_status"] | null
          target_markets: Json | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          url: string
          workspace_id: string
        }
        Insert: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          embed_html?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          metadata_json?: Json | null
          platform: Database["public"]["Enums"]["media_platform"]
          platform_id?: string | null
          release_date?: string | null
          site_id?: string | null
          smart_link_config?: Json | null
          smart_link_slug?: string | null
          status?: Database["public"]["Enums"]["media_asset_status"] | null
          target_markets?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
          workspace_id: string
        }
        Update: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          embed_html?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          metadata_json?: Json | null
          platform?: Database["public"]["Enums"]["media_platform"]
          platform_id?: string | null
          release_date?: string | null
          site_id?: string | null
          smart_link_config?: Json | null
          smart_link_slug?: string | null
          status?: Database["public"]["Enums"]["media_asset_status"] | null
          target_markets?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          end_at: string | null
          id: string
          media_asset_id: string
          name: string
          objective: string | null
          results_json: Json | null
          spent: number | null
          start_at: string | null
          status: string | null
          targeting_json: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          media_asset_id: string
          name: string
          objective?: string | null
          results_json?: Json | null
          spent?: number | null
          start_at?: string | null
          status?: string | null
          targeting_json?: Json | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          media_asset_id?: string
          name?: string
          objective?: string | null
          results_json?: Json | null
          spent?: number | null
          start_at?: string | null
          status?: string | null
          targeting_json?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_campaigns_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_competitors: {
        Row: {
          competitor_name: string | null
          competitor_url: string
          created_at: string | null
          id: string
          insights_json: Json | null
          last_analyzed_at: string | null
          media_asset_id: string
          metrics_json: Json | null
          platform: Database["public"]["Enums"]["media_platform"] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          competitor_name?: string | null
          competitor_url: string
          created_at?: string | null
          id?: string
          insights_json?: Json | null
          last_analyzed_at?: string | null
          media_asset_id: string
          metrics_json?: Json | null
          platform?: Database["public"]["Enums"]["media_platform"] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          competitor_name?: string | null
          competitor_url?: string
          created_at?: string | null
          id?: string
          insights_json?: Json | null
          last_analyzed_at?: string | null
          media_asset_id?: string
          metrics_json?: Json | null
          platform?: Database["public"]["Enums"]["media_platform"] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_competitors_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_competitors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_creatives: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          copy_json: Json | null
          created_at: string | null
          file_refs: Json | null
          format: string
          id: string
          media_asset_id: string
          name: string | null
          platform_target: string | null
          status: Database["public"]["Enums"]["media_creative_status"] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          copy_json?: Json | null
          created_at?: string | null
          file_refs?: Json | null
          format: string
          id?: string
          media_asset_id: string
          name?: string | null
          platform_target?: string | null
          status?: Database["public"]["Enums"]["media_creative_status"] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          copy_json?: Json | null
          created_at?: string | null
          file_refs?: Json | null
          format?: string
          id?: string
          media_asset_id?: string
          name?: string | null
          platform_target?: string | null
          status?: Database["public"]["Enums"]["media_creative_status"] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_creatives_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_distribution_plan: {
        Row: {
          calendar_json: Json | null
          created_at: string | null
          id: string
          media_asset_id: string
          phases: Json | null
          plan_json: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          calendar_json?: Json | null
          created_at?: string | null
          id?: string
          media_asset_id: string
          phases?: Json | null
          plan_json?: Json | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          calendar_json?: Json | null
          created_at?: string | null
          id?: string
          media_asset_id?: string
          phases?: Json | null
          plan_json?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_distribution_plan_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_distribution_plan_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_kpis_daily: {
        Row: {
          avg_view_duration: number | null
          comments: number | null
          created_at: string | null
          ctr: number | null
          date: string
          email_signups: number | null
          id: string
          likes: number | null
          media_asset_id: string
          metrics_json: Json | null
          playlist_adds: number | null
          retention_rate: number | null
          saves: number | null
          shares: number | null
          smart_link_clicks: number | null
          source: string
          streams: number | null
          subscribers_gained: number | null
          views: number | null
          watch_time_minutes: number | null
          workspace_id: string
        }
        Insert: {
          avg_view_duration?: number | null
          comments?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          email_signups?: number | null
          id?: string
          likes?: number | null
          media_asset_id: string
          metrics_json?: Json | null
          playlist_adds?: number | null
          retention_rate?: number | null
          saves?: number | null
          shares?: number | null
          smart_link_clicks?: number | null
          source: string
          streams?: number | null
          subscribers_gained?: number | null
          views?: number | null
          watch_time_minutes?: number | null
          workspace_id: string
        }
        Update: {
          avg_view_duration?: number | null
          comments?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          email_signups?: number | null
          id?: string
          likes?: number | null
          media_asset_id?: string
          metrics_json?: Json | null
          playlist_adds?: number | null
          retention_rate?: number | null
          saves?: number | null
          shares?: number | null
          smart_link_clicks?: number | null
          source?: string
          streams?: number | null
          subscribers_gained?: number | null
          views?: number | null
          watch_time_minutes?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_kpis_daily_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_kpis_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_metadata_snapshots: {
        Row: {
          captured_at: string | null
          id: string
          media_asset_id: string
          snapshot_json: Json
          source: string
          workspace_id: string
        }
        Insert: {
          captured_at?: string | null
          id?: string
          media_asset_id: string
          snapshot_json?: Json
          source: string
          workspace_id: string
        }
        Update: {
          captured_at?: string | null
          id?: string
          media_asset_id?: string
          snapshot_json?: Json
          source?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_metadata_snapshots_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_metadata_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_accounts: {
        Row: {
          account_id: string
          account_name: string | null
          account_status: number | null
          amount_spent: number | null
          business_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          last_sync_at: string | null
          spend_cap: number | null
          timezone: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          account_status?: number | null
          amount_spent?: number | null
          business_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          spend_cap?: number | null
          timezone?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          account_status?: number | null
          amount_spent?: number | null
          business_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          spend_cap?: number | null
          timezone?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads: {
        Row: {
          ad_id: string
          adset_id: string
          created_at: string | null
          creative: Json | null
          creative_id: string | null
          effective_status: string | null
          id: string
          name: string
          preview_url: string | null
          status: string | null
          tracking_specs: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          ad_id: string
          adset_id: string
          created_at?: string | null
          creative?: Json | null
          creative_id?: string | null
          effective_status?: string | null
          id?: string
          name: string
          preview_url?: string | null
          status?: string | null
          tracking_specs?: Json | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          ad_id?: string
          adset_id?: string
          created_at?: string | null
          creative?: Json | null
          creative_id?: string | null
          effective_status?: string | null
          id?: string
          name?: string
          preview_url?: string | null
          status?: string | null
          tracking_specs?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ads_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "meta_adsets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_adsets: {
        Row: {
          adset_id: string
          bid_amount: number | null
          billing_event: string | null
          campaign_id: string
          created_at: string | null
          daily_budget: number | null
          effective_status: string | null
          end_time: string | null
          id: string
          lifetime_budget: number | null
          name: string
          optimization_goal: string | null
          start_time: string | null
          status: string | null
          targeting: Json | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          adset_id: string
          bid_amount?: number | null
          billing_event?: string | null
          campaign_id: string
          created_at?: string | null
          daily_budget?: number | null
          effective_status?: string | null
          end_time?: string | null
          id?: string
          lifetime_budget?: number | null
          name: string
          optimization_goal?: string | null
          start_time?: string | null
          status?: string | null
          targeting?: Json | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          adset_id?: string
          bid_amount?: number | null
          billing_event?: string | null
          campaign_id?: string
          created_at?: string | null
          daily_budget?: number | null
          effective_status?: string | null
          end_time?: string | null
          id?: string
          lifetime_budget?: number | null
          name?: string
          optimization_goal?: string | null
          start_time?: string | null
          status?: string | null
          targeting?: Json | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_adsets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "meta_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_adsets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_campaigns: {
        Row: {
          ad_account_id: string
          bid_strategy: string | null
          campaign_id: string
          created_at: string | null
          daily_budget: number | null
          effective_status: string | null
          id: string
          lifetime_budget: number | null
          name: string
          objective: string | null
          start_time: string | null
          status: string | null
          stop_time: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          ad_account_id: string
          bid_strategy?: string | null
          campaign_id: string
          created_at?: string | null
          daily_budget?: number | null
          effective_status?: string | null
          id?: string
          lifetime_budget?: number | null
          name: string
          objective?: string | null
          start_time?: string | null
          status?: string | null
          stop_time?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          ad_account_id?: string
          bid_strategy?: string | null
          campaign_id?: string
          created_at?: string | null
          daily_budget?: number | null
          effective_status?: string | null
          id?: string
          lifetime_budget?: number | null
          name?: string
          objective?: string | null
          start_time?: string | null
          status?: string | null
          stop_time?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_capi_events: {
        Row: {
          action_source: string | null
          created_at: string | null
          custom_data: Json | null
          error_message: string | null
          event_id: string | null
          event_name: string
          event_source_url: string | null
          event_time: string
          fb_response: Json | null
          id: string
          opt_out: boolean | null
          pixel_id: string
          sent_at: string | null
          site_id: string | null
          status: string | null
          user_data: Json | null
          workspace_id: string
        }
        Insert: {
          action_source?: string | null
          created_at?: string | null
          custom_data?: Json | null
          error_message?: string | null
          event_id?: string | null
          event_name: string
          event_source_url?: string | null
          event_time: string
          fb_response?: Json | null
          id?: string
          opt_out?: boolean | null
          pixel_id: string
          sent_at?: string | null
          site_id?: string | null
          status?: string | null
          user_data?: Json | null
          workspace_id: string
        }
        Update: {
          action_source?: string | null
          created_at?: string | null
          custom_data?: Json | null
          error_message?: string | null
          event_id?: string | null
          event_name?: string
          event_source_url?: string | null
          event_time?: string
          fb_response?: Json | null
          id?: string
          opt_out?: boolean | null
          pixel_id?: string
          sent_at?: string | null
          site_id?: string | null
          status?: string | null
          user_data?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_capi_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_capi_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_conversations: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          page_id: string | null
          participant_id: string
          participant_name: string | null
          participant_profile_pic: string | null
          phone_number_id: string | null
          platform: string
          status: string | null
          unread_count: number | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          page_id?: string | null
          participant_id: string
          participant_name?: string | null
          participant_profile_pic?: string | null
          phone_number_id?: string | null
          platform: string
          status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          page_id?: string | null
          participant_id?: string
          participant_name?: string | null
          participant_profile_pic?: string | null
          phone_number_id?: string | null
          platform?: string
          status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ig_accounts: {
        Row: {
          biography: string | null
          connected_fb_page_id: string | null
          created_at: string | null
          followers_count: number | null
          follows_count: number | null
          id: string
          ig_user_id: string
          integration_id: string | null
          is_business_account: boolean | null
          last_sync_at: string | null
          media_count: number | null
          name: string | null
          profile_picture_url: string | null
          updated_at: string | null
          username: string
          website: string | null
          workspace_id: string
        }
        Insert: {
          biography?: string | null
          connected_fb_page_id?: string | null
          created_at?: string | null
          followers_count?: number | null
          follows_count?: number | null
          id?: string
          ig_user_id: string
          integration_id?: string | null
          is_business_account?: boolean | null
          last_sync_at?: string | null
          media_count?: number | null
          name?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username: string
          website?: string | null
          workspace_id: string
        }
        Update: {
          biography?: string | null
          connected_fb_page_id?: string | null
          created_at?: string | null
          followers_count?: number | null
          follows_count?: number | null
          id?: string
          ig_user_id?: string
          integration_id?: string | null
          is_business_account?: boolean | null
          last_sync_at?: string | null
          media_count?: number | null
          name?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          username?: string
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ig_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ig_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ig_media: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string | null
          engagement: number | null
          id: string
          ig_account_id: string
          impressions: number | null
          is_published: boolean | null
          like_count: number | null
          media_id: string
          media_type: string | null
          media_url: string | null
          permalink: string | null
          plays: number | null
          reach: number | null
          saved: number | null
          shares: number | null
          thumbnail_url: string | null
          timestamp: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          ig_account_id: string
          impressions?: number | null
          is_published?: boolean | null
          like_count?: number | null
          media_id: string
          media_type?: string | null
          media_url?: string | null
          permalink?: string | null
          plays?: number | null
          reach?: number | null
          saved?: number | null
          shares?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          ig_account_id?: string
          impressions?: number | null
          is_published?: boolean | null
          like_count?: number | null
          media_id?: string
          media_type?: string | null
          media_url?: string | null
          permalink?: string | null
          plays?: number | null
          reach?: number | null
          saved?: number | null
          shares?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ig_media_ig_account_id_fkey"
            columns: ["ig_account_id"]
            isOneToOne: false
            referencedRelation: "meta_ig_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ig_media_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ig_scheduled: {
        Row: {
          approval_id: string | null
          caption: string | null
          container_id: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          hashtags: Json | null
          id: string
          ig_account_id: string
          location_id: string | null
          media_id: string | null
          media_type: string
          media_urls: Json | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          user_tags: Json | null
          workspace_id: string
        }
        Insert: {
          approval_id?: string | null
          caption?: string | null
          container_id?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          hashtags?: Json | null
          id?: string
          ig_account_id: string
          location_id?: string | null
          media_id?: string | null
          media_type: string
          media_urls?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_tags?: Json | null
          workspace_id: string
        }
        Update: {
          approval_id?: string | null
          caption?: string | null
          container_id?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          hashtags?: Json | null
          id?: string
          ig_account_id?: string
          location_id?: string | null
          media_id?: string | null
          media_type?: string
          media_urls?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_tags?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ig_scheduled_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ig_scheduled_ig_account_id_fkey"
            columns: ["ig_account_id"]
            isOneToOne: false
            referencedRelation: "meta_ig_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ig_scheduled_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_insights: {
        Row: {
          actions: Json | null
          ad_account_id: string | null
          ad_id: string | null
          adset_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cost_per_conversion: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          level: string
          reach: number | null
          roas: number | null
          spend: number | null
          workspace_id: string
        }
        Insert: {
          actions?: Json | null
          ad_account_id?: string | null
          ad_id?: string | null
          adset_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          level: string
          reach?: number | null
          roas?: number | null
          spend?: number | null
          workspace_id: string
        }
        Update: {
          actions?: Json | null
          ad_account_id?: string | null
          ad_id?: string | null
          adset_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          level?: string
          reach?: number | null
          roas?: number | null
          spend?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_insights_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_insights_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "meta_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_insights_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "meta_adsets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "meta_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_insights_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          delivered_at: string | null
          direction: string
          error_code: string | null
          error_message: string | null
          id: string
          media_url: string | null
          message_id: string
          message_type: string | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          template_name: string | null
          template_params: Json | null
          workspace_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_id: string
          message_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          workspace_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_id?: string
          message_type?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "meta_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_webhook_configs: {
        Row: {
          created_at: string | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          last_event_at: string | null
          object_id: string
          object_type: string
          subscribed_fields: Json | null
          updated_at: string | null
          verify_token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_event_at?: string | null
          object_id: string
          object_type: string
          subscribed_fields?: Json | null
          updated_at?: string | null
          verify_token: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_event_at?: string | null
          object_id?: string
          object_type?: string
          subscribed_fields?: Json | null
          updated_at?: string | null
          verify_token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_webhook_configs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_webhook_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_webhook_events: {
        Row: {
          error_message: string | null
          event_type: string | null
          field: string
          id: string
          object_id: string
          object_type: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          received_at: string | null
          webhook_config_id: string | null
          workspace_id: string
        }
        Insert: {
          error_message?: string | null
          event_type?: string | null
          field: string
          id?: string
          object_id: string
          object_type: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
          webhook_config_id?: string | null
          workspace_id: string
        }
        Update: {
          error_message?: string | null
          event_type?: string | null
          field?: string
          id?: string
          object_id?: string
          object_type?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
          webhook_config_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_webhook_events_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "meta_webhook_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_webhook_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          actions_completed: Json | null
          created_at: string | null
          generated_at: string | null
          id: string
          kpi_changes: Json | null
          month: string
          next_actions: Json | null
          pdf_url: string | null
          risks: Json | null
          sent_at: string | null
          site_id: string
          summary_json: Json | null
          workspace_id: string
        }
        Insert: {
          actions_completed?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          kpi_changes?: Json | null
          month: string
          next_actions?: Json | null
          pdf_url?: string | null
          risks?: Json | null
          sent_at?: string | null
          site_id: string
          summary_json?: Json | null
          workspace_id: string
        }
        Update: {
          actions_completed?: Json | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          kpi_changes?: Json | null
          month?: string
          next_actions?: Json | null
          pdf_url?: string | null
          risks?: Json | null
          sent_at?: string | null
          site_id?: string
          summary_json?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_state_nonces: {
        Row: {
          created_at: string
          expires_at: string
          hmac_signature: string
          id: string
          nonce: string
          provider: string
          redirect_url: string
          used_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          hmac_signature: string
          id?: string
          nonce: string
          provider: string
          redirect_url: string
          used_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          hmac_signature?: string
          id?: string
          nonce?: string
          provider?: string
          redirect_url?: string
          used_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_state_nonces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_tokens: {
        Row: {
          access_ct: string
          access_iv: string
          created_at: string
          id: string
          integration_id: string
          refresh_ct: string | null
          refresh_iv: string | null
          updated_at: string
        }
        Insert: {
          access_ct: string
          access_iv: string
          created_at?: string
          id?: string
          integration_id: string
          refresh_ct?: string | null
          refresh_iv?: string | null
          updated_at?: string
        }
        Update: {
          access_ct?: string
          access_iv?: string
          created_at?: string
          id?: string
          integration_id?: string
          refresh_ct?: string | null
          refresh_iv?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          benefits: Json | null
          created_at: string | null
          features: Json | null
          guarantees: Json | null
          id: string
          is_active: boolean | null
          name: string
          objections_answers: Json | null
          price: number | null
          price_period: string | null
          site_id: string
          tier: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          features?: Json | null
          guarantees?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          objections_answers?: Json | null
          price?: number | null
          price_period?: string | null
          site_id: string
          tier?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          features?: Json | null
          guarantees?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          objections_answers?: Json | null
          price?: number | null
          price_period?: string | null
          site_id?: string
          tier?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_metrics_daily: {
        Row: {
          agent_avg_duration_ms: number | null
          agent_runs_failed: number | null
          agent_runs_success: number | null
          agent_runs_total: number | null
          ai_cost_usd: number | null
          created_at: string | null
          creative_jobs_completed: number | null
          creative_jobs_manual_review: number | null
          creative_jobs_total: number | null
          date: string
          id: string
          render_cost_usd: number | null
          top_manual_review_reasons: Json | null
          total_cost_usd: number | null
          workspace_id: string
        }
        Insert: {
          agent_avg_duration_ms?: number | null
          agent_runs_failed?: number | null
          agent_runs_success?: number | null
          agent_runs_total?: number | null
          ai_cost_usd?: number | null
          created_at?: string | null
          creative_jobs_completed?: number | null
          creative_jobs_manual_review?: number | null
          creative_jobs_total?: number | null
          date: string
          id?: string
          render_cost_usd?: number | null
          top_manual_review_reasons?: Json | null
          total_cost_usd?: number | null
          workspace_id: string
        }
        Update: {
          agent_avg_duration_ms?: number | null
          agent_runs_failed?: number | null
          agent_runs_success?: number | null
          agent_runs_total?: number | null
          ai_cost_usd?: number | null
          created_at?: string | null
          creative_jobs_completed?: number | null
          creative_jobs_manual_review?: number | null
          creative_jobs_total?: number | null
          date?: string
          id?: string
          render_cost_usd?: number | null
          top_manual_review_reasons?: Json | null
          total_cost_usd?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_metrics_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      page_map: {
        Row: {
          cluster_id: string | null
          created_at: string | null
          id: string
          keyword_id: string
          mapping_type: string | null
          page_id: string | null
          workspace_id: string
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string | null
          id?: string
          keyword_id: string
          mapping_type?: string | null
          page_id?: string | null
          workspace_id: string
        }
        Update: {
          cluster_id?: string | null
          created_at?: string | null
          id?: string
          keyword_id?: string
          mapping_type?: string | null
          page_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_map_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "keyword_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_map_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_map_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_map_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          canonical_url: string | null
          crawl_id: string | null
          created_at: string | null
          external_links_count: number | null
          h1: string | null
          h2_count: number | null
          id: string
          internal_links_count: number | null
          is_indexable: boolean | null
          last_crawled_at: string | null
          load_time_ms: number | null
          meta_description: string | null
          page_size_kb: number | null
          schema_types: Json | null
          site_id: string
          status_code: number | null
          title: string | null
          url: string
          word_count: number | null
          workspace_id: string
        }
        Insert: {
          canonical_url?: string | null
          crawl_id?: string | null
          created_at?: string | null
          external_links_count?: number | null
          h1?: string | null
          h2_count?: number | null
          id?: string
          internal_links_count?: number | null
          is_indexable?: boolean | null
          last_crawled_at?: string | null
          load_time_ms?: number | null
          meta_description?: string | null
          page_size_kb?: number | null
          schema_types?: Json | null
          site_id: string
          status_code?: number | null
          title?: string | null
          url: string
          word_count?: number | null
          workspace_id: string
        }
        Update: {
          canonical_url?: string | null
          crawl_id?: string | null
          created_at?: string | null
          external_links_count?: number | null
          h1?: string | null
          h2_count?: number | null
          id?: string
          internal_links_count?: number | null
          is_indexable?: boolean | null
          last_crawled_at?: string | null
          load_time_ms?: number | null
          meta_description?: string | null
          page_size_kb?: number | null
          schema_types?: Json | null
          site_id?: string
          status_code?: number | null
          title?: string | null
          url?: string
          word_count?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_crawl_id_fkey"
            columns: ["crawl_id"]
            isOneToOne: false
            referencedRelation: "crawls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          position: number | null
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          position?: number | null
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          position?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_policies: {
        Row: {
          created_at: string
          frequency_caps: Json | null
          id: string
          industry: string | null
          is_active: boolean
          platform: string
          policy_name: string
          required_approvals: string[] | null
          rules: Json
          warnings: string[] | null
        }
        Insert: {
          created_at?: string
          frequency_caps?: Json | null
          id?: string
          industry?: string | null
          is_active?: boolean
          platform: string
          policy_name: string
          required_approvals?: string[] | null
          rules?: Json
          warnings?: string[] | null
        }
        Update: {
          created_at?: string
          frequency_caps?: Json | null
          id?: string
          industry?: string | null
          is_active?: boolean
          platform?: string
          policy_name?: string
          required_approvals?: string[] | null
          rules?: Json
          warnings?: string[] | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          action_type: string
          autopilot_allowed: boolean
          constraints: Json | null
          created_at: string
          created_by: string | null
          id: string
          requires_approval: boolean
          risk_level: Database["public"]["Enums"]["risk_level"]
          site_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          action_type: string
          autopilot_allowed?: boolean
          constraints?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          requires_approval?: boolean
          risk_level?: Database["public"]["Enums"]["risk_level"]
          site_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          action_type?: string
          autopilot_allowed?: boolean
          constraints?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          requires_approval?: boolean
          risk_level?: Database["public"]["Enums"]["risk_level"]
          site_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_events: {
        Row: {
          action_type: string
          context: Json | null
          created_at: string
          decision: string
          id: string
          policy_id: string | null
          reason: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action_type: string
          context?: Json | null
          created_at?: string
          decision: string
          id?: string
          policy_id?: string | null
          reason?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action_type?: string
          context?: Json | null
          created_at?: string
          decision?: string
          id?: string
          policy_id?: string | null
          reason?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_events_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_profiles: {
        Row: {
          anti_spam_config: Json | null
          created_at: string | null
          id: string
          industry: string | null
          is_system_preset: boolean | null
          name: string
          platform: string | null
          policy_rules: Json
          required_approvals: Json | null
          updated_at: string | null
          warnings: Json | null
          workspace_id: string | null
        }
        Insert: {
          anti_spam_config?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_system_preset?: boolean | null
          name: string
          platform?: string | null
          policy_rules?: Json
          required_approvals?: Json | null
          updated_at?: string | null
          warnings?: Json | null
          workspace_id?: string | null
        }
        Update: {
          anti_spam_config?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_system_preset?: boolean | null
          name?: string
          platform?: string | null
          policy_rules?: Json
          required_approvals?: Json | null
          updated_at?: string | null
          warnings?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_versions: {
        Row: {
          created_at: string | null
          id: string
          is_live: boolean | null
          offers: Json | null
          page_content: Json | null
          published_at: string | null
          site_id: string
          version_number: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          offers?: Json | null
          page_content?: Json | null
          published_at?: string | null
          site_id: string
          version_number?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_live?: boolean | null
          offers?: Json | null
          page_content?: Json | null
          published_at?: string | null
          site_id?: string
          version_number?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_versions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          cms_post_id: string | null
          created_at: string | null
          draft_id: string | null
          id: string
          page_id: string | null
          published_at: string | null
          published_url: string | null
          site_id: string
          status: string | null
          workspace_id: string
        }
        Insert: {
          cms_post_id?: string | null
          created_at?: string | null
          draft_id?: string | null
          id?: string
          page_id?: string | null
          published_at?: string | null
          published_url?: string | null
          site_id: string
          status?: string | null
          workspace_id: string
        }
        Update: {
          cms_post_id?: string | null
          created_at?: string | null
          draft_id?: string | null
          id?: string
          page_id?: string | null
          published_at?: string | null
          published_url?: string | null
          site_id?: string
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publications_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "content_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          category: string
          confidence_score: number | null
          created_at: string | null
          description: string | null
          effort_score: number | null
          id: string
          impact_score: number | null
          is_automated: boolean | null
          priority_rank: number | null
          site_id: string
          status: string | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          category: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          is_automated?: boolean | null
          priority_rank?: number | null
          site_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          is_automated?: boolean | null
          priority_rank?: number | null
          site_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      render_qa_frames: {
        Row: {
          asset_id: string | null
          checks: Json | null
          created_at: string
          frame_position: string
          frame_url: string | null
          id: string
          issues: string[] | null
          job_id: string
          passed: boolean | null
          workspace_id: string
        }
        Insert: {
          asset_id?: string | null
          checks?: Json | null
          created_at?: string
          frame_position: string
          frame_url?: string | null
          id?: string
          issues?: string[] | null
          job_id: string
          passed?: boolean | null
          workspace_id: string
        }
        Update: {
          asset_id?: string | null
          checks?: Json | null
          created_at?: string
          frame_position?: string
          frame_url?: string | null
          id?: string
          issues?: string[] | null
          job_id?: string
          passed?: boolean | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "render_qa_frames_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "creative_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "render_qa_frames_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "creative_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "render_qa_frames_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          channel: string | null
          clicked_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          gbp_profile_id: string
          id: string
          opened_at: string | null
          review_received: boolean | null
          sent_at: string | null
          workspace_id: string
        }
        Insert: {
          channel?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          gbp_profile_id: string
          id?: string
          opened_at?: string | null
          review_received?: boolean | null
          sent_at?: string | null
          workspace_id: string
        }
        Update: {
          channel?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          gbp_profile_id?: string
          id?: string
          opened_at?: string | null
          review_received?: boolean | null
          sent_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_gbp_profile_id_fkey"
            columns: ["gbp_profile_id"]
            isOneToOne: false
            referencedRelation: "gbp_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string | null
          comment: string | null
          created_at: string | null
          gbp_profile_id: string
          id: string
          rating: number | null
          replied_at: string | null
          reply: string | null
          requires_attention: boolean | null
          review_date: string | null
          review_id: string | null
          sentiment: string | null
          workspace_id: string
        }
        Insert: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          gbp_profile_id: string
          id?: string
          rating?: number | null
          replied_at?: string | null
          reply?: string | null
          requires_attention?: boolean | null
          review_date?: string | null
          review_id?: string | null
          sentiment?: string | null
          workspace_id: string
        }
        Update: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          gbp_profile_id?: string
          id?: string
          rating?: number | null
          replied_at?: string | null
          reply?: string | null
          requires_attention?: boolean | null
          review_date?: string | null
          review_id?: string | null
          sentiment?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_gbp_profile_id_fkey"
            columns: ["gbp_profile_id"]
            isOneToOne: false
            referencedRelation: "gbp_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["permission_action"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["permission_action"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["permission_action"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      safe_zone_configs: {
        Row: {
          bottom_percent: number
          bottom_px: number
          created_at: string
          format: string
          height: number
          id: string
          left_percent: number
          left_px: number
          notes: string | null
          right_percent: number
          right_px: number
          top_percent: number
          top_px: number
          width: number
        }
        Insert: {
          bottom_percent?: number
          bottom_px?: number
          created_at?: string
          format: string
          height: number
          id?: string
          left_percent?: number
          left_px?: number
          notes?: string | null
          right_percent?: number
          right_px?: number
          top_percent?: number
          top_px?: number
          width: number
        }
        Update: {
          bottom_percent?: number
          bottom_px?: number
          created_at?: string
          format?: string
          height?: number
          id?: string
          left_percent?: number
          left_px?: number
          notes?: string | null
          right_percent?: number
          right_px?: number
          top_percent?: number
          top_px?: number
          width?: number
        }
        Relationships: []
      }
      site_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_roles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          business_type: string | null
          cms_access_level: string | null
          cms_type: string | null
          created_at: string | null
          geographic_zone: string | null
          id: string
          is_active: boolean | null
          language: string | null
          last_crawl_at: string | null
          name: string | null
          objectives: Json | null
          sector: string | null
          tracking_status: string | null
          updated_at: string | null
          url: string
          workspace_id: string
        }
        Insert: {
          business_type?: string | null
          cms_access_level?: string | null
          cms_type?: string | null
          created_at?: string | null
          geographic_zone?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_crawl_at?: string | null
          name?: string | null
          objectives?: Json | null
          sector?: string | null
          tracking_status?: string | null
          updated_at?: string | null
          url: string
          workspace_id: string
        }
        Update: {
          business_type?: string | null
          cms_access_level?: string | null
          cms_type?: string | null
          created_at?: string | null
          geographic_zone?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_crawl_at?: string | null
          name?: string | null
          objectives?: Json | null
          sector?: string | null
          tracking_status?: string | null
          updated_at?: string | null
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_link_clicks: {
        Row: {
          country: string | null
          created_at: string | null
          device: string | null
          id: string
          ip_hash: string | null
          media_asset_id: string
          platform: string
          rate_limited: boolean | null
          referrer: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_hash?: string | null
          media_asset_id: string
          platform: string
          rate_limited?: boolean | null
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip_hash?: string | null
          media_asset_id?: string
          platform?: string
          rate_limited?: boolean | null
          referrer?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_link_clicks_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_link_emails: {
        Row: {
          consent_given: boolean | null
          created_at: string | null
          email: string
          id: string
          media_asset_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          workspace_id: string
        }
        Insert: {
          consent_given?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          media_asset_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_id: string
        }
        Update: {
          consent_given?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          media_asset_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_link_emails_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_link_emails_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          account_id: string | null
          account_name: string | null
          created_at: string | null
          followers_count: number | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          permissions: Json | null
          platform: string
          workspace_id: string
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          platform: string
          workspace_id: string
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          followers_count?: number | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          platform?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_calendar: {
        Row: {
          content_type: string | null
          created_at: string | null
          id: string
          platforms: Json | null
          scheduled_at: string | null
          site_id: string
          status: string | null
          title: string
          workspace_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          id?: string
          platforms?: Json | null
          scheduled_at?: string | null
          site_id: string
          status?: string | null
          title: string
          workspace_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          id?: string
          platforms?: Json | null
          scheduled_at?: string | null
          site_id?: string
          status?: string | null
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_calendar_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_calendar_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          calendar_id: string | null
          content: string | null
          created_at: string | null
          engagement_comments: number | null
          engagement_likes: number | null
          engagement_shares: number | null
          hashtags: Json | null
          id: string
          media_urls: Json | null
          platform_post_id: string | null
          published_at: string | null
          reach: number | null
          social_account_id: string
          status: string | null
          utm_params: Json | null
          workspace_id: string
        }
        Insert: {
          calendar_id?: string | null
          content?: string | null
          created_at?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          hashtags?: Json | null
          id?: string
          media_urls?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          reach?: number | null
          social_account_id: string
          status?: string | null
          utm_params?: Json | null
          workspace_id: string
        }
        Update: {
          calendar_id?: string | null
          content?: string | null
          created_at?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          hashtags?: Json | null
          id?: string
          media_urls?: Json | null
          platform_post_id?: string | null
          published_at?: string | null
          reach?: number | null
          social_account_id?: string
          status?: string | null
          utm_params?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "social_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          meta: Json | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          message: string
          meta?: Json | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          meta?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      video_templates: {
        Row: {
          aspect_ratio: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          language: string
          name: string
          provider: string
          template_json: Json
          workspace_id: string | null
        }
        Insert: {
          aspect_ratio: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          language?: string
          name: string
          provider?: string
          template_json: Json
          workspace_id?: string | null
        }
        Update: {
          aspect_ratio?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          language?: string
          name?: string
          provider?: string
          template_json?: Json
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          response_body: string | null
          response_status: number | null
          webhook_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean | null
          last_status: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          secret: string | null
          updated_at: string | null
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          secret?: string | null
          updated_at?: string | null
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          secret?: string | null
          updated_at?: string | null
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_quotas: {
        Row: {
          agent_runs_per_month: number | null
          ai_requests_per_minute: number
          concurrent_runs: number
          crawls_per_month: number | null
          crawls_today: number
          created_at: string
          current_period_start: string
          id: string
          integrations_limit: number | null
          last_request_at: string | null
          max_concurrent_runs: number
          max_crawls_per_day: number
          max_pages_per_crawl: number
          monthly_tokens_used: number | null
          plan_tier: string
          reports_per_month: number | null
          requests_this_minute: number
          sites_limit: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          agent_runs_per_month?: number | null
          ai_requests_per_minute?: number
          concurrent_runs?: number
          crawls_per_month?: number | null
          crawls_today?: number
          created_at?: string
          current_period_start?: string
          id?: string
          integrations_limit?: number | null
          last_request_at?: string | null
          max_concurrent_runs?: number
          max_crawls_per_day?: number
          max_pages_per_crawl?: number
          monthly_tokens_used?: number | null
          plan_tier?: string
          reports_per_month?: number | null
          requests_this_minute?: number
          sites_limit?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          agent_runs_per_month?: number | null
          ai_requests_per_minute?: number
          concurrent_runs?: number
          crawls_per_month?: number | null
          crawls_today?: number
          created_at?: string
          current_period_start?: string
          id?: string
          integrations_limit?: number | null
          last_request_at?: string | null
          max_concurrent_runs?: number
          max_crawls_per_day?: number
          max_pages_per_crawl?: number
          monthly_tokens_used?: number | null
          plan_tier?: string
          reports_per_month?: number | null
          requests_this_minute?: number
          sites_limit?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_quotas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          is_agency: boolean | null
          name: string
          owner_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          quota_agent_runs_month: number | null
          quota_crawls_month: number | null
          quota_sites: number | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_agency?: boolean | null
          name: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          quota_agent_runs_month?: number | null
          quota_crawls_month?: number | null
          quota_sites?: number | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_agency?: boolean | null
          name?: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          quota_agent_runs_month?: number | null
          quota_crawls_month?: number | null
          quota_sites?: number | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_claim_guardrail: {
        Args: {
          _claim: string
          _evidence_source?: string
          _has_evidence?: boolean
          _workspace_id: string
        }
        Returns: {
          allowed: boolean
          reason: string
          requires_rewrite: boolean
        }[]
      }
      check_idempotency_key: {
        Args: { _key: string }
        Returns: {
          exists_already: boolean
          job_id: string
          status: string
        }[]
      }
      check_policy: {
        Args: { _action_type: string; _site_id?: string; _workspace_id: string }
        Returns: {
          autopilot_allowed: boolean
          constraints: Json
          requires_approval: boolean
          risk_level: Database["public"]["Enums"]["risk_level"]
        }[]
      }
      cleanup_expired_oauth_nonces: { Args: never; Returns: undefined }
      compute_ops_metrics: {
        Args: { _date?: string; _workspace_id: string }
        Returns: undefined
      }
      get_effective_role: {
        Args: { _site_id?: string; _user_id: string; _workspace_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_policy_profile: {
        Args: { _industry?: string; _platform?: string; _workspace_id: string }
        Returns: {
          anti_spam_config: Json | null
          created_at: string | null
          id: string
          industry: string | null
          is_system_preset: boolean | null
          name: string
          platform: string | null
          policy_rules: Json
          required_approvals: Json | null
          updated_at: string | null
          warnings: Json | null
          workspace_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "policy_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_permissions: {
        Args: { _site_id?: string; _user_id: string; _workspace_id: string }
        Returns: {
          permission: Database["public"]["Enums"]["permission_action"]
        }[]
      }
      get_user_workspace_ids: { Args: { _user_id: string }; Returns: string[] }
      get_workspace_quota: {
        Args: { p_workspace_id: string }
        Returns: {
          concurrent_runs: number
          current_period_start: string
          last_request_at: string
          monthly_tokens_used: number
          plan_tier: string
          requests_this_minute: number
        }[]
      }
      has_agency_access: {
        Args: { _client_workspace_id: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["permission_action"]
          _site_id?: string
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      has_workspace_access: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      has_workspace_role: {
        Args: {
          _role?: Database["public"]["Enums"]["app_role"]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _actor_id: string
          _actor_type?: string
          _changes?: Json
          _context?: Json
          _entity_id: string
          _entity_type: string
          _workspace_id: string
        }
        Returns: string
      }
      log_policy_event: {
        Args: {
          _action_type: string
          _context?: Json
          _decision: string
          _policy_id: string
          _reason?: string
          _user_id?: string
          _workspace_id: string
        }
        Returns: string
      }
      log_token_audit: {
        Args: {
          _action: string
          _error_message?: string
          _integration_id: string
          _provider: string
          _scopes?: Json
          _workspace_id: string
        }
        Returns: string
      }
      update_workspace_quota: {
        Args: {
          p_add_tokens?: number
          p_decrement_concurrent?: boolean
          p_increment_concurrent?: boolean
          p_increment_requests?: boolean
          p_workspace_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      agency_role: "agency_owner" | "agency_member"
      agent_run_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      agent_type:
        | "tech_auditor"
        | "keyword_strategist"
        | "content_builder"
        | "local_manager"
        | "ads_manager"
        | "analytics_guardian"
        | "cro_optimizer"
        | "offer_architect"
        | "lifecycle_manager"
        | "sales_ops"
        | "reputation_manager"
        | "competitive_analyst"
        | "chief_growth_officer"
        | "quality_compliance"
        | "media_strategy"
        | "youtube_optimizer"
        | "streaming_packager"
        | "shortform_repurposer"
        | "ads_creative"
        | "media_competitive_analyst"
        | "media_analytics_guardian"
      app_role: "owner" | "admin" | "member" | "manager" | "analyst" | "viewer"
      content_status: "draft" | "review" | "approved" | "published" | "archived"
      experiment_status:
        | "draft"
        | "running"
        | "paused"
        | "completed"
        | "archived"
      integration_provider:
        | "google_search_console"
        | "google_analytics"
        | "google_ads"
        | "google_business_profile"
        | "meta"
        | "instagram"
        | "wordpress"
        | "shopify"
        | "webflow"
        | "email_provider"
        | "crm"
        | "calendar"
      integration_status: "connected" | "disconnected" | "error" | "pending"
      issue_severity: "critical" | "high" | "medium" | "low" | "info"
      issue_status: "open" | "in_progress" | "fixed" | "ignored" | "wont_fix"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      media_asset_status:
        | "draft"
        | "planning"
        | "pre_launch"
        | "launching"
        | "post_launch"
        | "evergreen"
        | "archived"
      media_creative_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "published"
        | "rejected"
      media_platform:
        | "youtube_video"
        | "youtube_channel"
        | "spotify_track"
        | "spotify_album"
        | "spotify_artist"
        | "apple_music"
        | "soundcloud"
        | "tiktok"
        | "other"
      permission_action:
        | "run_agents"
        | "approve_actions"
        | "connect_integrations"
        | "export_assets"
        | "manage_billing"
        | "manage_team"
        | "view_analytics"
        | "manage_policies"
        | "manage_experiments"
        | "view_audit"
      risk_level: "low" | "medium" | "high" | "critical"
      subscription_plan: "free" | "starter" | "growth" | "agency"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agency_role: ["agency_owner", "agency_member"],
      agent_run_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      agent_type: [
        "tech_auditor",
        "keyword_strategist",
        "content_builder",
        "local_manager",
        "ads_manager",
        "analytics_guardian",
        "cro_optimizer",
        "offer_architect",
        "lifecycle_manager",
        "sales_ops",
        "reputation_manager",
        "competitive_analyst",
        "chief_growth_officer",
        "quality_compliance",
        "media_strategy",
        "youtube_optimizer",
        "streaming_packager",
        "shortform_repurposer",
        "ads_creative",
        "media_competitive_analyst",
        "media_analytics_guardian",
      ],
      app_role: ["owner", "admin", "member", "manager", "analyst", "viewer"],
      content_status: ["draft", "review", "approved", "published", "archived"],
      experiment_status: [
        "draft",
        "running",
        "paused",
        "completed",
        "archived",
      ],
      integration_provider: [
        "google_search_console",
        "google_analytics",
        "google_ads",
        "google_business_profile",
        "meta",
        "instagram",
        "wordpress",
        "shopify",
        "webflow",
        "email_provider",
        "crm",
        "calendar",
      ],
      integration_status: ["connected", "disconnected", "error", "pending"],
      issue_severity: ["critical", "high", "medium", "low", "info"],
      issue_status: ["open", "in_progress", "fixed", "ignored", "wont_fix"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      media_asset_status: [
        "draft",
        "planning",
        "pre_launch",
        "launching",
        "post_launch",
        "evergreen",
        "archived",
      ],
      media_creative_status: [
        "draft",
        "pending_review",
        "approved",
        "published",
        "rejected",
      ],
      media_platform: [
        "youtube_video",
        "youtube_channel",
        "spotify_track",
        "spotify_album",
        "spotify_artist",
        "apple_music",
        "soundcloud",
        "tiktok",
        "other",
      ],
      permission_action: [
        "run_agents",
        "approve_actions",
        "connect_integrations",
        "export_assets",
        "manage_billing",
        "manage_team",
        "view_analytics",
        "manage_policies",
        "manage_experiments",
        "view_audit",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      subscription_plan: ["free", "starter", "growth", "agency"],
    },
  },
} as const
