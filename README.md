# 🥋 Valour — BJJ Tournament Platform

Run jiu-jitsu tournaments end to end: registration & payments, live brackets, referee scoring, staff payouts, multi-event management, and an organizer stats dashboard. A self-owned alternative to Smoothcomp.

> **Live demo:** _add your GitHub Pages URL here after first deploy_ → `https://<user>.github.io/valour/`
> **No password needed** — the demo opens with a "Sign in as…" screen. Pick **Competitor / Referee / Admin / Staff** and explore.

---

## What it does

| Area | Feature |
|------|---------|
| 🎟️ Registration | Browse divisions, register, pay the entry fee (Stripe Checkout) |
| 🏆 Brackets | Live single-elimination brackets, results update as matches are scored |
| ✏️ Admin editing | Organizers seed brackets, declare winners, auto-advance the tree |
| 🧑‍⚖️ Ref scoring | Mat scoreboard — points (2/3/4), advantages, penalties, running clock, submission/decision |
| 💵 Staff & payouts | Roster refs/staff, track shifts & rates, batch-pay via Stripe Connect |
| 🗂️ Multi-tournament | One brand, many events; switch context or clone an event as a template |
| 📊 Event stats | Registrations, revenue, win methods, medals by team |

Four roles: **competitor**, **ref**, **admin**, **staff** — each gets its own view.

## Tech stack

- **Frontend:** Vite + React + TypeScript (static SPA, `HashRouter` for GitHub Pages)
- **Backend:** Supabase (Postgres, Auth, RLS, Realtime) — optional
- **Payments:** Stripe Checkout (in) + Stripe Connect (staff payouts, out), via Supabase Edge Functions
- **Hosting:** GitHub Pages (free)

### Data source: demo vs live

The app runs **with zero backend by default** on seeded in-browser data — perfect for the static demo, and edits persist for the session. Set two env vars and it switches to a real Supabase project:

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Schema + seed live in [`supabase/schema.sql`](supabase/schema.sql) and [`supabase/seed.sql`](supabase/seed.sql).

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push to GitHub. In **Settings → Pages**, set **Source: GitHub Actions**.
2. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) builds and deploys on every push to `main`.
3. If your repo isn't named `valour`, set `VITE_BASE=/<repo>/` (env var or in `vite.config.ts`).
4. (Optional) add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as repo **Secrets** to run on live data.

Manual one-off deploy: `npm run deploy` (publishes `dist/` to the `gh-pages` branch).

## Roadmap

P0 demo (this repo) → P1 real auth + RLS → P2 bracket generation → P3 admin editing → P4 payments → P5 ref scoring → P6 staff payouts → P7 multi-tournament → P8 stats → P9 real event theming.

## Cost — custom vs Smoothcomp

Smoothcomp is convenient but charges a **per-registration system fee that recurs for every athlete, every event, forever**. A custom platform is a one-time build plus near-zero hosting.

| | Smoothcomp | Valour (custom) |
|---|---|---|
| Setup | Free | One-time build |
| Per athlete | System fee (flat/%) every event | **$0** |
| Hosting | — | GitHub Pages free + Supabase ~$0–25/mo |
| Payments | Stripe/processor fees | Stripe fees only (2.9% + 30¢) |
| Branding / data | Smoothcomp's | **Fully yours** |
| Staff payouts, multi-event, custom rulesets | Limited | **Built in** |

*Illustrative:* 200 entries × ~$3–5 fee ≈ **$600–1,000 per event** on Smoothcomp, recurring — vs a mostly fixed custom cost. Past a few hundred registrations/year, custom wins on money **and** you own the brand and data. _(Confirm Smoothcomp's current published rates before quoting.)_

---

_Demo project — built to show what a self-owned tournament platform looks like._
