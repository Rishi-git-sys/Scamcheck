-- ==============================================================================
-- ScamCheck Database Schema & Profile Trigger for Supabase
-- ==============================================================================

-- 1. Create public.profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Set up Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- 3. Automatic Updated_At Timestamp Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 4. Auth New User Signup Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ==============================================================================
-- 5. Create public.verifications table
-- ==============================================================================
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  input_type text not null check (input_type in ('url', 'manual', 'company', 'evidence')),
  url text,
  company_name text,
  job_title text,
  recruiter_email text,
  salary_text text,
  contact_method text,
  payment_requested boolean,
  job_description text,
  risk_score integer not null,
  risk_level text not null check (risk_level in ('safe', 'review', 'high')),
  summary text not null,
  recommendations text[] default '{}',
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table public.verifications enable row level security;

create policy "Users can view their own verifications"
  on public.verifications
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own verifications"
  on public.verifications
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own verifications"
  on public.verifications
  for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 6. Create public.risk_signals table
-- ==============================================================================
create table if not exists public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid references public.verifications(id) on delete cascade not null,
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  points integer not null,
  created_at timestamptz default now() not null
);

alter table public.risk_signals enable row level security;

create policy "Users can view signals of their verifications"
  on public.risk_signals
  for select
  using (
    exists (
      select 1 from public.verifications
      where verifications.id = risk_signals.verification_id
      and verifications.user_id = auth.uid()
    )
  );

create policy "Users can delete signals for their verifications"
  on public.risk_signals
  for delete
  using (
    exists (
      select 1 from public.verifications
      where verifications.id = risk_signals.verification_id
      and verifications.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 7. Query Performance Indexes
-- ==============================================================================
create index if not exists idx_verifications_user_id_created_at 
  on public.verifications (user_id, created_at desc);

create index if not exists idx_verifications_risk_level 
  on public.verifications (user_id, risk_level);

create index if not exists idx_risk_signals_verification_id 
  on public.risk_signals (verification_id);
