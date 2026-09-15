-- =============================================================================
-- AYMOXI LLC — COMPLETE DATABASE SETUP (A to Z)
-- Run this ONE file on a fresh Supabase project (SQL Editor) and everything
-- (public website, admin panel, client portal) will work.
--
-- HOW TO RUN
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this whole file -> Run
--   3. Go to the bottom section "STEP 2 / STEP 3" and run those two small
--      snippets to create your admin user and link a client portal account.
--
-- -----------------------------------------------------------------------------
-- ROLES / ACCESS MODEL (yeh sab se important hissa hai)
-- -----------------------------------------------------------------------------
--   anon          = logged-out website visitor.  Sirf published content parh
--                   sakta hai + forms submit kar sakta hai.
--   authenticated = logged-in user (client ya admin).
--   admin         = row in public.user_roles with role = 'admin'.
--                   Poore admin panel ka access, har table par full CRUD.
--   client        = row in public.portal_clients whose user_id = auth.uid().
--                   Sirf apna hi data dekh sakta hai (projects, tasks,
--                   invoices, messages, documents, notifications, support).
--
--   Helper functions:
--     public.has_role(uid, 'admin')  -> admin check (used by every admin policy)
--     public.is_my_client(client_id) -> "kya yeh row mere client account ki hai"
--
--   IMPORTANT: agar client login to ho jaye lekin data na dikhe, to 99% wajah
--   yeh hoti hai ke portal_clients.user_id NULL hai (auth user se link nahi).
--   Neeche STEP 3 wali query us ko fix kar deti hai.
--
-- -----------------------------------------------------------------------------
-- TABLES — kis table ka kya kaam hai
-- -----------------------------------------------------------------------------
--  PUBLIC WEBSITE CONTENT (anon read where published = true, admin full CRUD)
--   services            – service cards + dedicated service page ka poora data
--                         (features, process, faq, pricing_tiers, SEO fields)
--   portfolio           – portfolio / work items
--   case_studies        – detailed case studies
--   blog_posts          – blog articles (slug, content, SEO fields)
--   testimonials        – client reviews (stars, quote, avatar)
--   team_members        – team profiles (email column public par hide hota hai)
--   clients             – client logos strip
--   faqs                – FAQ accordion items
--   pricing_plans       – pricing table plans
--   process_steps       – "how we work" steps
--   stats               – counter numbers (projects, clients, etc.)
--   page_sections       – page builder: kaunsa section on/off + settings
--   page_seo            – per-page SEO (title, description, keywords, OG, canonical)
--   tracking_pixels     – Google / Meta / TikTok / LinkedIn etc. pixel codes
--   calculator_options  – price calculator ke options (USD + PKR)
--
--  LEADS & FORMS (anon INSERT with validation, admin read/manage)
--   contact_messages    – contact form
--   quote_requests      – quote form
--   bookings            – meeting bookings
--   newsletter_subscribers – newsletter emails
--   site_audits         – free website audit requests + scores/findings
--   leads / lead_notes  – CRM pipeline (stage, value, follow-up)
--   analytics_events    – lightweight pageview / event tracking
--   email_templates / email_log – transactional email templates & send log
--
--  CLIENT PORTAL (client apna data, admin sab kuch)
--   portal_clients      – portal account  (user_id -> auth.users.id)  << KEY
--   projects            – client ke projects (status, progress, budget)
--   project_milestones  – project ke milestones
--   project_files       – project files
--   client_tasks        – tasks board (status, priority, progress)
--   client_messages     – admin -> client messages (client mark-as-read kar sakta hai)
--   client_notifications– portal notifications (client mark-as-read kar sakta hai)
--   client_documents    – shared documents (storage URLs)
--   client_activities   – activity feed (read-only for client)
--   support_requests    – support tickets (client create kare, admin reply kare)
--   proposals / invoices– quotes & billing (share_token se public share link)
--
--  ACCESS CONTROL
--   user_roles          – (user_id, role) — roles kabhi bhi profile table me
--                         store nahi karne chahiye, isi liye alag table hai.
--
-- =============================================================================
-- STEP 1 — SCHEMA, GRANTS, RLS POLICIES, TRIGGERS  (sab kuch neeche hai)
-- =============================================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: is_my_client(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_my_client(_client_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = _client_id AND c.user_id = auth.uid())
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    path text NOT NULL,
    event text DEFAULT 'pageview'::text NOT NULL,
    session_id text,
    referrer text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text DEFAULT ''::text,
    content text DEFAULT ''::text,
    cover_url text,
    author text DEFAULT 'Adphira Team'::text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    meta_title text,
    meta_description text,
    meta_keywords text,
    og_title text,
    og_description text,
    og_image text
);

