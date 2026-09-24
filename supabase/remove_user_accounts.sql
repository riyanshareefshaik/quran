-- Nur Al-Quran - OPTIONAL clean-up after removing user accounts.
--
-- The app no longer has user accounts; notes, favorites, bookmarks and
-- reading history are stored on each device. If you previously ran the old
-- account migrations (002_user_accounts.sql / 003_user_content.sql), this
-- removes the tables and functions they created. Safe to run more than once,
-- and safe to run even if those migrations were never applied.
--
-- It does NOT touch schema.sql's tables (admins, announcements, feedback,
-- content reports, page views) or any login in Authentication -> Users.

drop function if exists public.log_reading(text, smallint, text);
drop function if exists public.ensure_default_collection();
drop function if exists public.delete_my_account();
drop function if exists public.account_count();

drop table if exists public.reading_history cascade;
drop table if exists public.collection_ayahs cascade;
drop table if exists public.collections cascade;
drop table if exists public.notes cascade;
drop table if exists public.user_data cascade;
drop table if exists public.profiles cascade;

drop function if exists public.enforce_collection_ayah_owner();
drop function if exists public.prune_reading_history();
drop function if exists public.enforce_notes_limit();
drop function if exists public.enforce_collections_limit();
