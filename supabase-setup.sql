-- Marseille 2026 · synchronisation partagée
-- 1. Remplace CHANGE-ME-TO-A-LONG-GROUP-CODE par un code long à partager uniquement avec le groupe.
-- 2. Exécute ensuite l'intégralité de ce script dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.trip_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  access_code_hash text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.trip_events (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trip_state(id) on delete cascade,
  event_type text not null,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.trip_state (id, state, access_code_hash, updated_by)
values (
  'marseille-2026',
  jsonb_build_object(
    'expenses', jsonb_build_array(),
    'repayments', jsonb_build_array(),
    'history', jsonb_build_array(),
    'notes', jsonb_build_array(),
    'decisions', jsonb_build_array()
  ),
  crypt('CHANGE-ME-TO-A-LONG-GROUP-CODE', gen_salt('bf')),
  'Initialisation'
)
on conflict (id) do nothing;

alter table public.trip_state enable row level security;
alter table public.trip_events enable row level security;

drop policy if exists "Lecture publique du séjour" on public.trip_state;
create policy "Lecture publique du séjour"
on public.trip_state for select
to anon, authenticated
using (id = 'marseille-2026');

drop policy if exists "Lecture publique de l'historique" on public.trip_events;
create policy "Lecture publique de l'historique"
on public.trip_events for select
to anon, authenticated
using (trip_id = 'marseille-2026');

revoke all on public.trip_state from anon, authenticated;
revoke all on public.trip_events from anon, authenticated;
grant select on public.trip_state to anon, authenticated;
grant select on public.trip_events to anon, authenticated;
grant usage on schema public to anon, authenticated;

create or replace function public.save_marseille_trip_state(
  p_access_code text,
  p_state jsonb,
  p_expected_version bigint,
  p_actor text,
  p_event_type text default 'Mise à jour'
)
returns public.trip_state
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.trip_state;
  saved_row public.trip_state;
begin
  select * into current_row
  from public.trip_state
  where id = 'marseille-2026'
  for update;

  if current_row.id is null then
    raise exception 'Séjour introuvable';
  end if;

  if extensions.crypt(p_access_code, current_row.access_code_hash) <> current_row.access_code_hash then
    raise exception 'Code de groupe incorrect';
  end if;

  if p_expected_version <> current_row.version then
    raise exception 'Le séjour a été modifié par quelqu’un d’autre : recharge les données puis réessaie.';
  end if;

  update public.trip_state
  set state = p_state,
      version = version + 1,
      updated_at = now(),
      updated_by = nullif(trim(p_actor), '')
  where id = 'marseille-2026'
  returning * into saved_row;

  insert into public.trip_events (trip_id, event_type, actor, payload)
  values ('marseille-2026', p_event_type, nullif(trim(p_actor), ''), p_state);

  return saved_row;
end;
$$;

revoke all on function public.save_marseille_trip_state(text, jsonb, bigint, text, text) from public;
grant execute on function public.save_marseille_trip_state(text, jsonb, bigint, text, text) to anon, authenticated;

-- Synchronisation instantanée des mises à jour vers les navigateurs ouverts.
alter publication supabase_realtime add table public.trip_state;
