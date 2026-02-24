# FreddyFit — Claude Code Handoff

## What This Is
A full-stack personal trainer client portal built in React. All UI components are complete and ready to wire up to a real backend (Supabase recommended).

---

## Project Structure to Create

```
freddyfit/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← router / shell
│   ├── constants.js             ← shared colors, fonts, brand
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Toast.jsx
│   │   ├── onboarding/
│   │   │   └── OnboardingFlow.jsx     ← freddyfit-onboarding-v3.jsx
│   │   ├── portal/
│   │   │   └── TrainerDashboard.jsx   ← freddyfit-portal.jsx
│   │   ├── messaging/
│   │   │   └── Messaging.jsx          ← freddyfit-messaging.jsx
│   │   ├── clients/
│   │   │   └── AddClient.jsx          ← freddyfit-add-client.jsx
│   │   ├── nutrition/
│   │   │   └── NutritionLog.jsx       ← freddyfit-nutrition.jsx
│   │   └── photos/
│   │       └── ProgressPhotos.jsx     ← freddyfit-progress-photos.jsx
└── supabase/
    └── schema.sql               ← DB schema below
```

---

## Setup Commands

```bash
npm create vite@latest freddyfit -- --template react
cd freddyfit
npm install
npm install @supabase/supabase-js react-router-dom
npm run dev
```

---

## Shared Constants (src/constants.js)

```js
export const C = {
  blue:       "#1AABE3",
  blueDark:   "#1490C4",
  blueLight:  "#E8F7FD",
  greyLight:  "#F4F7FA",
  white:      "#FFFFFF",
  text:       "#1A2332",
  muted:      "#7A8A9E",
  border:     "#E2E8F0",
  green:      "#22C55E",
  red:        "#EF4444",
  orange:     "#F97316",
  purple:     "#A855F7",
};
export const ff = "'Barlow', sans-serif";
export const LOGO_B64 = "data:image/svg+xml;base64,..."; // from existing files
```

---

## Routing (src/App.jsx)

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Trainer routes
<Route path="/trainer/dashboard"  element={<TrainerDashboard />} />
<Route path="/trainer/clients"    element={<AddClient />} />
<Route path="/trainer/messages"   element={<Messaging role="trainer" />} />

// Client routes  
<Route path="/onboarding"         element={<OnboardingFlow />} />
<Route path="/client/dashboard"   element={<ClientDashboard />} />
<Route path="/client/nutrition"   element={<NutritionLog />} />
<Route path="/client/photos"      element={<ProgressPhotos />} />
<Route path="/client/messages"    element={<Messaging role="client" />} />
```

---

## Supabase Schema (supabase/schema.sql)

```sql
-- Users / profiles
create table profiles (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  height text,
  weight_lbs numeric,
  goal_weight_lbs numeric,
  bmi numeric,
  fitness_level text,
  role text default 'client', -- 'client' | 'trainer'
  waiver_signed boolean default false,
  waiver_signed_at timestamptz,
  waiver_name text,
  created_at timestamptz default now()
);

-- Client invites
create table invites (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references profiles(id),
  email text not null,
  first_name text,
  last_name text,
  plan text,
  note text,
  status text default 'pending', -- 'pending' | 'accepted' | 'expired'
  token text unique default gen_random_uuid()::text,
  expires_at timestamptz default now() + interval '48 hours',
  created_at timestamptz default now()
);

-- Weight entries
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  weight_lbs numeric not null,
  logged_at date default current_date,
  notes text
);

-- Workout plans
create table workout_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references profiles(id),
  client_id uuid references profiles(id),
  name text not null,
  created_at timestamptz default now()
);

-- Exercises
create table exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references workout_plans(id) on delete cascade,
  day text,
  name text,
  sets int,
  reps text,
  weight text,
  notes text,
  order_index int
);

-- Workout logs (client completions)
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  plan_id uuid references workout_plans(id),
  exercise_id uuid references exercises(id),
  completed boolean default false,
  logged_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  body text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Nutrition log
create table nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  meal text,
  food_name text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  serving text,
  logged_date date default current_date,
  created_at timestamptz default now()
);

