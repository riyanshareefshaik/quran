-- Nur Al-Quran - user accounts (phone number + OTP sign-in) and cloud sync.
--
-- Run AFTER schema.sql, in Supabase -> SQL Editor -> New query.
-- Safe to re-run.
--
-- Privacy model:
--   * Each signed-in user can read and write ONLY their own profile and
--     synced data (row-level security).
--   * The in-app admin dashboard sees only the NUMBER of accounts, never
--     phone numbers or anyone's bookmarks/progress.
--   * Users can delete their account (and all synced data) from the app.

-- -- Profile ----------------------------------------------------------------
create table if not exists public.profiles (
    id           uuid primary key references auth.users (id) on delete cascade,
    display_name text check (display_name is null or char_length(display_name) <= 60),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
    for each row execute function public.touch_updated_at();

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile" on public.profiles
    for all to authenticated
    using (id = auth.uid()) with check (id = auth.uid());

-- -- Synced bookmarks and reading progress ----------------------------------
create table if not exists public.user_data (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    bookmarks  jsonb not null default '[]'::jsonb,
    progress   jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    check (jsonb_typeof(bookmarks) = 'array' and jsonb_typeof(progress) = 'object'),
    check (pg_column_size(bookmarks) < 100000 and pg_column_size(progress) < 400000)
);
alter table public.user_data enable row level security;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch before update on public.user_data
    for each row execute function public.touch_updated_at();

drop policy if exists "users manage own data" on public.user_data;
create policy "users manage own data" on public.user_data
    for all to authenticated
    using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.profiles, public.user_data to authenticated;

-- -- Delete my account ------------------------------------------------------
-- Removes the auth user; profiles and user_data are deleted by cascade.
-- Admin accounts must be removed by another admin first (safety net).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if auth.uid() is null then
        raise exception 'Not signed in';
    end if;
    if exists (select 1 from public.admins where user_id = auth.uid()) then
        raise exception 'Admin accounts cannot be deleted here. Ask another admin to remove your admin access first.';
    end if;
    delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- -- Aggregate count for the admin dashboard (no personal data) --------------
create or replace function public.account_count()
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Only admins can view this';
    end if;
    return (select count(*) from auth.users);
end;
$$;
revoke all on function public.account_count() from public;
grant execute on function public.account_count() to authenticated;
