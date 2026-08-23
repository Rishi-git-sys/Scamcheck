-- ==============================================================================
-- Comprehensive Migration: Update verifications input_type check constraint
-- Run this in the Supabase SQL editor to allow all 4 verification types:
-- 'url', 'manual', 'company', 'evidence'
-- ==============================================================================

-- Step 1: Drop any existing check constraint on input_type
ALTER TABLE public.verifications
  DROP CONSTRAINT IF EXISTS verifications_input_type_check;

-- Step 2: Re-create the constraint allowing 'url', 'manual', 'company', and 'evidence'
ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_input_type_check
  CHECK (input_type IN ('url', 'manual', 'company', 'evidence'));
