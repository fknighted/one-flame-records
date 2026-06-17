-- ─────────────────────────────────────────────────────────────
-- Extend profiles role constraint to include bartender + gamer
-- ─────────────────────────────────────────────────────────────
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'artist', 'bartender', 'gamer'));

-- Update default for new gamer/bartender invite flows:
-- read role from user_metadata, fall back to 'artist'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'artist');
  if v_role not in ('admin', 'artist', 'bartender', 'gamer') then
    v_role := 'artist';
  end if;
  insert into public.profiles (id, role)
  values (new.id, v_role);
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Helper: is_bar_staff — true for admin OR bartender
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_bar_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'bartender')
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- pos_items — bar menu items
-- ─────────────────────────────────────────────────────────────
create table public.pos_items (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  category     text        not null default 'drink'
               check (category in ('drink', 'beverage', 'food', 'game_time')),
  price_cents  int         not null check (price_cents >= 0),
  description  text,
  is_active    boolean     not null default true,
  sort_order   int,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger pos_items_updated_at
  before update on public.pos_items
  for each row execute function public.set_updated_at();

alter table public.pos_items enable row level security;

-- Bar staff (admin + bartender) can read the menu
create policy "pos_items_select_bar_staff"
  on public.pos_items for select
  using (public.is_bar_staff());

-- Only admin can manage menu items
create policy "pos_items_insert_admin"
  on public.pos_items for insert
  with check (public.is_admin());

create policy "pos_items_update_admin"
  on public.pos_items for update
  using (public.is_admin());

create policy "pos_items_delete_admin"
  on public.pos_items for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- pos_tabs — customer tabs
-- ─────────────────────────────────────────────────────────────
create table public.pos_tabs (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  status         text        not null default 'open'
                 check (status in ('open', 'closed', 'voided')),
  payment_method text        check (payment_method in ('cash', 'card', 'comp')),
  total_cents    int         not null default 0,
  opened_by      uuid        references auth.users(id) on delete set null,
  closed_by      uuid        references auth.users(id) on delete set null,
  closed_at      timestamptz,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger pos_tabs_updated_at
  before update on public.pos_tabs
  for each row execute function public.set_updated_at();

alter table public.pos_tabs enable row level security;

create policy "pos_tabs_bar_staff_all"
  on public.pos_tabs for all
  using (public.is_bar_staff())
  with check (public.is_bar_staff());

-- ─────────────────────────────────────────────────────────────
-- pos_tab_items — line items on each tab
-- ─────────────────────────────────────────────────────────────
create table public.pos_tab_items (
  id           uuid        primary key default gen_random_uuid(),
  tab_id       uuid        not null references public.pos_tabs(id) on delete cascade,
  pos_item_id  uuid        references public.pos_items(id) on delete set null,
  name         text        not null,
  price_cents  int         not null,
  quantity     int         not null default 1 check (quantity > 0),
  note         text,
  created_at   timestamptz not null default now()
);

alter table public.pos_tab_items enable row level security;

create policy "pos_tab_items_bar_staff_all"
  on public.pos_tab_items for all
  using (public.is_bar_staff())
  with check (public.is_bar_staff());

-- ─────────────────────────────────────────────────────────────
-- gamer_members — loyalty member profiles
-- ─────────────────────────────────────────────────────────────
create table public.gamer_members (
  id               uuid        primary key default gen_random_uuid(),
  auth_user_id     uuid        unique references auth.users(id) on delete cascade,
  display_name     text        not null,
  email            text        not null,
  status           text        not null default 'active'
                   check (status in ('active', 'suspended')),
  minutes_balance  int         not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger gamer_members_updated_at
  before update on public.gamer_members
  for each row execute function public.set_updated_at();

-- current_gamer_member_id must be defined after gamer_members exists
create or replace function public.current_gamer_member_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.gamer_members
  where auth_user_id = auth.uid();
$$;

alter table public.gamer_members enable row level security;

-- Bar staff can read and manage all members
create policy "gamer_members_bar_staff_all"
  on public.gamer_members for all
  using (public.is_bar_staff())
  with check (public.is_bar_staff());

-- Gamers can read their own record
create policy "gamer_members_select_self"
  on public.gamer_members for select
  using (auth_user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- game_sessions — gaming session log
-- ─────────────────────────────────────────────────────────────
create table public.game_sessions (
  id               uuid        primary key default gen_random_uuid(),
  member_id        uuid        references public.gamer_members(id) on delete set null,
  tab_item_id      uuid        references public.pos_tab_items(id) on delete set null,
  started_by       uuid        references auth.users(id) on delete set null,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_minutes int,
  station          text,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

create policy "game_sessions_bar_staff_all"
  on public.game_sessions for all
  using (public.is_bar_staff())
  with check (public.is_bar_staff());

-- Gamers can read their own sessions
create policy "game_sessions_select_self"
  on public.game_sessions for select
  using (member_id = public.current_gamer_member_id());
