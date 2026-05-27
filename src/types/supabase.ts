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
      news_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          body: string
          cover_url: string | null
          category: string
          published_at: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          body?: string
          cover_url?: string | null
          category?: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          body?: string
          cover_url?: string | null
          category?: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
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
      profiles: {
        Row: {
          artist_id: string | null
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          id?: string
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
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          featured?: boolean
          id?: string
          kind: string
          published_at?: string
          release_id?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          featured?: boolean
          id?: string
          kind?: string
          published_at?: string
          release_id?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
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
      current_artist_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
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
