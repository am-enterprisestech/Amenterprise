-- =============================================================================
-- AM Enterprises — Migration 0005
-- Supabase SQL Editor mein run karo
--
-- YE FILE SAFE HAI:
--   - has_role() / set_updated_at() ko TOUCH NAHI KARTA (already exist karte hain)
--   - app_role enum ko TOUCH NAHI KARTA
--   - conversations / chat_messages already exist hain — sirf ALTER TABLE
--   - Har cheez IF NOT EXISTS / DROP...IF EXISTS ke sath hai
--
-- AGAR KUCH FAIL HO: Har SECTION separately paste karke run karo.
-- =============================================================================


-- =============================================================================
-- SECTION 1 — Chat message extra columns
-- (conversations aur chat_messages pehle se exist karti hain)
-- =============================================================================

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS message_type   text        NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS file_url       text,
  ADD COLUMN IF NOT EXISTS file_name      text,
  ADD COLUMN IF NOT EXISTS file_size      bigint,
  ADD COLUMN IF NOT EXISTS file_mime      text,
  ADD COLUMN IF NOT EXISTS voice_duration integer,
  ADD COLUMN IF NOT EXISTS reply_to_id    uuid
    REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_deleted     boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at      timestamptz;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS avatar_url  text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS role      text    NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS is_muted  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS joined_at timestamptz NOT NULL DEFAULT now();


-- =============================================================================
-- SECTION 2 — Read receipts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_read_receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      uuid NOT NULL
    REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  read_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_read_receipts_conv_user_idx
  ON public.chat_read_receipts(conversation_id, user_id);
CREATE INDEX IF NOT EXISTS chat_read_receipts_msg_idx
  ON public.chat_read_receipts(message_id);

ALTER TABLE public.chat_read_receipts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.chat_read_receipts TO authenticated;
GRANT ALL                     ON public.chat_read_receipts TO service_role;

DROP POLICY IF EXISTS rr_own         ON public.chat_read_receipts;
DROP POLICY IF EXISTS rr_conv_member ON public.chat_read_receipts;
DROP POLICY IF EXISTS rr_admin       ON public.chat_read_receipts;

CREATE POLICY rr_own ON public.chat_read_receipts
  FOR ALL TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK(user_id = auth.uid());

CREATE POLICY rr_conv_member ON public.chat_read_receipts
  FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id));

-- NOTE: has_role() already exists and takes app_role enum — cast with ::app_role
CREATE POLICY rr_admin ON public.chat_read_receipts
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));


-- =============================================================================
-- SECTION 3 — Emoji reactions
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      uuid NOT NULL
    REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  user_name       text,
  emoji           text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS chat_reactions_msg_idx
  ON public.chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS chat_reactions_conv_idx
  ON public.chat_reactions(conversation_id);

ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.chat_reactions TO authenticated;
GRANT ALL                     ON public.chat_reactions TO service_role;

DROP POLICY IF EXISTS react_member ON public.chat_reactions;
DROP POLICY IF EXISTS react_admin  ON public.chat_reactions;

CREATE POLICY react_member ON public.chat_reactions
  FOR ALL TO authenticated
  USING (public.is_conversation_member(conversation_id))
  WITH CHECK (
    public.is_conversation_member(conversation_id)
    AND user_id = auth.uid()
  );

CREATE POLICY react_admin ON public.chat_reactions
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));


-- =============================================================================
-- SECTION 4 — Online presence
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id      uuid PRIMARY KEY,
  status       text        NOT NULL DEFAULT 'offline',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.user_presence TO authenticated;
GRANT ALL                     ON public.user_presence TO service_role;

DROP POLICY IF EXISTS presence_own       ON public.user_presence;
DROP POLICY IF EXISTS presence_read_auth ON public.user_presence;

CREATE POLICY presence_own ON public.user_presence
  FOR ALL TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK(user_id = auth.uid());

CREATE POLICY presence_read_auth ON public.user_presence
  FOR SELECT TO authenticated
  USING (true);


-- =============================================================================
-- SECTION 5 — Pinned messages
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_pinned_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL
    REFERENCES public.conversations(id)  ON DELETE CASCADE,
  message_id      uuid NOT NULL
    REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  pinned_by       uuid NOT NULL,
  pinned_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, message_id)
);

ALTER TABLE public.chat_pinned_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.chat_pinned_messages TO authenticated;
GRANT ALL                     ON public.chat_pinned_messages TO service_role;

DROP POLICY IF EXISTS pinned_member         ON public.chat_pinned_messages;
DROP POLICY IF EXISTS pinned_admin_or_owner ON public.chat_pinned_messages;

CREATE POLICY pinned_member ON public.chat_pinned_messages
  FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id));

CREATE POLICY pinned_admin_or_owner ON public.chat_pinned_messages
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR pinned_by = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR pinned_by = auth.uid()
  );


-- =============================================================================
-- SECTION 6 — Realtime subscriptions
-- =============================================================================

ALTER TABLE public.chat_read_receipts REPLICA IDENTITY FULL;
ALTER TABLE public.chat_reactions     REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence      REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_read_receipts';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;


