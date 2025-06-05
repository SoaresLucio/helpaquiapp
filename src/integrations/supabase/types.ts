export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bank_details: {
        Row: {
          account_number: string
          account_type: string
          bank_name: string
          branch: string
          created_at: string
          document: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_number: string
          account_type: string
          bank_name: string
          branch: string
          created_at?: string
          document: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_number?: string
          account_type?: string
          bank_name?: string
          branch?: string
          created_at?: string
          document?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          action: string
          amount: number | null
          created_at: string
          id: string
          payment_id: string | null
        }
        Insert: {
          action: string
          amount?: number | null
          created_at?: string
          id?: string
          payment_id?: string | null
        }
        Update: {
          action?: string
          amount?: number | null
          created_at?: string
          id?: string
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          freelancer_amount: number
          freelancer_id: string | null
          id: string
          platform_fee: number
          service_id: string
          service_title: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          freelancer_amount: number
          freelancer_id?: string | null
          id?: string
          platform_fee: number
          service_id: string
          service_title?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          freelancer_amount?: number
          freelancer_id?: string | null
          id?: string
          platform_fee?: number
          service_id?: string
          service_title?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          cover_photo: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          created_at: string
          created_by: string | null
          cta_text: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_proposals: {
        Row: {
          created_at: string
          estimated_time: string | null
          freelancer_id: string
          id: string
          message: string | null
          proposed_price: number | null
          service_request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_time?: string | null
          freelancer_id: string
          id?: string
          message?: string | null
          proposed_price?: number | null
          service_request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_time?: string | null
          freelancer_id?: string
          id?: string
          message?: string | null
          proposed_price?: number | null
          service_request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_proposals_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          status: string
          title: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          max_requests_per_month: number | null
          name: string
          price_monthly: number
          priority_support: boolean | null
          stripe_price_id: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          max_requests_per_month?: number | null
          name: string
          price_monthly: number
          priority_support?: boolean | null
          stripe_price_id?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          max_requests_per_month?: number | null
          name?: string
          price_monthly?: number
          priority_support?: boolean | null
          stripe_price_id?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          requests_used_this_month: number | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          requests_used_this_month?: number | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          requests_used_this_month?: number | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_request_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args:
          | {
              _user_id: string
              _role: Database["public"]["Enums"]["user_role"]
            }
          | { _user_id: string; _role: string }
        Returns: boolean
      }
      insert_bank_details: {
        Args: {
          p_user_id: string
          p_bank_name: string
          p_account_type: string
          p_account_number: string
          p_branch: string
          p_document: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_success?: boolean
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "user" | "helpadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "helpadmin"],
    },
  },
} as const
