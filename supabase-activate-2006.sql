-- Marseille 2026 · activation finale des écritures partagées
-- À exécuter une seule fois dans Supabase > SQL Editor, connecté au projet Marseille 2026.

alter function public.save_marseille_trip_state(text, jsonb, bigint, text, text)
set search_path = public, extensions;

update public.trip_state
set access_code_hash = extensions.crypt('2006', extensions.gen_salt('bf'))
where id = 'marseille-2026';