-- Progress photos
create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  storage_path text not null,  -- Supabase Storage path
  label text,
  angle text,
  weight_lbs numeric,
  notes text,
  photo_date date,
  created_at timestamptz default now()
);

-- Row Level Security (enable on all tables)
alter table profiles        enable row level security;
alter table weight_logs     enable row level security;
alter table messages        enable row level security;
alter table nutrition_logs  enable row level security;
alter table progress_photos enable row level security;

-- Example RLS: clients can only see their own data
create policy "clients_own_data" on nutrition_logs
  for all using (auth.uid() = client_id);

create policy "clients_own_photos" on progress_photos
  for all using (auth.uid() = client_id);

-- Trainers can see their clients' data
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
```

---

## Environment Variables (.env)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USDA_API_KEY=DEMO_KEY  # or get free key at api.nal.usda.gov
```

---

## Supabase Client (src/lib/supabase.js)

```js
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Key Integrations To Wire Up

| Feature | File | Backend call needed |
|---|---|---|
| Onboarding signup | OnboardingFlow.jsx | `supabase.auth.signUp()` + insert profile |
| Client invite | AddClient.jsx | Insert invite row + trigger email via Resend |
| Messages | Messaging.jsx | `supabase.from('messages')` + realtime subscription |
| Nutrition log | NutritionLog.jsx | Insert/delete nutrition_logs rows |
| Progress photos | ProgressPhotos.jsx | `supabase.storage.upload()` + insert progress_photos |
| Weight log | TrainerDashboard.jsx | Insert weight_logs rows |

---

## Realtime Messages (example)

```js
// In Messaging.jsx, replace mock data with:
const channel = supabase
  .channel("messages")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "messages",
    filter: `receiver_id=eq.${currentUserId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();

return () => supabase.removeChannel(channel);
```

---

## Photo Upload (example)

```js
// In ProgressPhotos.jsx, replace mock with:
const { data, error } = await supabase.storage
  .from("progress-photos")
  .upload(`${userId}/${Date.now()}.jpg`, file);

if (!error) {
  const { publicUrl } = supabase.storage
    .from("progress-photos")
    .getPublicUrl(data.path);

  await supabase.from("progress_photos").insert({
    client_id: userId,
    storage_path: publicUrl,
    label: form.label,
    angle: form.angle,
    weight_lbs: form.weight,
    notes: form.notes,
    photo_date: form.date,
  });
}
```

---

## Send Invite Email (example using Resend)

```js
// Supabase Edge Function: supabase/functions/send-invite/index.ts
import { Resend } from "resend";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "Freddy Fit <noreply@freddyfit.com>",
  to: invite.email,
  subject: "You've been invited to Freddy Fit! 💪",
  html: inviteEmailTemplate(invite), // build from EmailPreview component
});
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel login
vercel --prod
# Add env vars in Vercel dashboard
```

**Custom domain:** Point app.freddyfit.com → Vercel deployment in your DNS settings.

---

## Files To Copy In

| Claude.ai artifact | → Destination |
|---|---|
| freddyfit-portal.jsx | src/components/portal/TrainerDashboard.jsx |
| freddyfit-onboarding-v3.jsx | src/components/onboarding/OnboardingFlow.jsx |
| freddyfit-messaging.jsx | src/components/messaging/Messaging.jsx |
| freddyfit-add-client.jsx | src/components/clients/AddClient.jsx |
| freddyfit-nutrition.jsx | src/components/nutrition/NutritionLog.jsx |
| freddyfit-progress-photos.jsx | src/components/photos/ProgressPhotos.jsx |

Each file is a self-contained React component — copy it in, remove the default export wrapper, and import it into App.jsx routing.

---

## Estimated Time To Production

| Task | Time |
|---|---|
| Vite setup + copy components in | 30 min |
| Supabase project + schema | 45 min |
| Wire up auth (login/signup) | 2 hrs |
| Connect each feature to DB | 1 day |
| Email invites via Resend | 2 hrs |
| Deploy to Vercel + domain | 1 hr |
| **Total** | **~2 days** |
