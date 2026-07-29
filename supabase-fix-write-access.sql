-- Correctif Marseille 2026 · accès écriture partagé
-- À exécuter une seule fois dans Supabase > SQL Editor.

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

grant execute on function public.save_marseille_trip_state(text, jsonb, bigint, text, text) to anon, authenticated;
