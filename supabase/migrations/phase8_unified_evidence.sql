-- ==============================================================================
-- Phase 8 Migration: Add 'evidence' to verifications.input_type
-- Run this in the Supabase SQL editor AFTER the Phase 7 migration
-- ==============================================================================

-- Step 1: Drop the existing constraint (Phase 7 left it as 'url', 'manual', 'company')
ALTER TABLE public.verifications
  DROP CONSTRAINT IF EXISTS verifications_input_type_check;

-- Step 2: Add updated constraint allowing 'url', 'manual', 'company', and 'evidence'
ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_input_type_check
  CHECK (input_type IN ('url', 'manual', 'company', 'evidence'));
