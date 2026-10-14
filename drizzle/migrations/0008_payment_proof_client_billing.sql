-- =============================================================================
-- Migration 0008 — Payment proof column + client billing request
-- Run in Supabase SQL Editor
-- =============================================================================

-- 1. Add proof_url to payment_transactions (for admin-uploaded payment receipts)
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS proof_url text;

-- 2. Client billing requests — clients can submit billing requests for admin approval
CREATE TABLE IF NOT EXISTS public.client_billing_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  amount       numeric(12,2),
  currency     text NOT NULL DEFAULT 'USD',
  attachment_url text,
  status       text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  admin_notes  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_billing_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.client_billing_requests TO authenticated;
GRANT ALL ON public.client_billing_requests TO service_role;

-- Client can see and create their own requests
DROP POLICY IF EXISTS cbr_client ON public.client_billing_requests;
CREATE POLICY cbr_client ON public.client_billing_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );

-- Admin can see and manage all
DROP POLICY IF EXISTS cbr_admin ON public.client_billing_requests;
CREATE POLICY cbr_admin ON public.client_billing_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER TABLE public.client_billing_requests REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.client_billing_requests';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