ALTER TABLE ONLY public.blog_posts REPLICA IDENTITY FULL;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    preferred_date date,
    preferred_time text,
    meeting_type text,
    notes text,
    is_read boolean DEFAULT false NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calculator_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculator_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service text NOT NULL,
    label text NOT NULL,
    description text,
    price_usd numeric DEFAULT 0 NOT NULL,
    price_pkr numeric DEFAULT 0 NOT NULL,
    is_base boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: case_studies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_studies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    client text DEFAULT ''::text,
    category text DEFAULT 'Case Study'::text,
    cover_url text,
    summary text DEFAULT ''::text,
    results text DEFAULT ''::text,
    link_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.case_studies REPLICA IDENTITY FULL;


--
-- Name: client_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    action text NOT NULL,
    description text,
    actor text DEFAULT 'system'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    project_id uuid,
    name text NOT NULL,
    description text,
    file_type text,
    file_size integer,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    sender text DEFAULT 'AYMOXI Team'::text NOT NULL,
    important boolean DEFAULT false NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    title text NOT NULL,
    body text,
    kind text DEFAULT 'info'::text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    project_id uuid,
    title text NOT NULL,
    description text,
    status text DEFAULT 'todo'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    assignee text,
    due_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.clients REPLICA IDENTITY FULL;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text DEFAULT ''::text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    to_email text NOT NULL,
    subject text NOT NULL,
    template_key text,
    status text DEFAULT 'sent'::text NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    subject text NOT NULL,
    body_html text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text DEFAULT 'General'::text,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.faqs REPLICA IDENTITY FULL;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    proposal_id uuid,
    client_id uuid,
    number text NOT NULL,
    client_name text NOT NULL,
    client_email text,
    currency text DEFAULT 'USD'::text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric DEFAULT 0 NOT NULL,
    tax numeric DEFAULT 0 NOT NULL,
    total numeric DEFAULT 0 NOT NULL,
    amount_paid numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    payment_method text DEFAULT 'card'::text NOT NULL,
    due_date date,
    paid_at timestamp with time zone,
    notes text,
    share_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lead_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    body text NOT NULL,
    kind text DEFAULT 'note'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    source text DEFAULT 'website'::text NOT NULL,
    value_usd numeric DEFAULT 0 NOT NULL,
    stage text DEFAULT 'new'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    notes text,
    next_follow_up date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page text DEFAULT '/'::text NOT NULL,
    section_key text NOT NULL,
    label text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: page_seo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_seo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    path text NOT NULL,
    label text NOT NULL,
    meta_title text,
    meta_description text,
    meta_keywords text,
    og_title text,
    og_description text,
    og_image text,
    canonical_url text,
    noindex boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portal_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portal_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    phone text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portfolio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    image_url text,
    link_url text,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.portfolio REPLICA IDENTITY FULL;


--
-- Name: pricing_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    price text DEFAULT '$0'::text NOT NULL,
    price_period text DEFAULT '/mo'::text,
    description text DEFAULT ''::text,
    features text[] DEFAULT '{}'::text[] NOT NULL,
    cta_label text DEFAULT 'Get Started'::text,
    cta_url text DEFAULT '/contact'::text,
    featured boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.pricing_plans REPLICA IDENTITY FULL;


--
-- Name: process_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    step_number text DEFAULT '01'::text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.process_steps REPLICA IDENTITY FULL;


--
-- Name: project_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    due_date date,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    title text NOT NULL,
    service text,
    status text DEFAULT 'planning'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    start_date date,
    due_date date,
    budget_usd numeric DEFAULT 0 NOT NULL,
    summary text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid,
    client_id uuid,
    title text NOT NULL,
    client_name text NOT NULL,
    client_email text,
    currency text DEFAULT 'USD'::text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric DEFAULT 0 NOT NULL,
    discount numeric DEFAULT 0 NOT NULL,
    total numeric DEFAULT 0 NOT NULL,
    notes text,
    status text DEFAULT 'draft'::text NOT NULL,
    valid_until date,
    share_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
    viewed_at timestamp with time zone,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    budget text,
    timeline text,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text DEFAULT 'Sparkles'::text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    gradient text DEFAULT 'light'::text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text,
    long_description text,
    hero_image text,
    banner_image text,
    features text[] DEFAULT '{}'::text[] NOT NULL,
    faq jsonb DEFAULT '[]'::jsonb NOT NULL,
    process jsonb DEFAULT '[]'::jsonb NOT NULL,
    pricing_tiers jsonb DEFAULT '[]'::jsonb NOT NULL,
    meta_title text,
    meta_description text,
    meta_keywords text,
    og_title text,
    og_description text,
    og_image text
);