-- =============================================================================
-- SECTION 7 — Unread count helper
-- =============================================================================

CREATE OR REPLACE FUNCTION public.unread_count(_conv uuid)
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COUNT(*)
  FROM   public.chat_messages m
  WHERE  m.conversation_id = _conv
    AND  m.sender_id        <> auth.uid()
    AND  m.is_deleted        = false
    AND  NOT EXISTS (
           SELECT 1
           FROM   public.chat_read_receipts r
           WHERE  r.message_id = m.id
             AND  r.user_id    = auth.uid()
         );
$$;

REVOKE ALL      ON FUNCTION public.unread_count(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE  ON FUNCTION public.unread_count(uuid) TO   authenticated, service_role;


-- =============================================================================
-- SECTION 8 — Storage bucket for voice / file uploads
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('chat-uploads', 'chat-uploads', false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "chat_uploads_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_uploads_select" ON storage.objects;
DROP POLICY IF EXISTS "chat_uploads_delete" ON storage.objects;

CREATE POLICY "chat_uploads_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "chat_uploads_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'chat-uploads');

CREATE POLICY "chat_uploads_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- =============================================================================
-- SECTION 9 — Email templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text    NOT NULL UNIQUE,
  name       text    NOT NULL,
  subject    text    NOT NULL,
  html_body  text    NOT NULL,
  text_body  text,
  variables  text[]  NOT NULL DEFAULT '{}',
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
GRANT SELECT            ON public.email_templates TO authenticated;
GRANT ALL               ON public.email_templates TO service_role;

DROP POLICY IF EXISTS et_admin ON public.email_templates;

CREATE POLICY et_admin ON public.email_templates
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS email_templates_updated ON public.email_templates;
CREATE TRIGGER email_templates_updated
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 10 — Email log
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_slug text,
  to_email      text        NOT NULL,
  to_name       text,
  subject       text        NOT NULL,
  status        text        NOT NULL DEFAULT 'queued',
  provider_id   text,
  error_message text,
  metadata      jsonb,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.email_log TO authenticated;
GRANT ALL                     ON public.email_log TO service_role;

DROP POLICY IF EXISTS el_admin ON public.email_log;

CREATE POLICY el_admin ON public.email_log
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));


-- =============================================================================
-- SECTION 11 — Seed email templates (skips if already exist)
-- =============================================================================

INSERT INTO public.email_templates
  (slug, name, subject, html_body, text_body, variables)
VALUES
  ('welcome_client', 'Welcome — Client Portal',
   'Welcome to AM Enterprises, {{name}}!',
   '<h1>Welcome, {{name}}!</h1><p>Your portal: <a href="{{portal_url}}">Sign in</a></p><p>AM ID: <strong>{{am_id}}</strong></p>',
   'Welcome {{name}}! Portal: {{portal_url}} | AM ID: {{am_id}}',
   ARRAY['name','portal_url','am_id']),

  ('welcome_staff', 'Welcome — Team Portal',
   'Welcome to the AM Enterprises Team, {{name}}!',
   '<h1>Welcome, {{name}}!</h1><p>Team portal: <a href="{{portal_url}}">Sign in</a></p><p>AM ID: <strong>{{am_id}}</strong></p>',
   'Welcome {{name}}! Portal: {{portal_url}} | AM ID: {{am_id}}',
   ARRAY['name','portal_url','am_id']),

  ('support_reply', 'Support Ticket Reply',
   'Re: {{ticket_subject}}',
   '<p>Hi {{name}},</p><p>{{reply_body}}</p><p>AM Enterprises Support</p>',
   'Hi {{name}},\n\n{{reply_body}}\n\nAM Enterprises Support',
   ARRAY['name','ticket_subject','reply_body']),

  ('invoice_sent', 'Invoice Ready',
   'Invoice #{{invoice_number}} — AM Enterprises',
   '<p>Hi {{name}},</p><p>Invoice <strong>#{{invoice_number}}</strong> for <strong>{{amount}}</strong> is ready.<br/><a href="{{invoice_url}}">View Invoice</a></p>',
   'Hi {{name}}, Invoice #{{invoice_number}} for {{amount}}: {{invoice_url}}',
   ARRAY['name','invoice_number','amount','invoice_url']),

  ('project_update', 'Project Update',
   'Update on {{project_name}}',
   '<p>Hi {{name}},</p><p>Project <strong>{{project_name}}</strong>: {{update_message}}</p>',
   'Hi {{name}}, Project {{project_name}}: {{update_message}}',
   ARRAY['name','project_name','update_message']),

  ('quote_received', 'Quote Request Received',
   'We received your quote request, {{name}}',
   '<p>Hi {{name}},</p><p>Thanks! We will respond within 24 hours.</p><p>Ref: <strong>{{reference}}</strong></p>',
   'Hi {{name}}, Thanks! Ref: {{reference}}',
   ARRAY['name','reference'])

ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- SECTION 12 — Payment transactions
-- (Only run if public.invoices table exists in your DB)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id      uuid REFERENCES public.portal_clients(id) ON DELETE SET NULL,
  gateway        text         NOT NULL DEFAULT 'manual',
  gateway_tx_id  text,
  amount         numeric(12,2) NOT NULL,
  currency       text         NOT NULL DEFAULT 'USD',
  status         text         NOT NULL DEFAULT 'pending',
  payment_method text,
  notes          text,
  paid_at        timestamptz,
  created_at     timestamptz  NOT NULL DEFAULT now(),
  updated_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_tx_invoice_idx
  ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS payment_tx_client_idx
  ON public.payment_transactions(client_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.payment_transactions TO authenticated;
GRANT ALL            ON public.payment_transactions TO service_role;

DROP POLICY IF EXISTS pt_admin       ON public.payment_transactions;
DROP POLICY IF EXISTS pt_client_read ON public.payment_transactions;

CREATE POLICY pt_admin ON public.payment_transactions
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY pt_client_read ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portal_clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS payment_tx_updated ON public.payment_transactions;
CREATE TRIGGER payment_tx_updated
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 13 — Support ticket replies
-- =============================================================================

ALTER TABLE public.support_requests
  ADD COLUMN IF NOT EXISTS priority     text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS resolved_at  timestamptz,
  ADD COLUMN IF NOT EXISTS client_rating integer;

CREATE TABLE IF NOT EXISTS public.support_replies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id      uuid NOT NULL
    REFERENCES public.support_requests(id) ON DELETE CASCADE,
  sender_kind    text NOT NULL DEFAULT 'admin',
  sender_id      uuid,
  sender_name    text NOT NULL,
  body           text NOT NULL,
  attachment_url text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_replies_ticket_idx
  ON public.support_replies(ticket_id);

ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.support_replies TO authenticated;
GRANT ALL            ON public.support_replies TO service_role;

DROP POLICY IF EXISTS sr_admin         ON public.support_replies;
DROP POLICY IF EXISTS sr_client_read   ON public.support_replies;
DROP POLICY IF EXISTS sr_client_insert ON public.support_replies;

CREATE POLICY sr_admin ON public.support_replies
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY sr_client_read ON public.support_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM   public.support_requests r
      JOIN   public.portal_clients   c ON c.id = r.client_id
      WHERE  r.id = ticket_id
        AND  c.user_id = auth.uid()
    )
  );

