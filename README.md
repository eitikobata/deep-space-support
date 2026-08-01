# Deep Space Support

A ticketing/help-desk system themed as a space station's internal communications desk, built as a portfolio piece demonstrating authentication, role-based authorization, AI-powered triage automation, and API design.

## Concept

Deep Space Support is an internal service desk — closer to Jira/ServiceNow than a public help center like Zendesk. Crew members ("Crew" role) submit transmissions (tickets) about issues aboard the station; duty officers ("Officer" role) triage, respond, and resolve them. Login is required for both roles because the scenario is internal crew communication, not anonymous public complaints (unlike the sibling project, Kingdom's Complaints Office / Correio das Reclamações, which is intentionally anonymous).

## Domain model

- **Transmission** (ticket): `subject`, `description`, `alertLevel`, `status`, `sender` (Crew who filed it), `tags`, `logEntries`
- **Alert levels**: `BLUE_ALERT` (routine, default) → `YELLOW_ALERT` (moderate) → `RED_ALERT` (safety-critical/urgent)
- **Status**: `ACTIVE` → `UNDER_REVIEW` → `RESOLVED`
- **Tags**: free-form categories (e.g. `mechanical_failure`, `first_contact`, `crew_dispute`, `supply_shortage`, `navigation_error`, `unidentified_signal`), assigned automatically by AI triage
- **LogEntry**: an Officer's response to a Transmission
- **Roles**: `CREW` (files and reads own transmissions only), `OFFICER` (reads/updates all transmissions, writes log entries)

## Tech stack (current)

- **Backend**: NestJS + Prisma + PostgreSQL, JWT auth (Passport), layered architecture (Controller → Service → Prisma), role-based Guards, DTO validation via class-validator
- **Frontend**: Next.js (App Router, TypeScript), two portals — `/` for Crew, `/officer` for Officer — sharing a retro sci-fi panel design system (dark navy panels, cyan/amber accents, JetBrains Mono + Inter, animated "signal strength" alert indicator)
- **Automation**: n8n workflow — webhook receives new transmission → fetches tag list → Gemini (gemini-flash-lite-latest) classifies `alertLevel` + `tags` from subject/description → updates the transmission via API → optionally emails the sender (Resend SMTP) with a fallback if no email is available
- **Infra**: self-hosted on a Hostinger VPS (8GB RAM) via EasyPanel/Docker, shared PostgreSQL instance per project database

## Why not Supabase or Directus (decision history)

1. **Supabase Cloud** was considered first but dropped early — the free-tier payment verification requirement was a blocker.
2. **Directus (self-hosted)** was built out fully — schema, RLS-equivalent Access Policies, n8n integration, a working Next.js frontend — but produced an extended, genuinely anomalous debugging saga across two sessions:
   - Field Presets (`$CURRENT_USER`) only apply within the Directus Studio UI form, **not** when items are created via external API calls — this caused the `sender` field to silently stay null when created from the custom frontend. Fixed via the field-level "On Create → Save Current User ID" option instead.
   - Directus returns `204 No Content` (not the created object) on POST when it can't confirm read-back permissions in the same request — broke code that destructured the response body.
   - A rebuilt-from-scratch Access Policy with **All Access** on every field/item permission still returned `403 Forbidden` for a specific field update, with no configuration difference found across four separate UI panels (Item Permissions, Field Permissions, Field Validation, Field Presets) and no change after multiple container restarts — this was never resolved and is suspected to be a genuine bug or corrupted internal state in that Directus instance.
   - Multiple instances of Access Policies silently detaching from their Role despite appearing correctly configured when viewed in isolation.
3. **Decision**: abandon Directus, rebuild the backend as a hand-written NestJS API. This trades "configure a black-box permission engine" for "write and read the actual authorization code" — slower to build, but debuggable, testable, and a stronger portfolio artifact (demonstrates layered architecture, DTOs, guards, and includes unit tests, which director-level and junior SWE job postings alike explicitly value).

## Career context

This project is being built as a flagship portfolio piece, not scoped narrowly to one job category. The person building it (see person-level context) is targeting a mix of: Automation Engineer / CX Ops / Support Ops roles (where Directus/n8n/API integration skills mattered most) **and** general Junior/Graduate Software Engineer roles at product companies (where TypeScript, tests, layered backend architecture, and Node.js fluency matter more). The NestJS rewrite was deliberately chosen to maximize employability across both tracks, prioritizing what recruiters/tech leads evaluate over minimizing personal friction with TypeScript (which had previously been a pain point from an earlier bootcamp experience with heavily-abstracted layered architectures).

## Current status

- ✅ Backend: all 33 files scaffolded (auth, transmissions, log-entries, tags modules; Prisma schema with blue/yellow/red alert levels; one example unit test)
- ✅ Frontend: fully built for Directus, needs its `lib/directus.ts` (or equivalent) rewired to call the new NestJS API instead
- ✅ n8n triage workflow: built and working against Directus, needs its Directus-specific nodes (Get Available Tags, Update Transmission) repointed to the new API
- ⏳ Not yet done: install backend deps, run first Prisma migration, deploy backend to EasyPanel, rewire frontend API client, rewire n8n nodes, redeploy/retest end-to-end

## Repo structure

```
deep-space/
├── backend/     (NestJS + Prisma — see file list below)
└── frontend/    (Next.js — App Router, portals at / and /officer)
```

## Next steps (in order)

1. `npm install` in `backend/`, create real `.env`, run `npx prisma migrate dev --name init`
2. Test auth locally (`/auth/signup`, `/auth/login`) via curl/Postman
3. Deploy `backend/` to EasyPanel (new Postgres database, new Node service, Dockerfile build)
4. Rewrite the frontend's API client to call the new backend instead of Directus
5. Rewrite the two Directus-dependent n8n nodes to call the new backend's endpoints
6. Full end-to-end retest: Crew creates transmission → n8n triages → Officer responds → status updates
7. Build the self-healing demo-data reset workflow (scheduled n8n job resetting demo Crew/Officer tickets) for recruiter-facing access