ALTER TABLE ONLY public.services REPLICA IDENTITY FULL;


--
-- Name: site_audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_audits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    name text,
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    score_overall integer,
    scores jsonb DEFAULT '{}'::jsonb NOT NULL,
    findings jsonb DEFAULT '[]'::jsonb NOT NULL,
    summary text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.stats REPLICA IDENTITY FULL;


--
-- Name: support_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    reply text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role_title text DEFAULT ''::text NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    photo_url text,
    email text,
    linkedin_url text,
    twitter_url text,
    published boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.team_members REPLICA IDENTITY FULL;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role_title text DEFAULT ''::text NOT NULL,
    quote text NOT NULL,
    stars integer DEFAULT 5 NOT NULL,
    avatar_url text,
    published boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.testimonials REPLICA IDENTITY FULL;


--
-- Name: tracking_pixels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracking_pixels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    label text,
    pixel_id text,
    verification_code text,
    head_code text,
    body_code text,
    enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: calculator_options calculator_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculator_options
    ADD CONSTRAINT calculator_options_pkey PRIMARY KEY (id);


--
-- Name: case_studies case_studies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_studies
    ADD CONSTRAINT case_studies_pkey PRIMARY KEY (id);


--
-- Name: client_activities client_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_activities
    ADD CONSTRAINT client_activities_pkey PRIMARY KEY (id);


--
-- Name: client_documents client_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_pkey PRIMARY KEY (id);


--
-- Name: client_messages client_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_pkey PRIMARY KEY (id);


--
-- Name: client_notifications client_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_notifications
    ADD CONSTRAINT client_notifications_pkey PRIMARY KEY (id);


--
-- Name: client_tasks client_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tasks
    ADD CONSTRAINT client_tasks_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: email_log email_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_log
    ADD CONSTRAINT email_log_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_key_key UNIQUE (key);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lead_notes lead_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_notes
    ADD CONSTRAINT lead_notes_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- Name: page_seo page_seo_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_seo
    ADD CONSTRAINT page_seo_path_key UNIQUE (path);


--
-- Name: page_seo page_seo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_seo
    ADD CONSTRAINT page_seo_pkey PRIMARY KEY (id);


--
-- Name: portal_clients portal_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portal_clients
    ADD CONSTRAINT portal_clients_pkey PRIMARY KEY (id);


--
-- Name: portfolio portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio
    ADD CONSTRAINT portfolio_pkey PRIMARY KEY (id);


--
-- Name: pricing_plans pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plans
    ADD CONSTRAINT pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: process_steps process_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_steps
    ADD CONSTRAINT process_steps_pkey PRIMARY KEY (id);


--
-- Name: project_files project_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_pkey PRIMARY KEY (id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: quote_requests quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_requests
    ADD CONSTRAINT quote_requests_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: site_audits site_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_audits
    ADD CONSTRAINT site_audits_pkey PRIMARY KEY (id);


--
-- Name: stats stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stats
    ADD CONSTRAINT stats_pkey PRIMARY KEY (id);


--
-- Name: support_requests support_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_requests
    ADD CONSTRAINT support_requests_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: tracking_pixels tracking_pixels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_pixels
    ADD CONSTRAINT tracking_pixels_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: analytics_events_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_created_idx ON public.analytics_events USING btree (created_at DESC);


--
-- Name: services_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);


