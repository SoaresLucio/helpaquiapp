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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      administradores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          role: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          role: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          role?: string
        }
        Relationships: []
      }
      ai_support_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          session_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_support_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_content: string
          metadata: Json | null
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_content: string
          metadata?: Json | null
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_content?: string
          metadata?: Json | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_configurations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_configurations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "administradores"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          order_position: number | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          order_position?: number | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          order_position?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          freelancer_id: string
          id: string
          service_request_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          freelancer_id: string
          id?: string
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          freelancer_id?: string
          id?: string
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_profiles: {
        Row: {
          cnpj: string
          company_name: string
          created_at: string
          employee_count: string | null
          id: string
          purpose: string[] | null
          responsible_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cnpj: string
          company_name: string
          created_at?: string
          employee_count?: string | null
          id?: string
          purpose?: string[] | null
          responsible_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cnpj?: string
          company_name?: string
          created_at?: string
          employee_count?: string | null
          id?: string
          purpose?: string[] | null
          responsible_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      freelancer_offers: {
        Row: {
          availability: string | null
          created_at: string
          freelancer_id: string
          id: string
          message: string | null
          offered_value: number
          service_request_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          freelancer_id: string
          id?: string
          message?: string | null
          offered_value: number
          service_request_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          freelancer_id?: string
          id?: string
          message?: string | null
          offered_value?: number
          service_request_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_offers_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_offers_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          available: boolean | null
          category: string
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          observations: string | null
          portfolio_photos: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          observations?: string | null
          portfolio_photos?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          observations?: string | null
          portfolio_photos?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancer_service_offers: {
        Row: {
          categories: string[]
          created_at: string
          custom_categories: string[] | null
          description: string
          freelancer_id: string
          id: string
          is_active: boolean
          location: string | null
          photos: string[] | null
          rate: string
          title: string
          updated_at: string
        }
        Insert: {
          categories: string[]
          created_at?: string
          custom_categories?: string[] | null
          description: string
          freelancer_id: string
          id?: string
          is_active?: boolean
          location?: string | null
          photos?: string[] | null
          rate: string
          title: string
          updated_at?: string
        }
        Update: {
          categories?: string[]
          created_at?: string
          custom_categories?: string[] | null
          description?: string
          freelancer_id?: string
          id?: string
          is_active?: boolean
          location?: string | null
          photos?: string[] | null
          rate?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          candidate_email: string
          candidate_name: string
          candidate_phone: string | null
          created_at: string
          id: string
          job_listing_id: string | null
          message: string | null
          resume_url: string
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          candidate_phone?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string | null
          message?: string | null
          resume_url: string
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          candidate_phone?: string | null
          created_at?: string
          id?: string
          job_listing_id?: string | null
          message?: string | null
          resume_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "public_job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          benefits: string | null
          company_email: string
          company_name: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          job_type: string
          location: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          owner_id: string | null
          requirements: string | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          company_email: string
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type: string
          location?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          owner_id?: string | null
          requirements?: string | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          company_email?: string
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: string
          location?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          owner_id?: string | null
          requirements?: string | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string
          id: number
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          receiver_id?: string | null
          sender_id?: string | null
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
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_interests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          offer_id: string
          solicitante_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          offer_id: string
          solicitante_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          offer_id?: string
          solicitante_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_interests_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "freelancer_service_offers"
            referencedColumns: ["id"]
          },
        ]
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
      payment_methods: {
        Row: {
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          method_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          method_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          method_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      pix_payments: {
        Row: {
          amount: number
          asaas_payment_id: string | null
          created_at: string
          expires_at: string
          id: string
          pix_code: string
          qr_code_url: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          pix_code: string
          qr_code_url?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          pix_code?: string
          qr_code_url?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions_flow"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_transactions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          pix_code: string
          qr_code_data: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at: string
          id?: string
          pix_code: string
          qr_code_data?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          pix_code?: string
          qr_code_data?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_verifications: {
        Row: {
          additional_data: Json | null
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          cover_photo: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_type: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
          verified?: boolean | null
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
      rate_limits: {
        Row: {
          action_type: string
          count: number | null
          created_at: string | null
          id: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string | null
          id?: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string | null
          id?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          freelancer_id: string
          id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          freelancer_id: string
          id?: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          freelancer_id?: string
          id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_applications: {
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
            foreignKeyName: "service_applications_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
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
          max_messages_per_month: number | null
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
          max_messages_per_month?: number | null
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
          max_messages_per_month?: number | null
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
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          other_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          other_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          other_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          latitude: number
          longitude: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          latitude: number
          longitude: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          latitude?: number
          longitude?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_message_tracking: {
        Row: {
          created_at: string | null
          first_message_at: string | null
          id: string
          other_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          other_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          other_user_id?: string
          user_id?: string
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
          messages_used_this_month: number | null
          plan_id: string | null
          profile_views_this_month: number | null
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
          messages_used_this_month?: number | null
          plan_id?: string | null
          profile_views_this_month?: number | null
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
          messages_used_this_month?: number | null
          plan_id?: string | null
          profile_views_this_month?: number | null
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
      user_subscriptions_flow: {
        Row: {
          created_at: string
          end_date: string
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan_name: string
          plan_price: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_name: string
          plan_price: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_name?: string
          plan_price?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_permissions: {
        Row: {
          ativo: boolean | null
          can_access_payments: boolean | null
          can_access_reports: boolean | null
          can_access_support: boolean | null
          can_manage_admins: boolean | null
          can_manage_banners: boolean | null
          can_manage_categories: boolean | null
          created_at: string | null
          email: string | null
          id: string | null
          nome: string | null
          role: string | null
        }
        Insert: {
          ativo?: boolean | null
          can_access_payments?: never
          can_access_reports?: never
          can_access_support?: never
          can_manage_admins?: never
          can_manage_banners?: never
          can_manage_categories?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          role?: string | null
        }
        Update: {
          ativo?: boolean | null
          can_access_payments?: never
          can_access_reports?: never
          can_access_support?: never
          can_manage_admins?: never
          can_manage_banners?: never
          can_manage_categories?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          nome?: string | null
          role?: string | null
        }
        Relationships: []
      }
      freelancer_ratings: {
        Row: {
          avg_rating: number | null
          freelancer_id: string | null
          rating_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_job_listings: {
        Row: {
          benefits: string | null
          company_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          job_type: string | null
          location: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          requirements: string | null
          salary_range: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          requirements?: string | null
          salary_range?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          requirements?: string | null
          salary_range?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          cover_photo: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          user_type: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          user_type?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          cover_photo?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          user_type?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      verificacoes: {
        Row: {
          created_at: string | null
          descricao: string | null
          documentos: Json | null
          id: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          documentos?: Json | null
          id?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          documentos?: Json | null
          id?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_message_limit: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_request_limit: { Args: { p_user_id: string }; Returns: boolean }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      encrypt_sensitive_data: { Args: { data: string }; Returns: string }
      generate_pix_code: { Args: never; Returns: string }
      get_bank_details_decrypted: {
        Args: { p_user_id: string }
        Returns: {
          account_number: string
          account_type: string
          bank_name: string
          branch: string
          created_at: string
          document: string
          id: string
          updated_at: string
          user_id: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["user_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { role_name: string; user_id: number }; Returns: boolean }
      insert_bank_details: {
        Args: {
          p_account_number: string
          p_account_type: string
          p_bank_name: string
          p_branch: string
          p_document: string
          p_user_id: string
        }
        Returns: boolean
      }
      insert_bank_details_encrypted: {
        Args: {
          p_account_number: string
          p_account_type: string
          p_bank_name: string
          p_branch: string
          p_document: string
          p_user_id: string
        }
        Returns: boolean
      }
      log_security_event:
        | { Args: never; Returns: undefined }
        | {
            Args: {
              p_action: string
              p_error_message?: string
              p_ip_address?: unknown
              p_metadata?: Json
              p_resource_id?: string
              p_resource_type: string
              p_success?: boolean
              p_user_agent?: string
              p_user_id: string
            }
            Returns: undefined
          }
      log_security_event_enhanced: {
        Args: {
          p_action: string
          p_error_message?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_owns_job_listing: { Args: { listing_id: string }; Returns: boolean }
    }
    Enums: {
      user_role: "user" | "helpadmin"
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
      user_role: ["user", "helpadmin"],
    },
  },
} as const
