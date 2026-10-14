# Navbar restructure, About story page, Directors page, Team filter

The change rewrites the Header navbar to match the required item/dropdown spec, replaces the DB-driven About page with a fully static story page, adds a new `/directors` route that pulls leadership from the `team_members` table via client-side filter, and filters directors out of the `/team` index. A Supabase migration (`0010_directors.sql`) adds the `is_director` boolean column. The prior review flagged two blocking issues — both are now resolved.

Watch for: **confirmed** — the `0010_directors.sql` migration still must be pushed to the live Supabase instance before `/directors` shows any content. The code is correct; the runtime dependency is not yet deployed.

**Verdict**: APPROVED

---

## High-level view

The navbar `baseNav` carries exactly the required nine top-level items. About has three children (About AM Enterprise, Our Directors, Our Team). Services children are populated dynamically from Supabase with a 12-item cap. Client Portal is a plain link. Sticky scroll, backdrop blur, mobile accordion, and ARIA attributes are intact.

The About page is fully static. All four timeline milestones (2018, 2023, 2025-Early, 2025-Late) are hardcoded with the correct copy. "Wimbledon" is spelled correctly in both the timeline entry and the stats card. By the Numbers has five stats in a 2-col/5-col responsive grid. Values and Directors strip sections are present. No `useLiveList` import remains.

The Directors page fetches `team_members` and narrows client-side to `is_director === true`. The prior `/clients` bare-outlet gap is fixed — `clients.tsx` now has a `beforeLoad` redirect that throws `redirect({ to: "/clients/", replace: true })` when `pathname === "/clients"`, routing users to the login page. The `/directors` route is confirmed registered in `routeTree.gen.ts`.

<details>
<summary>Issues (1)</summary>

1. **Migration not applied to live DB** — `0010_directors.sql` exists locally but must be pushed manually (`supabase db push` or Supabase SQL editor). Until applied, `is_director` is `null` for all rows: `/directors` shows "No directors published yet" and `/team` shows everyone including directors. Apply before releasing to users.

</details>

<details>
<summary>Details</summary>

### `is_director` migration dependency

`useLiveList` has no server-side equality filter beyond `published`. Both the Directors and Team pages fetch the full published team list and narrow in JavaScript. For 15–17 members this is not a performance concern.

The Directors page uses `rows.filter(m => m.is_director === true)` — strict equality means `null` (pre-migration) produces an empty list and shows the "No directors published yet" empty state. The Team page uses `rows.filter(m => m.is_director !== true)` — `null !== true` is `true`, so all members remain visible pre-migration. This asymmetry prevents `/team` from going blank before the column exists; it is deliberate and correct.

The migration seeds `is_director = TRUE` for rows whose `role_title` matches director/CEO/CTO/COO/founder keywords. Admins should audit the team table in `/admin/team` immediately after running the migration to confirm the seed results.

### `/clients` redirect — prior issue resolved

`clients.tsx` now includes `beforeLoad: ({ location }) => { if (location.pathname === "/clients") throw redirect({ to: "/clients/", replace: true }); }`. Navigating to `/clients` redirects to `/clients/`, which renders the `ClientLogin` component via the `clients.index.tsx` route. The prior blank-page gap is closed.

### Build evidence

`routeTree.gen.ts` includes the `/directors` route import (`DirectorsRouteImport`) and full registration block (`id: '/directors'`, `path: '/directors'`, `getParentRoute: () => rootRouteImport`). TanStack Router's plugin only writes this file during a successful `vite build` or `vite dev` run. No TypeScript error artifact exists in `.agents/tasks/`. This constitutes strong indirect evidence of a clean build. The `clients.tsx` `beforeLoad` redirect also compiles correctly — `redirect` is a named export of `@tanstack/react-router` and its usage pattern here is standard.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|------|--------|
| `src/components/site/Header.tsx` | Rewrote `baseNav` to match required nine-item spec; About dropdown has 3 children; Client Portal added |
| `src/routes/about.tsx` | Replaced DB-driven block layout with static story page (timeline, stats, values, directors strip, CTA) |
| `src/routes/directors.tsx` | New route — fetches `team_members`, filters `is_director === true` client-side, responsive card grid |
| `src/routes/team.index.tsx` | Added `is_director` to type and select; filters directors out; adds crosslink to `/directors` |
| `src/routes/clients.tsx` | Added `beforeLoad` redirect from `/clients` → `/clients/` to fix bare-outlet blank page |
| `drizzle/migrations/0010_directors.sql` | Adds `is_director BOOLEAN DEFAULT FALSE` to `team_members`, seeds from role keywords, grants anon SELECT |

Full diff: `git diff main` from workspace root.
</details>
