create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  settings jsonb default '{}',
  created_at timestamp default now(),
  updated_at timestamp default now()
);


alter table user_settings enable row level security;

create policy "Allow user to manage own settings"
on user_settings
for all
using (auth.uid() = user_id);
