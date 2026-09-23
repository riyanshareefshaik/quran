-- Nur Al-Quran - Supabase schema for the admin dashboard.
--
-- Run this whole file once in the Supabase dashboard -> SQL Editor -> New query.
-- It is safe to re-run: every statement is idempotent.
-- Then run 002_user_accounts.sql for phone sign-in and cloud sync.
--
-- Security model: the web app only ever holds the public "anon" key. Every
-- permission below is enforced by Postgres row-level security (RLS), so the
-- public key can do nothing except:
--   * read currently-active announcements
--   * submit feedback and content-issue reports (length-checked)
--   * increment an anonymous page-view counter
-- Everything else requires a signed-in user listed in public.admins.

create extension if not exists pgcrypto;

-- -- Admins --------------------------------------------------------------
create table if not exists public.admins (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    email      text not null,
    created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins can view admins" on public.admins;
create policy "admins can view admins" on public.admins
    for select to authenticated using (public.is_admin());
-- No insert/update/delete policies: admins are managed only through the
-- functions below (or the SQL editor), which check permissions themselves.

create or replace function public.add_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user auth.users%rowtype;
begin
    if not public.is_admin() then
        raise exception 'Only admins can add admins';
    end if;
    select * into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
    if not found then
        raise exception 'No user with that email. Create the user in Supabase -> Authentication first.';
    end if;
    insert into public.admins (user_id, email) values (v_user.id, v_user.email)
    on conflict (user_id) do nothing;
end;
$$;
revoke all on function public.add_admin(text) from public;
grant execute on function public.add_admin(text) to authenticated;

create or replace function public.remove_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Only admins can remove admins';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'You cannot remove yourself';
    end if;
    delete from public.admins where user_id = p_user_id;
end;
$$;
revoke all on function public.remove_admin(uuid) from public;
grant execute on function public.remove_admin(uuid) to authenticated;

-- -- Shared trigger: keep updated_at current -----------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- -- Announcements (shown as a banner on the home page) ------------------
create table if not exists public.announcements (
    id         uuid primary key default gen_random_uuid(),
    title      text not null check (char_length(title) between 1 and 120),
    body       text not null check (char_length(body) between 1 and 1000),
    link_url   text check (link_url is null or (char_length(link_url) <= 500 and link_url ~ '^(https://|/)[^\s<>"]*$')),
    level      text not null default 'info' check (level in ('info', 'important', 'event')),
    is_active  boolean not null default true,
    starts_at  timestamptz not null default now(),
    ends_at    timestamptz,
    created_by uuid default auth.uid() references auth.users (id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (ends_at is null or ends_at > starts_at)
);
alter table public.announcements enable row level security;

drop trigger if exists announcements_touch on public.announcements;
create trigger announcements_touch before update on public.announcements
    for each row execute function public.touch_updated_at();

drop policy if exists "anyone can read live announcements" on public.announcements;
create policy "anyone can read live announcements" on public.announcements
    for select to anon, authenticated
    using (is_active and starts_at <= now() and (ends_at is null or ends_at > now()));

drop policy if exists "admins manage announcements" on public.announcements;
create policy "admins manage announcements" on public.announcements
    for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -- Feedback from app users ---------------------------------------------
create table if not exists public.feedback (
    id         uuid primary key default gen_random_uuid(),
    name       text check (name is null or char_length(name) <= 100),
    email      text check (email is null or (char_length(email) <= 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
    category   text not null default 'suggestion' check (category in ('suggestion', 'bug', 'content', 'other')),
    message    text not null check (char_length(message) between 5 and 2000),
    status     text not null default 'new' check (status in ('new', 'read', 'resolved')),
    admin_note text check (admin_note is null or char_length(admin_note) <= 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.feedback enable row level security;

drop trigger if exists feedback_touch on public.feedback;
create trigger feedback_touch before update on public.feedback
    for each row execute function public.touch_updated_at();

drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
    for insert to anon, authenticated
    with check (status = 'new' and admin_note is null);

drop policy if exists "admins manage feedback" on public.feedback;
create policy "admins manage feedback" on public.feedback
    for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -- Reports of mistakes in Quran / hadith / dua / guide content ---------
create table if not exists public.content_reports (
    id           uuid primary key default gen_random_uuid(),
    content_type text not null check (content_type in ('quran', 'hadith', 'essential', 'guide', 'other')),
    content_ref  text not null check (char_length(content_ref) between 1 and 200),
    page_path    text check (page_path is null or (char_length(page_path) <= 300 and page_path ~ '^/[^\s<>"]*$')),
    issue        text not null check (char_length(issue) between 5 and 1000),
    status       text not null default 'new' check (status in ('new', 'reviewing', 'fixed', 'dismissed')),
    admin_note   text check (admin_note is null or char_length(admin_note) <= 2000),
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);
alter table public.content_reports enable row level security;

drop trigger if exists content_reports_touch on public.content_reports;
create trigger content_reports_touch before update on public.content_reports
    for each row execute function public.touch_updated_at();

drop policy if exists "anyone can report content" on public.content_reports;
create policy "anyone can report content" on public.content_reports
    for insert to anon, authenticated
    with check (status = 'new' and admin_note is null);

drop policy if exists "admins manage reports" on public.content_reports;
create policy "admins manage reports" on public.content_reports
    for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -- Anonymous page-view counts (no IPs, no user ids, no cookies) --------
create table if not exists public.page_views (
    day   date not null default current_date,
    path  text not null,
    views integer not null default 0,
    primary key (day, path)
);
alter table public.page_views enable row level security;

drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views" on public.page_views
    for select to authenticated using (public.is_admin());

create or replace function public.track_page_view(p_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_path is null or p_path !~ '^/[A-Za-z0-9/_-]{0,120}$' or p_path like '/admin%' then
        return;
    end if;
    insert into public.page_views (day, path, views) values (current_date, p_path, 1)
    on conflict (day, path) do update set views = public.page_views.views + 1;
end;
$$;
revoke all on function public.track_page_view(text) from public;
grant execute on function public.track_page_view(text) to anon, authenticated;

-- -- Table privileges (RLS above still decides which rows) ---------------
grant usage on schema public to anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant insert on public.feedback, public.content_reports to anon, authenticated;
grant select, insert, update, delete on public.announcements, public.feedback, public.content_reports to authenticated;
grant select on public.admins, public.page_views to authenticated;

-- -- Indexes for the dashboard lists -------------------------------------
create index if not exists feedback_status_created on public.feedback (status, created_at desc);
create index if not exists reports_status_created on public.content_reports (status, created_at desc);
create index if not exists announcements_live on public.announcements (is_active, starts_at);

-- -- First admin ---------------------------------------------------------
-- 1. Supabase -> Authentication -> Users -> "Add user" (email + password).
-- 2. Then run (with your email):
--
--    insert into public.admins (user_id, email)
--    select id, email from auth.users where email = 'you@example.com'
--    on conflict do nothing;
--
-- After that, add further admins from the dashboard's Admins tab.
