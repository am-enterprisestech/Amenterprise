-- =============================================================================
-- AM ENTERPRISE V3 — DATABASE EXTENSIONS & SCHEMA UPDATES
-- Run this in Supabase SQL Editor to add Chat, App Settings, Audit Logs, and AM IDs
-- =============================================================================

-- 1. Add AM ID to portal_clients & staff_members if missing
ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS am_id text UNIQUE;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS am_id text UNIQUE;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS department text DEFAULT 'developer';

-- 2. Create Chat Channels Table
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text DEFAULT 'direct' NOT NULL, -- 'direct' | 'group' | 'project'
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    created_by text DEFAULT 'system' NOT NULL,
    members text[] DEFAULT '{}' NOT NULL, -- Array of AM IDs or User IDs
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    sender_id text NOT NULL, -- AM ID or User ID
    sender_name text NOT NULL,
    sender_type text DEFAULT 'staff' NOT NULL, -- 'admin' | 'staff' | 'client'
    message text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    reactions jsonb DEFAULT '{}'::jsonb NOT NULL,
    reply_to jsonb,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for chat
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can select channels" ON public.chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert channels" ON public.chat_channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone authenticated can select messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can insert messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (true);

-- Enable Realtime replication on chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- 4. Create App Settings Table for PWA Branding
CREATE TABLE IF NOT EXISTS public.app_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE DEFAULT 'main' NOT NULL,
    app_name text DEFAULT 'AM Enterprises' NOT NULL,
    app_short_name text DEFAULT 'AM Enterprise' NOT NULL,
    app_icon_url text DEFAULT '/logo.png' NOT NULL,
    favicon_url text DEFAULT '/favicon.png' NOT NULL,
    theme_color text DEFAULT '#2F8FFF' NOT NULL,
    background_color text DEFAULT '#FFFFFF' NOT NULL,
    install_message text DEFAULT 'Install AM Enterprise Web App on your home screen for quick access and instant notifications!' NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL TO authenticated USING (true);

-- Insert default app settings row if not present
INSERT INTO public.app_settings (key, app_name, app_short_name, app_icon_url, theme_color)
VALUES ('main', 'AM Enterprises', 'AM Enterprise', '/logo.png', '#2F8FFF')
ON CONFLICT (key) DO NOTHING;

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id text NOT NULL,
    actor_name text NOT NULL,
    actor_role text NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    details text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
