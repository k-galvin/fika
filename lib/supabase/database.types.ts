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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          description: string
          id: number
          image_url: string | null
          name: string
          threshold_visits: number
        }
        Insert: {
          description: string
          id?: number
          image_url?: string | null
          name: string
          threshold_visits: number
        }
        Update: {
          description?: string
          id?: number
          image_url?: string | null
          name?: string
          threshold_visits?: number
        }
        Relationships: []
      }
      cafe_updates: {
        Row: {
          approved: boolean | null
          cafe_id: number | null
          created_at: string | null
          field_name: string | null
          id: number
          suggested_value: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          cafe_id?: number | null
          created_at?: string | null
          field_name?: string | null
          id?: number
          suggested_value?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          cafe_id?: number | null
          created_at?: string | null
          field_name?: string | null
          id?: number
          suggested_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafe_updates_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "coffee_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_shops: {
        Row: {
          address: string | null
          busyness: Database["public"]["Enums"]["Busyness"] | null
          city: Database["public"]["Enums"]["Cities"] | null
          has_outlets: boolean | null
          has_wifi: boolean | null
          id: number
          is_featured: boolean | null
          is_laptop_friendly: boolean | null
          name: string | null
          parking: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing: Database["public"]["Enums"]["Pricing"] | null
          seating: Database["public"]["Enums"]["Seating Availability"] | null
          summary: string | null
          vibe: Database["public"]["Enums"]["Vibe"] | null
          wine_bar: boolean | null
        }
        Insert: {
          address?: string | null
          busyness?: Database["public"]["Enums"]["Busyness"] | null
          city?: Database["public"]["Enums"]["Cities"] | null
          has_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: number
          is_featured?: boolean | null
          is_laptop_friendly?: boolean | null
          name?: string | null
          parking?: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing?: Database["public"]["Enums"]["Pricing"] | null
          seating?: Database["public"]["Enums"]["Seating Availability"] | null
          summary?: string | null
          vibe?: Database["public"]["Enums"]["Vibe"] | null
          wine_bar?: boolean | null
        }
        Update: {
          address?: string | null
          busyness?: Database["public"]["Enums"]["Busyness"] | null
          city?: Database["public"]["Enums"]["Cities"] | null
          has_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: number
          is_featured?: boolean | null
          is_laptop_friendly?: boolean | null
          name?: string | null
          parking?: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing?: Database["public"]["Enums"]["Pricing"] | null
          seating?: Database["public"]["Enums"]["Seating Availability"] | null
          summary?: string | null
          vibe?: Database["public"]["Enums"]["Vibe"] | null
          wine_bar?: boolean | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          friend_id: string | null
          id: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          friend_id?: string | null
          id?: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          friend_id?: string | null
          id?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string | null
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string | null
        }
        Relationships: []
      }
      shop_photos: {
        Row: {
          id: number
          is_approved: boolean
          is_primary: boolean | null
          photo_url: string
          shop_id: number
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          id?: number
          is_approved?: boolean
          is_primary?: boolean | null
          photo_url: string
          shop_id: number
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          id?: number
          is_approved?: boolean
          is_primary?: boolean | null
          photo_url?: string
          shop_id?: number
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_photos_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "coffee_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggested_cafes: {
        Row: {
          address: string | null
          busyness: Database["public"]["Enums"]["Busyness"] | null
          city: Database["public"]["Enums"]["Cities"] | null
          created_at: string
          description: string | null
          has_outlets: boolean | null
          has_wifi: boolean | null
          id: number
          is_laptop_friendly: boolean | null
          name: string
          parking: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing: Database["public"]["Enums"]["Pricing"] | null
          seating: Database["public"]["Enums"]["Seating Availability"] | null
          submitted_by: string | null
          vibe: Database["public"]["Enums"]["Vibe"] | null
          wine_bar: boolean | null
        }
        Insert: {
          address?: string | null
          busyness?: Database["public"]["Enums"]["Busyness"] | null
          city?: Database["public"]["Enums"]["Cities"] | null
          created_at?: string
          description?: string | null
          has_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: number
          is_laptop_friendly?: boolean | null
          name: string
          parking?: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing?: Database["public"]["Enums"]["Pricing"] | null
          seating?: Database["public"]["Enums"]["Seating Availability"] | null
          submitted_by?: string | null
          vibe?: Database["public"]["Enums"]["Vibe"] | null
          wine_bar?: boolean | null
        }
        Update: {
          address?: string | null
          busyness?: Database["public"]["Enums"]["Busyness"] | null
          city?: Database["public"]["Enums"]["Cities"] | null
          created_at?: string
          description?: string | null
          has_outlets?: boolean | null
          has_wifi?: boolean | null
          id?: number
          is_laptop_friendly?: boolean | null
          name?: string
          parking?: Database["public"]["Enums"]["Parking Difficulty"] | null
          pricing?: Database["public"]["Enums"]["Pricing"] | null
          seating?: Database["public"]["Enums"]["Seating Availability"] | null
          submitted_by?: string | null
          vibe?: Database["public"]["Enums"]["Vibe"] | null
          wine_bar?: boolean | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: number
          earned_at: string | null
          id: number
          profile_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string | null
          id?: number
          profile_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string | null
          id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_cafes: {
        Row: {
          coffee_shop_id: number
          id: string
          profile_id: string
          saved_at: string
        }
        Insert: {
          coffee_shop_id: number
          id?: string
          profile_id: string
          saved_at?: string
        }
        Update: {
          coffee_shop_id?: number
          id?: string
          profile_id?: string
          saved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_cafes_coffee_shop_id_fkey"
            columns: ["coffee_shop_id"]
            isOneToOne: false
            referencedRelation: "coffee_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_cafes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_visits: {
        Row: {
          coffee_shop_id: number
          id: string
          profile_id: string
          rating: number | null
          visited_at: string
        }
        Insert: {
          coffee_shop_id: number
          id?: string
          profile_id: string
          rating?: number | null
          visited_at?: string
        }
        Update: {
          coffee_shop_id?: number
          id?: string
          profile_id?: string
          rating?: number | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_visits_coffee_shop_id_fkey"
            columns: ["coffee_shop_id"]
            isOneToOne: false
            referencedRelation: "coffee_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_visits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_coffee_shop_activity_over_time: {
        Args: {
          end_date: string
          start_date: string
          target_coffee_shop_id: number
        }
        Returns: {
          daily_save_count: number
          daily_visit_count: number
          time_period: string
        }[]
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      Busyness: "Quiet" | "Medium" | "Very"
      Cities:
        | "Los Angeles"
        | "Newport Beach"
        | "Costa Mesa"
        | "London"
        | "San Francisco"
        | "Copenhagen"
        | "San Diego"
        | "Lisbon"
        | "Kyoto"
        | "Tokyo"
      "Parking Difficulty": "Easy" | "Medium" | "Hard"
      Pricing: "$" | "$$" | "$$$"
      "Seating Availability": "None" | "Some" | "Plenty"
      user_role: "user" | "admin"
      Vibe: "Minimalistic" | "Cool" | "Corporate" | "Cozy" | "Beachy" | "Trendy"
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
      Busyness: ["Quiet", "Medium", "Very"],
      Cities: [
        "Los Angeles",
        "Newport Beach",
        "Costa Mesa",
        "London",
        "San Francisco",
        "Copenhagen",
        "San Diego",
        "Lisbon",
        "Kyoto",
        "Tokyo",
      ],
      "Parking Difficulty": ["Easy", "Medium", "Hard"],
      Pricing: ["$", "$$", "$$$"],
      "Seating Availability": ["None", "Some", "Plenty"],
      user_role: ["user", "admin"],
      Vibe: ["Minimalistic", "Cool", "Corporate", "Cozy", "Beachy", "Trendy"],
    },
  },
} as const
