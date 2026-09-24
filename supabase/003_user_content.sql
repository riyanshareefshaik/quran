-- Nur Al-Quran - notes, collections, reading history, and synced preferences.
--
-- Run AFTER schema.sql and 002_user_accounts.sql, in Supabase -> SQL Editor.
-- Safe to re-run.
--
-- Privacy model (same as 002): every row here is owned by exactly one
-- signed-in user and protected by row-level security. Nobody but that user
-- (and, for aggregate counts only, nothing here) can read or write it.
-- Content requires an account, same as cloud sync in 002 - there is no
-- anonymous/local-only path for notes or collections, since they only make
-- sense once they can follow the user across devices.

-- -- Personal notes on a verse ------------------------------------------------
create table if not exists public.notes (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users (id) on delete cascade,
    verse_key  text not null check (verse_key ~ '^([1-9]|[1-9][0-9]|10[0-9]|11[0-4]):[0-9]{1,3}$'),
    chapter_id smallint not null check (chapter_id between 1 and 114),
    body       text not null check (char_length(body) between 1 and 4000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- One note per verse per user; editing replaces it rather than piling up duplicates.
    unique (user_id, verse_key)
);
alter table public.notes enable row level security;

drop trigger if exists notes_touch on public.notes;
create trigger notes_touch before update on public.notes
    for each row execute function public.touch_updated_at();

drop policy if exists "users manage own notes" on public.notes;
create policy "users manage own notes" on public.notes
    for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists notes_user_updated on public.notes (user_id, updated_at desc);

-- A user is capped at a sane number of notes so one account can't grow the
-- table without bound; the UI will never hit this in normal use.
create or replace function public.enforce_notes_limit()
returns trigger
language plpgsql
as $$
begin
    if (select count(*) from public.notes where user_id = new.user_id) >= 2000 then
        raise exception 'Note limit reached (2000). Delete some notes first.';
    end if;
    return new;
end;
$$;
drop trigger if exists notes_limit on public.notes;
create trigger notes_limit before insert on public.notes
    for each row execute function public.enforce_notes_limit();

-- -- Collections (named groups of saved ayahs, e.g. "Favorites", "For Khutbah") --
create table if not exists public.collections (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    name        text not null check (char_length(name) between 1 and 80),
    description text check (description is null or char_length(description) <= 300),
    is_default  boolean not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (user_id, name)
);
alter table public.collections enable row level security;

drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections
    for each row execute function public.touch_updated_at();

drop policy if exists "users manage own collections" on public.collections;
create policy "users manage own collections" on public.collections
    for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists collections_user on public.collections (user_id, created_at desc);

create or replace function public.enforce_collections_limit()
returns trigger
language plpgsql
as $$
begin
    if (select count(*) from public.collections where user_id = new.user_id) >= 100 then
        raise exception 'Collection limit reached (100). Delete some collections first.';
    end if;
    return new;
end;
$$;
drop trigger if exists collections_limit on public.collections;
create trigger collections_limit before insert on public.collections
    for each row execute function public.enforce_collections_limit();

-- -- Ayahs saved into a collection ---------------------------------------------
create table if not exists public.collection_ayahs (
    id            uuid primary key default gen_random_uuid(),
    collection_id uuid not null references public.collections (id) on delete cascade,
    user_id       uuid not null references auth.users (id) on delete cascade,
    verse_key     text not null check (verse_key ~ '^([1-9]|[1-9][0-9]|10[0-9]|11[0-4]):[0-9]{1,3}$'),
    chapter_id    smallint not null check (chapter_id between 1 and 114),
    added_at      timestamptz not null default now(),
    unique (collection_id, verse_key)
);
alter table public.collection_ayahs enable row level security;

drop policy if exists "users manage own saved ayahs" on public.collection_ayahs;
create policy "users manage own saved ayahs" on public.collection_ayahs
    for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists collection_ayahs_collection on public.collection_ayahs (collection_id, added_at desc);
create index if not exists collection_ayahs_user_verse on public.collection_ayahs (user_id, verse_key);

-- Keep collection_ayahs.user_id honest (must match the parent collection's
-- owner) so RLS on this table alone is enough - a stale/forged user_id can
-- never smuggle a row into someone else's collection.
create or replace function public.enforce_collection_ayah_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (select 1 from public.collections c where c.id = new.collection_id and c.user_id = new.user_id) then
        raise exception 'Collection does not belong to this user';
    end if;
    return new;
end;
$$;
drop trigger if exists collection_ayahs_owner_check on public.collection_ayahs;
create trigger collection_ayahs_owner_check before insert or update on public.collection_ayahs
    for each row execute function public.enforce_collection_ayah_owner();

-- One default "Favorites" collection is created automatically for every new
-- user, so the app always has somewhere to save a quick "favorite" ayah
-- without asking which collection to use first.
create or replace function public.ensure_default_collection()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id uuid;
begin
    if auth.uid() is null then
        raise exception 'Not signed in';
    end if;
    select id into v_id from public.collections where user_id = auth.uid() and is_default limit 1;
    if v_id is null then
        insert into public.collections (user_id, name, is_default)
        values (auth.uid(), 'Favorites', true)
        on conflict (user_id, name) do update set is_default = true
        returning id into v_id;
    end if;
    return v_id;
end;
$$;
revoke all on function public.ensure_default_collection() from public;
grant execute on function public.ensure_default_collection() to authenticated;

-- -- Reading history (append-only log of recently opened ayahs) ----------------
create table if not exists public.reading_history (
    id         bigint generated always as identity primary key,
    user_id    uuid not null references auth.users (id) on delete cascade,
    verse_key  text not null check (verse_key ~ '^([1-9]|[1-9][0-9]|10[0-9]|11[0-4]):[0-9]{1,3}$'),
    chapter_id smallint not null check (chapter_id between 1 and 114),
    surah_name text not null check (char_length(surah_name) <= 80),
    read_at    timestamptz not null default now()
);
alter table public.reading_history enable row level security;

drop policy if exists "users manage own history" on public.reading_history;
create policy "users manage own history" on public.reading_history
    for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists reading_history_user_time on public.reading_history (user_id, read_at desc);

-- History is a rolling log, not an archive: after each insert, prune this
-- user's rows beyond the most recent 200 so the table stays bounded without
-- needing a separate scheduled cleanup job.
create or replace function public.prune_reading_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    delete from public.reading_history
    where user_id = new.user_id
      and id in (
          select id from public.reading_history
          where user_id = new.user_id
          order by read_at desc, id desc
          offset 200
      );
    return new;
end;
$$;
drop trigger if exists reading_history_prune on public.reading_history;
create trigger reading_history_prune after insert on public.reading_history
    for each row execute function public.prune_reading_history();

create or replace function public.log_reading(p_verse_key text, p_chapter_id smallint, p_surah_name text)
returns void
language sql
security definer
set search_path = public
as $$
    insert into public.reading_history (user_id, verse_key, chapter_id, surah_name)
    values (auth.uid(), p_verse_key, p_chapter_id, left(p_surah_name, 80));
$$;
revoke all on function public.log_reading(text, smallint, text) from public;
grant execute on function public.log_reading(text, smallint, text) to authenticated;

-- -- Synced preferences (extends 002's user_data with a small settings blob) --
-- Reuses the existing per-user row instead of a new table: preferences are a
-- single small object with no relational structure of their own, exactly
-- like the bookmarks/progress blobs already synced here.
alter table public.user_data add column if not exists preferences jsonb not null default '{}'::jsonb;
alter table public.user_data drop constraint if exists user_data_preferences_check;
alter table public.user_data add constraint user_data_preferences_check
    check (jsonb_typeof(preferences) = 'object' and pg_column_size(preferences) < 20000);

-- -- Table privileges (RLS above still decides which rows) ---------------------
grant select, insert, update, delete on public.notes, public.collections, public.collection_ayahs to authenticated;
grant select, insert, delete on public.reading_history to authenticated;
