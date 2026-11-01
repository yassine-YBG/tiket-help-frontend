# Tiket Help — Frontend

React frontend of the **Tiket Help** support ticket application.
It talks to the [tiket-help backend](https://github.com/yassine-YBG/help-tiket) API.

**Stack:** React 19 · Vite 8 · React Router 7 · TanStack Query 5 · Axios ·
React Hook Form · Tailwind CSS 4 · shadcn/ui · lucide icons · sonner toasts

## Getting started

Requirements: **Node.js 20.19+** (or 22 LTS) and the backend running.

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm run dev               # http://localhost:5173
```

In the backend `.env`, allow this frontend: `CORS_ORIGIN=http://localhost:5173`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check the code with ESLint |
| `npm test` | Unit and component tests (Vitest, ~10 s) |
| `npm run test:watch` | Same, re-running on every file change |
| `npm run test:e2e` | Browser tests of the whole app (Playwright, ~1 min) |
| `npm run test:e2e:install` | First time only: download the browser used by the tests |

## Tests

**Unit and component tests** (`src/**/*.test.jsx`) use [Vitest](https://vitest.dev) and
[Testing Library](https://testing-library.com): small pieces such as a hook, a form rule or
a component, without a server.

**Browser tests** (`e2e/*.spec.js`) use [Playwright](https://playwright.dev): a real Chromium
clicks through the real app. `npm run test:e2e` starts **its own backend** from the
`tiket-help` folder next to this one (or `BACKEND_DIR=path/to/tiket-help`) on a **temporary
in-memory database** with test accounts, so your real data is never touched. The backend
folder needs its `npm install` done. The first run downloads MongoDB for the test database
(about a minute, then cached).

If the browser download fails (slow network, firewall), use the browser already
installed on the computer instead — Microsoft Edge is on every Windows PC:

```powershell
$env:E2E_BROWSER="msedge"; npm run test:e2e      # PowerShell
```

A failed browser test saves a screenshot and a trace in `test-results/`; open the report
with `npx playwright show-report`.

## Project structure

Organised **by feature**: each part of the app keeps its pages, components and hooks together.

```
src/
├─ main.jsx                 entry point
├─ index.css                Tailwind + shadcn/ui theme (colors are CSS variables)
├─ app/
│  ├─ App.jsx
│  ├─ RouteError.jsx        error screen when a page crashes
│  ├─ router.jsx            every URL → page, with role protection, lazy-loaded pages
│  ├─ providers.jsx         TanStack Query + Auth + toasts
│  ├─ HomeRedirect.jsx      "/" → dashboard (admins) or my tickets (users)
│  └─ NotFoundPage.jsx
├─ api/                     the ONLY place that calls the backend
│  ├─ client.js             axios: base URL, adds the token, handles expired sessions
│  ├─ auth.api.js  tickets.api.js  users.api.js  stats.api.js  activityLogs.api.js
├─ features/
│  ├─ auth/                 AuthProvider, useAuth, route guards, login & register pages
│  ├─ tickets/pages/        MyTickets, NewTicket, TicketDetail, AllTickets
│  ├─ dashboard/pages/      Dashboard (admin)
│  ├─ users/pages/          Users, PendingUsers (admin)
│  ├─ activity/pages/       ActivityLogs (admin)
│  └─ profile/pages/        Profile
├─ components/
│  ├─ ui/                   shadcn/ui components (button, input, card, badge...)
│  ├─ layout/               AppLayout, Sidebar, Topbar, PageHeader, navigation menu
│  ├─ form/                 FormField (label + input + error)
│  ├─ data/                 Pagination, TableSkeleton
│  └─ feedback/             EmptyState, ErrorState, ConfirmDialog, ComingSoon
├─ hooks/                   useUrlFilters (filters in the URL), useDebouncedValue (search)
├─ lib/                     constants (statuses, priorities, roles), queryKeys (cache keys),
│                           formatting, errors, token storage, safe file download
└─ test/                    test setup + render helper
e2e/                        browser tests + throw-away test backend
```

## How it works

- **Login:** the token is saved in the browser. On start the app calls `GET /auth/me`
  to know who is logged in. Any `401` from the API (expired token, account disabled,
  password changed) logs out and returns to `/login` with a message.
- **Roles:** routes are wrapped in `ProtectedRoute` (logged in) and
  `ProtectedRoute roles={ADMIN_ROLES}` (admin pages). The menu only shows what the role
  can use. The backend still checks every request — this is for the user experience.
- **Server data:** fetched with TanStack Query (cache, loading and error states, background refresh).
- **Statuses:** the backend stores them in French; the UI shows English labels
  (`lib/constants.js`: `non résolu` → Open, `en cours` → In progress, `résolu` → Resolved).
- **Files:** downloads go through axios (a plain link cannot send the token), and file
  names from other users are cleaned before saving (`safeFileName`).
- **Filters in the URL:** list pages keep their filters and page number in the address
  (`useUrlFilters`), so refresh, back/forward and shared links keep the same view.
- **Errors:** a page that crashes shows an error screen inside the layout (`RouteError`);
  the menu keeps working. Failed requests show `ErrorState` with a "Try again" button.

## Adding shadcn/ui components

`components.json` is configured, so you can add any component from
[ui.shadcn.com](https://ui.shadcn.com/docs/components):

```bash
npx shadcn@latest add dialog select table
```

## Pages

| Status | Page | Who | URL |
|---|---|---|---|
| ✅ | Login, Register | visitors | `/login`, `/register` |
| ✅ | My tickets | everyone | `/tickets` |
| ✅ | New ticket | everyone | `/tickets/new` |
| ✅ | Ticket detail | owner, admins | `/tickets/:id` |
| ✅ | Profile | everyone | `/profile` |
| 🔜 | Dashboard | admins | `/admin/dashboard` |
| 🔜 | All tickets | admins | `/admin/tickets` |
| 🔜 | Users, Pending accounts | admins | `/admin/users`, `/admin/users/pending` |
| 🔜 | Activity logs | admins | `/admin/activity` |
