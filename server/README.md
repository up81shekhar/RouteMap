# LearnPath API

Express + TypeScript + MongoDB backend. See `/docs/ARCHITECTURE.md` and
`/docs/DATABASE_SCHEMA.md` at the project root for the full design.

## Setup

1. Get a free MongoDB Atlas cluster (or run MongoDB locally) and grab its connection string.
2. `cp ../.env.example .env` and fill in:
   - `MONGODB_URI` — your real connection string
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings (`openssl rand -hex 32` works well)
   - `RESEND_API_KEY` *(optional)* — needed for password-reset emails to actually send. Get a free key at [resend.com](https://resend.com) (100 emails/day free). Without it, forgot-password still works in development — the reset link is logged to the server console instead of emailed.
   - `EMAIL_FROM` *(optional)* — defaults to Resend's shared test sender; set your own verified domain once you have one
3. `npm install`
4. `npm run seed` — loads the 15-roadmap starter catalog (DSA, Full Stack, Aptitude, Physics 11–12, etc.) plus the curated Arrays example, matching what the frontend demo ships with.
5. `npm run dev` — starts the API on `http://localhost:5000` with hot reload.

## Creating your first admin user

There's no bootstrap script for this yet — sign up normally via `POST /api/auth/signup`,
then in your MongoDB Atlas dashboard (or `mongosh`), flip that user's `role` field
from `"student"` to `"admin"`:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## What's implemented

- **Auth**: signup, login, refresh (httpOnly cookie), logout, `/me`, forgot-password / reset-password (email via Resend, 1-hour token) — JWT access + refresh tokens
- **Roadmaps**: public list/get (published only for non-admins), full admin CRUD + publish toggle
- **Topics (stations)**: public get by roadmap+node slug, admin add/edit/delete/reorder
- **Resources**: admin add/delete (video/article/practice, tagged, source-credited)
- **Progress**: get/mark-complete per roadmap+topic, scoped to the logged-in user
- **Search**: basic regex search across roadmaps and topics
- **Dashboard**: aggregate view (published roadmaps + recent progress) for the logged-in user
- **Admin gate**: every `/api/admin/*` route requires a valid JWT **and** `role: "admin"` — this is the real security boundary; the frontend's `RequireAdmin` component is just a UX nicety on top of it

## Not implemented yet (see docs/PRD.md roadmap)

Quizzes/PracticeQuestion bank, Bookmarks, Notes, LearningSession analytics,
Subscriptions, Ads/Sponsor management, and Google OAuth — these map onto
collections already defined in `docs/DATABASE_SCHEMA.md` but don't have
routes yet. Add them as `modules/<name>/` following the same
route → controller → service pattern used everywhere else here.

## Connecting the frontend

The client currently reads/writes through Zustand stores backed by
`localStorage` (`client/src/store/adminStore.ts`, `authStore.ts`,
`progressStore.ts`). To wire it to this real API: replace each store's
actions with `fetch` calls to the endpoints above, keeping the same
state shape so the UI components don't need to change. That swap is the
next logical step once you've got a real `MONGODB_URI` running.
