# Nur Al-Quran

A Quran reading app: Uthmani Arabic text, translations, tafsir, and
recitation audio (all sourced live from [Quran.com](https://quran.com)'s
API — never fabricated or hand-copied), prayer times and Qibla direction,
hadith, and Islamic guides. Built with [Next.js](https://nextjs.org) for the
web and wrapped with [Capacitor](https://capacitorjs.com) for Android/iOS.
Feedback, content reports, announcements and the admin dashboard run on
[Supabase](https://supabase.com) (Postgres + Auth + row-level security).

There are no user accounts: bookmarks, reading progress, notes, favorites,
collections and reading history are stored on the device only, so the app
costs nothing per user to run.

See **[docs/API.md](docs/API.md)** for the full backend/API reference
(database schema, RPC functions, REST routes, security model).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs without
Supabase configured too — feedback, reports and the admin dashboard simply
disable themselves (see `src/lib/supabase.ts`).

### Setting up the database

In the Supabase dashboard's SQL editor, run `supabase/schema.sql` (idempotent
— safe to re-run).

Then make yourself the first admin (see the comment at the bottom of
`schema.sql`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production web build/server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:watch` | Unit tests (Vitest) |
| `npm run build:app` | Static export for Capacitor (Android/iOS) |
| `npm run cap:android` / `npm run cap:ios` | Build + open the native project |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and the web build
on every push/PR.

## Deployment

- **Web**: deploy the Next.js app as usual (e.g. Vercel) with
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set. `GET
  /api/health` reports readiness.
- **Android/iOS**: `npm run build:app` produces a static export that
  Capacitor wraps into the native project (`android/`, `ios/`). The native
  app calls the hosted web deployment for the two server-only routes — set
  `NEXT_PUBLIC_API_BASE_URL` at build time if that isn't the default in
  `src/lib/api-config.ts`.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Capacitor documentation](https://capacitorjs.com/docs)
- [Supabase documentation](https://supabase.com/docs)