--
-- Name: bookings bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: calculator_options calc_options_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calc_options_updated BEFORE UPDATE ON public.calculator_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_documents client_documents_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER client_documents_updated BEFORE UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_messages client_messages_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER client_messages_updated BEFORE UPDATE ON public.client_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_notifications client_notifications_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER client_notifications_updated BEFORE UPDATE ON public.client_notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_tasks client_tasks_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER client_tasks_updated BEFORE UPDATE ON public.client_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: email_templates email_templates_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER email_templates_updated BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices invoices_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: leads leads_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: project_milestones milestones_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER milestones_updated BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: page_sections page_sections_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER page_sections_updated BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: portal_clients portal_clients_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER portal_clients_updated BEFORE UPDATE ON public.portal_clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: portfolio portfolio_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER portfolio_updated BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: projects projects_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: proposals proposals_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER proposals_updated BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: quote_requests quote_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: services services_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: site_audits site_audits_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER site_audits_updated BEFORE UPDATE ON public.site_audits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: support_requests support_requests_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER support_requests_updated BEFORE UPDATE ON public.support_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: team_members team_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER team_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: testimonials testimonials_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: tracking_pixels tracking_pixels_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tracking_pixels_updated_at BEFORE UPDATE ON public.tracking_pixels FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: blog_posts trg_blog_posts_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: case_studies trg_cases_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: clients trg_clients_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: faqs trg_faqs_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: page_seo trg_page_seo_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_page_seo_updated BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pricing_plans trg_pricing_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_pricing_updated BEFORE UPDATE ON public.pricing_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: process_steps trg_process_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_process_updated BEFORE UPDATE ON public.process_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stats trg_stats_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_stats_updated BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: client_activities client_activities_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_activities
    ADD CONSTRAINT client_activities_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: client_documents client_documents_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: client_documents client_documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_documents
    ADD CONSTRAINT client_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: client_messages client_messages_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_messages
    ADD CONSTRAINT client_messages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: client_notifications client_notifications_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_notifications
    ADD CONSTRAINT client_notifications_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: client_tasks client_tasks_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tasks
    ADD CONSTRAINT client_tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: client_tasks client_tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_tasks
    ADD CONSTRAINT client_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;


--
-- Name: lead_notes lead_notes_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_notes
    ADD CONSTRAINT lead_notes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: project_files project_files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_files
    ADD CONSTRAINT project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_milestones project_milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE SET NULL;


--
-- Name: proposals proposals_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE SET NULL;