CREATE POLICY sr_client_insert ON public.support_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_kind = 'client'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM   public.support_requests r
      JOIN   public.portal_clients   c ON c.id = r.client_id
      WHERE  r.id = ticket_id
        AND  c.user_id = auth.uid()
    )
  );


-- =============================================================================
-- SECTION 14 — Blog enhancements
-- =============================================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS content_format    text    NOT NULL DEFAULT 'markdown',
  ADD COLUMN IF NOT EXISTS reading_time_mins integer,
  ADD COLUMN IF NOT EXISTS view_count        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count        integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id      uuid,
  author_name  text NOT NULL,
  author_email text,
  body         text NOT NULL,
  approved     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_comments_post_idx
  ON public.blog_comments(post_id);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.blog_comments TO authenticated;
GRANT SELECT, INSERT ON public.blog_comments TO anon;
GRANT ALL            ON public.blog_comments TO service_role;

DROP POLICY IF EXISTS bc_read_approved ON public.blog_comments;
DROP POLICY IF EXISTS bc_insert_any    ON public.blog_comments;
DROP POLICY IF EXISTS bc_admin         ON public.blog_comments;

CREATE POLICY bc_read_approved ON public.blog_comments
  FOR SELECT USING (approved = true);

CREATE POLICY bc_insert_any ON public.blog_comments
  FOR INSERT WITH CHECK (length(body) BETWEEN 3 AND 2000);

CREATE POLICY bc_admin ON public.blog_comments
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_post_views(_post_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = _post_id AND published = true;
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;


-- =============================================================================
-- SECTION 15 — Notification preferences
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id               uuid PRIMARY KEY,
  email_project_updates boolean NOT NULL DEFAULT true,
  email_invoice_sent    boolean NOT NULL DEFAULT true,
  email_support_replies boolean NOT NULL DEFAULT true,
  email_chat_mentions   boolean NOT NULL DEFAULT false,
  email_marketing       boolean NOT NULL DEFAULT false,
  push_chat_messages    boolean NOT NULL DEFAULT true,
  push_task_assignments boolean NOT NULL DEFAULT true,
  push_project_updates  boolean NOT NULL DEFAULT true,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL                     ON public.notification_preferences TO service_role;

DROP POLICY IF EXISTS np_own ON public.notification_preferences;

CREATE POLICY np_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK(user_id = auth.uid());


-- =============================================================================
-- SECTION 16 — Extra columns on existing tables
-- =============================================================================

ALTER TABLE public.portal_clients
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio          text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url   text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS tech_stack text[],
  ADD COLUMN IF NOT EXISTS budget     numeric(12,2);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS due_date   date,
  ADD COLUMN IF NOT EXISTS notes      text,
  ADD COLUMN IF NOT EXISTS stripe_url text;


-- =============================================================================
-- END OF MIGRATION 0005 — All done!
-- =============================================================================
