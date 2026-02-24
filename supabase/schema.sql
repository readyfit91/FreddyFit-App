-- ── PROFILES ──────────────────────────────────────────────────────────────
create table profiles (
  id               uuid references auth.users primary key,
  first_name       text,
  last_name        text,
  email            text,
  phone            text,
  date_of_birth    date,
  height           text,
  weight_lbs       numeric,
  goal_weight_lbs  numeric,
  bmi              numeric,
  fitness_level    text,
  role             text default 'client', -- 'client' | 'trainer'
  waiver_signed    boolean default false,
  waiver_signed_at timestamptz,
  waiver_name      text,
  created_at       timestamptz default now()
);

-- ── INVITES ───────────────────────────────────────────────────────────────
create table invites (
  id         uuid primary key default gen_random_uuid(),
  trainer_id uuid references profiles(id),
  email      text not null,
  first_name text,
  last_name  text,
  plan       text,
  note       text,
  status     text default 'pending', -- 'pending' | 'accepted' | 'expired'
  token      text unique default gen_random_uuid()::text,
  expires_at timestamptz default now() + interval '48 hours',
  created_at timestamptz default now()
);

-- ── WEIGHT LOGS ───────────────────────────────────────────────────────────
create table weight_logs (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references profiles(id),
  weight_lbs numeric not null,
  logged_at  date default current_date,
  notes      text
);

-- ── WORKOUT PLANS ─────────────────────────────────────────────────────────
create table workout_plans (
  id         uuid primary key default gen_random_uuid(),
  trainer_id uuid references profiles(id),
  client_id  uuid references profiles(id),
  name       text not null,
  created_at timestamptz default now()
);

-- ── EXERCISES ─────────────────────────────────────────────────────────────
create table exercises (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid references workout_plans(id) on delete cascade,
  day         text,
  name        text,
  sets        int,
  reps        text,
  weight      text,
  notes       text,
  order_index int
);

-- ── WORKOUT LOGS ──────────────────────────────────────────────────────────
create table workout_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references profiles(id),
  plan_id     uuid references workout_plans(id),
  exercise_id uuid references exercises(id),
  completed   boolean default false,
  logged_at   timestamptz default now()
);

-- ── MESSAGES ──────────────────────────────────────────────────────────────
create table messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references profiles(id),
  receiver_id uuid references profiles(id),
  body        text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── NUTRITION LOGS ────────────────────────────────────────────────────────
create table nutrition_logs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references profiles(id),
  meal         text,
  food_name    text,
  calories     numeric,
  protein_g    numeric,
  carbs_g      numeric,
  fat_g        numeric,
  fiber_g      numeric,
  serving      text,
  logged_date  date default current_date,
  created_at   timestamptz default now()
);

-- ── PROGRESS PHOTOS ───────────────────────────────────────────────────────
create table progress_photos (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references profiles(id),
  storage_path text not null,
  label        text,
  angle        text,
  weight_lbs   numeric,
  notes        text,
  photo_date   date,
  created_at   timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
alter table profiles        enable row level security;
alter table invites         enable row level security;
alter table weight_logs     enable row level security;
alter table workout_plans   enable row level security;
alter table exercises       enable row level security;
alter table workout_logs    enable row level security;
alter table messages        enable row level security;
alter table nutrition_logs  enable row level security;
alter table progress_photos enable row level security;

-- Clients own their own data
create policy "clients_own_nutrition"  on nutrition_logs  for all using (auth.uid() = client_id);
create policy "clients_own_photos"     on progress_photos for all using (auth.uid() = client_id);
create policy "clients_own_weight"     on weight_logs     for all using (auth.uid() = client_id);
create policy "clients_own_workouts"   on workout_logs    for all using (auth.uid() = client_id);

-- Trainers can see their invited clients' profiles
create policy "trainer_sees_clients" on profiles
  for select using (
    auth.uid() = id or
    exists (
      select 1 from invites
      where trainer_id = auth.uid()
        and email = profiles.email
        and status = 'accepted'
    )
  );

-- Users can read/send their own messages
create policy "users_own_messages" on messages
  for all using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Trainers manage their own invites
create policy "trainers_own_invites" on invites
  for all using (auth.uid() = trainer_id);

-- Clients can see the trainer who invited them
create policy "client_sees_trainer" on profiles
  for select using (
    auth.uid() = id or
    exists (
      select 1 from invites
      where trainer_id = profiles.id
        and email = (select email from profiles where id = auth.uid())
        and status = 'accepted'
    )
  );

-- Enable realtime for messages table
alter publication supabase_realtime add table messages;