--
-- Name: proposals proposals_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: support_requests support_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_requests
    ADD CONSTRAINT support_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.portal_clients(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bookings Admins delete bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins delete messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quote_requests Admins delete quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete quotes" ON public.quote_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins delete subs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete subs" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_audits Admins manage audits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage audits" ON public.site_audits TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_activities Admins manage client activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage client activities" ON public.client_activities TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_documents Admins manage client documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage client documents" ON public.client_documents TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_messages Admins manage client messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage client messages" ON public.client_messages TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_notifications Admins manage client notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage client notifications" ON public.client_notifications TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_tasks Admins manage client tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage client tasks" ON public.client_tasks TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_templates Admins manage email templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage email templates" ON public.email_templates TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins manage invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage invoices" ON public.invoices TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: lead_notes Admins manage lead notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage lead notes" ON public.lead_notes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leads Admins manage leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage leads" ON public.leads TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: project_milestones Admins manage milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage milestones" ON public.project_milestones TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: calculator_options Admins manage options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage options" ON public.calculator_options TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tracking_pixels Admins manage pixels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage pixels" ON public.tracking_pixels TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: portal_clients Admins manage portal clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage portal clients" ON public.portal_clients TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: project_files Admins manage project files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage project files" ON public.project_files TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: projects Admins manage projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage projects" ON public.projects TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: proposals Admins manage proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage proposals" ON public.proposals TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: page_sections Admins manage sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage sections" ON public.page_sections TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_requests Admins manage support requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage support requests" ON public.support_requests TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: portfolio Admins read all portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read all portfolio" ON public.portfolio FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: services Admins read all services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: team_members Admins read all team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read all team" ON public.team_members FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admins read all testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins read bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_log Admins read email log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read email log" ON public.email_log TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_events Admins read events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read events" ON public.analytics_events TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins read messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quote_requests Admins read quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read quotes" ON public.quote_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins read subs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read subs" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins update bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins update messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quote_requests Admins update quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update quotes" ON public.quote_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: page_seo Admins write page seo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins write page seo" ON public.page_seo TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: portfolio Admins write portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins write portfolio" ON public.portfolio TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: services Admins write services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins write services" ON public.services TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: team_members Admins write team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins write team" ON public.team_members TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admins write testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins write testimonials" ON public.testimonials TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_events Anyone can record an event; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can record an event" ON public.analytics_events FOR INSERT TO authenticated, anon WITH CHECK (((length(path) <= 300) AND (length(event) <= 60) AND (COALESCE(length(session_id), 0) <= 64) AND (COALESCE(length(referrer), 0) <= 400)));


--
-- Name: site_audits Anyone can request an audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can request an audit" ON public.site_audits FOR INSERT TO authenticated, anon WITH CHECK ((((length(url) >= 4) AND (length(url) <= 400)) AND ((length(email) >= 3) AND (length(email) <= 160)) AND (email ~~ '%@%'::text) AND (status = 'pending'::text)));


--
-- Name: leads Anyone can submit a lead; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO authenticated, anon WITH CHECK ((((length(name) >= 1) AND (length(name) <= 120)) AND ((length(email) >= 3) AND (length(email) <= 160)) AND (email ~~ '%@%'::text) AND (stage = 'new'::text) AND (COALESCE(length(notes), 0) <= 4000)));


--
-- Name: bookings Anyone can submit a valid booking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a valid booking" ON public.bookings FOR INSERT TO authenticated, anon WITH CHECK ((((length(btrim(name)) >= 1) AND (length(btrim(name)) <= 200)) AND ((length(btrim(email)) >= 3) AND (length(btrim(email)) <= 320)) AND (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND (length(COALESCE(phone, ''::text)) <= 50) AND (length(COALESCE(company, ''::text)) <= 200) AND (length(COALESCE(service, ''::text)) <= 200) AND (length(COALESCE(preferred_time, ''::text)) <= 50) AND (length(COALESCE(meeting_type, ''::text)) <= 100) AND (length(COALESCE(notes, ''::text)) <= 5000) AND ((preferred_date IS NULL) OR (preferred_date >= (CURRENT_DATE - 1))) AND (is_read = false) AND (status = 'new'::text)));


--
-- Name: contact_messages Anyone can submit a valid message; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a valid message" ON public.contact_messages FOR INSERT TO authenticated, anon WITH CHECK (((length(TRIM(BOTH FROM name)) >= 1) AND (length(TRIM(BOTH FROM name)) <= 200) AND ((length(TRIM(BOTH FROM email)) >= 3) AND (length(TRIM(BOTH FROM email)) <= 320)) AND (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND ((length(TRIM(BOTH FROM message)) >= 1) AND (length(TRIM(BOTH FROM message)) <= 5000)) AND (length(COALESCE(subject, ''::text)) <= 300)));


--
-- Name: quote_requests Anyone can submit a valid quote; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit a valid quote" ON public.quote_requests FOR INSERT TO authenticated, anon WITH CHECK ((((length(btrim(name)) >= 1) AND (length(btrim(name)) <= 200)) AND ((length(btrim(email)) >= 3) AND (length(btrim(email)) <= 320)) AND (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND ((length(btrim(message)) >= 1) AND (length(btrim(message)) <= 5000)) AND (length(COALESCE(phone, ''::text)) <= 50) AND (length(COALESCE(company, ''::text)) <= 200) AND (length(COALESCE(service, ''::text)) <= 200) AND (length(COALESCE(budget, ''::text)) <= 100) AND (length(COALESCE(timeline, ''::text)) <= 100) AND (is_read = false) AND (status = 'new'::text)));


--
-- Name: newsletter_subscribers Anyone can subscribe with a valid email; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe with a valid email" ON public.newsletter_subscribers FOR INSERT TO authenticated, anon WITH CHECK ((((length(btrim(email)) >= 3) AND (length(btrim(email)) <= 320)) AND (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND (length(COALESCE(source, ''::text)) <= 100)));


--
-- Name: support_requests Clients create own support requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients create own support requests" ON public.support_requests FOR INSERT TO authenticated WITH CHECK (public.is_my_client(client_id));


--
-- Name: client_activities Clients read own activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own activities" ON public.client_activities FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: client_documents Clients read own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own documents" ON public.client_documents FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: invoices Clients read own invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own invoices" ON public.invoices FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: client_messages Clients read own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own messages" ON public.client_messages FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: project_milestones Clients read own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own milestones" ON public.project_milestones FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.projects p
  WHERE ((p.id = project_milestones.project_id) AND public.is_my_client(p.client_id)))));


--
-- Name: client_notifications Clients read own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own notifications" ON public.client_notifications FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: project_files Clients read own project files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own project files" ON public.project_files FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.projects p
  WHERE ((p.id = project_files.project_id) AND public.is_my_client(p.client_id)))));


