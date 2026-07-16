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
          cost_cents: number | null
          created_at: string
          menu_section: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
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
          cost_cents?: number | null
          created_at?: string
          menu_section?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
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
          cost_cents?: number | null
          created_at?: string
          menu_section?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
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
          container_cost_cents: number | null
          containers: number | null
          created_at: string
          id: string
          note: string | null
          pos_item_id: string
          quantity_added: number
          total_cost_cents: number
          unit_cost_cents: number
        }
        Insert: {
          added_by?: string | null
          container_cost_cents?: number | null
          containers?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pos_item_id: string
          quantity_added: number
          total_cost_cents: number
          unit_cost_cents: number
        }
        Update: {
          added_by?: string | null
          container_cost_cents?: number | null
          containers?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pos_item_id?: string
          quantity_added?: number
          total_cost_cents?: number
          unit_cost_cents?: number
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
      pos_tab_items: {
        Row: {
          cost_cents: number | null
          created_at: string
          id: string
          name: string
          note: string | null
          pos_item_id: string | null
          price_cents: number
          quantity: number
          tab_id: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          id?: string
          name: string
          note?: string | null
          pos_item_id?: string | null
          price_cents: number
          quantity?: number
          tab_id: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          pos_item_id?: string | null
          price_cents?: number
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
          tip_cents: number
          total_cents: number
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
          tip_cents?: number
          total_cents?: number
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
          tip_cents?: number
          total_cents?: number
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
      add_pos_item_stock: {
        Args: { p_item_id: string; p_qty: number; p_unit_cost_cents: number }
        Returns: number
      }
      current_artist_id: { Args: never; Returns: string }
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
