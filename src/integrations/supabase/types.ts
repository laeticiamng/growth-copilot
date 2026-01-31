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
      integrations: {
        Row: {
          access_token_ref: string | null
          account_id: string | null
          account_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider: Database["public"]["Enums"]["integration_provider"]
          refresh_token_ref: string | null
          scopes: Json | null
          site_id: string | null
          status: Database["public"]["Enums"]["integration_status"] | null
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
          last_sync_at?: string | null
          metadata?: Json | null
          provider: Database["public"]["Enums"]["integration_provider"]
          refresh_token_ref?: string | null
          scopes?: Json | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
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
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["integration_provider"]
          refresh_token_ref?: string | null
          scopes?: Json | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
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
          organic_clicks: number | null
          organic_impressions: number | null
          organic_sessions: number | null
          revenue: number | null
          site_id: string
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
          organic_clicks?: number | null
          organic_impressions?: number | null
          organic_sessions?: number | null
          revenue?: number | null
          site_id: string
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
          organic_clicks?: number | null
          organic_impressions?: number | null
          organic_sessions?: number | null
          revenue?: number | null
          site_id?: string
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
      get_user_workspace_ids: { Args: { _user_id: string }; Returns: string[] }
      has_agency_access: {
        Args: { _client_workspace_id: string; _user_id: string }
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
      app_role: "owner" | "admin" | "member"
      content_status: "draft" | "review" | "approved" | "published" | "archived"
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
      ],
      app_role: ["owner", "admin", "member"],
      content_status: ["draft", "review", "approved", "published", "archived"],
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
      subscription_plan: ["free", "starter", "growth", "agency"],
    },
  },
} as const