--
-- Name: projects Clients read own projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own projects" ON public.projects FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: proposals Clients read own proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own proposals" ON public.proposals FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: portal_clients Clients read own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own record" ON public.portal_clients FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: support_requests Clients read own support requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own support requests" ON public.support_requests FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: client_tasks Clients read own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients read own tasks" ON public.client_tasks FOR SELECT TO authenticated USING (public.is_my_client(client_id));


--
-- Name: client_messages Clients update own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients update own messages" ON public.client_messages FOR UPDATE TO authenticated USING (public.is_my_client(client_id)) WITH CHECK (public.is_my_client(client_id));


--
-- Name: client_notifications Clients update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients update own notifications" ON public.client_notifications FOR UPDATE TO authenticated USING (public.is_my_client(client_id)) WITH CHECK (public.is_my_client(client_id));


--
-- Name: portal_clients Clients update own record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients update own record" ON public.portal_clients FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: tracking_pixels Public can read enabled pixels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read enabled pixels" ON public.tracking_pixels FOR SELECT TO authenticated, anon USING ((enabled = true));


--
-- Name: page_seo Public reads page seo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads page seo" ON public.page_seo FOR SELECT USING (true);


--
-- Name: calculator_options Public reads published options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads published options" ON public.calculator_options FOR SELECT TO authenticated, anon USING ((published = true));


--
-- Name: portfolio Public reads published portfolio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads published portfolio" ON public.portfolio FOR SELECT USING ((published = true));


--
-- Name: services Public reads published services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads published services" ON public.services FOR SELECT USING ((published = true));


--
-- Name: team_members Public reads published team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads published team" ON public.team_members FOR SELECT USING ((published = true));


--
-- Name: testimonials Public reads published testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads published testimonials" ON public.testimonials FOR SELECT USING ((published = true));


--
-- Name: page_sections Public reads sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public reads sections" ON public.page_sections FOR SELECT TO authenticated, anon USING (true);


--
-- Name: user_roles Users can see own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can see own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: blog_posts admin all blog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all blog" ON public.blog_posts TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: case_studies admin all cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all cases" ON public.case_studies TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clients admin all clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all clients" ON public.clients TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: faqs admin all faqs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all faqs" ON public.faqs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pricing_plans admin all pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all pricing" ON public.pricing_plans TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: process_steps admin all process; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all process" ON public.process_steps TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: stats admin all stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin all stats" ON public.stats TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: calculator_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calculator_options ENABLE ROW LEVEL SECURITY;

--
-- Name: case_studies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

--
-- Name: client_activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: client_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: client_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: client_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: client_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: email_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

--
-- Name: email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: faqs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: page_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: page_seo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

--
-- Name: portal_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portal_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

--
-- Name: pricing_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: process_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: project_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

--
-- Name: project_milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts public read published blog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published blog" ON public.blog_posts FOR SELECT USING ((published = true));


--
-- Name: case_studies public read published cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published cases" ON public.case_studies FOR SELECT USING ((published = true));


--
-- Name: clients public read published clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published clients" ON public.clients FOR SELECT USING ((published = true));


--
-- Name: faqs public read published faqs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published faqs" ON public.faqs FOR SELECT USING ((published = true));


--
-- Name: pricing_plans public read published pricing; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published pricing" ON public.pricing_plans FOR SELECT USING ((published = true));


--
-- Name: process_steps public read published process; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published process" ON public.process_steps FOR SELECT USING ((published = true));


--
-- Name: stats public read published stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read published stats" ON public.stats FOR SELECT USING ((published = true));


--
-- Name: quote_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: site_audits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_audits ENABLE ROW LEVEL SECURITY;

--
-- Name: stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

--
-- Name: support_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: tracking_pixels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tracking_pixels ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION handle_new_user_role(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user_role() TO service_role;


--
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) FROM PUBLIC;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;


