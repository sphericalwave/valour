# 🥋 Valour — BJJ Tournament Platform

Run jiu-jitsu tournaments end to end: registration & payments, live brackets, referee scoring, staff payouts, multi-event management, and an organizer stats dashboard. A **self-owned alternative to Smoothcomp**.

> **Live demo:** **https://sphericalwave.com/valour/**
> **No password needed** — opens on a "Sign in as…" screen. Pick **Competitor / Referee / Admin / Staff** and explore. Themed with the real Valour Series Jiu-Jitsu branding.

---

## Project status

**Working demo, deployed and live on real infrastructure.** Every page verified rendering against the live site.

| Capability | State |
|---|---|
| 🎟️ Registration + entry-fee checkout | ✅ built (checkout mocked — see below) |
| 🏆 Live single-elimination brackets | ✅ built |
| ⚙️ Bracket generation (seed from entrants, auto-byes) | ✅ built |
| ✏️ Admin bracket editing (declare winner, auto-advance) | ✅ built |
| 🧑‍⚖️ Ref scoreboard (2/3/4 pts, adv, pen, clock, sub/decision) | ✅ built |
| 💵 Staff roster + payouts (roles, rates, batch "pay all") | ✅ built (transfer mocked) |
| 🗂️ Multi-tournament (switch + clone events) | ✅ built |
| 📊 Event stats dashboard | ✅ built |
| 🎨 Real event branding (logo, banner, palette from artwork) | ✅ built |
| ☁️ Supabase persistence + realtime sync across devices | ✅ **live** |
| 💳 **Real** Stripe charges + Connect payouts | ⬜ mocked (production step) |
| 🔒 Row-level security / production auth | ⬜ demo runs RLS-off (production step) |

Four roles — **competitor**, **ref**, **admin**, **staff** — each with its own view.

## Tech stack

- **Frontend:** Vite + React + TypeScript (static SPA, `HashRouter` for GitHub Pages)
- **Backend:** Supabase (Postgres + Realtime; RLS + Auth wired for production)
- **Payments (planned):** Stripe Checkout (in) + Stripe Connect (staff payouts, out), via Supabase Edge Functions
- **Hosting:** GitHub Pages + GitHub Actions CI (free)

### Data source: demo vs live

Runs on seeded **in-browser data** with zero backend by default (great for a static demo). Set two env vars and it bootstraps from a real **Supabase** project — loading, write-through on every edit, and realtime sync:

```bash
cp .env.example .env   # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

Schema in [`supabase/schema.sql`](supabase/schema.sql) (text IDs, realtime on `matches`).

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

Push to `main` → the [workflow](.github/workflows/deploy.yml) builds and deploys automatically. Set repo **Secrets** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to run the deployed build on live data; set `VITE_BASE=/<repo>/` if the repo isn't named `valour`.

## Roadmap

P0 demo → P1 auth+RLS → P2 bracket gen → P3 admin edit → P4 payments → P5 ref scoring → P6 payouts → P7 multi-event → P8 stats → P9 theming.
**Done:** P0–P3, P5–P9 + Supabase persistence/realtime. **Remaining:** real Stripe (P4/P6) and RLS hardening — both "green-light" work once an organizer commits.

---

## Cost analysis — Smoothcomp vs owning it

**Smoothcomp** is a mature, convenient SaaS. Its pricing is **not transparently published** (federation/company platforms are quoted case-by-case, and athletes typically pay a **service fee added at checkout** on top of the organizer's entry fee, plus payment processing). The important point isn't the exact number — it's the **structure**:

- The cost is **recurring** and **scales with every athlete, every event, forever**.
- The organizer **doesn't own** the platform, the brand experience, or the data.
- Feature set is fixed to what Smoothcomp offers.

**Owning it (Valour)** inverts that: a **one-time build**, then a near-fixed running cost independent of headcount.

| | Smoothcomp (SaaS) | Valour (owned) |
|---|---|---|
| Upfront | ~free to start | one-time build |
| Per athlete | service fee every event (recurring) | **$0** beyond payment processing |
| Hosting | included | GitHub Pages free + Supabase ~$0–25/mo |
| Payment processing | processor fee (+ any Smoothcomp cut) | Stripe only (2.9% + 30¢) |
| Branding | Smoothcomp-branded | **fully yours** (logo, colours, domain) |
| Data | on their platform | **yours**, in your database |
| Refs/staff payroll, multi-event, custom rulesets | limited / add-on | **built in** |

**Illustrative math** — assume a conservative athlete service fee of **$3–5/registration**:

| Registrations / year | Smoothcomp fees/yr (@ $3–5) | Valour running cost/yr |
|---|---|---|
| 500 | $1,500 – $2,500 | ~$0 – $300 |
| 1,500 | $4,500 – $7,500 | ~$0 – $300 |
| 3,000 | $9,000 – $15,000 | ~$0 – $300 |

Those fees repeat **every year**. A one-time build is typically paid back within the **first year or two** of a moderately active organizer — and after that it's pure savings, plus brand ownership and data you control. _(Exact Smoothcomp rates should be confirmed with a live quote before publishing final numbers.)_

## Business proposition

There's a real, ownable business here — see **[PROPOSAL.md](PROPOSAL.md)** for the offer: what an organizer gets, engagement models (owned build vs. managed/hosted), and how it undercuts Smoothcomp while giving them their own branded platform.

---

_Demo project — a working proof of a self-owned tournament platform._
