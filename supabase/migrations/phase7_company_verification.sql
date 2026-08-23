-- ==============================================================================
-- Phase 7 Migration: Add 'company' to verifications.input_type
-- Run this in the Supabase SQL editor
-- ==============================================================================

-- Step 1: Drop the existing constraint
ALTER TABLE public.verifications
  DROP CONSTRAINT IF EXISTS verifications_input_type_check;

-- Step 2: Add updated constraint allowing 'url', 'manual', and 'company'
ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_input_type_check
  CHECK (input_type IN ('url', 'manual', 'company'));