--
-- Name: FUNCTION is_my_client(_client_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.is_my_client(_client_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.is_my_client(_client_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_my_client(_client_id uuid) TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: TABLE analytics_events; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.analytics_events TO anon;
GRANT ALL ON TABLE public.analytics_events TO authenticated;
GRANT ALL ON TABLE public.analytics_events TO service_role;


--
-- Name: TABLE blog_posts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.blog_posts TO anon;
GRANT ALL ON TABLE public.blog_posts TO authenticated;
GRANT ALL ON TABLE public.blog_posts TO service_role;


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.bookings TO anon;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;


--
-- Name: TABLE calculator_options; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.calculator_options TO anon;
GRANT ALL ON TABLE public.calculator_options TO authenticated;
GRANT ALL ON TABLE public.calculator_options TO service_role;


--
-- Name: TABLE case_studies; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.case_studies TO anon;
GRANT ALL ON TABLE public.case_studies TO authenticated;
GRANT ALL ON TABLE public.case_studies TO service_role;


--
-- Name: TABLE client_activities; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.client_activities TO anon;
GRANT ALL ON TABLE public.client_activities TO authenticated;
GRANT ALL ON TABLE public.client_activities TO service_role;


--
-- Name: TABLE client_documents; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.client_documents TO anon;
GRANT ALL ON TABLE public.client_documents TO authenticated;
GRANT ALL ON TABLE public.client_documents TO service_role;


--
-- Name: TABLE client_messages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.client_messages TO anon;
GRANT ALL ON TABLE public.client_messages TO authenticated;
GRANT ALL ON TABLE public.client_messages TO service_role;


--
-- Name: TABLE client_notifications; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.client_notifications TO anon;
GRANT ALL ON TABLE public.client_notifications TO authenticated;
GRANT ALL ON TABLE public.client_notifications TO service_role;


--
-- Name: TABLE client_tasks; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.client_tasks TO anon;
GRANT ALL ON TABLE public.client_tasks TO authenticated;
GRANT ALL ON TABLE public.client_tasks TO service_role;


--
-- Name: TABLE clients; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.clients TO anon;
GRANT ALL ON TABLE public.clients TO authenticated;
GRANT ALL ON TABLE public.clients TO service_role;


--
-- Name: TABLE contact_messages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.contact_messages TO anon;
GRANT ALL ON TABLE public.contact_messages TO authenticated;
GRANT ALL ON TABLE public.contact_messages TO service_role;


--
-- Name: TABLE email_log; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.email_log TO anon;
GRANT ALL ON TABLE public.email_log TO authenticated;
GRANT ALL ON TABLE public.email_log TO service_role;


--
-- Name: TABLE email_templates; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.email_templates TO anon;
GRANT ALL ON TABLE public.email_templates TO authenticated;
GRANT ALL ON TABLE public.email_templates TO service_role;


--
-- Name: TABLE faqs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.faqs TO anon;
GRANT ALL ON TABLE public.faqs TO authenticated;
GRANT ALL ON TABLE public.faqs TO service_role;


--
-- Name: TABLE invoices; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.invoices TO anon;
GRANT ALL ON TABLE public.invoices TO authenticated;
GRANT ALL ON TABLE public.invoices TO service_role;


--
-- Name: TABLE lead_notes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.lead_notes TO anon;
GRANT ALL ON TABLE public.lead_notes TO authenticated;
GRANT ALL ON TABLE public.lead_notes TO service_role;


--
-- Name: TABLE leads; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.leads TO anon;
GRANT ALL ON TABLE public.leads TO authenticated;
GRANT ALL ON TABLE public.leads TO service_role;


--
-- Name: TABLE newsletter_subscribers; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.newsletter_subscribers TO anon;
GRANT ALL ON TABLE public.newsletter_subscribers TO authenticated;
GRANT ALL ON TABLE public.newsletter_subscribers TO service_role;


--
-- Name: TABLE page_sections; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.page_sections TO anon;
GRANT ALL ON TABLE public.page_sections TO authenticated;
GRANT ALL ON TABLE public.page_sections TO service_role;


--
-- Name: TABLE page_seo; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.page_seo TO anon;
GRANT ALL ON TABLE public.page_seo TO authenticated;
GRANT ALL ON TABLE public.page_seo TO service_role;


--
-- Name: TABLE portal_clients; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.portal_clients TO anon;
GRANT ALL ON TABLE public.portal_clients TO authenticated;
GRANT ALL ON TABLE public.portal_clients TO service_role;


--
-- Name: TABLE portfolio; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.portfolio TO anon;
GRANT ALL ON TABLE public.portfolio TO authenticated;
GRANT ALL ON TABLE public.portfolio TO service_role;


--
-- Name: TABLE pricing_plans; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pricing_plans TO anon;
GRANT ALL ON TABLE public.pricing_plans TO authenticated;
GRANT ALL ON TABLE public.pricing_plans TO service_role;


--
-- Name: TABLE process_steps; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.process_steps TO anon;
GRANT ALL ON TABLE public.process_steps TO authenticated;
GRANT ALL ON TABLE public.process_steps TO service_role;


--
-- Name: TABLE project_files; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.project_files TO anon;
GRANT ALL ON TABLE public.project_files TO authenticated;
GRANT ALL ON TABLE public.project_files TO service_role;


--
-- Name: TABLE project_milestones; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.project_milestones TO anon;
GRANT ALL ON TABLE public.project_milestones TO authenticated;
GRANT ALL ON TABLE public.project_milestones TO service_role;


--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.projects TO anon;
GRANT ALL ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;


--
-- Name: TABLE proposals; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.proposals TO anon;
GRANT ALL ON TABLE public.proposals TO authenticated;
GRANT ALL ON TABLE public.proposals TO service_role;


--
-- Name: TABLE quote_requests; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.quote_requests TO anon;
GRANT ALL ON TABLE public.quote_requests TO authenticated;
GRANT ALL ON TABLE public.quote_requests TO service_role;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.services TO anon;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;


--
-- Name: TABLE site_audits; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.site_audits TO anon;
GRANT ALL ON TABLE public.site_audits TO authenticated;
GRANT ALL ON TABLE public.site_audits TO service_role;


--
-- Name: TABLE stats; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.stats TO anon;
GRANT ALL ON TABLE public.stats TO authenticated;
GRANT ALL ON TABLE public.stats TO service_role;


--
-- Name: TABLE support_requests; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.support_requests TO anon;
GRANT ALL ON TABLE public.support_requests TO authenticated;
GRANT ALL ON TABLE public.support_requests TO service_role;


--
-- Name: TABLE team_members; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.team_members TO anon;
GRANT ALL ON TABLE public.team_members TO authenticated;
GRANT ALL ON TABLE public.team_members TO service_role;


--
-- Name: COLUMN team_members.id; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(id) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.name; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(name) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.role_title; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(role_title) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.bio; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(bio) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.photo_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(photo_url) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.linkedin_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(linkedin_url) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.twitter_url; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(twitter_url) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.published; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(published) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.sort_order; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(sort_order) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.created_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(created_at) ON TABLE public.team_members TO anon;


--
-- Name: COLUMN team_members.updated_at; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT(updated_at) ON TABLE public.team_members TO anon;


--
-- Name: TABLE testimonials; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.testimonials TO anon;
GRANT ALL ON TABLE public.testimonials TO authenticated;
GRANT ALL ON TABLE public.testimonials TO service_role;


--
-- Name: TABLE tracking_pixels; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tracking_pixels TO anon;
GRANT ALL ON TABLE public.tracking_pixels TO authenticated;
GRANT ALL ON TABLE public.tracking_pixels TO service_role;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--



-- =============================================================================
-- STEP 2 — APNE AAP KO ADMIN BANAYEIN
-- Pehle app par /auth se sign up karein, phir apna email yahan daal kar chalayein.
-- =============================================================================
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;


-- =============================================================================
-- STEP 3 — CLIENT PORTAL LOGIN KE BAAD DATA NAZAR NA AAYE TO YEH CHALAYEIN
-- Yeh har portal_clients row ko usi email wale auth user se link kar deta hai.
-- (Portal ka poora data isi user_id link par depend karta hai.)
-- =============================================================================
UPDATE public.portal_clients pc
SET user_id = u.id
FROM auth.users u
WHERE pc.user_id IS NULL
  AND lower(u.email) = lower(pc.email);

-- Check karne ke liye (user_id NULL nahi hona chahiye):
-- SELECT id, name, email, user_id, active FROM public.portal_clients;

-- Naya user 'user' role automatically pata chale is ke liye (optional, auth
-- schema par trigger — Supabase dashboard me hi chalta hai):
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();


-- =============================================================================
-- STEP 4 — STORAGE BUCKET (admin panel image/file uploads ke liye)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND policyname='Admins manage media') THEN
    CREATE POLICY "Admins manage media" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND policyname='Authenticated read media') THEN
    CREATE POLICY "Authenticated read media" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'media');
  END IF;
END $$;

-- =============================================================================
-- DONE. Ab .env me apne project ka URL + publishable key daal kar app chalayein.
-- =============================================================================
