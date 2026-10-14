-- =============================================================================
-- Migration 0007 — Enable Realtime for client & staff notifications
-- Run this in Supabase SQL Editor
-- =============================================================================

ALTER TABLE public.client_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.staff_notifications  REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.client_notifications';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_notifications';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
