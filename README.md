# Deep Space Support

An internal help-desk system for a space station's crew — built as a portfolio piece demonstrating real authentication, role-based authorization, AI-assisted automation, and full-stack TypeScript engineering, with the actual decision-making trail left visible instead of cleaned up after the fact.

**Live demo:
**Crew Portal:** [Crew Station](https://eitikobata.com)
**Officer Deck:** [Officer Deck](https://eitikobata.comofficer)
Both login screens have an **Auto-fill Demo Credentials** button — no signup needed to explore. (See [note on that](#a-note-on-the-demo-login-button) below — it's a deliberate trade-off, not an oversight.)

---

## Concept

Deep Space Support is an *internal* service desk — closer to Jira or ServiceNow than a public contact form. Crew members file **transmissions** (tickets) about issues aboard the station; duty **Officers** triage, respond, and resolve them.

This is deliberately **authenticated**, not anonymous — unlike its sibling portfolio project, Kingdom's Complaints Office, which is intentionally anonymous (a citizen's public complaint). On a ship, every transmission is logged against whoever sent it, and that one constraint shaped everything downstream: real login, real role separation, real per-user data isolation.

| Concept | Meaning |
|---|---|
| **Transmission** | A ticket: subject, description, alert level, status, sender, tags, log entries |
| **Alert level** | `BLUE_ALERT` (routine) → `YELLOW_ALERT` (moderate) → `RED_ALERT` (critical) — classified automatically by an AI triage step |
| **Status** | `ACTIVE` → `UNDER_REVIEW` → `RESOLVED` |
| **Log entry** | An Officer's logged response to a transmission |
| **Roles** | `CREW` (files and reads own transmissions only) · `OFFICER` (reads/updates all transmissions, writes log entries) |

---

## Stack

| Layer | Choice |
|---|---|
| Backend | NestJS + Prisma + PostgreSQL |
| Auth | JWT (Passport), bcrypt password hashing |
| Frontend | Next.js (App Router, TypeScript, static export) |
| Automation | n8n — Gemini-based AI triage, transactional email via Resend |
| Testing | Jest on both sides — `RolesGuard`/service tests on the backend, sort-logic/API/component tests on the frontend |
| Infra | Self-hosted on a Hostinger VPS via EasyPanel/Docker, shared Postgres instance |

### Why this stack, specifically

**Backend: NestJS over Express.** Express is still the most common Node framework and the safer default for a quick take-home test. But this project was built to target two hiring tracks at once — Automation Engineer / CX Ops roles, and Junior/Graduate Software Engineer roles at product companies. The latter increasingly expects TypeScript fluency, layered architecture, and automated tests, not just "the API works." NestJS was chosen to demonstrate that layer of engineering discipline (controller → service → DTO → guard) — a deliberate choice to prioritize employability over personal comfort with a stack that had previously been a point of friction.

**Authorization lives in code, not in a config UI.** A `RolesGuard` + `@Roles('OFFICER')` decorator is plain TypeScript, unit-testable, and reviewable in a diff. This is the single biggest lesson carried over from an earlier, abandoned attempt at this same project — see below.

---

## Decision history: three backends before this one

<details>
<summary><strong>Click to expand — why Supabase and Directus were tried and abandoned first</strong></summary>

### 1. Supabase Cloud — abandoned in minutes
Considered first: Postgres + Auth + auto-generated REST API, zero backend code. Blocked immediately by the free tier requiring a credit card. Never got past setup.

### 2. Directus (self-hosted) — the long, instructive detour
Directus is a headless CMS/backend-admin layer on Postgres, self-hosted alongside this project's other services. This phase produced a genuinely unusual run of bugs — most silent, several contradicting their own configuration UI:

- **Field Presets don't apply outside the Directus Studio form.** A preset like `{"sender": "$CURRENT_USER"}` only fires when an item is created *through the admin UI* — not through an external API call, which is exactly how a real frontend creates data. `sender` silently stayed `null` on every transmission created by the actual app, quietly breaking any permission rule depending on it. The real fix lived elsewhere: a field-level "On Create → Save Current User ID" option operating at the database layer.
- **`204 No Content` instead of the created object** on `POST`, when Directus can't confirm read-back permission within the same request — broke code that destructured the response body directly.
- **A rebuilt-from-scratch Access Policy with total "All Access" on every permission still returned `403 Forbidden`** for an automation account trying to update one field, with no configuration difference visible across four separate permission panels, and no change after multiple full container restarts. Verified in isolation via raw `curl`/PowerShell to eliminate other variables — identical error. Never resolved. This is the bug that ended the Directus attempt.
- Smaller but real issues along the way: CORS variables reverting after redeploy, Access Policies silently detaching from their Role despite looking correctly configured in isolation, `/users/me` requiring its own explicit read permission.

The pattern that finally forced the decision: *configuration that is visually and structurally correct still silently fails, with no error message pointing at a cause, surviving container restarts.* Not a debuggable state for something meant to run unattended.

### 3. NestJS + Prisma — the deliberate choice
Trades "configure a permission engine you can't fully inspect" for "write and read the actual authorization code." Slower to build from scratch, but every rule (*Crew can only see their own transmissions*, *only Officer can update alertLevel*) is a line of TypeScript in a `.service.ts` file, covered by a unit test, reviewable in a pull request.

</details>

---

## Architecture

```
deep-space/
├── backend/     NestJS + Prisma — REST API, JWT auth, RBAC
└── frontend/    Next.js — two portals, / and /officer
```

### Backend

Layered NestJS architecture (`Controller → Service → Prisma`), `class-validator` DTOs at the boundary, `Guard`s for auth/role enforcement.

- **Auth** — signup/login, bcrypt hashing, JWT (`JWT_EXPIRES_IN=7d`, no refresh flow by design — this is a demo, not a system needing long-lived sessions).
- **Transmissions** — `JwtAuthGuard` + `RolesGuard` on the controller; `@Roles('OFFICER')` restricts status/alert-level updates. `GET /transmissions` is *role-aware, not role-gated*: Crew and Officer hit the same endpoint, and the service scopes the result set by `senderId` for Crew, or returns everything for Officer.
- **Log entries** — Officer-only creation. After saving a response, fires a fire-and-forget webhook to n8n if the transmission has a `notifyEmail` on file, so the crew member gets emailed when their ticket is answered. A failure here never fails the actual API response.
- **Tags** — public read endpoint, called by both the frontend and the unauthenticated leg of the n8n triage workflow.
- **Tests** — `RolesGuard` (all three branches: no metadata, allowed role, blocked role) and `TransmissionsService` (creation, field mapping, `notifyEmail` persistence).

### Frontend

Next.js App Router, static export (the whole app is client components hitting the API directly — no server-side Next.js features in use, so `output: 'export'` is the correct build target, not a workaround).

- **`/` — Crew Portal.** File a transmission, browse own tickets in a 3-column board (Active / Under Review / Resolved), open a read-only ticket view.
- **`/officer` — Officer Deck.** Same 3-column board across *all* tickets, red-alert-first within each column. Opening a ticket shows a themed detail view (background tint, pulsing alert banner, a short audio cue per alert level with a persistent mute toggle) and a sidebar for status/alert-level control and tag editing.
- **Character banners** on both portals, with a rotating speech-bubble line pulled from a per-scene dialogue set — same pattern used across this author's other portfolio projects.
- **Tests** — Jest + React Testing Library: pure sort-logic, `Api` client session handling (login persistence, 401 recovery), and component behavior (`LoginForm`, `TicketList`).

### Automation (n8n)

Three independent workflows:

1. **Transmission triage** — `Webhook → Officer service-account login → Get Available Tags → Gemini classification → Update Transmission → conditional email`. The model is asked for raw JSON; a small parsing step strips markdown fences and falls back safely if the response is malformed, so one bad completion never breaks the pipeline.
2. **Response notification** — fired by the backend itself when an Officer logs a reply, so it fires regardless of which client submitted the response.
3. **Self-heal reset** — scheduled workflow that wipes and reseeds ~20 fixed demo transmissions (mixed severity, mixed status, some with officer responses, a couple closed without one) on a timer, so the public demo never degrades.

---

## Local development

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev       # http://localhost:3001
npm test                # Jest — RolesGuard + TransmissionsService

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:3000
npm test                 # Jest — sort logic, Api client, components
```

---

## Deployment notes

Both services run as separate EasyPanel apps on the same VPS, sharing one Postgres instance with a dedicated database per project.

- **Backend** ships as a multi-stage Docker build. Notably includes `apk add openssl` in *both* build and runtime stages — Prisma's musl-target query engine needs a real OpenSSL present to detect its own version, which slim Alpine images don't ship by default. Without it, the container builds fine and then crashes on boot with a `PrismaClientInitializationError`.
- **Frontend** is a static export served via `serve`, not `next start` (which doesn't work with `output: 'export'`).

---

## A note on the demo login button

The Auto-fill Demo Credentials button ships real login/password pairs in the client-side bundle — a pattern that would be a genuine problem on any system holding real user data. Here, it's a conscious trade-off: these accounts only ever touch fictional tickets, and the self-heal workflow resets all of it hourly regardless. Making a recruiter type credentials by hand to evaluate a portfolio project costs more than the theoretical risk is worth. This isn't a pattern to ship anywhere real data is at stake — and being able to say that clearly is part of the point.

---

## What's next

- Broader frontend test coverage, if this project keeps growing
