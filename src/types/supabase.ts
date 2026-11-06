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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      partner_accounts: {
        Row: {
          created_at: string
          member_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          member_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          member_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_accounts_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_agreements: {
        Row: {
          created_at: string
          document_url: string
          id: string
          member_id: string
          signed_date: string
          version: string
        }
        Insert: {
          created_at?: string
          document_url: string
          id?: string
          member_id: string
          signed_date: string
          version: string
        }
        Update: {
          created_at?: string
          document_url?: string
          id?: string
          member_id?: string
          signed_date?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_agreements_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_delivery_jobs: {
        Row: {
          attempts: number
          created_at: string
          first_send_at: string | null
          id: string
          kind: string
          last_error: string | null
          lease_id: string | null
          lease_until: string | null
          member_id: string
          payload: Json | null
          prepared_at: string | null
          recipient: string
          sent_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          first_send_at?: string | null
          id?: string
          kind: string
          last_error?: string | null
          lease_id?: string | null
          lease_until?: string | null
          member_id: string
          payload?: Json | null
          prepared_at?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          first_send_at?: string | null
          id?: string
          kind?: string
          last_error?: string | null
          lease_id?: string | null
          lease_until?: string | null
          member_id?: string
          payload?: Json | null
          prepared_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_delivery_jobs_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_draws: {
        Row: {
          amount: number
          created_at: string
          id: string
          member_id: string
          paid_date: string | null
          scheduled_week: string
          status: Database["public"]["Enums"]["partner_draw_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          member_id: string
          paid_date?: string | null
          scheduled_week: string
          status?: Database["public"]["Enums"]["partner_draw_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          member_id?: string
          paid_date?: string | null
          scheduled_week?: string
          status?: Database["public"]["Enums"]["partner_draw_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_draws_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_guarantors: {
        Row: {
          address: string
          approval_token: string
          created_at: string
          display_id: string
          email: string
          employer: string
          full_name: string
          id: string
          member_id: string
          phone: string
          relationship_to_member: string
          responded_at: string | null
          status: Database["public"]["Enums"]["partner_guarantor_status"]
          updated_at: string
        }
        Insert: {
          address: string
          approval_token: string
          created_at?: string
          display_id?: string
          email: string
          employer: string
          full_name: string
          id?: string
          member_id: string
          phone: string
          relationship_to_member: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["partner_guarantor_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          approval_token?: string
          created_at?: string
          display_id?: string
          email?: string
          employer?: string
          full_name?: string
          id?: string
          member_id?: string
          phone?: string
          relationship_to_member?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["partner_guarantor_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_guarantors_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_members: {
        Row: {
          address: string
          completion_date: string | null
          created_at: string
          deleted_at: string | null
          deposit_status: Database["public"]["Enums"]["partner_deposit_status"]
          display_id: string
          draw_date: string | null
          email: string
          employer: string
          enrollment_date: string
          full_name: string
          id: string
          is_test: boolean
          payment_day: number
          phone: string
          status: Database["public"]["Enums"]["partner_member_status"]
          tier: string
          updated_at: string
          weeks_paid: number
        }
        Insert: {
          address: string
          completion_date?: string | null
          created_at?: string
          deleted_at?: string | null
          deposit_status?: Database["public"]["Enums"]["partner_deposit_status"]
          display_id: string
          draw_date?: string | null
          email: string
          employer: string
          enrollment_date?: string
          full_name: string
          id?: string
          is_test?: boolean
          payment_day: number
          phone: string
          status?: Database["public"]["Enums"]["partner_member_status"]
          tier?: string
          updated_at?: string
          weeks_paid?: number
        }
        Update: {
          address?: string
          completion_date?: string | null
          created_at?: string
          deleted_at?: string | null
          deposit_status?: Database["public"]["Enums"]["partner_deposit_status"]
          display_id?: string
          draw_date?: string | null
          email?: string
          employer?: string
          enrollment_date?: string
          full_name?: string
          id?: string
          is_test?: boolean
          payment_day?: number
          phone?: string
          status?: Database["public"]["Enums"]["partner_member_status"]
          tier?: string
          updated_at?: string
          weeks_paid?: number
        }
        Relationships: []
      }
      partner_operation_receipts: {
        Row: {
          actor_id: string | null
          created_at: string
          operation: string
          payload: Json
          request_id: string
          result: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          operation: string
          payload: Json
          request_id: string
          result: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          operation?: string
          payload?: Json
          request_id?: string
          result?: Json
        }
        Relationships: []
      }
      partner_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          late_fee: number
          member_id: string
          method: string | null
          received_date: string | null
          recorded_by: string | null
          status: Database["public"]["Enums"]["partner_payment_status"]
          updated_at: string
          week_number: number
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          late_fee?: number
          member_id: string
          method?: string | null
          received_date?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["partner_payment_status"]
          updated_at?: string
          week_number: number
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          late_fee?: number
          member_id?: string
          method?: string | null
          received_date?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["partner_payment_status"]
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_payments_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "partner_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_tier_interest: {
        Row: {
          created_at: string
          email: string
          id: string
          tier: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tier: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tier?: string
        }
        Relationships: []
      }
      email_studio_templates: {
        Row: { key: string; subject: string; opening: string; body: string; version: number; updated_at: string; updated_by: string }
        Insert: { key: string; subject: string; opening: string; body: string; version?: number; updated_at?: string; updated_by: string }
        Update: { subject?: string; opening?: string; body?: string; version?: number; updated_at?: string; updated_by?: string }
        Relationships: []
      }
      email_studio_tests: {
        Row: { id: string; actor: string; recipient: string; payload: Json; created_at: string; status: string; provider_id: string | null }
        Insert: { id: string; actor: string; recipient: string; payload: Json; status?: string; provider_id?: string | null }
        Update: { status?: string; provider_id?: string | null }
        Relationships: []
      }

      youtube_upload_requests: { Row: { source:string;record_id:string;request_id:string;status:string;youtube_id:string|null;created_at:string }; Insert: { source:string;record_id:string;request_id?:string;status?:string;youtube_id?:string|null;created_at?:string }; Update: { request_id?:string;status?:string;youtube_id?:string|null }; Relationships:[] }

      newsletter_deliveries: { Row: { run_id: string; subscriber_id: string; email: string; status: string; first_attempt_at: string | null; claimed_at: string | null; provider_id: string | null }; Insert: { run_id?: string; subscriber_id?: string; email?: string; status?: string; first_attempt_at?: string | null; claimed_at?: string | null; provider_id?: string | null }; Update: { run_id?: string; subscriber_id?: string; email?: string; status?: string; first_attempt_at?: string | null; claimed_at?: string | null; provider_id?: string | null }; Relationships: [] }

      newsletter_runs: { Row: { id: string; subject: string; body: string; created_by: string; created_at: string }; Insert: { id?: string; subject?: string; body?: string; created_by?: string; created_at?: string }; Update: { id?: string; subject?: string; body?: string; created_by?: string; created_at?: string }; Relationships: [] }

      newsletter_confirmations: { Row: { email: string; token_hash: string; expires_at: string }; Insert: { email?: string; token_hash?: string; expires_at?: string }; Update: { email?: string; token_hash?: string; expires_at?: string }; Relationships: [] }

      upload_reservations: { Row: { id: string; owner_id: string; artist_id: string; purpose: string; kind: string; bucket: string; path: string; mime_type: string; size_bytes: number; expires_at: string }; Insert: { id?: string; owner_id?: string; artist_id?: string; purpose?: string; kind?: string; bucket?: string; path?: string; mime_type?: string; size_bytes?: number; expires_at?: string }; Update: { id?: string; owner_id?: string; artist_id?: string; purpose?: string; kind?: string; bucket?: string; path?: string; mime_type?: string; size_bytes?: number; expires_at?: string }; Relationships: [] }

      storage_cleanup_queue: { Row: { id: string; bucket: string; path: string; created_at: string }; Insert: { id?: string; bucket?: string; path?: string; created_at?: string }; Update: { id?: string; bucket?: string; path?: string; created_at?: string }; Relationships: [] }


      ai_generated_images: {
        Row: {
          created_at: string
          id: string
          prompt: string | null
          purpose: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt?: string | null
          purpose?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string | null
          purpose?: string | null
          url?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio: string
          created_at: string
          featured_order: number | null
          genres: string[]
          hometown: string | null
          id: string
          legal_name: string | null
          photo_url: string | null
          slug: string
          socials: Json
          stage_name: string
          status: string
          streaming: Json
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          featured_order?: number | null
          genres?: string[]
          hometown?: string | null
          id?: string
          legal_name?: string | null
          photo_url?: string | null
          slug: string
          socials?: Json
          stage_name: string
          status?: string
          streaming?: Json
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          featured_order?: number | null
          genres?: string[]
          hometown?: string | null
          id?: string
          legal_name?: string | null
          photo_url?: string | null
          slug?: string
          socials?: Json
          stage_name?: string
          status?: string
          streaming?: Json
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          artist_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          is_public: boolean
          kind: string
          mime_type: string
          notes: string | null
          size_bytes: number
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_public?: boolean
          kind: string
          mime_type: string
          notes?: string | null
          size_bytes: number
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_public?: boolean
          kind?: string
          mime_type?: string
          notes?: string | null
          size_bytes?: number
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_regulars: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      campaign_ideas: {
        Row: {
          angle: string | null
          created_at: string
          id: string
          pillar: string | null
          source_type: string
          status: string
          suggested_platforms: string[]
          title: string
        }
        Insert: {
          angle?: string | null
          created_at?: string
          id?: string
          pillar?: string | null
          source_type?: string
          status?: string
          suggested_platforms?: string[]
          title: string
        }
        Update: {
          angle?: string | null
          created_at?: string
          id?: string
          pillar?: string | null
          source_type?: string
          status?: string
          suggested_platforms?: string[]
          title?: string
        }
        Relationships: []
      }
      content_campaigns: {
        Row: {
          created_at: string
          id: string
          source_content: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_content: string
          source_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          source_content?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_pieces: {
        Row: {
          campaign_id: string
          caption: string | null
          content_type: string
          created_at: string
          error: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          platform: string
          published_at: string | null
          sort_order: number
          status: string
          updated_at: string
          video_mode: string | null
          video_script: string | null
          video_url: string | null
        }
        Insert: {
          campaign_id: string
          caption?: string | null
          content_type: string
          created_at?: string
          error?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform: string
          published_at?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          video_mode?: string | null
          video_script?: string | null
          video_url?: string | null
        }
        Update: {
          campaign_id?: string
          caption?: string | null
          content_type?: string
          created_at?: string
          error?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform?: string
          published_at?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          video_mode?: string | null
          video_script?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "content_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          is_public: boolean
          location: string
          tickets_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          is_public?: boolean
          location?: string
          tickets_url?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          is_public?: boolean
          location?: string
          tickets_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fan_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          duration_type: string | null
          ended_at: string | null
          id: string
          member_id: string | null
          notes: string | null
          price_jmd: number | null
          started_at: string
          started_by: string | null
          station: string | null
          tab_item_id: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          duration_type?: string | null
          ended_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          price_jmd?: number | null
          started_at?: string
          started_by?: string | null
          station?: string | null
          tab_item_id?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          duration_type?: string | null
          ended_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          price_jmd?: number | null
          started_at?: string
          started_by?: string | null
          station?: string | null
          tab_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gamer_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_tab_item_id_fkey"
            columns: ["tab_item_id"]
            isOneToOne: false
            referencedRelation: "pos_tab_items"
            referencedColumns: ["id"]
          },
        ]
      }
      gamer_balance_transactions: {
        Row: {
          amount_minutes: number
          created_at: string
          created_by: string | null
          id: string
          member_id: string
          reason: string | null
          type: string
        }
        Insert: {
          amount_minutes: number
          created_at?: string
          created_by?: string | null
          id?: string
          member_id: string
          reason?: string | null
          type: string
        }
        Update: {
          amount_minutes?: number
          created_at?: string
          created_by?: string | null
          id?: string
          member_id?: string
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamer_balance_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "gamer_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gamer_members: {
        Row: {
          auth_user_id: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          minutes_balance: number
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          minutes_balance?: number
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          minutes_balance?: number
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          body: string
          category: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_items: {
        Row: {
          bottle_group: string | null
          bottle_parent_id: string | null
          bottle_yield: number | null
          category: string
          cost_jmd: number | null
          created_at: string
          menu_section: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_jmd: number
          reorder_level: number | null
          sort_order: number | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          bottle_group?: string | null
          bottle_parent_id?: string | null
          bottle_yield?: number | null
          category?: string
          cost_jmd?: number | null
          created_at?: string
          menu_section?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_jmd: number
          reorder_level?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          bottle_group?: string | null
          bottle_parent_id?: string | null
          bottle_yield?: number | null
          category?: string
          cost_jmd?: number | null
          created_at?: string
          menu_section?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_jmd?: number
          reorder_level?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_stock_purchases: {
        Row: {
          added_by: string | null
          container_cost_jmd: number | null
          containers: number | null
          created_at: string
          id: string
          note: string | null
          pos_item_id: string
          quantity_added: number
          total_cost_jmd: number
          unit_cost_jmd: number
        }
        Insert: {
          added_by?: string | null
          container_cost_jmd?: number | null
          containers?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pos_item_id: string
          quantity_added: number
          total_cost_jmd: number
          unit_cost_jmd: number
        }
        Update: {
          added_by?: string | null
          container_cost_jmd?: number | null
          containers?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pos_item_id?: string
          quantity_added?: number
          total_cost_jmd?: number
          unit_cost_jmd?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_stock_purchases_pos_item_id_fkey"
            columns: ["pos_item_id"]
            isOneToOne: false
            referencedRelation: "pos_items"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_throttle: {
        Row: {
          created_at: string
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      pos_voids: {
        Row: {
          cost_jmd: number | null
          created_at: string
          id: string
          name: string
          pos_item_id: string | null
          price_jmd: number
          quantity: number
          reason: string | null
          tab_id: string | null
          voided_by: string | null
        }
        Insert: {
          cost_jmd?: number | null
          created_at?: string
          id?: string
          name: string
          pos_item_id?: string | null
          price_jmd: number
          quantity: number
          reason?: string | null
          tab_id?: string | null
          voided_by?: string | null
        }
        Update: {
          cost_jmd?: number | null
          created_at?: string
          id?: string
          name?: string
          pos_item_id?: string | null
          price_jmd?: number
          quantity?: number
          reason?: string | null
          tab_id?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_voids_pos_item_id_fkey"
            columns: ["pos_item_id"]
            isOneToOne: false
            referencedRelation: "pos_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_voids_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "pos_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_tab_items: {
        Row: {
          cost_jmd: number | null
          created_at: string
          id: string
          name: string
          note: string | null
          pos_item_id: string | null
          price_jmd: number
          quantity: number
          tab_id: string
        }
        Insert: {
          cost_jmd?: number | null
          created_at?: string
          id?: string
          name: string
          note?: string | null
          pos_item_id?: string | null
          price_jmd: number
          quantity?: number
          tab_id: string
        }
        Update: {
          cost_jmd?: number | null
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          pos_item_id?: string | null
          price_jmd?: number
          quantity?: number
          tab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_tab_items_pos_item_id_fkey"
            columns: ["pos_item_id"]
            isOneToOne: false
            referencedRelation: "pos_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_tab_items_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "pos_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_tabs: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          opened_by: string | null
          payment_method: string | null
          regular_id: string | null
          status: string
          tip_jmd: number
          total_jmd: number
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          opened_by?: string | null
          payment_method?: string | null
          regular_id?: string | null
          status?: string
          tip_jmd?: number
          total_jmd?: number
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          opened_by?: string | null
          payment_method?: string | null
          regular_id?: string | null
          status?: string
          tip_jmd?: number
          total_jmd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_tabs_regular_id_fkey"
            columns: ["regular_id"]
            isOneToOne: false
            referencedRelation: "bar_regulars"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_id: string | null
          created_at: string
          id: string
          is_bartender: boolean
          role: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          id: string
          is_bartender?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          id?: string
          is_bartender?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          artist_id: string
          catalog_no: string | null
          cover_url: string
          created_at: string
          description: string | null
          featured: boolean
          id: string
          production_status: string
          release_date: string
          slug: string
          streaming_links: Json
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          catalog_no?: string | null
          cover_url?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          production_status?: string
          release_date: string
          slug: string
          streaming_links?: Json
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          catalog_no?: string | null
          cover_url?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          production_status?: string
          release_date?: string
          slug?: string
          streaming_links?: Json
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      signup_applications: {
        Row: {
          approval_lease_until: string | null
          provisioned_user_id: string | null
          provisioned_artist_id: string | null
          code_id: string
          created_at: string
          email: string
          genres: string[]
          id: string
          legal_name: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          socials: Json
          stage_name: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_lease_until?: string | null
          provisioned_user_id?: string | null
          provisioned_artist_id?: string | null
          code_id: string
          created_at?: string
          email: string
          genres?: string[]
          id?: string
          legal_name: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          socials?: Json
          stage_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_lease_until?: string | null
          provisioned_user_id?: string | null
          provisioned_artist_id?: string | null
          code_id?: string
          created_at?: string
          email?: string
          genres?: string[]
          id?: string
          legal_name?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          socials?: Json
          stage_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signup_applications_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "signup_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signup_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          rotated_at: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          rotated_at?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          rotated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      video_jobs: {
        Row: {
          artist_id: string
          completed_at: string | null
          cost_estimate_usd: number | null
          created_at: string
          error: string | null
          id: string
          inngest_run_id: string | null
          is_public: boolean
          output_url: string | null
          params: Json
          source_asset_id: string
          started_at: string | null
          status: string
          updated_at: string
          youtube_id: string | null
          youtube_upload_status: string | null
        }
        Insert: {
          artist_id: string
          completed_at?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          error?: string | null
          id?: string
          inngest_run_id?: string | null
          is_public?: boolean
          output_url?: string | null
          params?: Json
          source_asset_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          youtube_id?: string | null
          youtube_upload_status?: string | null
        }
        Update: {
          artist_id?: string
          completed_at?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          error?: string | null
          id?: string
          inngest_run_id?: string | null
          is_public?: boolean
          output_url?: string | null
          params?: Json
          source_asset_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          youtube_id?: string | null
          youtube_upload_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_jobs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_jobs_source_asset_id_fkey"
            columns: ["source_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          artist_id: string
          created_at: string
          featured: boolean
          id: string
          kind: string
          published_at: string
          release_id: string | null
          storage_url: string | null
          title: string
          updated_at: string
          youtube_id: string | null
          youtube_upload_status: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          featured?: boolean
          id?: string
          kind: string
          published_at?: string
          release_id?: string | null
          storage_url?: string | null
          title: string
          updated_at?: string
          youtube_id?: string | null
          youtube_upload_status?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          featured?: boolean
          id?: string
          kind?: string
          published_at?: string
          release_id?: string | null
          storage_url?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string | null
          youtube_upload_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      partner_admin_operation: {
        Args: {
          p_actor: string
          p_operation: string
          p_payload: Json
          p_request_id: string
        }
        Returns: Json
      }
      partner_apply_application: {
        Args: { p_guarantor: Json; p_member: Json; p_request_id: string }
        Returns: string
      }
      partner_capture_interest: {
        Args: { p_email: string; p_tier: string }
        Returns: undefined
      }
      partner_claim_mail: {
        Args: { p_member?: string }
        Returns: {
          attempts: number
          created_at: string
          first_send_at: string | null
          id: string
          kind: string
          last_error: string | null
          lease_id: string | null
          lease_until: string | null
          member_id: string
          payload: Json | null
          prepared_at: string | null
          recipient: string
          sent_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "partner_delivery_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      partner_current_member_id: { Args: never; Returns: string }
      partner_daily_maintenance: { Args: never; Returns: Json }
      partner_link_account: {
        Args: { p_member: string; p_user: string }
        Returns: undefined
      }
      partner_lookup_account: { Args: { p_email: string }; Returns: string }
      partner_queue_position: { Args: { p_member: string }; Returns: Json }
      partner_respond_guarantor: {
        Args: { p_response: string; p_token: string }
        Returns: Json
      }
      partner_tier_config: { Args: { p_tier: string }; Returns: Json }
      partner_tier_summary: {
        Args: { include_test?: boolean }
        Returns: {
          active_members: number
          buffer_balance: number
          queue_length: number
          tier: string
          total_contributions_received: number
          total_draws_paid: number
        }[]
      }
      partner_validate_person: {
        Args: { p_guarantor?: boolean; p_person: Json }
        Returns: undefined
      }
      save_email_studio_template: { Args: { p_key: string; p_subject: string; p_opening: string; p_body: string; p_version: number; p_actor: string }; Returns: number }
      prepare_email_studio_test: { Args: { p_id: string; p_actor: string; p_recipient: string; p_payload: Json }; Returns: Json }

      newsletter_progress: { Args:{p_actor:string;p_run?:string|null}; Returns:{run_id:string;subject:string;created_at:string;sent:number;remaining:number;uncertain:number}[] }

      bar_open_tab: { Args:{p_request_id:string;p_actor:string;p_name:string;p_notes:string|null;p_regular:string|null}; Returns:string }
      bar_save_regular: { Args:{p_tab:string}; Returns:string }

      finalize_asset_upload: { Args: {p_upload:string;p_owner:string;p_title:string;p_notes:string|null;p_duration:number|null}; Returns:string }

      claim_youtube_upload: { Args: {p_source:string;p_id:string}; Returns:string }

      confirm_newsletter: { Args: {p_email:string;p_hash:string}; Returns:boolean }
      prepare_newsletter: { Args: {p_id:string;p_subject:string;p_body:string;p_actor:string}; Returns:undefined }
      claim_newsletter_batch: { Args: {p_id:string}; Returns: Database["public"]["Tables"]["newsletter_deliveries"]["Row"][] }

      delete_asset_record: { Args: { p_id: string; p_artist: string }; Returns: undefined }
      claim_application: { Args: { p_id: string }; Returns: Json }
      finish_application: { Args: { p_id: string; p_user: string; p_admin: string }; Returns: undefined }
      consume_form_limit: { Args: { p_key: string; p_limit: number; p_window_seconds: number }; Returns: boolean }
      submit_artist_application: { Args: { p_data: Json }; Returns: string | null }

      bar_apply_operation: { Args: { p_request_id: string; p_actor: string; p_tab_id: string; p_operation: string; p_payload: Json }; Returns: undefined }
      bar_record_purchase: { Args: { p_request_id: string; p_actor: string; p_item_id: string; p_qty: number; p_unit_cost: number; p_total_cost: number; p_containers: number | null; p_container_cost: number | null; p_note: string | null }; Returns: number }


      add_pos_item_stock: {
        Args: { p_item_id: string; p_qty: number; p_unit_cost_jmd: number }
        Returns: number
      }
      admin_artist_counts: {
        Args: { p_artist_ids: string[] }
        Returns: { artist_id: string; asset_count: number; job_count: number }[]
      }
      admin_campaign_piece_counts: {
        Args: never
        Returns: { campaign_id: string; total: number; approved: number; published: number }[]
      }
      bar_sales_payment_summary: {
        Args: { p_start: string | null }
        Returns: { payment_method: string; tab_count: number; revenue_jmd: number }[]
      }
      bar_sales_by_category: {
        Args: { p_start: string | null }
        Returns: { category: string; qty: number; revenue_jmd: number; cost_jmd: number }[]
      }
      bar_sales_top_items: {
        Args: { p_start: string | null; p_limit?: number }
        Returns: { name: string; category: string; qty: number; revenue_jmd: number; cost_jmd: number }[]
      }
      current_artist_id: { Args: never; Returns: string }
      adjust_member_minutes: {
        Args: { p_member_id: string; p_delta: number; p_clamp_zero?: boolean }
        Returns: number
      }
      current_gamer_member_id: { Args: never; Returns: string }
      decrement_pos_item_stock: {
        Args: { p_item_id: string }
        Returns: boolean
      }
      decrement_pos_item_stock_by: {
        Args: { p_item_id: string; p_qty: number }
        Returns: boolean
      }
      decrement_tab_item_quantity: {
        Args: { p_tab_item_id: string }
        Returns: undefined
      }
      decrement_tab_total: {
        Args: { p_amount: number; p_tab_id: string }
        Returns: undefined
      }
      increment_pos_item_stock_by: {
        Args: { p_item_id: string; p_qty: number }
        Returns: boolean
      }
      increment_tab_item_quantity: {
        Args: { p_tab_item_id: string }
        Returns: undefined
      }
      increment_tab_total: {
        Args: { p_amount: number; p_tab_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_bar_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      partner_deposit_status: "pending" | "held" | "refunded" | "forfeited"
      partner_draw_status: "scheduled" | "paid" | "cancelled"
      partner_guarantor_status: "pending" | "approved" | "declined" | "timeout"
      partner_member_status:
        | "pending_guarantor"
        | "active"
        | "eligible"
        | "drew"
        | "completed"
        | "defaulted_predraw"
        | "defaulted_postdraw"
        | "withdrawn"
      partner_payment_status: "pending" | "paid" | "late" | "defaulted"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      partner_deposit_status: ["pending", "held", "refunded", "forfeited"],
      partner_draw_status: ["scheduled", "paid", "cancelled"],
      partner_guarantor_status: ["pending", "approved", "declined", "timeout"],
      partner_member_status: ["pending_guarantor", "active", "eligible", "drew", "completed", "defaulted_predraw", "defaulted_postdraw", "withdrawn"],
      partner_payment_status: ["pending", "paid", "late", "defaulted"],
    },
  },
} as const
