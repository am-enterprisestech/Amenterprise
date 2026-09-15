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
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event: string
          id: string
          meta: Json
          path: string
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json
          path: string
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published: boolean
          published_at: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          meeting_type: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          service: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          meeting_type?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          meeting_type?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      calculator_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_base: boolean
          label: string
          price_pkr: number
          price_usd: number
          published: boolean
          service: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_base?: boolean
          label: string
          price_pkr?: number
          price_usd?: number
          published?: boolean
          service: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_base?: boolean
          label?: string
          price_pkr?: number
          price_usd?: number
          published?: boolean
          service?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          category: string | null
          client: string | null
          cover_url: string | null
          created_at: string
          id: string
          link_url: string | null
          published: boolean
          results: string | null
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          link_url?: string | null
          published?: boolean
          results?: string | null
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          link_url?: string | null
          published?: boolean
          results?: string | null
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_activities: {
        Row: {
          action: string
          actor: string
          client_id: string
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          body: string
          client_id: string
          created_at: string
          id: string
          important: boolean
          is_read: boolean
          sender: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          client_id: string
          created_at?: string
          id?: string
          important?: boolean
          is_read?: boolean
          sender?: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          important?: boolean
          is_read?: boolean
          sender?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notifications: {
        Row: {
          body: string | null
          client_id: string
          created_at: string
          id: string
          is_read: boolean
          kind: string
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tasks: {
        Row: {
          assignee: string | null
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          progress: number
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          published: boolean
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          status: string
          subject: string
          template_key: string | null
          to_email: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          subject: string
          template_key?: string | null
          to_email: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          subject?: string
          template_key?: string | null
          to_email?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string
          enabled: boolean
          id: string
          key: string
          label: string
          subject: string
          updated_at: string
        }
        Insert: {
          body_html: string
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          label: string
          subject: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          label?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          items: Json
          notes: string | null
          number: string
          paid_at: string | null
          payment_method: string
          proposal_id: string | null
          share_token: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          client_email?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          number: string
          paid_at?: string | null
          payment_method?: string
          proposal_id?: string | null
          share_token?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          number?: string
          paid_at?: string | null
          payment_method?: string
          proposal_id?: string | null
          share_token?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          lead_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind?: string
          lead_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          priority: string
          service: string | null
          source: string
          stage: string
          updated_at: string
          value_usd: number
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          service?: string | null
          source?: string
          stage?: string
          updated_at?: string
          value_usd?: number
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          service?: string | null
          source?: string
          stage?: string
          updated_at?: string
          value_usd?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string
          page: string
          section_key: string
          settings: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label: string
          page?: string
          section_key: string
          settings?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          page?: string
          section_key?: string
          settings?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          label: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          path: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          label: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          label?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_clients: {
        Row: {
          active: boolean
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          link_url: string | null
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          link_url?: string | null
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          link_url?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          description: string | null
          featured: boolean
          features: string[]
          id: string
          name: string
          price: string
          price_period: string | null
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          name: string
          price?: string
          price_period?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          name?: string
          price?: string
          price_period?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      process_steps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          published: boolean
          sort_order: number
          step_number: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          step_number?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          step_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_usd: number
          client_id: string | null
          created_at: string
          due_date: string | null
          id: string
          progress: number
          service: string | null
          start_date: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_usd?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          progress?: number
          service?: string | null
          start_date?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_usd?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          progress?: number
          service?: string | null
          start_date?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          currency: string
          discount: number
          id: string
          items: Json
          lead_id: string | null
          notes: string | null
          share_token: string
          status: string
          subtotal: number
          title: string
          total: number
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          share_token?: string
          status?: string
          subtotal?: number
          title: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          share_token?: string
          status?: string
          subtotal?: number
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          service: string | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          banner_image: string | null
          created_at: string
          description: string
          faq: Json
          featured: boolean
          features: string[]
          gradient: string
          hero_eyebrow: string | null
          hero_headline: string | null
          hero_image: string | null
          hero_media_type: string
          hero_media_url: string | null
          hero_stat_label: string | null
          hero_status: string | null
          hero_subheadline: string | null
          icon: string
          id: string
          long_description: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          pricing_tiers: Json
          process: Json
          published: boolean
          slug: string | null
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          description: string
          faq?: Json
          featured?: boolean
          features?: string[]
          gradient?: string
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image?: string | null
          hero_media_type?: string
          hero_media_url?: string | null
          hero_stat_label?: string | null
          hero_status?: string | null
          hero_subheadline?: string | null
          icon?: string
          id?: string
          long_description?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          pricing_tiers?: Json
          process?: Json
          published?: boolean
          slug?: string | null
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          description?: string
          faq?: Json
          featured?: boolean
          features?: string[]
          gradient?: string
          hero_eyebrow?: string | null
          hero_headline?: string | null
          hero_image?: string | null
          hero_media_type?: string
          hero_media_url?: string | null
          hero_stat_label?: string | null
          hero_status?: string | null
          hero_subheadline?: string | null
          icon?: string
          id?: string
          long_description?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          pricing_tiers?: Json
          process?: Json
          published?: boolean
          slug?: string | null
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_audits: {
        Row: {
          created_at: string
          email: string
          findings: Json
          id: string
          name: string | null
          score_overall: number | null
          scores: Json
          sent_at: string | null
          status: string
          summary: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          email: string
          findings?: Json
          id?: string
          name?: string | null
          score_overall?: number | null
          scores?: Json
          sent_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          email?: string
          findings?: Json
          id?: string
          name?: string | null
          score_overall?: number | null
          scores?: Json
          sent_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      staff_activities: {
        Row: {
          action: string
          actor: string
          created_at: string
          description: string | null
          id: string
          staff_id: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          description?: string | null
          id?: string
          staff_id: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          description?: string | null
          id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_activities_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          created_at: string
          description: string | null
          file_type: string | null
          id: string
          name: string
          staff_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          id?: string
          name: string
          staff_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          id?: string
          name?: string
          staff_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          job_title: string | null
          modules: string[]
          name: string
          phone: string | null
          role: string
          team_member_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          job_title?: string | null
          modules?: string[]
          name: string
          phone?: string | null
          role?: string
          team_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          job_title?: string | null
          modules?: string[]
          name?: string
          phone?: string | null
          role?: string
          team_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          important: boolean
          is_read: boolean
          sender: string
          staff_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          important?: boolean
          is_read?: boolean
          sender?: string
          staff_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          important?: boolean
          is_read?: boolean
          sender?: string
          staff_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_messages_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          kind: string
          link: string | null
          staff_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          staff_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          staff_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_notifications_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          progress: number
          project_id: string | null
          staff_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number
          project_id?: string | null
          staff_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress?: number
          project_id?: string | null
          staff_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_tasks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          created_at: string
          id: string
          label: string
          published: boolean
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          client_id: string
          created_at: string
          id: string
          message: string
          priority: string
          reply: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          reply?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          reply?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string
          created_at: string
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          published: boolean
          role_title: string
          sort_order: number
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          published?: boolean
          role_title?: string
          sort_order?: number
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          published?: boolean
          role_title?: string
          sort_order?: number
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          published: boolean
          quote: string
          role_title: string
          sort_order: number
          stars: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          published?: boolean
          quote: string
          role_title?: string
          sort_order?: number
          stars?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          quote?: string
          role_title?: string
          sort_order?: number
          stars?: number
          updated_at?: string
        }
        Relationships: []
      }
      tracking_pixels: {
        Row: {
          body_code: string | null
          created_at: string
          enabled: boolean
          head_code: string | null
          id: string
          label: string | null
          pixel_id: string | null
          provider: string
          sort_order: number
          updated_at: string
          verification_code: string | null
        }
        Insert: {
          body_code?: string | null
          created_at?: string
          enabled?: boolean
          head_code?: string | null
          id?: string
          label?: string | null
          pixel_id?: string | null
          provider: string
          sort_order?: number
          updated_at?: string
          verification_code?: string | null
        }
        Update: {
          body_code?: string | null
          created_at?: string
          enabled?: boolean
          head_code?: string | null
          id?: string
          label?: string | null
          pixel_id?: string | null
          provider?: string
          sort_order?: number
          updated_at?: string
          verification_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_my_client: { Args: { _client_id: string }; Returns: boolean }
      is_my_staff: { Args: { _staff_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
