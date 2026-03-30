# Granted Demo Environment — Setup Guide

This document explains how to deploy a standalone demo environment at `granted-demo.vercel.app` using the `NEXT_PUBLIC_IS_DEMO=true` flag.

---

## What the Demo Shows

When `NEXT_PUBLIC_IS_DEMO=true` is set:

- A **yellow banner** appears on every page: "Demo Environment — data shown is for illustration purposes only"
- `/dashboard` is **publicly accessible without login** — no Supabase auth required
- The dashboard opens as **Murphy Architecture — Demo Account** with 5 pre-populated Irish planning applications:

| Reference | Location | Client | Status |
|---|---|---|---|
| `DCC/2025/04821` | Ranelagh, Dublin 6 | Murphy Family | Under Assessment |
| `PL04B/2025/1205` | Ballincollig, Cork | O'Brien Family | **Further Information Requested** (RFI flagged) |
| `PL07/2025/0892` | Salthill, Galway | Walsh Family | **Decision Made** (Granted with Conditions) |
| `PL09/2025/2341` | Naas, Kildare | Byrne Family | Received |
| `PL06/2025/0445` | Tralee, Kerry | O'Sullivan Family | **Appealed to An Coimisiún Pleanála** |

### Features showcased in the demo

1. **Pipeline dashboard** — 5 live applications with status badges, deadline countdown pills, filter tabs (All / On Track / Needs Attention / Decisions)
2. **RFI flag** — Cork application highlighted with red "Further Info Requested" badge and RFI issued date (22 March)
3. **Granted with Conditions** — Galway application with green Decision Made badge and conditions noted in the notes panel
4. **Appeal status** — Kerry application showing orange Appealed badge with full grounds in the activity log
5. **Deadline urgency** — colour-coded deadline pills (red < 5 days, amber < 10 days, green beyond)
6. **Activity log** — per-application timeline of status changes and client emails sent
7. **Client portal links** — "Copy portal link" button on each application card
8. **Client email updates** — "Send Update" panel per application (simulated in demo — no emails actually sent)
9. **Notes panel** — per-application internal notes with save (in-memory in demo)
10. **Status updates** — change application status via dropdown (in-memory in demo)
11. **County Intelligence panel** — full planning guidance for all 26 counties
12. **Planning Fee Calculator** — live fee calculation per Irish Schedule 5
13. **Newspaper Notice Generator** — site notice and newspaper notice template builder
14. **Grants dashboard widget** — applicable SEAI grants per project type

### Reset

The yellow banner includes a **Reset Demo** button. Clicking it navigates to `/dashboard`, which re-initialises all in-memory state from the original demo data. All changes in the demo are in-memory only — nothing is persisted to any database.

---

## Deploying to Vercel

### Step 1 — Create a new Vercel project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the same GitHub repository: `planassist-ai/planassist`
3. Name the project `granted-demo`
4. Framework preset: **Next.js** (auto-detected)

### Step 2 — Set environment variables

In **Vercel → granted-demo → Settings → Environment Variables**, add the following:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_IS_DEMO` | `true` | Enables demo mode |
| `NEXT_PUBLIC_SUPABASE_URL` | `<your-supabase-url>` | Required for middleware init |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` | Required for middleware init |
| `NEXT_PUBLIC_SITE_URL` | `https://granted-demo.vercel.app` | Used for portal link generation |

> **Note**: Supabase credentials are still needed so the middleware can initialise its client. However, in demo mode `/dashboard` bypasses auth — no data is read from or written to Supabase.

### Step 3 — Deploy

Vercel will deploy automatically on the next push to `main`. To trigger a manual deploy:

1. Go to **Vercel → granted-demo → Deployments**
2. Click **Redeploy** on the latest build

### Step 4 — Custom domain (optional)

1. Go to **Vercel → granted-demo → Settings → Domains**
2. Add `granted-demo.vercel.app` (already assigned by Vercel) or a custom domain such as `demo.granted.ie`

---

## Architecture notes

### How demo mode works

- `NEXT_PUBLIC_IS_DEMO` is a public env var available in both server and client code
- **Middleware** (`src/middleware.ts`): skips the auth redirect for `/dashboard` when demo mode is active
- **Dashboard** (`src/app/dashboard/page.tsx`):
  - Initialises `applications` state from `DEMO_APPLICATIONS` (in `src/lib/demo-data.ts`) instead of the Supabase API
  - Skips all API fetch calls on mount
  - Bypasses the `isArchitect` gate
  - Shows "Murphy Architecture — Demo Account" in the header with an amber avatar
  - All mutations (status change, notes save, send client update) operate in-memory with simulated delays
- **DemoBanner** (`src/app/components/DemoBanner.tsx`): renders the yellow banner in the root layout — appears on every page automatically

### Security

- The demo does not expose any real user data
- All applications are fictional
- No data is written to Supabase in demo mode
- Real API routes will return 401/403 if called (no authenticated session), but all mutation paths short-circuit before making API calls when `isDemoMode` is true

---

## Demo data source

All sample data lives in `src/lib/demo-data.ts`. Edit this file to update the demo applications, notes, or activity logs without touching the main application code.
